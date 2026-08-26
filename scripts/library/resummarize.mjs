/*
  Repair pass for duplicated summaries.

  30 pieces (14% of the library) share one of 5 summary texts, imported that
  way from the MDX frontmatter. The worst is a summary about the third
  commandment attached to 16 pieces including "Was Jonah Swallowed by a Whale".

  The main enrichment pass deliberately only filled MISSING summaries, so it
  preserved these rather than correcting them. This pass targets only the
  duplicated ones and writes a fresh summary from the actual body text.

  Touches the summary field and nothing else: topics, scripture and doctrines
  were derived from the real prose and are unaffected.

  Usage:
    node scripts/library/resummarize.mjs --dry    propose and print
    node scripts/library/resummarize.mjs          write to Postgres and MDX
*/
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
}

const DRY = process.argv.includes('--dry')
const MODEL = 'claude-opus-5'
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const claude = new Anthropic()

// Find every piece whose summary is shared with at least one other piece.
const { data: all } = await db.from('content')
  .select('id, slug, title, summary, body_text, legacy_id, collections(name), formats(name)')
  .not('summary', 'is', null)

const bySummary = new Map()
for (const c of all) bySummary.set(c.summary, [...(bySummary.get(c.summary) ?? []), c])
const affected = [...bySummary.values()].filter(g => g.length > 1).flat()

console.log(`\n  ${affected.length} pieces with a duplicated summary${DRY ? '  (DRY RUN)' : ''}\n`)
if (!affected.length) { console.log('  nothing to repair\n'); process.exit(0) }

/*
  Two lengths, one call. The first attempt produced ~106 word abstracts, which
  are excellent for retrieval and far too long to sit under a card. Rather than
  choose, write both: `subtitle` is the card line, `summary` is the abstract
  that search and the article page use.
*/
const SCHEMA = {
  type: 'object', additionalProperties: false, required: ['subtitle', 'summary'],
  properties: {
    subtitle: {
      type: 'string',
      description: 'A card line of 20 to 30 words. Name the passage or the question, and the one thing the piece is really about. No illustrations, no anecdotes, no title repetition. Must stand alone under a thumbnail.',
    },
    summary: {
      type: 'string',
      description: 'An abstract of 90 to 120 words for search and the article page. Concrete: the passage worked through, the argument made, the illustrations and sources used. This is the text semantic search will match against, so specificity matters more than polish.',
    },
  },
}

const SYSTEM = `You write summaries for a theological teaching library.

Describe what the piece in front of you actually says. Be concrete: name the passage it works through, the question it answers, or the claim it makes.

You write two things at different lengths for different jobs. The subtitle sits under a thumbnail and has to earn a click in one glance. The summary is an abstract that search matches against, so it carries the detail: illustrations, sources quoted, the shape of the argument.

Avoid generic religious filler. "Accessible teaching grounded in Scripture" tells a reader nothing.

House style: never use an em dash or an en dash.`

const results = []
for (const [i, piece] of affected.entries()) {
  let res = null
  for (let attempt = 1; attempt <= 3 && !res; attempt++) {
    try {
      res = await claude.messages.create({
        model: MODEL, max_tokens: 2000,
        thinking: { type: 'adaptive' },
        output_config: { format: { type: 'json_schema', schema: SCHEMA } },
        system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
        messages: [{
          role: 'user',
          content: `COLLECTION: ${piece.collections?.name ?? '?'}
FORMAT: ${piece.formats?.name ?? '?'}
TITLE: ${piece.title}

TEXT:
${(piece.body_text ?? '').slice(0, 18000)}`,
        }],
      })
    } catch (e) {
      if (attempt === 3) console.log(`  ! ${piece.slug}: ${e.message?.slice(0, 60)}`)
      else await new Promise(r => setTimeout(r, 2000 * attempt))
    }
  }
  if (!res) continue

  const out = JSON.parse(res.content.find(b => b.type === 'text')?.text ?? '{}')
  if (!out.summary || !out.subtitle) continue
  results.push({ piece, summary: out.summary, subtitle: out.subtitle })

  console.log(`  ${String(i + 1).padStart(2)}. ${piece.title}`)
  console.log(`      card: ${out.subtitle}`)
  console.log(`      abs : ${out.summary.slice(0, 110)}...\n`)
  await new Promise(r => setTimeout(r, 300))
}

if (DRY) { console.log(`  dry run: ${results.length} proposed, nothing written\n`); process.exit(0) }

// ── Write to Postgres ───────────────────────────────────────────────────────
for (const { piece, summary, subtitle } of results) {
  await db.from('content').update({ summary, subtitle }).eq('id', piece.id)
}
console.log(`  postgres  ${results.length} summaries updated`)

/*
  Write back to the MDX frontmatter too. Postgres is becoming the source of
  truth, but the importer is idempotent and would overwrite the fix from the
  files on any re-run, so the two must agree until the migration completes.
*/
let filesFixed = 0
for (const { piece, summary } of results) {
  if (!piece.legacy_id || !existsSync(piece.legacy_id)) continue
  const raw = readFileSync(piece.legacy_id, 'utf8')
  // Replace the excerpt line only, preserving everything else verbatim.
  const escaped = summary.replace(/"/g, '\\"')
  const next = raw.replace(/^excerpt:\s*.*$/m, `excerpt: "${escaped}"`)
  if (next !== raw) { writeFileSync(piece.legacy_id, next); filesFixed++ }
}
console.log(`  mdx       ${filesFixed} files updated`)
console.log('\n  done\n')
