import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Piece } from '@/lib/library/types'
import { cleanText, formatDate } from '@/components/library/hub/cards'

/*
  The featured slot at the top of the Library.

  Full bleed artwork behind a heavy scrim. The scrim is weighted to the left
  rather than spread evenly on purpose: Austin typesets the title into a lot of
  the artwork, so the copy column sits over the part of the frame that has been
  taken down to near black, and the art itself stays legible on the right.
*/

const HEADING = 'var(--font-cmg), system-ui, sans-serif'

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")"

export default function Billboard({
  piece,
  pieceCount,
  showCount,
}: {
  piece: Piece
  pieceCount: number
  showCount: number
}) {
  const blurb = cleanText(piece.subtitle ?? piece.summary)
  const meta = [
    piece.collection?.name,
    piece.scripture[0]?.label,
    formatDate(piece.publishedAt),
    piece.readingMinutes ? `${piece.readingMinutes} min read` : null,
  ].filter(Boolean) as string[]

  return (
    <section
      className="relative flex min-h-[34rem] items-end overflow-hidden lg:min-h-[42rem]"
      style={{ background: 'var(--awd-black)' }}
    >
      {piece.artwork && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={piece.artwork}
          alt=""
          className="absolute inset-0 h-full w-full object-cover grayscale-[0.55] contrast-[0.92] brightness-[0.72]"
        />
      )}

      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(23,25,24,0.97) 0%, rgba(23,25,24,0.93) 30%, rgba(23,25,24,0.55) 58%, rgba(23,25,24,0.2) 100%)',
        }}
      />
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(0deg, var(--awd-black) 0%, rgba(23,25,24,0.78) 22%, rgba(23,25,24,0.05) 62%)',
        }}
      />
      <span
        aria-hidden
        className="absolute inset-0 opacity-25 mix-blend-color"
        style={{ background: 'var(--awd-accent-2)' }}
      />
      <span
        aria-hidden
        className="absolute inset-0 opacity-[0.16] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />

      <div className="relative w-full px-6 pb-16 pt-40 lg:px-10 lg:pb-24 lg:pt-52">
        <div className="max-w-[46rem]">
          {/* The ruled eyebrow, carried over from Crosswalk. */}
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-10 shrink-0" style={{ background: 'var(--awd-gold)' }} />
            <p
              className="text-[0.66rem] font-semibold uppercase tracking-[0.22em]"
              style={{ fontFamily: HEADING, color: 'var(--awd-gold)' }}
            >
              The Library
            </p>
            <span
              className="text-[0.66rem] font-semibold uppercase tracking-[0.18em]"
              style={{ fontFamily: HEADING, color: 'rgba(238,234,225,0.42)' }}
            >
              {pieceCount} pieces · {showCount} shows
            </span>
          </div>

          {/*
            A real title, so it is never uppercased. CMG Sans at display size
            wants tight tracking and leading just under one.
          */}
          <h1
            style={{
              fontFamily: HEADING,
              fontSize: 'clamp(2.3rem, 5.4vw, 4.4rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 0.95,
              color: 'var(--awd-bone)',
            }}
          >
            {piece.title}
          </h1>

          {blurb && (
            <p
              className="mt-6 line-clamp-3 max-w-[38rem] text-[1.02rem] leading-relaxed"
              style={{ fontFamily: 'var(--font-source-serif)', color: 'rgba(238,234,225,0.76)' }}
            >
              {blurb}
            </p>
          )}

          {meta.length > 0 && (
            <p
              className="mt-6 text-[0.68rem] font-semibold uppercase tracking-[0.16em]"
              style={{ fontFamily: HEADING, color: 'var(--awd-stone)' }}
            >
              {meta.join(' · ')}
            </p>
          )}

          <Link
            href={piece.href}
            className="mt-9 inline-flex items-center gap-2 rounded-full px-7 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] transition-transform duration-200 hover:-translate-y-0.5"
            style={{ fontFamily: HEADING, background: 'var(--awd-gold)', color: 'var(--awd-black)' }}
          >
            Start reading
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}
