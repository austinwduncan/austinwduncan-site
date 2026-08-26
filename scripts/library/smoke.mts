import { getTaxonomy, getPieces, getShows, getPieceBySlug, scriptureIds, getRelated } from '../../lib/library/queries'

const tax = await getTaxonomy()
console.log(`\n  taxonomy: ${tax.collections.length} collections, ${tax.topics.length} topics, ${tax.books.length} books, ${tax.series.length} series`)

const all = await getPieces()
console.log(`  getPieces(): ${all.length} pieces`)
const withArt = all.filter(p => p.artwork).length
const withScripture = all.filter(p => p.scripture.length).length
console.log(`    with artwork ${withArt}, with scripture ${withScripture}`)
console.log(`    sample href: ${all[0]?.href}`)
console.log(`    sample scripture label: ${all.find(p => p.scripture.length)?.scripture[0]?.label}`)

const wfw = await getPieces({ collection: 'word-for-word', sort: 'episode' })
console.log(`  filter by collection: ${wfw.length} Word for Word`)
console.log(`    episodes: ${wfw.slice(0,6).map(p => p.episode).join(', ')}`)

const luke = await scriptureIds('luke', 15, 11)
console.log(`  scripture Luke 15:11 touches ${luke.length} pieces`)

const shows = await getShows()
for (const s of shows) console.log(`  show ${s.name.padEnd(16)} ${String(s.count).padStart(3)} pieces, ${s.seasons.length} seasons, ${s.loose.length} loose`)

const one = await getPieceBySlug(all[0].slug)
console.log(`  getPieceBySlug: ${one?.title.slice(0,44)} (body ${one?.bodyText?.length ?? 0} chars, ${one?.doctrines.length} doctrines)`)

const rel = await getRelated(all[0].id)
console.log(`  getRelated: ${rel.length} neighbours`)

// Sweeps must not count as teaching on a chapter.
const t2 = await getTaxonomy()
const psalms = t2.books.find(b => b.slug === 'psalms')!
let touched = 0
for (let c = 1; c <= psalms.chapter_count; c++) {
  if ((await scriptureIds('psalms', c)).length) touched++
}
console.log(`  Psalms chapters with direct teaching: ${touched} of ${psalms.chapter_count}`)
const jude = t2.books.find(b => b.slug === 'jude')!
console.log(`  Jude still covered: ${(await scriptureIds('jude', 1)).length > 0}`)
const directCount = (await getPieces()).filter(p => p.scripture.length).length
console.log(`  pieces with a direct reference: ${directCount}`)
