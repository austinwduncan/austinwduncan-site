import Link from 'next/link'
import Artwork from '@/components/library/artwork'
import type { Piece } from '@/lib/library/types'

/*
  Grade calibrated against the artwork, not assumed.

  The original treatment assumed Austin's covers ran near white to near black
  and needed flattening. Measuring all 272 of them says otherwise: the median
  sits at 35 percent brightness and 133 are already below that. The old grade
  then halved it to 18 percent, which pushed the darkest covers to near black.
  "War with Iran" read as an empty card on the shelf.

  So the brightness cut is gone and the graphite veil drops from 42 to 20
  percent. Grayscale, the steel tint and the vignette stay, which is what keeps
  a shelf reading as one set. Full colour still returns on hover.
*/
/*
  A result tile for the browse grid.

  Same grade as every other Library tile: Austin's artwork runs from near
  white (Hebrews) to near black (Daniel), so a raw grid of it reads as noise.
  Grayscale with reduced contrast and brightness, a graphite veil, a steel
  tint, a vignette and grain, and every layer lifts on hover so the original
  art is still the reward.

  Nothing is ever set on top of the art. Austin typesets titles into the
  images themselves, so a chip over the frame collides with type that is
  already there. Everything the card says sits below the frame.

  This is the browse variant rather than the shelf variant, so the summary is
  printed under the title instead of hiding in a hover panel. A grid of
  results is scanned, not swept, and the reader is deciding between twenty
  things at once.
*/

const HEADING = 'var(--font-cmg), system-ui, sans-serif'

/*
  Summaries were imported from MDX front matter and still carry markdown, so
  the marks come off before they reach a card. The wording is Austin's and is
  left exactly as written.
*/
function cleanText(input: string | null | undefined): string {
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
function formatDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}

export default function BrowsePieceCard({ piece }: { piece: Piece }) {
  const kicker = piece.collection?.name ?? piece.format?.name ?? null
  const blurb = cleanText(piece.subtitle ?? piece.summary)
  const meta = [
    piece.series?.name ?? piece.scripture[0]?.label ?? null,
    formatDate(piece.publishedAt) || null,
    piece.readingMinutes ? `${piece.readingMinutes} min read` : null,
  ].filter(Boolean).join(' · ')

  return (
    <Link
      href={piece.href}
      className="group relative block min-w-0 outline-none focus-visible:z-30"
      style={{ zIndex: 0 }}
    >
      <Artwork
        src={piece.artwork}
        title={piece.title}
        aspect="16/9"
        className="relative overflow-hidden rounded-[3px] transition-all duration-300 ease-out group-hover:z-20 group-hover:-translate-y-1.5 group-hover:shadow-[0_22px_50px_rgba(0,0,0,0.55)] group-focus-visible:-translate-y-1.5"
      />

      {kicker && (
        <p
          className="mt-3.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: HEADING, color: 'var(--awd-accent-2)' }}
        >
          {kicker}
        </p>
      )}

      {/*
        Titles are dynamic and are never uppercased. Austin writes long
        questions and uppercase eats the line clamp.
      */}
      <h3
        className="mt-1.5 text-[0.95rem] leading-snug transition-colors group-hover:text-[var(--awd-gold)]"
        style={{
          fontFamily: HEADING,
          fontWeight: 600,
          letterSpacing: '-0.01em',
          color: 'var(--awd-bone)',
        }}
      >
        {piece.title}
      </h3>

      {blurb && (
        <p
          className="mt-1.5 line-clamp-2 text-[0.8rem] leading-snug"
          style={{ fontFamily: 'var(--font-cmg), system-ui, sans-serif', color: 'rgba(238,234,225,0.62)' }}
        >
          {blurb}
        </p>
      )}

      {meta && (
        <p className="mt-2 line-clamp-1 text-[0.68rem]" style={{ color: 'var(--awd-stone)' }}>
          {meta}
        </p>
      )}
    </Link>
  )
}
