import Link from 'next/link'
import type { Piece } from '@/lib/library/types'
import ArtFrame from './art-frame'
import { HEADING, BODY, episodeLabel, metaLine, primaryPassage } from './meta'

/*
  The no-season view.

  Sermons, Exegetica and Forum and Pulpit have no seasons at all, and never
  will: a sermon belongs to a Sunday, not to a run. So this is not a fallback
  branch that renders whatever is left over. It is the primary shape for three
  of the five shows, and it is built to look chosen: the newest piece takes a
  wide lead panel, and everything behind it falls into an even grid, newest
  first.

  Where a piece does carry an episode number it is still shown, because the
  number belongs to the piece rather than to any grouping around it.
*/

/*
  The eyebrow prefers the episode number, then what the piece is, then the
  passage it works from. The passage is the last resort because it also appears
  in the meta line, and a card that prints the same reference twice reads as a
  bug.
*/
function eyebrowFor(piece: Piece): { label: string | null; isPassage: boolean } {
  const numbered = episodeLabel(piece)
  if (numbered) return { label: numbered, isPassage: false }
  if (piece.format) return { label: piece.format.name, isPassage: false }
  return { label: primaryPassage(piece), isPassage: true }
}

function Feature({ piece }: { piece: Piece }) {
  const blurb = piece.summary ?? piece.subtitle

  return (
    <Link href={piece.href} className="group mb-16 flex flex-col gap-8 lg:flex-row lg:gap-12">
      <div className="w-full shrink-0 lg:w-[34rem]">
        <ArtFrame src={piece.artwork} title={piece.title} ratio="16/9" />
      </div>

      <div className="min-w-0 flex-1 lg:pt-2">
        <p
          className="flex items-center gap-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.2em]"
          style={{ fontFamily: HEADING, color: 'var(--awd-gold)' }}
        >
          <span className="inline-block h-px w-[18px]" style={{ background: 'var(--awd-gold)' }} />
          Latest
        </p>

        <h3
          className="mt-4 text-[1.6rem] leading-[1.14] transition-colors duration-200 group-hover:text-[var(--awd-gold)] lg:text-[2.1rem]"
          style={{
            fontFamily: HEADING,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--awd-bone)',
          }}
        >
          {piece.title}
        </h3>

        {blurb && (
          <p
            className="mt-5 line-clamp-4 max-w-[40rem] text-[1.02rem] leading-relaxed"
            style={{ fontFamily: BODY, color: 'rgba(238,234,225,0.66)' }}
          >
            {blurb}
          </p>
        )}

        <p className="mt-5 text-[0.74rem]" style={{ fontFamily: BODY, color: 'var(--awd-stone)' }}>
          {metaLine(piece)}
        </p>
      </div>
    </Link>
  )
}

function Card({ piece }: { piece: Piece }) {
  const { label, isPassage } = eyebrowFor(piece)

  return (
    <Link href={piece.href} className="group block min-w-0">
      <ArtFrame src={piece.artwork} title={piece.title} ratio="16/9" />

      {label && (
        <p
          className="mt-4 truncate text-[0.6rem] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: HEADING, color: 'var(--awd-accent-2)' }}
        >
          {label}
        </p>
      )}

      <h3
        className="mt-2 text-[1.02rem] leading-[1.3] transition-colors duration-200 group-hover:text-[var(--awd-gold)]"
        style={{
          fontFamily: HEADING,
          fontWeight: 600,
          letterSpacing: '-0.012em',
          color: 'var(--awd-bone)',
        }}
      >
        {piece.title}
      </h3>

      <p className="mt-2.5 truncate text-[0.7rem]" style={{ fontFamily: BODY, color: 'var(--awd-stone)' }}>
        {metaLine(piece, { passage: !isPassage })}
      </p>
    </Link>
  )
}

export default function PieceGrid({
  pieces,
  heading,
  note,
  lead = false,
}: {
  pieces: Piece[]
  heading: string
  note?: string | null
  /** Give the newest piece a wide panel above the grid. */
  lead?: boolean
}) {
  if (!pieces.length) return null
  const feature = lead ? pieces[0] : null
  const rest = lead ? pieces.slice(1) : pieces

  return (
    <div>
      <div
        className="mb-12 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b pb-6"
        style={{ borderColor: 'rgba(238,234,225,0.12)' }}
      >
        <div className="min-w-0">
          <h2
            className="text-[0.82rem] font-semibold uppercase tracking-[0.18em]"
            style={{ fontFamily: HEADING, color: 'rgba(238,234,225,0.78)' }}
          >
            {heading}
          </h2>
          {note && (
            <p
              className="mt-3 max-w-[40rem] text-[0.97rem] leading-relaxed"
              style={{ fontFamily: BODY, color: 'rgba(238,234,225,0.55)' }}
            >
              {note}
            </p>
          )}
        </div>
        <p
          className="shrink-0 text-[0.64rem] font-semibold uppercase tracking-[0.16em]"
          style={{ fontFamily: HEADING, color: 'var(--awd-accent-2)' }}
        >
          {pieces.length} {pieces.length === 1 ? 'piece' : 'pieces'}
        </p>
      </div>

      {feature && <Feature piece={feature} />}

      <div
        className="grid gap-x-7 gap-y-12"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 16rem), 1fr))' }}
      >
        {rest.map(piece => (
          <Card key={piece.id} piece={piece} />
        ))}
      </div>
    </div>
  )
}
