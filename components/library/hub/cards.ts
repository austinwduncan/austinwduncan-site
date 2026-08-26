import type { Piece } from '@/lib/library/types'

/*
  Card shaping for the Library home.

  Kept apart from the components so the page stays a server component that
  hands plain, serializable objects across the client boundary. Nothing here
  touches the database: it only reshapes what the read layer already returned.
*/

export type HubCard = {
  /** Stable React key. Piece ids are uuids, so they are unique per shelf. */
  id: string
  title: string
  href: string
  image: string | null
  kicker: string | null
  meta: string | null
  blurb: string | null
}

/*
  Summaries were imported from MDX front matter and still carry markdown.
  Rendering them raw puts asterisks on the card, so the marks come off here.
  The wording itself is Austin's and is left alone.
*/
export function cleanText(input: string | null | undefined): string {
  if (!input) return ''
  return input
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\\([_*[\]])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Always UTC, so the server render and the client hydration agree. */
export function formatDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  })
}

const join = (parts: (string | null | undefined)[]) => {
  const kept = parts.filter(Boolean) as string[]
  return kept.length ? kept.join(' · ') : null
}

/** Where a piece sits in the wider collection. Used on mixed shelves. */
export function collectionKicker(p: Piece): string | null {
  return p.collection?.name ?? p.format?.name ?? null
}

/** Where a piece sits inside its own show. Used on the per show shelves. */
/*
  One kind of kicker per row, decided by the row rather than per card.

  Choosing per card produced rows reading "Romans 3", "Exegetica", "Ezekiel 1",
  "Genesis 1:1-3:24", because a piece with a series showed its series, one with
  only scripture showed a passage, and one with neither showed its collection.
  Three different kinds of label in a single row reads as noise.

  A mode is used only when every piece in the row can supply it, so the row is
  uniform or it falls back to something all of them have.
*/
export type KickerMode = 'series' | 'scripture' | 'collection' | 'none'

export function chooseKickerMode(pieces: Piece[]): KickerMode {
  if (!pieces.length) return 'none'
  if (pieces.every(p => p.series)) return 'series'
  if (pieces.every(p => p.scripture.length > 0)) return 'scripture'
  if (pieces.every(p => p.collection)) return 'collection'
  return 'none'
}

/** Episode numbers only appear when the whole row has them. */
export function kickerFor(pieces: Piece[]): (p: Piece) => string | null {
  const mode = chooseKickerMode(pieces)
  const numbered = pieces.length > 0 && pieces.every(p => p.episode != null)
  return (p: Piece) => {
    const place =
      mode === 'series' ? (p.series?.name ?? null)
      : mode === 'scripture' ? (p.scripture[0]?.label ?? null)
      : mode === 'collection' ? (p.collection?.name ?? null)
      : null
    return join([place, numbered && p.episode != null ? `Episode ${p.episode}` : null])
  }
}

export function toCard(p: Piece, kicker: string | null): HubCard {
  return {
    id: p.id,
    title: p.title,
    href: p.href,
    image: p.artwork,
    kicker,
    meta: join([
      formatDate(p.publishedAt),
      p.readingMinutes ? `${p.readingMinutes} min read` : null,
    ]),
    blurb: cleanText(p.subtitle ?? p.summary) || null,
  }
}
