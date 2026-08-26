import Link from 'next/link'
import type { Piece } from '@/lib/library/types'

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

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")"

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
      <div
        className="relative overflow-hidden rounded-[3px] transition-all duration-300 ease-out group-hover:z-20 group-hover:-translate-y-1.5 group-hover:shadow-[0_22px_50px_rgba(0,0,0,0.55)] group-focus-visible:-translate-y-1.5"
        style={{ aspectRatio: '16/9', background: 'var(--awd-graphite)' }}
      >
        {piece.artwork ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={piece.artwork}
            alt=""
            loading="lazy"
            className="h-full w-full scale-[1.04] object-cover grayscale contrast-[0.88] brightness-[0.86] transition-all duration-[600ms] ease-out group-hover:scale-[1.09] group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100"
          />
        ) : (
          <span aria-hidden className="section-pattern absolute inset-0" />
        )}

        <span
          aria-hidden
          className="absolute inset-0 transition-opacity duration-[600ms] group-hover:opacity-0"
          style={{ background: 'rgba(44,48,47,0.42)' }}
        />
        <span
          aria-hidden
          className="absolute inset-0 opacity-30 mix-blend-color transition-opacity duration-[600ms] group-hover:opacity-0"
          style={{ background: 'var(--awd-accent-2)' }}
        />
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ background: 'radial-gradient(120% 100% at 50% 40%, transparent 45%, rgba(23,25,24,0.5) 100%)' }}
        />
        <span
          aria-hidden
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{ backgroundImage: GRAIN }}
        />
      </div>

      {kicker && (
        <p
          className="mt-3.5 line-clamp-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em]"
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
        className="mt-1.5 line-clamp-2 text-[0.95rem] leading-snug transition-colors group-hover:text-[var(--awd-gold)]"
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
          style={{ fontFamily: 'var(--font-source-serif)', color: 'rgba(238,234,225,0.62)' }}
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
