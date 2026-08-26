import fs from 'node:fs'
import path from 'node:path'
import { cache } from 'react'
// Relative rather than aliased on purpose: next.config.ts imports this file to
// build its redirect table, and the config loader does not apply tsconfig paths.
import { library } from './library/client'
import { getTaxonomy, hrefFor } from './library/queries'

/*
  Shared URL and metadata helpers.

  Two jobs live here. The first is naming the origin once so nothing hand
  writes "https://austinwduncan.com" again. The second is gathering, correctly,
  the set of paths the Library can serve, which the sitemap then assigns
  priority to.

  Why this file reads Postgres itself rather than calling getPieces().

  PostgREST caps a response at 1000 rows. decorate() in lib/library/queries.ts
  fetches every topic link and every scripture reference for the pieces it is
  decorating in one request each, and those tables now hold 1047 and 1634 rows.
  Asking for all 213 pieces at once therefore returns a truncated tail with no
  error. That is fine for a shelf, which only ever shows the first topic on a
  card, but a sitemap built from a truncated join would silently omit real
  URLs. Everything below is read in pages of 1000 so the tail cannot be lost.
*/

export const SITE_URL = 'https://austinwduncan.com'

/** Absolute URL for a site relative path. */
export function absolute(pathname: string): string {
  return pathname === '/' ? SITE_URL : `${SITE_URL}${pathname}`
}

/*
  Does a route file exist for this path shape.

  The site is being rebuilt by several hands at once, so route families appear
  and disappear between one read of this file and the next. A sitemap entry
  pointing at a route that does not exist is worse than a missing entry, so
  every generated family is gated on the page file actually being on disk.

  sitemap.ts has no request-time input, so Next treats it as a static route and
  runs this once at build, where the working directory is the project root and
  app/ is present. If it were ever evaluated somewhere without the source tree,
  existsSync returns false and the family is dropped, which fails in the safe
  direction: a URL is never claimed for a route that cannot be proven.
*/
export function routeExists(appRelativePath: string): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), 'app', appRelativePath))
  } catch {
    return false
  }
}

const PAGE = 1000

/** Reads a table in pages of 1000, so the PostgREST row cap cannot truncate it. */
async function paged<T>(
  fetchPage: (from: number, to: number) => PromiseLike<{ data: T[] | null }>,
): Promise<T[]> {
  const rows: T[] = []
  for (let from = 0; ; from += PAGE) {
    const { data } = await fetchPage(from, from + PAGE - 1)
    const page = data ?? []
    rows.push(...page)
    if (page.length < PAGE) break
  }
  return rows
}

export type UrlEntry = {
  /** Site relative path, always starting with a slash. */
  path: string
  /** Newest publication date of whatever the page collects. */
  lastModified: Date
}

/*
  A chapter page earns a sitemap entry only when a piece treats it closely.

  Whole book sweeps are excluded outright. Migration 0008 flags them, following
  Austin's rule that what counts is a passage actually read or referenced, so
  the query below filters on is_sweep rather than guessing from span width.

  The span cap is a second, softer guard for a reference that is not a full
  book sweep but is still too wide to call teaching on each chapter, for
  example Isaiah 40 to 55. Those belong on the book page.
*/
const FOCUSED_CHAPTER_SPAN = 3

export type SitemapData = {
  pieces: UrlEntry[]
  shows: UrlEntry[]
  books: UrlEntry[]
  chapters: UrlEntry[]
  topics: UrlEntry[]
  /** Newest publication date anywhere in the library. */
  latest: Date
}

const newest = (dates: Date[]): Date =>
  dates.reduce((a, b) => (b > a ? b : a), dates[0] ?? new Date(0))

export const getSitemapData = cache(async (): Promise<SitemapData> => {
  const tax = await getTaxonomy()

  const contentRows = await paged<{
    id: string
    slug: string
    legacy_id: string | null
    published_at: string | null
    updated_at: string | null
    collection_id: number | null
  }>((from, to) =>
    library
      .from('content')
      .select('id, slug, legacy_id, published_at, updated_at, collection_id')
      .order('id')
      .range(from, to),
  )

  const scriptureRows = await paged<{
    content_id: string
    book_id: number
    chapter_start: number
    chapter_end: number | null
  }>((from, to) =>
    library
      .from('scripture_references')
      .select('content_id, book_id, chapter_start, chapter_end')
      .eq('is_sweep', false)
      .order('id')
      .range(from, to),
  )

  const topicRows = await paged<{ content_id: string; topic_id: number }>((from, to) =>
    library
      .from('content_topics')
      .select('content_id, topic_id')
      .order('content_id')
      .range(from, to),
  )

  /*
    published_at is the date the piece went out. updated_at is the timestamp of
    the last pipeline load, which is the same day for all 213 rows and says
    nothing about the content, so it is only a fallback for a row that somehow
    has no publication date.
  */
  const dateOf = (row: { published_at: string | null; updated_at: string | null }): Date =>
    new Date(row.published_at ?? row.updated_at ?? Date.now())

  const dateById = new Map(contentRows.map(r => [r.id, dateOf(r)]))

  const pieces: UrlEntry[] = contentRows.map(r => ({
    path: hrefFor(r, tax.collections),
    lastModified: dateOf(r),
  }))

  // Shows. A collection with nothing in it is a real page but an empty one, so
  // it stays out of the sitemap until it has something to show.
  const shows: UrlEntry[] = tax.collections
    .map(collection => {
      const dates = contentRows
        .filter(r => r.collection_id === collection.id)
        .map(r => dateOf(r))
      return { collection, dates }
    })
    .filter(({ dates }) => dates.length > 0)
    .map(({ collection, dates }) => ({
      path: `/library/${collection.slug}`,
      lastModified: newest(dates),
    }))

  // Scripture. Book coverage counts every reference. Chapter coverage counts
  // only the focused ones, for the reason given above.
  const bookById = new Map(tax.books.map(b => [b.id, b]))
  const bookDates = new Map<string, Date[]>()
  const chapterDates = new Map<string, Date[]>()

  for (const ref of scriptureRows) {
    const book = bookById.get(ref.book_id)
    const date = dateById.get(ref.content_id)
    if (!book || !date) continue

    const push = (map: Map<string, Date[]>, key: string) => {
      const list = map.get(key)
      if (list) list.push(date)
      else map.set(key, [date])
    }

    push(bookDates, book.slug)

    const from = Math.max(1, ref.chapter_start)
    const to = Math.min(book.chapter_count, ref.chapter_end ?? ref.chapter_start)
    if (to - from + 1 > FOCUSED_CHAPTER_SPAN) continue
    for (let chapter = from; chapter <= to; chapter++) {
      push(chapterDates, `${book.slug}/${chapter}`)
    }
  }

  // Canonical order, so the sitemap reads Genesis to Revelation.
  const books: UrlEntry[] = tax.books
    .filter(b => bookDates.has(b.slug))
    .map(b => ({ path: `/scripture/${b.slug}`, lastModified: newest(bookDates.get(b.slug)!) }))

  const chapters: UrlEntry[] = tax.books.flatMap(book =>
    Array.from({ length: book.chapter_count }, (_, i) => i + 1)
      .filter(chapter => chapterDates.has(`${book.slug}/${chapter}`))
      .map(chapter => ({
        path: `/scripture/${book.slug}/${chapter}`,
        lastModified: newest(chapterDates.get(`${book.slug}/${chapter}`)!),
      })),
  )

  const topicDates = new Map<number, Date[]>()
  for (const link of topicRows) {
    const date = dateById.get(link.content_id)
    if (!date) continue
    const list = topicDates.get(link.topic_id)
    if (list) list.push(date)
    else topicDates.set(link.topic_id, [date])
  }

  const topics: UrlEntry[] = tax.topics
    .filter(t => topicDates.has(t.id))
    .map(t => ({ path: `/topics/${t.slug}`, lastModified: newest(topicDates.get(t.id)!) }))

  return {
    pieces,
    shows,
    books,
    chapters,
    topics,
    latest: newest(pieces.map(p => p.lastModified)),
  }
})

/*
  Legacy paths that no longer match their canonical path.

  content_slug_history is the record of every published path. A row whose
  old_path already equals the canonical path needs no redirect, and emitting
  one would be an infinite loop, so only genuine moves come back from here.

  This is called from next.config.ts, which means it runs at build. A slug that
  moves after a deploy will not redirect until the next build. That is the
  right trade while the set is small and slugs are stable: static redirects are
  checked before the filesystem and cost nothing per request, where a proxy
  would run on every request in the site to catch a case that has not happened
  yet.
*/
export async function legacyRedirects(): Promise<{ from: string; to: string }[]> {
  const history = await paged<{ content_id: string; old_path: string }>((from, to) =>
    library
      .from('content_slug_history')
      .select('content_id, old_path')
      .order('id')
      .range(from, to),
  )
  if (!history.length) return []

  const rows = await paged<{
    id: string; slug: string; legacy_id: string | null; collection_id: number | null
  }>((from, to) =>
    library.from('content').select('id, slug, legacy_id, collection_id').order('id').range(from, to),
  )
  const { collections } = await getTaxonomy()
  const canonicalById = new Map(rows.map(r => [r.id, hrefFor(r, collections)]))

  const moves: { from: string; to: string }[] = []
  const seen = new Set<string>()
  for (const entry of history) {
    const canonical = canonicalById.get(entry.content_id)
    if (!canonical) continue
    if (canonical === entry.old_path) continue
    if (seen.has(entry.old_path)) continue
    seen.add(entry.old_path)
    moves.push({ from: entry.old_path, to: canonical })
  }
  return moves
}
