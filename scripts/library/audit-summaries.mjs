/*
  Summary audit. Reports only, writes nothing.

  The duplicate repair fixed 30 summaries that were provably wrong because they
  were shared. It could not catch a summary that is unique but still inaccurate,
  vague, or written in a voice Austin has moved past. This reads each piece
  against its own body text and grades the existing summary.

  Deliberately read-only: the point is to see the scale of the problem before
  deciding whether to rewrite 182 pieces.

  Usage:
    node scripts/library/audit-summaries.mjs             all
    node scripts/library/audit-summaries.mjs --limit 40  a sample
*/
import { readFileSync, writeFileSync, appendFileSync, mkdirSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
}

const args = process.argv.slice(2)
const LIMIT = args.includes('--limit') ? Number(args[args.indexOf('--limit') + 1]) : 1000
const MODEL = 'claude-opus-5'
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const claude = new Anthropic()

// Skip the 30 just rewritten: they carry a subtitle and are known good.
const { data: pieces } = await db.from('content')
  .select('id, slug, title, summary, subtitle, body_text')
  .not('summary', 'is', null)
  .is('subtitle', null)
  .not('body_text', 'is', null)
  .limit(1000)

// A summary cannot be checked against a body that does not exist. Twelve MDX
// files are frontmatter only, so they are reported separately rather than
// graded, which would otherwise bury the real findings under false positives.
const bodyless = pieces.filter(p => (p.body_text ?? '').trim().length < 400)
const gradable = pieces.filter(p => (p.body_text ?? '').trim().length >= 400).slice(0, LIMIT)

if (bodyless.length) {
  console.log(`\n  ${bodyless.length} pieces have no body text and cannot be audited:`)
  for (const p of bodyless) console.log(`    ${p.title.slice(0, 60)}`)
}
console.log(`\n  auditing ${gradable.length} summaries\n`)

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['verdict', 'issues', 'note'],
  properties: {
    verdict: {
      type: 'string',
      enum: ['accurate', 'vague', 'inaccurate', 'promotional'],
      description: 'accurate = describes this piece truthfully and usefully. vague = true but says nothing specific. inaccurate = states something the text does not support. promotional = marketing copy rather than description.',
    },
    issues: {
      type: 'array',
      items: { type: 'string' },
      description: 'Specific problems. Empty when accurate.',
    },
    note: { type: ['string', 'null'], description: 'One short line. Null when accurate.' },
  },
}

const SYSTEM = `You are auditing summaries in a theological teaching library against the pieces they describe.

Judge only whether the summary honestly and usefully describes THIS piece. You are not rewriting anything.

Grade harshly on vagueness. "Accessible teaching grounded in Scripture" or "a careful biblical answer to the question" describes nothing and should be marked vague. A summary that merely restates the title is vague.

Mark inaccurate when the summary claims something the text does not support: a wrong passage, a wrong topic, a wrong occasion.

Mark promotional when it is selling rather than describing.

House style: never use an em dash or an en dash.`

mkdirSync('.library', { recursive: true })
const JSONL = '.library/summary-audit.jsonl'
const appendResult = r => appendFileSync(JSONL, JSON.stringify(r) + '\n')

const results = []
for (const [i, p] of gradable.entries()) {
  let res = null
  for (let a = 1; a <= 3 && !res; a++) {
    try {
      res = await claude.messages.create({
        model: MODEL, max_tokens: 1500,
        thinking: { type: 'adaptive' },
        output_config: { format: { type: 'json_schema', schema: SCHEMA }, effort: 'low' },
        system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: `TITLE: ${p.title}

EXISTING SUMMARY:
${p.summary}

ACTUAL TEXT:
${(p.body_text ?? '').slice(0, 14000)}` }],
      })
    } catch (e) {
      if (a === 3) console.log(`  ! ${p.slug}`)
      else await new Promise(r => setTimeout(r, 2000 * a))
    }
  }
  if (!res) continue
  let out
  try {
    out = JSON.parse(res.content.find(b => b.type === 'text')?.text ?? '{}')
  } catch {
    console.log(`  UNPARSEABLE  ${p.title.slice(0, 52)}`)
    results.push({ slug: p.slug, title: p.title, verdict: 'unparseable', issues: [], note: null })
    appendResult(results.at(-1))
    continue
  }
  if (!out.verdict) continue
  results.push({ slug: p.slug, title: p.title, ...out })
  appendResult(results.at(-1))
  if (out.verdict !== 'accurate') {
    console.log(`  ${out.verdict.toUpperCase().padEnd(12)} ${p.title.slice(0, 52)}`)
    if (out.note) console.log(`               ${out.note}`)
  }
  process.stdout.write('')
  await new Promise(r => setTimeout(r, 200))
}

const by = v => results.filter(r => r.verdict === v).length
console.log(`\n  ────────────────────────────────`)
console.log(`  accurate     ${String(by('accurate')).padStart(3)}`)
console.log(`  vague        ${String(by('vague')).padStart(3)}`)
console.log(`  inaccurate   ${String(by('inaccurate')).padStart(3)}`)
console.log(`  promotional  ${String(by('promotional')).padStart(3)}`)
console.log(`  unparseable  ${String(by('unparseable')).padStart(3)}`)
console.log(`  no body      ${String(bodyless.length).padStart(3)}  (not graded)`)
console.log(`  ────────────────────────────────`)
console.log(`  audited      ${String(results.length).padStart(3)}`)

writeFileSync('.library/summary-audit.json', JSON.stringify(results, null, 2))
console.log(`\n  wrote .library/summary-audit.json\n`)
