/*
  Pass 1 of 3: PROPOSE.

  Reads a piece's actual prose and proposes the dimensions the MDX never had:
  topics, doctrines, approach, level, and verse-level scripture.

  This pass writes NOTHING to the taxonomy. Proposals are stored whole in
  enrichment_proposals, because a single pass writing directly produced four
  names for one idea across three pieces. consolidate.mjs then fixes the
  vocabulary and apply.mjs writes the rows, reusing these payloads so no
  inference is paid for twice.

  Choices worth knowing:

  * Opus 5 with adaptive thinking. This is judgment work over long prose, not
    extraction, and the cheap models are noticeably worse at telling a topic
    from a doctrine.
  * Structured outputs, so every response validates against the schema instead
    of being parsed hopefully.
  * The taxonomy block is identical across all 213 calls, so it sits behind a
    cache_control breakpoint ahead of the volatile per-piece content. Watch
    cache_read_input_tokens in the cost line to confirm it is working.
  * Body text is truncated per call. The median piece is 5,500 words; a handful
    are far longer, and the tail adds cost without improving the tags.

  Usage:
    node scripts/library/enrich.mjs --limit 5          propose + write
    node scripts/library/enrich.mjs --limit 5 --dry    propose only, no writes
*/
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
}

const args = process.argv.slice(2)
const DRY = args.includes('--dry')
const LIMIT = Number(args[args.indexOf('--limit') + 1]) || 5
const MODEL = 'claude-opus-5'
const MAX_BODY_CHARS = 24000

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
)
const claude = new Anthropic()

// ── Existing taxonomy, so Claude reuses terms instead of inventing near-duplicates
const [{ data: topics }, { data: doctrines }, { data: approaches }, { data: levels }, { data: books }] =
  await Promise.all([
    db.from('topics').select('id, slug, name'),
    db.from('doctrines').select('id, slug, name'),
    db.from('approaches').select('id, slug, name'),
    db.from('levels').select('id, slug, name, depth'),
    db.from('bible_books').select('id, slug, name, position, chapter_count'),
  ])

const bookBySlug = new Map(books.map(b => [b.slug, b]))
const ref = (pos, ch, v) => pos * 1_000_000 + ch * 1_000 + v

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['topics', 'doctrines', 'approaches', 'level', 'scripture', 'summary', 'notes'],
  properties: {
    topics: {
      type: 'array',
      description: 'Two to six subjects the piece is actually about. Reuse an existing name verbatim where one fits; only invent a new one when nothing fits.',
      items: {
        type: 'object', additionalProperties: false,
        required: ['name', 'primary', 'confidence'],
        properties: {
          name: { type: 'string' },
          primary: { type: 'boolean', description: 'True only for the one or two the piece is centrally about.' },
          confidence: { type: 'number' },
        },
      },
    },
    doctrines: {
      type: 'array',
      description: 'Formal theological loci, e.g. Soteriology, Christology, Ecclesiology. Empty if the piece is not doing doctrinal work.',
      items: {
        type: 'object', additionalProperties: false,
        required: ['name', 'confidence'],
        properties: { name: { type: 'string' }, confidence: { type: 'number' } },
      },
    },
    approaches: {
      type: 'array',
      description: 'How the piece argues. Usually ONE, at most two. Only add a second when the piece genuinely does both throughout. Choose only from the given slugs.',
      items: {
        type: 'object', additionalProperties: false,
        required: ['slug', 'confidence'],
        properties: { slug: { type: 'string' }, confidence: { type: 'number' } },
      },
    },
    level: {
      type: 'object', additionalProperties: false,
      required: ['slug', 'confidence'],
      properties: { slug: { type: 'string' }, confidence: { type: 'number' } },
    },
    scripture: {
      type: 'array',
      description: 'Passages the piece actually expounds or leans on. Verse level where the text supports it. Skip passing mentions.',
      items: {
        type: 'object', additionalProperties: false,
        required: ['book_slug', 'chapter_start', 'primary', 'confidence'],
        properties: {
          book_slug: { type: 'string' },
          chapter_start: { type: 'integer' },
          verse_start: { type: ['integer', 'null'] },
          chapter_end: { type: ['integer', 'null'] },
          verse_end: { type: ['integer', 'null'] },
          primary: { type: 'boolean' },
          confidence: { type: 'number' },
        },
      },
    },
    summary: {
      type: ['string', 'null'],
      description: 'One or two sentences, only if the piece has no summary already. Plain prose. Never use an em dash or en dash.',
    },
    notes: { type: ['string', 'null'], description: 'Anything ambiguous a human should check. Null if nothing.' },
  },
}

// Stable across every call, so it sits behind the cache breakpoint.
const TAXONOMY_BLOCK = `You are cataloguing the teaching library of Austin W. Duncan, a pastor and Bible teacher.

Assign metadata to one piece at a time. Accuracy matters far more than coverage: an empty field is better than a guess. Confidence is 0 to 1 and should be honest, not flattering.

EXISTING TOPICS (reuse these names exactly where one fits):
${topics.map(t => t.name).join('\n') || '(none yet)'}

EXISTING DOCTRINES:
${doctrines.map(d => d.name).join('\n') || '(none yet)'}

APPROACH SLUGS (choose only from these):
${approaches.map(a => `${a.slug}  ${a.name}`).join('\n')}

LEVEL SLUGS (choose exactly one):
${levels.sort((a, b) => a.depth - b.depth).map(l => `${l.slug}  ${l.name}`).join('\n')}
accessible = a new believer could follow it. academic = footnotes, original languages, engages scholarship.

BIBLE BOOK SLUGS: use the lowercase hyphenated form, e.g. luke, 1-corinthians, song-of-solomon.

Distinctions that matter here:
- A TOPIC is what it is about (wealth, suffering, prayer). A DOCTRINE is a formal locus (Soteriology, Christology). Do not put a doctrine in the topics list.
- APPROACH is how it argues, not what it is. A sermon can be expositional or topical. Assign ONE approach unless the piece genuinely sustains two; listing three or four makes the category useless.
- LEVEL should use the whole range. Most sermons and Word for Word answers are accessible. Reserve academic for pieces with footnotes, original languages, or engagement with scholarship.
- Mark scripture primary only when the piece is genuinely working through that passage.

House style: never use an em dash or an en dash in anything you write.`

// ── Pick work ───────────────────────────────────────────────────────────────
/*
  Resumable. A first attempt at all 213 lost most of the run to transient
  connection errors, so the work already done is skipped rather than repeated:
  re-run this until `remaining` reaches zero. Costs nothing to resume.
*/
const { data: done } = await db.from('enrichment_proposals').select('content_id')
const alreadyDone = new Set((done ?? []).map(r => r.content_id))

const { data: allPieces, error } = await db
  .from('content')
  .select('id, slug, title, summary, body_text, collection_id, collections(name), formats(name)')
  .not('body_text', 'is', null)
  .order('published_at', { ascending: false })
if (error) { console.error(error.message); process.exit(1) }

const pending = allPieces.filter(p => !alreadyDone.has(p.id))
const pieces = pending.slice(0, LIMIT)
console.log(`\n  ${alreadyDone.size} already proposed · ${pending.length} remaining`)

console.log(`  ${pieces.length} this pass · ${MODEL}${DRY ? ' · DRY RUN' : ''}\n`)

const { data: run } = await db.from('enrichment_runs')
  .insert({ model: MODEL, note: `propose limit=${LIMIT}` }).select('id').single()
const runId = DRY ? null : run.id

const totals = { in: 0, out: 0, cacheRead: 0, cacheWrite: 0 }

for (const [i, piece] of pieces.entries()) {
  const body = (piece.body_text ?? '').slice(0, MAX_BODY_CHARS)
  /*
    Transient connection failures killed most of the first full run. Retry with
    backoff rather than dropping the piece: a lost piece is silent, and only
    shows up later as a gap in the taxonomy.
  */
  let res = null
  for (let attempt = 1; attempt <= 4 && !res; attempt++) {
  try {
    res = await claude.messages.create({
      model: MODEL,
      max_tokens: 8000,
      thinking: { type: 'adaptive' },
      output_config: { format: { type: 'json_schema', schema: SCHEMA } },
      system: [
        { type: 'text', text: TAXONOMY_BLOCK, cache_control: { type: 'ephemeral' } },
      ],
      messages: [{
        role: 'user',
        content: `COLLECTION: ${piece.collections?.name ?? 'unknown'}
FORMAT: ${piece.formats?.name ?? 'unknown'}
TITLE: ${piece.title}
EXISTING SUMMARY: ${piece.summary || '(none)'}

TEXT:
${body}`,
      }],
    })
  } catch (e) {
    const last = attempt === 4
    if (last) {
      console.log(`  ! ${piece.slug}: gave up after 4 tries (${e.message?.slice(0, 60)})`)
    } else {
      await new Promise(r => setTimeout(r, 2000 * 2 ** (attempt - 1)))
    }
  }
  }
  if (!res) continue

  totals.in += res.usage.input_tokens
  totals.out += res.usage.output_tokens
  totals.cacheRead += res.usage.cache_read_input_tokens ?? 0
  totals.cacheWrite += res.usage.cache_creation_input_tokens ?? 0

  const text = res.content.find(b => b.type === 'text')?.text ?? '{}'
  let out
  try { out = JSON.parse(text) } catch { console.log(`  ! ${piece.slug}: unparseable`); continue }

  const topicNames = out.topics.map(t => `${t.name}${t.primary ? '*' : ''}`).join(', ')
  console.log(`  ${String(i + 1).padStart(3)}. ${piece.title.slice(0, 52).padEnd(52)} ${out.scripture.length} refs`)
  if (process.env.VERBOSE) console.log(`       ${topicNames}`)

  if (!DRY) {
    await db.from('enrichment_proposals').upsert({
      content_id: piece.id, run_id: runId, payload: out, model: MODEL,
    }, { onConflict: 'content_id' })
  }
  await new Promise(r => setTimeout(r, 400))
}

// Opus 5 pricing: $5 in / $25 out per MTok. Cache reads bill at ~0.1x input.
const cost = (totals.in * 5 + totals.cacheWrite * 6.25 + totals.cacheRead * 0.5 + totals.out * 25) / 1e6
console.log(`\n  tokens   in ${totals.in}  cache-write ${totals.cacheWrite}  cache-read ${totals.cacheRead}  out ${totals.out}`)
console.log(`  cost     $${cost.toFixed(3)} for ${pieces.length} this pass`)

if (!DRY) {
  await db.from('enrichment_runs').update({
    finished_at: new Date().toISOString(),
    stats: { pieces: pieces.length, ...totals, cost_usd: Number(cost.toFixed(4)) },
  }).eq('id', runId)
  const { count } = await db.from('enrichment_proposals').select('id', { count: 'exact', head: true })
  console.log(`  stored   ${count ?? '?'} proposals total`)
  console.log(`  run id   ${runId}`)
  console.log(`\n  next: node scripts/library/consolidate.mjs\n`)
} else {
  console.log()
}
