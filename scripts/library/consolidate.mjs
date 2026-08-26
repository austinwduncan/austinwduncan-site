/*
  Pass 2 of 3: CONSOLIDATE.

  Reads every topic name proposed in pass 1, and produces one canonical
  vocabulary. This is the pass that exists because a single-pass run invented
  "Bible Study Methods", "Bible Study Method", "Greek Word Study", "Biblical
  Word Study" and "Word Study and Greek Vocabulary" for what is plainly one
  idea.

  It writes decisions to topic_merges, unapproved, so the mapping can be read
  and edited before anything touches the live taxonomy. Nothing here changes
  content.

  Usage:
    node scripts/library/consolidate.mjs           propose the mapping
    node scripts/library/consolidate.mjs --approve mark every row approved
*/
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
}

const APPROVE = process.argv.includes('--approve')
const MODEL = 'claude-opus-5'
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const claude = new Anthropic()

if (APPROVE) {
  const { count } = await db.from('topic_merges').update({ approved: true })
    .eq('approved', false).select('*', { count: 'exact', head: true })
  console.log(`\n  approved ${count ?? 'all'} merge decisions\n`)
  process.exit(0)
}

// ── Gather every proposed topic, with how often it appeared ─────────────────
const { data: proposals, error } = await db.from('enrichment_proposals').select('payload')
if (error) { console.error(error.message); process.exit(1) }

const counts = new Map()
for (const p of proposals) {
  for (const t of (p.payload?.topics ?? [])) {
    const n = t.name.trim()
    counts.set(n, (counts.get(n) ?? 0) + 1)
  }
}
const { data: existing } = await db.from('topics').select('name')

console.log(`\n  ${proposals.length} proposals · ${counts.size} distinct topic names proposed\n`)
if (!counts.size) { console.log('  nothing to consolidate. run enrich.mjs first.\n'); process.exit(0) }

const JUNK = /[{}\[\]]|^.{0,2}$/
const sorted = [...counts.entries()]
  .filter(([n]) => !JUNK.test(n))
  .sort((a, b) => b[1] - a[1])
const singletons = sorted.filter(([, c]) => c === 1).length
console.log(`  ${singletons} of them used exactly once\n`)

const SCHEMA = {
  type: 'object', additionalProperties: false, required: ['decisions'],
  properties: {
    decisions: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['raw_name', 'canonical_name', 'reason'],
        properties: {
          raw_name: { type: 'string' },
          canonical_name: {
            type: ['string', 'null'],
            description: 'The name this should become. Identical to raw_name if it is already right. Null to drop it as not a topic.',
          },
          reason: { type: 'string', description: 'Short. Only meaningful when merging or dropping.' },
        },
      },
    },
  },
}

/*
  Streamed, not a plain create. 544 names in and a decision for each one out is
  a large response, and the SDK refuses non-streaming requests whose max_tokens
  could exceed the 10 minute HTTP timeout. finalMessage() gives the assembled
  result without handling individual events.
*/
const stream = claude.messages.stream({
  model: MODEL,
  max_tokens: 64000,
  thinking: { type: 'adaptive' },
  output_config: { format: { type: 'json_schema', schema: SCHEMA }, effort: 'high' },
  system: `You are consolidating the topic vocabulary for a theological teaching library of 213 pieces.

A tagging pass proposed these names independently per piece, with no shared vocabulary, so the same idea appears under many near-identical labels and there is a very long tail of one-off names.

TARGET: about 100 canonical topics. You are currently given 544 names. Most must merge.

The tail is the work. Roughly 430 of these names were used by exactly ONE piece. A topic used once is almost never a real category, it is a specific phrasing of something broader. For each one, ask what a reader browsing a topic list would actually click, and merge it there. Examples of the reasoning:
- "Mercy Seat and the Day of Atonement" is not its own topic. It is The Atonement.
- "Refugees and Mercy Ministry" is not its own topic. It is Caring for the Poor.
- "Assurance and the Indwelling Spirit" is not its own topic. It is Assurance of Salvation.
- "Waiting on God" and "Patience in Suffering" both sit under Suffering and Trials unless the library has many pieces on each.

Rules:
- Merge aggressively toward broad, browsable subjects. Prefer the clearest standard wording, and prefer a name already established in the library.
- Keep a narrow topic separate ONLY when several pieces genuinely centre on it, or when it is a landmark subject a reader would look for by name (Baptism, Marriage, Prayer, The Trinity).
- Do NOT merge genuinely different things. Election and Free Will are related but distinct. Baptism and Communion are not one topic.
- Return null for anything that is really a FORMAT (Sermons), an APPROACH (Expositional), a DOCTRINE locus (Soteriology, Christology, Pneumatology), a BIBLE BOOK or character, a SERIES name, or a season. Those live in other dimensions.
- Return null for anything that is not a coherent phrase.
- Return a decision for every raw_name given.

Aim for a list where every canonical topic has at least two or three pieces behind it, and a reader scanning it would understand each one instantly.

House style: never use an em dash or an en dash.`,
  messages: [{
    role: 'user',
    content: `ALREADY IN THE LIBRARY:
${existing.map(e => e.name).join('\n') || '(none)'}

PROPOSED NAMES (count of pieces that used each):
${sorted.map(([n, c]) => `${String(c).padStart(3)}  ${n}`).join('\n')}`,
  }],
})
const res = await stream.finalMessage()

// A truncated response is silent otherwise: JSON.parse throws on a cut-off
// string and the run dies with no idea why.
if (res.stop_reason === 'max_tokens') {
  console.error('\n  response hit max_tokens and truncated. raise it or chunk the input.\n')
  process.exit(1)
}

const text = res.content.find(b => b.type === 'text')?.text ?? '{}'
let decisions
try {
  ({ decisions } = JSON.parse(text))
} catch (e) {
  console.error(`\n  could not parse response (${text.length} chars): ${e.message}\n`)
  process.exit(1)
}

// ── Report ──────────────────────────────────────────────────────────────────
const merged = decisions.filter(d => d.canonical_name && d.canonical_name !== d.raw_name)
const dropped = decisions.filter(d => !d.canonical_name)
const kept = decisions.filter(d => d.canonical_name === d.raw_name)
const canonical = new Set(decisions.filter(d => d.canonical_name).map(d => d.canonical_name))

console.log(`  kept as-is   ${kept.length}`)
console.log(`  merged       ${merged.length}`)
console.log(`  dropped      ${dropped.length}`)
console.log(`  final vocab  ${canonical.size} topics\n`)

const groups = new Map()
for (const d of merged) {
  groups.set(d.canonical_name, [...(groups.get(d.canonical_name) ?? []), d.raw_name])
}
console.log('  MERGES')
for (const [canon, raws] of [...groups].sort((a, b) => b[1].length - a[1].length).slice(0, 15)) {
  console.log(`    ${canon}`)
  for (const r of raws) console.log(`        <- ${r}`)
}
if (dropped.length) {
  console.log('\n  DROPPED (wrong dimension)')
  for (const d of dropped.slice(0, 12)) console.log(`    ${d.raw_name.padEnd(42)} ${d.reason}`)
}

await db.from('topic_merges').delete().neq('raw_name', '')
await db.from('topic_merges').upsert(
  decisions.map(d => ({ raw_name: d.raw_name, canonical_name: d.canonical_name, reason: d.reason })),
  { onConflict: 'raw_name' },
)

const cost = (res.usage.input_tokens * 5 + res.usage.output_tokens * 25) / 1e6
console.log(`\n  cost  $${cost.toFixed(3)}`)
console.log(`\n  review topic_merges, then:`)
console.log(`    node scripts/library/consolidate.mjs --approve`)
console.log(`    node scripts/library/apply.mjs\n`)
