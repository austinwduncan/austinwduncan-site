import { cache } from 'react'
import { library } from '@/lib/library/client'
import { getTaxonomy, scriptureIds } from '@/lib/library/queries'
import type { BibleBookRow, TopicRow } from '@/lib/library/database.types'
import type { Piece } from '@/lib/library/types'

/*
  Counting helpers for the Scripture explorer and the topic index.

  Two of these read a join table directly rather than going through
  getPieces(). That is deliberate. PostgREST caps a response at 1000 rows, and
  both content_topics (1047 rows) and scripture_references (1634 rows) are over
  that, so a single unfiltered fetch silently loses the tail. Counting through
  a paged read, or through the range backed scriptureIds() one book at a time,
  is the only way to get true totals. Nothing here writes, and nothing here
  duplicates the interval maths: the overlap test still belongs to
  scriptureIds().
*/

const PAGE = 1000

export type BookCount = { book: BibleBookRow; count: number }

export const getBookCoverage = cache(async (): Promise<{
  books: BookCount[]
  piecesWithScripture: number
  booksCovered: number
}> => {
  const { books } = await getTaxonomy()

  // One range scan per book, all in flight together. Each is index backed and
  // returns only content ids, so the whole canon costs one round trip of time.
  const rows = await Promise.all(
    books.map(async book => ({ book, ids: await scriptureIds(book.slug) })),
  )

  const union = new Set<string>()
  for (const row of rows) for (const id of row.ids) union.add(id)

  return {
    books: rows.map(r => ({ book: r.book, count: r.ids.length })),
    piecesWithScripture: union.size,
    booksCovered: rows.filter(r => r.ids.length > 0).length,
  }
})

/** Pieces per topic id, read in pages so the row cap cannot truncate the tail. */
export const getTopicCounts = cache(async (): Promise<Map<number, number>> => {
  const counts = new Map<number, number>()
  for (let from = 0; from < PAGE * 20; from += PAGE) {
    const { data } = await library
      .from('content_topics')
      .select('topic_id')
      .range(from, from + PAGE - 1)
    const rows = data ?? []
    for (const row of rows) counts.set(row.topic_id, (counts.get(row.topic_id) ?? 0) + 1)
    if (rows.length < PAGE) break
  }
  return counts
})

export type TopicWithCount = { topic: TopicRow; count: number }

export const getTopicsWithCounts = cache(async (): Promise<TopicWithCount[]> => {
  const [{ topics }, counts] = await Promise.all([getTaxonomy(), getTopicCounts()])
  return (topics as TopicRow[])
    .map(topic => ({ topic, count: counts.get(topic.id) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.topic.name.localeCompare(b.topic.name))
})

/*
  How many pieces touch each chapter of a book, index 0 being chapter 1.

  Derived from the references already loaded with the pieces rather than from
  one query per chapter, which would be 150 round trips on Psalms. A reference
  is a closed interval, so a piece counts for every chapter its span crosses,
  which is exactly what the overlap test in scriptureIds() would answer.
*/
export function chapterCounts(pieces: Piece[], bookSlug: string, chapterCount: number): number[] {
  const counts = new Array<number>(chapterCount).fill(0)
  for (const piece of pieces) {
    const touched = new Set<number>()
    for (const ref of piece.scripture) {
      if (ref.bookSlug !== bookSlug) continue
      const from = Math.max(1, ref.chapterStart)
      const to = Math.min(chapterCount, ref.chapterEnd ?? ref.chapterStart)
      for (let c = from; c <= to; c++) touched.add(c)
    }
    for (const c of touched) counts[c - 1] += 1
  }
  return counts
}

/*
  How tightly a piece is pinned to a book, in encoded units.

  A whole book sweep such as "Romans 1-16" scores in the tens of thousands, a
  single verse scores zero, so sorting ascending puts the most specific
  treatment of a book first.
*/
export function specificity(piece: Piece, bookSlug: string): number {
  let best = Number.POSITIVE_INFINITY
  for (const ref of piece.scripture) {
    if (ref.bookSlug !== bookSlug) continue
    const span =
      ((ref.chapterEnd ?? ref.chapterStart) - ref.chapterStart) * 1000 +
      ((ref.verseEnd ?? 999) - (ref.verseStart ?? 0))
    if (span < best) best = span
  }
  return best
}

/** The labels in this book, in canonical order, for a piece. */
export function labelsFor(piece: Piece, bookSlug: string, chapter?: number): string[] {
  const labels = piece.scripture
    .filter(ref => {
      if (ref.bookSlug !== bookSlug) return false
      if (chapter === undefined) return true
      return ref.chapterStart <= chapter && (ref.chapterEnd ?? ref.chapterStart) >= chapter
    })
    .map(ref => ref.label)
  return [...new Set(labels)]
}
