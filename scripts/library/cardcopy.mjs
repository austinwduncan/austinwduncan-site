/*
  Generates the two pieces of copy every card needs:

    subtitle  20 to 30 words, the line under a title in a grid or shelf
    summary   90 to 120 words, the paragraph on a detail or hover state

  Both are written from the piece's own body, which is the whole point. An
  earlier generation produced five summary texts shared across thirty pieces,
  including one about the third commandment attached to "Was Jonah Swallowed by
  a Whale". Grounding every call in the actual text is what prevents that.

  Skips any piece whose body cannot be trusted: the twelve empty files and the
  eighteen that share a body with something else. Summarising a body that
  belongs to a different piece is how the last mess happened.

  Writes to Postgres AND back to the MDX frontmatter, because load.mjs is
  idempotent and would otherwise restore the old text on its next run.

  Resumable. Re-running only processes what is still missing or still flagged.
*/
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
}

const apply = process.argv.includes('--apply')
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const claude = new Anthropic()
const MODEL = 'claude-opus-5'

const { data: all } = await db.from('content')
  .select('id, slug, title, subtitle, summary, body_text, legacy_id')

// Bodies we cannot trust: empty, or shared with another piece.
const norm = s => (s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '')
const seen = new Map()
for (const p of all) {
  const k = norm(p.body_text).slice(0, 4000)
  if (k.length < 40) continue
  seen.set(k, (seen.get(k) ?? 0) + 1)
}
const untrusted = new Set(
  all.filter(p => {
    const k = norm(p.body_text).slice(0, 4000)
    return k.length < 40 || seen.get(k) > 1
  }).map(p => p.id),
)

// Summaries the audit graded as anything other than accurate.
let flagged = new Set()
if (existsSync('.library/summary-audit.json')) {
  for (const r of JSON.parse(readFileSync('.library/summary-audit.json', 'utf8'))) {
    if (r.verdict && r.verdict !== 'accurate') flagged.add(r.slug)
  }
}

const todo = all.filter(p =>
  !untrusted.has(p.id) && (!p.subtitle || flagged.has(p.slug)),
)

console.log(`\n  ${all.length} pieces`)
console.log(`  ${untrusted.size} skipped, body empty or shared with another piece`)
console.log(`  ${flagged.size} summaries flagged by the audit`)
console.log(`  ${todo.length} to write\n`)
if (!apply) { console.log('  dry run. re-run with --apply\n'); process.exit(0) }

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['subtitle', 'summary'],
  properties: {
    subtitle: { type: 'string', description: '20 to 30 words. The line under a title on a card.' },
    summary: { type: 'string', description: '90 to 120 words. One paragraph.' },
  },
}

const SYSTEM = `You write card copy for a theological teaching library.

For each piece you receive its title and its actual text. Write from the text, never from the title alone.

subtitle: 20 to 30 words. What this specific piece actually does, concretely enough that a reader can tell it apart from twenty neighbours on the same topic. Not a restatement of the title.

summary: 90 to 120 words, one paragraph. The argument the piece actually makes and where it lands.

Rules:
- Describe only what the text contains. Never promise ground the piece does not reach. If the teaching stops in chapter 1, do not summarise chapter 2. Overstatement is the single most common failure here.
- Plain, direct, pastoral. This is a working pastor's library, not a marketing page.
- Never open with "In this piece" or "This article".
- Never use an em dash or an en dash. Rewrite the sentence instead.`

let done = 0, failed = 0
for (const p of todo) {
  let res = null
  for (let a = 1; a <= 4 && !res; a++) {
    try {
      res = await claude.messages.create({
        model: MODEL, max_tokens: 2000,
        thinking: { type: 'adaptive' },
        output_config: { format: { type: 'json_schema', schema: SCHEMA }, effort: 'low' },
        system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: `TITLE: ${p.title}\n\nTEXT:\n${(p.body_text ?? '').slice(0, 16000)}` }],
      })
    } catch (e) {
      if (a === 4) { failed++; console.log(`  ! ${p.slug}`) }
      else await new Promise(r => setTimeout(r, 2000 * 2 ** (a - 1)))
    }
  }
  if (!res) continue

  let out
  try { out = JSON.parse(res.content.find(b => b.type === 'text')?.text ?? '{}') } catch { failed++; continue }
  if (!out.subtitle || !out.summary) { failed++; continue }

  const clean = s => s.replace(/[–—]/g, ',').replace(/\s+,/g, ',').trim()
  const subtitle = clean(out.subtitle)
  const summary = clean(out.summary)

  await db.from('content').update({ subtitle, summary }).eq('id', p.id)

  // Keep the MDX in step, or the next import restores the old text.
  if (p.legacy_id && existsSync(p.legacy_id)) {
    let src = readFileSync(p.legacy_id, 'utf8')
    const esc = summary.replace(/"/g, '\\"')
    src = /^excerpt:/m.test(src)
      ? src.replace(/^excerpt:.*$/m, `excerpt: "${esc}"`)
      : src.replace(/^(title:.*)$/m, `$1\nexcerpt: "${esc}"`)
    writeFileSync(p.legacy_id, src)
  }

  done++
  if (done % 20 === 0) console.log(`  ${done}/${todo.length}`)
  await new Promise(r => setTimeout(r, 250))
}

console.log(`\n  wrote ${done}, failed ${failed}\n`)
