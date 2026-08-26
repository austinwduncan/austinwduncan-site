import type { Piece } from '@/lib/library/types'

/*
  Small shared bits of presentation for a show page.

  The episode label is the one that matters. The number is global across a
  whole show and was minted at production, printed straight into the artwork
  ("Word for Word - Episode 51.jpg"), so it is never re-derived from the season
  a piece happens to sit in. Categories are an editorial judgment Austin can
  revise; the number is not. That is why nothing here ever counts an index.
*/

export const HEADING = 'var(--font-cmg), system-ui, sans-serif'
export const BODY = 'var(--font-source-serif), Georgia, serif'

/** "Episode 51", or null for a show that never numbered its pieces. */
export function episodeLabel(piece: Piece): string | null {
  return piece.episode == null ? null : `Episode ${piece.episode}`
}

/** Fixed to UTC so the server and the client never disagree on the day. */
export function formatDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  })
}

export function readingLabel(minutes: number | null): string | null {
  return minutes ? `${minutes} min read` : null
}

/** Newest first, with undated pieces last rather than jumbled into the middle. */
export function byNewest(a: Piece, b: Piece): number {
  const at = a.publishedAt ? Date.parse(a.publishedAt) : -1
  const bt = b.publishedAt ? Date.parse(b.publishedAt) : -1
  return bt - at
}

/** The passage a card leads with, if the piece names one. */
export function primaryPassage(piece: Piece): string | null {
  return (piece.scripture.find(s => s.isPrimary) ?? piece.scripture[0])?.label ?? null
}

/**
 * The meta line under a title: date, reading time, primary passage.
 * Pass `passage: false` where the passage is already the card's eyebrow, so
 * the same reference is never printed twice on one card.
 */
export function metaLine(piece: Piece, { passage = true }: { passage?: boolean } = {}): string {
  return [
    formatDate(piece.publishedAt),
    readingLabel(piece.readingMinutes),
    passage ? primaryPassage(piece) : null,
  ]
    .filter(Boolean)
    .join('  ·  ')
}

/**
 * Reading order inside a season.
 *
 * Numbered episodes lead, ascending by their own global number, gaps intact.
 * Shows that never numbered anything (Sermons, Exegetica, Forum and Pulpit,
 * and the book studies in In the Text) fall back to date ascending, so a study
 * of Daniel opens at chapter 1 rather than at the most recent instalment.
 */
export function inSeasonOrder(a: Piece, b: Piece): number {
  const an = a.episode ?? Number.POSITIVE_INFINITY
  const bn = b.episode ?? Number.POSITIVE_INFINITY
  if (an !== bn) return an - bn
  const at = a.publishedAt ? Date.parse(a.publishedAt) : Number.POSITIVE_INFINITY
  const bt = b.publishedAt ? Date.parse(b.publishedAt) : Number.POSITIVE_INFINITY
  return at - bt
}
