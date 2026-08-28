import { cache } from 'react'
import { library } from './client'
import type {
  Facet, FullPiece, LibraryFilters, Piece, ScriptureRef, Season, Show,
} from './types'
import type { BibleBookRow, ContentRow } from './database.types'

/*
  Read layer for the Library.

  Every export is wrapped in React's `cache`, so a route that asks for the
  taxonomy in three places pays for one query per request.

  Joins are done in application code rather than through PostgREST embedding.
  The join tables carry provenance columns (source, confidence, run_id) that
  the page never wants, and a nested select drags them along on every row.
  Fetching the small taxonomy tables once and mapping by id is both cheaper and
  far easier to read.
*/

/*
  Transient database failures are retried.

  The build prerenders 478 pages with 9 workers, all reading Postgres at once,
  and Supabase cancels a statement that waits too long under that contention.
  It is intermittent: the same build fails and then succeeds unchanged, which
  makes it a coin flip in CI rather than a reproducible fault.

  Retrying with backoff turns a failed deploy into a slower one. Only transient
  classes are retried; a real error, a bad column or a policy denial, still
  fails immediately rather than being retried three times and hidden.
*/
const TRANSIENT = /statement timeout|connection|ECONNRESET|ETIMEDOUT|fetch failed|too many/i

async function resilient<T>(label: string, run: () => Promise<T>): Promise<T> {
  let lastError: unknown
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      return await run()
    } catch (error) {
      lastError = error
      if (!TRANSIENT.test(String((error as Error)?.message ?? error))) throw error
      if (attempt === 4) break
      await new Promise(r => setTimeout(r, 250 * 2 ** (attempt - 1)))
    }
  }
  throw new Error(`Library ${label} failed after 4 attempts: ${String(lastError)}`)
}

// ─── Taxonomy ────────────────────────────────────────────────────────────────

export const getTaxonomy = cache(async () => {
  const [collections, series, topics, doctrines, formats, approaches, levels, books] =
    await Promise.all([
      library.from('collections').select('*').order('position'),
      library.from('series').select('*').order('position'),
      library.from('topics').select('*').order('name'),
      library.from('doctrines').select('*').order('name'),
      library.from('formats').select('*').order('position'),
      library.from('approaches').select('*').order('position'),
      library.from('levels').select('*').order('depth'),
      library.from('bible_books').select('*').order('position'),
    ])

  return {
    collections: collections.data ?? [],
    series: series.data ?? [],
    topics: topics.data ?? [],
    doctrines: doctrines.data ?? [],
    formats: formats.data ?? [],
    approaches: approaches.data ?? [],
    levels: levels.data ?? [],
    books: (books.data ?? []) as BibleBookRow[],
  }
})

const facet = (r: { id: number; slug: string; name: string } | undefined): Facet | null =>
  r ? { id: r.id, slug: r.slug, name: r.name } : null

/*
  Canonical path for a piece.

  Routes deliberately did not move when the collections were renamed. About 220
  published URLs exist in the wild and none of them may 404, so the display
  label ("In the Text") and the path segment ("teaching") are allowed to differ.
*/
export function hrefFor(
  row: Pick<ContentRow, 'slug' | 'legacy_id' | 'collection_id'>,
  collections?: { id: number; slug: string }[],
): string {
  // legacy_source is always "mdx"; the original path lives in legacy_id.
  const path = row.legacy_id ?? ''
  if (path.includes('/word-for-word/')) return `/word-for-word/${row.slug}`
  if (path.includes('/exegetica/')) return `/exegetica/${row.slug}`
  if (path.includes('/forum-and-pulpit/')) return `/forum-and-pulpit/${row.slug}`
  if (path.includes('/sermons/')) return `/sermons/${row.slug}`
  if (path.includes('/topical/')) return `/teaching/topical/${row.slug}`
  if (path.includes('/expositional/')) return `/teaching/expositional/${row.slug}`

  /*
    No legacy path, which today means a piece authored after the import.
    Detail pages still render from MDX, so such a piece has no page of its own
    yet. Send the reader to the show that contains it, which always exists.

    The previous fallback was `/library/${slug}`, and that collides with
    `/library/[show]` and returns a 404. Landing on the right show is a poor
    answer but an honest one; a 404 is neither.
  */
  const collection = collections?.find(c => c.id === row.collection_id)
  return collection ? `/library/${collection.slug}` : '/library'
}

/** Builds "Luke 15:11-32" style labels. Uses a plain hyphen, never a dash. */
function scriptureLabel(
  book: string, cs: number, vs: number | null, ce: number | null, ve: number | null,
): string {
  const start = vs ? `${cs}:${vs}` : `${cs}`
  if (ce == null || (ce === cs && (ve == null || ve === vs))) return `${book} ${start}`
  const end = ce === cs ? `${ve}` : ve ? `${ce}:${ve}` : `${ce}`
  return `${book} ${start}-${end}`
}

// ─── Assembling pieces ───────────────────────────────────────────────────────

/*
  PostgREST caps every response at 1000 rows.

  The join tables are larger than the content table: content_topics holds about
  1050 rows and scripture_references about 1650. A single `.in('content_id',
  ids)` across all 213 pieces therefore returned a truncated set, and the tail
  vanished without an error. Unfiltered pages reported Romans, Hebrews, the
  letters and Revelation as touching no scripture at all.

  This pages until a short page comes back, so the caller always gets the whole
  set. Found by an agent cross checking rendered counts against a direct query
  rather than trusting the numbers the layer produced.
*/
const PAGE = 1000

async function fetchAllJoinRows<T>(
  table: 'content_topics' | 'scripture_references',
  columns: string,
  ids: string[],
  order?: string,
): Promise<T[]> {
  const out: T[] = []
  for (let from = 0; ; from += PAGE) {
    let q = library.from(table).select(columns).in('content_id', ids).range(from, from + PAGE - 1)
    if (order) q = q.order(order)
    const rows = await resilient(table, async () => {
      const { data, error } = await q
      if (error) throw new Error(error.message)
      return (data ?? []) as unknown as T[]
    })
    out.push(...rows)
    if (rows.length < PAGE) return out
  }
}


async function decorate(rows: ContentRow[]): Promise<Piece[]> {
  if (!rows.length) return []
  const ids = rows.map(r => r.id)
  const tax = await getTaxonomy()

  const [topicLinks, scriptureRows] = await Promise.all([
    fetchAllJoinRows<{ content_id: string; topic_id: number; is_primary: boolean }>(
      'content_topics', 'content_id, topic_id, is_primary', ids),
    fetchAllJoinRows<{
      content_id: string; book_id: number; chapter_start: number; verse_start: number | null
      chapter_end: number | null; verse_end: number | null; is_primary: boolean; is_sweep: boolean
    }>('scripture_references',
      'content_id, book_id, chapter_start, verse_start, chapter_end, verse_end, is_primary, is_sweep',
      ids, 'start_ref'),
  ])

  const topicById = new Map(tax.topics.map(t => [t.id, t]))
  const bookById = new Map(tax.books.map(b => [b.id, b]))
  const collectionById = new Map(tax.collections.map(c => [c.id, c]))
  const seriesById = new Map(tax.series.map(s => [s.id, s]))
  const formatById = new Map(tax.formats.map(f => [f.id, f]))
  const levelById = new Map(tax.levels.map(l => [l.id, l]))

  const topicsFor = new Map<string, Facet[]>()
  for (const link of topicLinks) {
    const t = topicById.get(link.topic_id)
    if (!t) continue
    const list = topicsFor.get(link.content_id) ?? []
    // Primary topics lead, so a card that shows only one shows the right one.
    if (link.is_primary) list.unshift(facet(t)!)
    else list.push(facet(t)!)
    topicsFor.set(link.content_id, list)
  }

  const scriptureFor = new Map<string, ScriptureRef[]>()
  for (const s of scriptureRows) {
    const b = bookById.get(s.book_id)
    // A whole book sweep is a gesture at the book, not a passage taught, so it
    // is not shown as one of the piece's references. See migration 0008.
    if (!b || s.is_sweep) continue
    const list = scriptureFor.get(s.content_id) ?? []
    list.push({
      book: b.name, bookSlug: b.slug,
      label: scriptureLabel(b.name, s.chapter_start, s.verse_start, s.chapter_end, s.verse_end),
      chapterStart: s.chapter_start, verseStart: s.verse_start,
      chapterEnd: s.chapter_end, verseEnd: s.verse_end, isPrimary: s.is_primary,
    })
    scriptureFor.set(s.content_id, list)
  }

  return rows.map(r => ({
    id: r.id,
    slug: r.slug,
    href: hrefFor(r, tax.collections),
    title: r.title,
    subtitle: r.subtitle,
    summary: r.summary,
    artwork: r.featured_image,
    publishedAt: r.published_at,
    readingMinutes: r.reading_minutes,
    collection: facet(r.collection_id ? collectionById.get(r.collection_id) : undefined),
    series: facet(r.series_id ? seriesById.get(r.series_id) : undefined),
    episode: r.series_position,
    format: facet(r.format_id ? formatById.get(r.format_id) : undefined),
    level: facet(r.level_id ? levelById.get(r.level_id) : undefined),
    topics: topicsFor.get(r.id) ?? [],
    scripture: scriptureFor.get(r.id) ?? [],
  }))
}

// ─── Queries ─────────────────────────────────────────────────────────────────

const SORTS = {
  newest: { column: 'published_at', ascending: false },
  oldest: { column: 'published_at', ascending: true },
  episode: { column: 'series_position', ascending: true },
  title: { column: 'title', ascending: true },
} as const

export const getPieces = cache(async (filters: LibraryFilters = {}): Promise<Piece[]> => {
  const tax = await getTaxonomy()
  let q = library.from('content').select('*')

  const bySlug = <T extends { slug: string; id: number }>(list: T[], slug?: string) =>
    slug ? list.find(x => x.slug === slug)?.id : undefined

  const collectionId = bySlug(tax.collections, filters.collection)
  if (collectionId) q = q.eq('collection_id', collectionId)
  const seriesId = bySlug(tax.series, filters.series)
  if (seriesId) q = q.eq('series_id', seriesId)
  const formatId = bySlug(tax.formats, filters.format)
  if (formatId) q = q.eq('format_id', formatId)
  const levelId = bySlug(tax.levels, filters.level)
  if (levelId) q = q.eq('level_id', levelId)

  // Dimensions that live in join tables narrow the id set first. The table
  // name is a union rather than a string so the typed client can still infer.
  type JoinTable = 'content_topics' | 'content_doctrines' | 'content_approaches'
  const narrow = async (table: JoinTable, column: string, id?: number) => {
    if (!id) return null
    const { data } = await library.from(table).select('content_id').eq(column, id)
    return (data ?? []).map(r => r.content_id as string)
  }
  const idSets = (await Promise.all([
    narrow('content_topics', 'topic_id', bySlug(tax.topics, filters.topic)),
    narrow('content_doctrines', 'doctrine_id', bySlug(tax.doctrines, filters.doctrine)),
    narrow('content_approaches', 'approach_id', bySlug(tax.approaches, filters.approach)),
    filters.book ? scriptureIds(filters.book, filters.chapter, filters.verse) : Promise.resolve(null),
  ])).filter(Boolean) as string[][]

  if (idSets.length) {
    const intersection = idSets.reduce((a, b) => a.filter(x => b.includes(x)))
    if (!intersection.length) return []
    q = q.in('id', intersection)
  }

  if (filters.q) q = q.or(`title.ilike.%${filters.q}%,summary.ilike.%${filters.q}%`)

  const sort = SORTS[filters.sort ?? 'newest']
  q = q.order(sort.column, { ascending: sort.ascending, nullsFirst: false })
  if (filters.limit) q = q.range(filters.offset ?? 0, (filters.offset ?? 0) + filters.limit - 1)

  const rows = await resilient('getPieces', async () => {
    const { data, error } = await q
    if (error) throw new Error(error.message)
    return (data ?? []) as ContentRow[]
  })
  return decorate(rows)
})

/*
  Scripture lookup by integer bounds.

  Sweeps are excluded. A sermon tagged "Psalms 1-150" matched all 150 chapters
  under the overlap test, which made a whole book gesture look like teaching on
  every psalm. Counting direct references only, Psalms goes from 150 of 150 to
  36 of 150.

  A reference is stored as a closed interval, encoded as
  book_position * 1000000 + chapter * 1000 + verse. Asking what touches a
  passage is therefore an overlap test, `start_ref <= target_end AND
  end_ref >= target_start`, which the (start_ref, end_ref) index serves
  directly rather than scanning.
*/
export const scriptureIds = cache(
  async (bookSlug: string, chapter?: number, verse?: number): Promise<string[]> => {
    const tax = await getTaxonomy()
    const book = tax.books.find(b => b.slug === bookSlug)
    if (!book) return []

    const base = book.position * 1_000_000
    const start = base + (chapter ?? 1) * 1_000 + (verse ?? 0)
    const end = chapter
      ? base + chapter * 1_000 + (verse ?? 999)
      : base + book.chapter_count * 1_000 + 999

    return resilient('scriptureIds', async () => {
      const { data, error } = await library.from('scripture_references')
        .select('content_id').eq('is_sweep', false)
        .lte('start_ref', end).gte('end_ref', start)
      if (error) throw new Error(error.message)
      return [...new Set((data ?? []).map(r => r.content_id as string))]
    })
  },
)

export const getPieceBySlug = cache(async (slug: string): Promise<FullPiece | null> => {
  const { data } = await library.from('content').select('*').eq('slug', slug).maybeSingle()
  if (!data) return null

  const row = data as ContentRow
  const [base] = await decorate([row])
  const tax = await getTaxonomy()

  const [doctrines, approaches, media] = await Promise.all([
    library.from('content_doctrines').select('doctrine_id').eq('content_id', row.id),
    library.from('content_approaches').select('approach_id').eq('content_id', row.id),
    library.from('media').select('kind, provider, url, duration_secs')
      .eq('content_id', row.id).order('position'),
  ])

  const pick = <T extends { id: number; slug: string; name: string }>(
    list: T[], ids: number[],
  ): Facet[] => ids.map(id => facet(list.find(x => x.id === id))).filter(Boolean) as Facet[]

  return {
    ...base,
    body: row.body,
    bodyText: row.body_text,
    doctrines: pick(tax.doctrines, (doctrines.data ?? []).map(d => d.doctrine_id)),
    approaches: pick(tax.approaches, (approaches.data ?? []).map(a => a.approach_id)),
    media: (media.data ?? []).map(m => ({
      kind: m.kind, provider: m.provider, url: m.url, durationSecs: m.duration_secs,
    })),
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
  }
})

/** Resolves a retired path to its current one, so old links never 404. */
export const resolveLegacyPath = cache(async (oldPath: string): Promise<string | null> => {
  const { data } = await library.from('content_slug_history')
    .select('content_id').eq('old_path', oldPath).maybeSingle()
  if (!data) return null
  const { data: row } = await library.from('content')
    .select('slug, legacy_id, collection_id').eq('id', data.content_id).maybeSingle()
  const tax = await getTaxonomy()
  return row ? hrefFor(row as ContentRow, tax.collections) : null
})

// ─── Shows and seasons ───────────────────────────────────────────────────────

export const getShows = cache(async (): Promise<Show[]> => {
  const tax = await getTaxonomy()
  const all = await getPieces({ sort: 'newest' })

  return tax.collections.map(c => {
    const mine = all.filter(p => p.collection?.id === c.id)
    const seasons: Season[] = tax.series
      .filter(s => s.collection_id === c.id)
      .map(s => ({
        id: s.id, slug: s.slug, name: s.name, subtitle: s.subtitle,
        artwork: s.artwork_url, isComplete: s.is_complete,
        // Ascending by episode number. Gaps are expected and honest: the
        // number is global across the whole show, not per season.
        episodes: mine
          .filter(p => p.series?.id === s.id)
          .sort((a, b) => (a.episode ?? 1e9) - (b.episode ?? 1e9)),
      }))
      .filter(s => s.episodes.length)

    return {
      id: c.id, slug: c.slug, name: c.name, tagline: c.tagline,
      description: c.description, artwork: c.artwork_url,
      logo: c.logo_url, blurb: c.blurb, accent: c.accent,
      count: mine.length,
      seasons,
      loose: mine.filter(p => !p.series),
    }
  })
})

export const getShow = cache(async (slug: string): Promise<Show | null> => {
  const shows = await getShows()
  return shows.find(s => s.slug === slug) ?? null
})

// ─── Canon coverage ──────────────────────────────────────────────────────────

export type BookCoverage = {
  name: string
  abbreviation: string
  slug: string
  testament: 'OT' | 'NT'
  chapterCount: number
  /** Distinct chapters with at least one direct reference. */
  taught: number
}

/*
  How much of the canon has actually been taught.

  Counts distinct chapters rather than references, so a book worked through
  once weighs the same as a book quoted forty times in passing. Sweeps are
  excluded for the same reason they are excluded everywhere else: a piece
  tagged Psalms 1-150 is a gesture at the book, not teaching on every psalm.
*/
export const getCanonCoverage = cache(async (): Promise<BookCoverage[]> => {
  const tax = await getTaxonomy()

  const rows: { book_id: number; chapter_start: number; chapter_end: number | null }[] = []
  for (let from = 0; ; from += PAGE) {
    const page = await resilient('canon coverage', async () => {
      const { data, error } = await library
        .from('scripture_references')
        .select('book_id, chapter_start, chapter_end')
        .eq('is_sweep', false)
        .range(from, from + PAGE - 1)
      if (error) throw new Error(error.message)
      return data ?? []
    })
    rows.push(...page)
    if (page.length < PAGE) break
  }

  const chapters = new Map<number, Set<number>>()
  for (const r of rows) {
    const book = tax.books.find(b => b.id === r.book_id)
    if (!book) continue
    const set = chapters.get(r.book_id) ?? new Set<number>()
    const to = Math.min(book.chapter_count, r.chapter_end ?? r.chapter_start)
    for (let c = Math.max(1, r.chapter_start); c <= to; c++) set.add(c)
    chapters.set(r.book_id, set)
  }

  return tax.books.map(b => ({
    name: b.name,
    abbreviation: b.abbreviation ?? b.name.slice(0, 4),
    slug: b.slug,
    testament: b.testament === 'OT' ? 'OT' : 'NT',
    chapterCount: b.chapter_count,
    taught: chapters.get(b.id)?.size ?? 0,
  }))
})

// ─── Related ─────────────────────────────────────────────────────────────────

/** Nearest neighbours by shared topics, then shared scripture. */
export const getRelated = cache(async (id: string, limit = 6): Promise<Piece[]> => {
  const { data: mine } = await library.from('content_topics')
    .select('topic_id').eq('content_id', id)
  const topicIds = (mine ?? []).map(r => r.topic_id)
  if (!topicIds.length) return []

  const { data: neighbours } = await library.from('content_topics')
    .select('content_id, topic_id').in('topic_id', topicIds)

  const score = new Map<string, number>()
  for (const n of neighbours ?? []) {
    if (n.content_id === id) continue
    score.set(n.content_id, (score.get(n.content_id) ?? 0) + 1)
  }
  const ranked = [...score.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([k]) => k)
  if (!ranked.length) return []

  const { data } = await library.from('content').select('*').in('id', ranked)
  const pieces = await decorate((data ?? []) as ContentRow[])
  return pieces.sort((a, b) => ranked.indexOf(a.id) - ranked.indexOf(b.id))
})
