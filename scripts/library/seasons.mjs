/*
  Builds the season layer.

  Word for Word is a show whose seasons are its eight categories. Each piece
  carries exactly one legacy category, so the assignment is unambiguous.

  Episode numbers come from the artwork filename and are stored as
  series_position. They are global across the whole show, not per season,
  because the number is printed into the artwork and must never be re-derived
  from a grouping that Austin might later revise. A season's episodes are
  therefore non-contiguous by design.

  Also files the 47 sermons, which had no collection at all.

  Idempotent: safe to run more than once.
*/
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
}
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
const apply = process.argv.includes('--apply')
const slugify = s => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const { data: collections } = await db.from('collections').select('*')
let sermons = collections.find(c => /sermon/i.test(c.name))
const wfw = collections.find(c => /word.for.word/i.test(c.name))

// 1. Sermons collection
if (!sermons) {
  console.log('\n  CREATE collection "Sermons"')
  if (apply) {
    const { data } = await db.from('collections').insert({
      slug: 'sermons', name: 'Sermons',
      tagline: 'Sunday preaching from Crosswalk Church.',
      position: (Math.max(...collections.map(c => c.position)) || 0) + 1,
    }).select().single()
    sermons = data
  }
}

// 2. File the unfiled sermons
const { data: loose } = await db.from('content').select('id, legacy_id').is('collection_id', null)
const sermonIds = loose.filter(r => (r.legacy_id ?? '').includes('/sermons/')).map(r => r.id)
console.log(`  FILE ${sermonIds.length} pieces into Sermons (of ${loose.length} unfiled)`)
if (apply && sermons && sermonIds.length) {
  for (let i = 0; i < sermonIds.length; i += 100) {
    await db.from('content').update({ collection_id: sermons.id }).in('id', sermonIds.slice(i, i + 100))
  }
}

// 3. Word for Word seasons, from the one legacy category each piece carries
const { data: wfwPieces } = await db.from('content')
  .select('id, title, featured_image, legacy_id, series_id, series_position')
  .eq('collection_id', wfw.id)

const categoryOf = new Map()
for (const p of wfwPieces) {
  const file = readFileSync(p.legacy_id, 'utf8')
  const m = file.match(/^tags:\s*\[(.*)\]/m)
  const cat = m ? m[1].split('","')[0].replace(/^"|"$/g, '').replace(/\\"/g, '"') : null
  if (cat) categoryOf.set(p.id, cat)
}

const categories = [...new Set(categoryOf.values())].sort()
const { data: existingSeries } = await db.from('series').select('*').eq('collection_id', wfw.id)
console.log(`\n  WORD FOR WORD: ${categories.length} seasons`)

const seriesFor = new Map()
for (const [i, name] of categories.entries()) {
  const slug = slugify(name)
  let row = existingSeries.find(s => s.slug === slug)
  const n = [...categoryOf.values()].filter(v => v === name).length
  console.log(`    ${row ? 'exists' : 'CREATE'}  ${String(n).padStart(2)} ep  ${name}`)
  if (!row && apply) {
    const { data } = await db.from('series').insert({
      slug, name, collection_id: wfw.id, position: i + 1, is_complete: false,
    }).select().single()
    row = data
  }
  if (row) seriesFor.set(name, row.id)
}

// 4. Episode numbers from the artwork filename
let numbered = 0, missing = []
for (const p of wfwPieces) {
  const m = (p.featured_image ?? '').match(/Episode\s*(\d+)/i)
  const cat = categoryOf.get(p.id)
  const seriesId = seriesFor.get(cat)
  if (!m) { missing.push(p.title); continue }
  numbered++
  if (apply && seriesId) {
    await db.from('content').update({
      series_id: seriesId, series_position: Number(m[1]),
    }).eq('id', p.id)
  }
}
console.log(`\n  EPISODES: ${numbered} numbered from artwork, ${missing.length} without a number`)
for (const t of missing.slice(0, 5)) console.log(`    no number: ${t}`)

console.log(apply ? '\n  applied\n' : '\n  dry run. re-run with --apply\n')
