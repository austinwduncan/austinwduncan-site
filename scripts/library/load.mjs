/*
  Load .library/records.json into Supabase.

  Idempotent by design: every content row carries (legacy_source, legacy_id),
  which has a unique index, so re-running updates rather than duplicates. That
  matters because this import will be run several times as the transform
  improves.

  Order matters. Series and topics are created from what the content actually
  references, rather than invented up front, so the taxonomy reflects the
  material instead of a guess.

  Pass --dry to see what would happen without writing.
*/
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
}

const DRY = process.argv.includes('--dry')
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
)

const records = JSON.parse(readFileSync('.library/records.json', 'utf8'))
const slugify = s => s.toLowerCase().trim()
  .replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const die = (label, error) => { if (error) { console.error(`\n  ✗ ${label}:`, error.message, '\n'); process.exit(1) } }

// ── Lookup maps ─────────────────────────────────────────────────────────────
async function idMap(table) {
  const { data, error } = await db.from(table).select('id, slug')
  die(`read ${table}`, error)
  return new Map(data.map(r => [r.slug, r.id]))
}
const formats     = await idMap('formats')
const approaches  = await idMap('approaches')
const collections = await idMap('collections')
const books       = await idMap('bible_books')

console.log(`\n  ${records.length} records${DRY ? '  (DRY RUN)' : ''}\n`)

// ── Series, derived from the content that references them ───────────────────
const seriesNames = [...new Set(records.flatMap(r => r.series_tags))]
if (seriesNames.length && !DRY) {
  const { error } = await db.from('series').upsert(
    seriesNames.map((name, i) => ({
      slug: slugify(name), name,
      collection_id: collections.get('in-the-text') ?? null,
      position: i,
    })),
    { onConflict: 'slug' },
  )
  die('upsert series', error)
}
const series = DRY ? new Map() : await idMap('series')
console.log(`  series        ${seriesNames.length}`)

/*
  Topic candidates need routing before they become topics. The transform showed
  "Sermons" and "Stand-Alone Sermons" in this list, which are formats, not
  topics, and both spellings of "Basic Christian Thought and/& Spiritual
  Growth", which are one topic. Slugifying normalises "&" to "and", which
  merges that pair automatically; the format-shaped tags are skipped outright.
*/
const NOT_TOPICS = new Set(['sermons', 'stand-alone-sermons'])
const topicNames = new Map()
for (const r of records) {
  for (const t of r.topic_candidates) {
    const slug = slugify(t)
    if (NOT_TOPICS.has(slug)) continue
    if (!topicNames.has(slug)) topicNames.set(slug, t)
  }
}
if (topicNames.size && !DRY) {
  const { error } = await db.from('topics').upsert(
    [...topicNames].map(([slug, name]) => ({ slug, name })),
    { onConflict: 'slug' },
  )
  die('upsert topics', error)
}
const topics = DRY ? new Map() : await idMap('topics')
console.log(`  topics        ${topicNames.size}  (from ${new Set(records.flatMap(r => r.topic_candidates)).size} raw tags)`)

if (DRY) {
  console.log('\n  dry run: nothing written\n')
  process.exit(0)
}

// ── Content ─────────────────────────────────────────────────────────────────
const rows = records.map(r => ({
  slug: r.slug,
  title: r.title,
  summary: r.summary,
  body_text: r.body_text,
  format_id: formats.get(r.format) ?? null,
  collection_id: collections.get(r.collection) ?? null,
  series_id: r.series_tags.length ? (series.get(slugify(r.series_tags[0])) ?? null) : null,
  status: r.status,
  published_at: r.published_at ? `${r.published_at}T12:00:00Z` : null,
  reading_minutes: r.reading_minutes,
  featured_image: r.featured_image,
  legacy_source: r.legacy_source,
  legacy_id: r.legacy_id,
}))

/*
  Upsert by hand rather than relying on ON CONFLICT. 0001 declared the legacy
  identity as a partial unique index, which Postgres cannot use for conflict
  inference; 0004 replaces it with a real constraint, but doing the match here
  means the import works either way and never depends on which migrations have
  been applied.
*/
const { data: existing, error: readErr } = await db
  .from('content')
  .select('id, legacy_id')
  .eq('legacy_source', 'mdx')
die('read existing content', readErr)

const idByLegacy = new Map((existing ?? []).map(r => [r.legacy_id, r.id]))
const toInsert = rows.filter(r => !idByLegacy.has(r.legacy_id))
const toUpdate = rows.filter(r => idByLegacy.has(r.legacy_id))

if (toInsert.length) {
  const { data, error } = await db.from('content').insert(toInsert).select('id, legacy_id')
  die('insert content', error)
  for (const r of data) idByLegacy.set(r.legacy_id, r.id)
}
for (const r of toUpdate) {
  const { error } = await db.from('content').update(r).eq('id', idByLegacy.get(r.legacy_id))
  die('update content', error)
}
console.log(`  content       ${toInsert.length} new, ${toUpdate.length} updated`)

// ── Join tables ─────────────────────────────────────────────────────────────
// Replaced wholesale per run so a re-import cannot leave orphaned links.
const contentIds = [...idByLegacy.values()]
for (const t of ['content_approaches', 'content_topics', 'scripture_references', 'media', 'content_slug_history']) {
  const { error } = await db.from(t).delete().in('content_id', contentIds)
  die(`clear ${t}`, error)
}

const approachRows = [], topicRows = [], scriptureRows = [], mediaRows = [], slugRows = []
for (const r of records) {
  const id = idByLegacy.get(r.legacy_id)
  if (!id) continue

  for (const a of r.approaches) {
    const aid = approaches.get(a)
    if (aid) approachRows.push({ content_id: id, approach_id: aid })
  }
  for (const t of r.topic_candidates) {
    const slug = slugify(t)
    if (NOT_TOPICS.has(slug)) continue
    const tid = topics.get(slug)
    if (tid) topicRows.push({ content_id: id, topic_id: tid })
  }
  for (const s of r.scripture) {
    const bid = books.get(s.book_slug)
    if (!bid) continue
    scriptureRows.push({
      content_id: id, book_id: bid,
      chapter_start: s.chapter_start, verse_start: s.verse_start,
      chapter_end: s.chapter_end, verse_end: s.verse_end,
      start_ref: s.start_ref, end_ref: s.end_ref,
      is_primary: !s.whole_book,
    })
  }
  for (const [i, m] of r.media.entries()) {
    mediaRows.push({ content_id: id, kind: m.kind, provider: m.provider,
                     url: m.url, external_id: m.external_id, position: i })
  }
  if (r.legacy_path) slugRows.push({ content_id: id, old_path: r.legacy_path })
}

const dedupe = (rows, key) => {
  const seen = new Set()
  return rows.filter(r => { const k = key(r); if (seen.has(k)) return false; seen.add(k); return true })
}

for (const [table, data] of [
  ['content_approaches', dedupe(approachRows, r => `${r.content_id}:${r.approach_id}`)],
  ['content_topics',     dedupe(topicRows,    r => `${r.content_id}:${r.topic_id}`)],
  ['scripture_references', scriptureRows],
  ['media',              mediaRows],
  ['content_slug_history', dedupe(slugRows,   r => r.old_path)],
]) {
  if (!data.length) { console.log(`  ${table.padEnd(20)} 0`); continue }
  const { error } = await db.from(table).insert(data)
  die(`insert ${table}`, error)
  console.log(`  ${table.padEnd(20)} ${data.length}`)
}

console.log('\n  done\n')
