/*
  Domain shapes for the Library.

  The database keeps the dimensions independent on purpose: format is what a
  piece is, approach is how it argues, level is how deep it goes, and none of
  them compete. These types preserve that separation rather than flattening it
  back into one tag array, which is the mistake the schema exists to prevent.
*/

export type Facet = { id: number; slug: string; name: string }

export type ScriptureRef = {
  book: string
  bookSlug: string
  /** Human label, for example "Luke 15:11-32". Never contains a dash character. */
  label: string
  chapterStart: number
  verseStart: number | null
  chapterEnd: number | null
  verseEnd: number | null
  isPrimary: boolean
}

/** A card. Everything a shelf, grid or billboard needs, and nothing more. */
export type Piece = {
  id: string
  slug: string
  /** Canonical public path. Legacy paths still resolve through slug history. */
  href: string
  title: string
  subtitle: string | null
  summary: string | null
  artwork: string | null
  publishedAt: string | null
  readingMinutes: number | null
  collection: Facet | null
  series: Facet | null
  /**
   * Episode number. Global and canonical, minted at production and printed
   * into the artwork, so it is never re-derived from the season a piece sits
   * in. Seasons are named, never numbered, and a season's episodes are
   * therefore non-contiguous by design.
   */
  episode: number | null
  format: Facet | null
  level: Facet | null
  topics: Facet[]
  scripture: ScriptureRef[]
}

/** A piece with its body and everything the detail page needs. */
export type FullPiece = Piece & {
  body: unknown | null
  bodyText: string | null
  doctrines: Facet[]
  approaches: Facet[]
  media: { kind: string; provider: string | null; url: string; durationSecs: number | null }[]
  seoTitle: string | null
  seoDescription: string | null
}

/** A named grouping inside a show. Never numbered. */
export type Season = {
  id: number
  slug: string
  name: string
  subtitle: string | null
  artwork: string | null
  isComplete: boolean
  episodes: Piece[]
}

/** A branded property: Word for Word, In the Text, Exegetica, Forum & Pulpit. */
export type Show = {
  id: number
  slug: string
  name: string
  tagline: string | null
  description: string | null
  artwork: string | null
  count: number
  seasons: Season[]
  /** Pieces in this show that belong to no season. */
  loose: Piece[]
}

export type LibraryFilters = {
  collection?: string
  series?: string
  topic?: string
  doctrine?: string
  format?: string
  approach?: string
  level?: string
  book?: string
  chapter?: number
  verse?: number
  q?: string
  sort?: 'newest' | 'oldest' | 'episode' | 'title'
  limit?: number
  offset?: number
}
