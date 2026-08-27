import Link from 'next/link'
import type { Piece, Season } from '@/lib/library/types'
import ArtFrame from './art-frame'
import { HEADING, BODY, episodeLabel, inSeasonOrder, metaLine } from './meta'

/*
  A season and its episodes.

  Two things are load bearing here.

  1. Episodes are ordered by their own number, ascending, and those numbers
     will be non-contiguous inside a season: 4, 17, 31, 52 is a correct season.
     The number is global to the show and was minted when the episode was made,
     so it is shown exactly as stored. Gaps are never filled, never renumbered
     and never explained away.

  2. Where a show never numbered anything, the season falls back to date
     ascending rather than newest first, because an unnumbered season is
     almost always a book study and chapter 1 belongs at the top.

  3. Titles are long questions. They get the full width of the row, three lines
     before clamping, and they are never uppercased, because uppercase eats a
     line and pushes the end of the question out of view.
*/

function EpisodeRow({ piece, first }: { piece: Piece; first: boolean }) {
  const label = episodeLabel(piece)
  const blurb = piece.subtitle ?? piece.summary

  return (
    <Link
      href={piece.href}
      className={`group flex flex-col gap-5 py-8 sm:flex-row sm:gap-7 ${first ? '' : 'border-t'}`}
      style={{ borderColor: 'rgba(238,234,225,0.08)' }}
    >
      <div className="w-full shrink-0 sm:w-[15rem] lg:w-[17rem]">
        <ArtFrame src={piece.artwork} title={piece.title} ratio="16/9" />
      </div>

      <div className="min-w-0 flex-1 sm:pt-1">
        <p
          className="text-[0.62rem] font-semibold uppercase tracking-[0.2em]"
          style={{ fontFamily: HEADING, color: label ? 'var(--awd-gold)' : 'var(--awd-accent-2)' }}
        >
          {label ?? piece.format?.name ?? 'Episode'}
        </p>

        <h3
          className="mt-2.5 text-[1.24rem] leading-[1.28] transition-colors duration-200 group-hover:text-[var(--awd-gold)] lg:text-[1.34rem]"
          style={{
            fontFamily: HEADING,
            fontWeight: 600,
            letterSpacing: '-0.015em',
            color: 'var(--awd-bone)',
          }}
        >
          {piece.title}
        </h3>

        {blurb && (
          <p
            className="mt-3 line-clamp-2 max-w-[46rem] text-[0.97rem] leading-relaxed"
            style={{ fontFamily: BODY, color: 'rgba(238,234,225,0.6)' }}
          >
            {blurb}
          </p>
        )}

        <p className="mt-3.5 text-[0.72rem]" style={{ fontFamily: BODY, color: 'var(--awd-stone)' }}>
          {metaLine(piece)}
        </p>
      </div>
    </Link>
  )
}

export default function EpisodeList({ season }: { season: Season }) {
  const episodes = [...season.episodes].sort(inSeasonOrder)

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b pb-6"
        style={{ borderColor: 'rgba(238,234,225,0.12)' }}
      >
        <div className="min-w-0">
          <p
            className="mb-3 flex items-center gap-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.2em]"
            style={{ fontFamily: HEADING, color: 'var(--awd-gold)' }}
          >
            <span className="inline-block h-px w-[18px]" style={{ background: 'var(--awd-gold)' }} />
            Season
          </p>
          <h2
            style={{
              fontFamily: HEADING,
              fontSize: 'clamp(1.9rem, 3.4vw, 2.7rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.02,
              color: 'var(--awd-bone)',
            }}
          >
            {season.name}
          </h2>
          {season.subtitle && (
            <p
              className="mt-3 max-w-[40rem] text-[1rem] leading-relaxed"
              style={{ fontFamily: BODY, color: 'rgba(238,234,225,0.62)' }}
            >
              {season.subtitle}
            </p>
          )}
        </div>

        <div
          className="flex shrink-0 items-center gap-3 text-[0.64rem] font-semibold uppercase tracking-[0.16em]"
          style={{ fontFamily: HEADING, color: 'var(--awd-accent-2)' }}
        >
          <span>
            {episodes.length} {episodes.length === 1 ? 'episode' : 'episodes'}
          </span>
          <span aria-hidden style={{ color: 'rgba(238,234,225,0.22)' }}>/</span>
          <span style={{ color: season.isComplete ? 'var(--awd-gold)' : 'var(--awd-stone)' }}>
            {season.isComplete ? 'Complete' : 'Ongoing'}
          </span>
        </div>
      </div>

      <div>
        {episodes.map((piece, i) => (
          <EpisodeRow key={piece.id} piece={piece} first={i === 0} />
        ))}
      </div>
    </div>
  )
}
