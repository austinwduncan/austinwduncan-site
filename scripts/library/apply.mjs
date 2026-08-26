/*
  Pass 3 of 3: APPLY.

  Reads the stored proposals, maps every topic name through the approved
  topic_merges vocabulary, and writes the join rows. Makes no API calls, so it
  is free to re-run after editing the merge map: change a decision, re-run,
  and the taxonomy reshapes.

  Only rows with source='ai' are cleared before writing, so anything imported
  from the MDX or set by hand survives untouched.

  Usage:
    node scripts/library/apply.mjs --dry     report what would change
    node scripts/library/apply.mjs           write it
*/
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
}

const DRY = process.argv.includes('--dry')
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const slugify = s => s.toLowerCase().trim().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const [{ data: proposals }, { data: merges }, { data: books }, { data: approaches }, { data: levels }] =
  await Promise.all([
    db.from('enrichment_proposals').select('content_id, payload'),
    db.from('topic_merges').select('raw_name, canonical_name, approved'),
    db.from('bible_books').select('id, slug, position, chapter_count'),
    db.from('approaches').select('id, slug'),
    db.from('levels').select('id, slug'),
  ])

if (!proposals?.length) { console.log('\n  no proposals. run enrich.mjs first.\n'); process.exit(0) }

const unapproved = (merges ?? []).filter(m => !m.approved).length
if (merges?.length && unapproved) {
  console.log(`\n  ${unapproved} of ${merges.length} merge decisions are unapproved.`)
  console.log(`  run: node scripts/library/consolidate.mjs --approve\n`)
  if (!DRY) process.exit(1)
}

// raw name -> canonical name. Absent from the map means keep as proposed.
const mergeMap = new Map((merges ?? []).map(m => [m.raw_name, m.canonical_name]))
const bookBySlug = new Map(books.map(b => [b.slug, b]))
const approachBySlug = new Map(approaches.map(a => [a.slug, a.id]))
const levelBySlug = new Map(levels.map(l => [l.slug, l.id]))
const ref = (pos, ch, v) => pos * 1_000_000 + ch * 1_000 + v

// ── Resolve the final topic and doctrine vocabulary ──────────────────────────
const wantedTopics = new Map()   // slug -> name
const wantedDoctrines = new Map()
let droppedCount = 0

for (const p of proposals) {
  for (const t of (p.payload?.topics ?? [])) {
    const canon = mergeMap.has(t.name) ? mergeMap.get(t.name) : t.name
    if (!canon) { droppedCount++; continue }   // null means "not a topic"
    wantedTopics.set(slugify(canon), canon)
  }
  for (const d of (p.payload?.doctrines ?? [])) {
    wantedDoctrines.set(slugify(d.name), d.name)
  }
}

console.log(`\n  ${proposals.length} proposals`)
console.log(`  topics    ${wantedTopics.size} canonical  (${droppedCount} tag uses dropped as wrong dimension)`)
console.log(`  doctrines ${wantedDoctrines.size}`)

if (DRY) {
  const scripture = proposals.reduce((a, p) => a + (p.payload?.scripture?.length ?? 0), 0)
  const verseLevel = proposals.reduce((a, p) =>
    a + (p.payload?.scripture ?? []).filter(s => s.verse_start).length, 0)
  console.log(`  scripture ${scripture} refs, ${verseLevel} verse level`)
  console.log('\n  dry run: nothing written\n')
  process.exit(0)
}

// ── Upsert the vocabularies ─────────────────────────────────────────────────
if (wantedTopics.size) {
  await db.from('topics').upsert([...wantedTopics].map(([slug, name]) => ({ slug, name })), { onConflict: 'slug' })
}
if (wantedDoctrines.size) {
  await db.from('doctrines').upsert([...wantedDoctrines].map(([slug, name]) => ({ slug, name })), { onConflict: 'slug' })
}
const { data: topicRows } = await db.from('topics').select('id, slug')
const { data: doctrineRows } = await db.from('doctrines').select('id, slug')
const topicId = new Map(topicRows.map(t => [t.slug, t.id]))
const doctrineId = new Map(doctrineRows.map(d => [d.slug, d.id]))

// ── Clear only AI rows, then rebuild ────────────────────────────────────────
const ids = proposals.map(p => p.content_id)
for (const t of ['content_topics', 'content_doctrines', 'content_approaches', 'scripture_references']) {
  await db.from(t).delete().eq('source', 'ai').in('content_id', ids)
}

/*
  These join tables key on (content_id, dimension_id) regardless of source, so
  an AI row for a pairing the import already established collides. That is not
  a conflict worth resolving: it is the model agreeing with a tag that already
  exists. Skip it and leave the earlier row, which keeps the honest provenance.
*/
async function existingKeys(table, col) {
  const keys = new Set()
  for (let i = 0; i < ids.length; i += 200) {
    const { data } = await db.from(table).select(`content_id, ${col}`).in('content_id', ids.slice(i, i + 200))
    for (const r of data ?? []) keys.add(`${r.content_id}:${r[col]}`)
  }
  return keys
}
const haveTopic = await existingKeys('content_topics', 'topic_id')
const haveDoctrine = await existingKeys('content_doctrines', 'doctrine_id')
const haveApproach = await existingKeys('content_approaches', 'approach_id')

const topicIns = [], doctrineIns = [], approachIns = [], scriptureIns = []
const contentPatches = []

for (const p of proposals) {
  const cid = p.content_id
  const pay = p.payload ?? {}

  const seenT = new Set()
  for (const t of (pay.topics ?? [])) {
    const canon = mergeMap.has(t.name) ? mergeMap.get(t.name) : t.name
    if (!canon) continue
    const id = topicId.get(slugify(canon))
    if (!id || seenT.has(id) || haveTopic.has(`${cid}:${id}`)) continue
    seenT.add(id)
    topicIns.push({ content_id: cid, topic_id: id, is_primary: !!t.primary, source: 'ai', confidence: t.confidence })
  }

  const seenD = new Set()
  for (const d of (pay.doctrines ?? [])) {
    const id = doctrineId.get(slugify(d.name))
    if (!id || seenD.has(id) || haveDoctrine.has(`${cid}:${id}`)) continue
    seenD.add(id)
    doctrineIns.push({ content_id: cid, doctrine_id: id, source: 'ai', confidence: d.confidence })
  }

  const seenA = new Set()
  for (const a of (pay.approaches ?? [])) {
    const id = approachBySlug.get(a.slug)
    if (!id || seenA.has(id) || haveApproach.has(`${cid}:${id}`)) continue
    seenA.add(id)
    approachIns.push({ content_id: cid, approach_id: id, source: 'ai', confidence: a.confidence })
  }

  for (const s of (pay.scripture ?? [])) {
    const b = bookBySlug.get(s.book_slug)
    if (!b) continue
    // Clamp to the book's real extent: a hallucinated chapter would otherwise
    // produce a range that sorts into the next book.
    const cs = Math.min(Math.max(1, s.chapter_start), b.chapter_count)
    const ce = Math.min(Math.max(cs, s.chapter_end ?? cs), b.chapter_count)
    scriptureIns.push({
      content_id: cid, book_id: b.id,
      chapter_start: cs, verse_start: s.verse_start ?? null,
      chapter_end: ce, verse_end: s.verse_end ?? s.verse_start ?? null,
      start_ref: ref(b.position, cs, s.verse_start ?? 1),
      end_ref: ref(b.position, ce, s.verse_end ?? s.verse_start ?? 999),
      is_primary: !!s.primary, source: 'ai', confidence: s.confidence,
    })
  }

  const patch = {}
  if (pay.level?.slug && levelBySlug.has(pay.level.slug)) patch.level_id = levelBySlug.get(pay.level.slug)
  if (pay.summary) patch.summary = pay.summary
  if (Object.keys(patch).length) contentPatches.push({ cid, patch })
}

// Insert in chunks: a single 5,000-row insert can exceed the request limit.
async function insertAll(table, rows) {
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await db.from(table).insert(rows.slice(i, i + 500))
    if (error) { console.error(`  ✗ ${table}: ${error.message}`); process.exit(1) }
  }
  console.log(`  ${table.padEnd(22)} ${rows.length}`)
}

await insertAll('content_topics', topicIns)
await insertAll('content_doctrines', doctrineIns)
await insertAll('content_approaches', approachIns)
await insertAll('scripture_references', scriptureIns)

// Only fill a summary where one is genuinely missing.
let summariesAdded = 0, levelsSet = 0
for (const { cid, patch } of contentPatches) {
  const { data: cur } = await db.from('content').select('summary, level_id').eq('id', cid).single()
  const p = {}
  if (patch.level_id && !cur.level_id) { p.level_id = patch.level_id; levelsSet++ }
  if (patch.summary && !cur.summary) { p.summary = patch.summary; summariesAdded++ }
  if (Object.keys(p).length) await db.from('content').update(p).eq('id', cid)
}
console.log(`  levels set             ${levelsSet}`)
console.log(`  summaries filled       ${summariesAdded}`)
console.log('\n  done\n')
