import Link from 'next/link'
import Artwork from '@/components/library/artwork'
import { ArrowRight } from 'lucide-react'
import type { HubCard } from '@/components/library/hub/cards'

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
  A Library tile.

  The grade is the point. Austin's artwork runs from near white (Hebrews) to
  near black (Daniel), so a raw row of it reads as noise. Every tile therefore
  gets the same treatment, grayscale with reduced contrast and brightness, a
  graphite veil, a steel tint, a vignette and grain, and every layer lifts on
  hover so the original art is still the reward.

  The art is never labelled over. Austin typesets titles into the images
  themselves, so a chip or a caption on top of the frame collides with type
  that is already there. Everything the card says sits below the frame.
*/

const HEADING = 'var(--font-cmg), system-ui, sans-serif'

export default function PieceCard({ card }: { card: HubCard }) {
  return (
    <Link
      href={card.href}
      className="group relative block outline-none focus-visible:z-30"
      style={{ zIndex: 0 }}
    >
      <Artwork
        src={card.image}
        title={card.title}
        aspect="16/9"
        className="relative overflow-hidden rounded-[3px] transition-all duration-300 ease-out group-hover:z-20 group-hover:-translate-y-1.5 group-hover:shadow-[0_22px_50px_rgba(0,0,0,0.55)] group-focus-visible:-translate-y-1.5"
      >
        {/* Hover panel. It only ever adds; nothing readable is hidden behind it. */}
        <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        style={{ background: 'linear-gradient(0deg, rgba(23,25,24,0.96) 30%, transparent 100%)' }}
        >
        {card.blurb && (
        <span
        className="mb-3 line-clamp-2 block text-[0.78rem] leading-snug"
        style={{ fontFamily: 'var(--font-source-serif)', color: 'rgba(238,234,225,0.8)' }}
        >
        {card.blurb}
        </span>
        )}
        <span
        className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.14em]"
        style={{ fontFamily: HEADING, background: 'var(--awd-gold)', color: 'var(--awd-black)' }}
        >
        Read
        <ArrowRight size={11} />
        </span>
        </span>
      </Artwork>

      {card.kicker && (
        <p
          className="mt-3.5 line-clamp-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: HEADING, color: 'var(--awd-accent-2)' }}
        >
          {card.kicker}
        </p>
      )}
      {/*
        Titles are dynamic, so they are never uppercased. Austin writes long
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
        {card.title}
      </h3>
      {card.meta && (
        <p className="mt-1.5 line-clamp-1 text-[0.7rem]" style={{ color: 'var(--awd-stone)' }}>
          {card.meta}
        </p>
      )}
    </Link>
  )
}
