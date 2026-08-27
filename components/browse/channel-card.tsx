'use client'

import Artwork from '@/components/library/artwork'
import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'

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
  A browse tile, built to behave like a streaming app rather than a blog card.

  Two things carry the feel:

  1. The grade. Austin's artwork spans an enormous tonal range (Hebrews is
     nearly white, Daniel nearly black, Word for Word a bright glow). Shown
     raw, a grid reads as noise, so every card runs the same treatment and
     lifts it on hover, the way Crosswalk grades its sermon stills so the page
     "reads as one intentional set".

  2. The hover expand. The card lifts, the art un-grades, and a panel reveals
     the description and a Read affordance. Nothing is hidden that matters;
     the panel only adds.

  `read` comes from the same localStorage key ReadMarker already writes on
  every article page, so the check mark is real history, not decoration.
*/

export type CardItem = {
  title: string
  href: string
  slug: string
  image?: string
  kicker?: string
  meta?: string
  chip?: string
  blurb?: string
}

export default function ChannelCard({
  item,
  read = false,
}: {
  item: CardItem
  read?: boolean
}) {
  return (
    <Link
      href={item.href}
      className="group relative block outline-none focus-visible:z-30"
      style={{ zIndex: 0 }}
    >
      <Artwork
        src={item.image ?? null}
        title={item.title}
        className="relative overflow-hidden rounded-[3px] transition-all duration-300 ease-out group-hover:z-20 group-hover:-translate-y-1.5 group-hover:shadow-[0_22px_50px_rgba(0,0,0,0.55)] group-focus-visible:-translate-y-1.5"
      >
        {/* Hover panel: description plus the read affordance. */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                  style={{ background: 'linear-gradient(0deg, rgba(23,25,24,0.96) 30%, transparent 100%)' }}
                >
                  {item.blurb && (
                    <span
                      className="mb-3 line-clamp-2 block text-[0.78rem] leading-snug"
                      style={{ fontFamily: 'var(--font-source-serif)', color: 'rgba(238,234,225,0.8)' }}
                    >
                      {item.blurb}
                    </span>
                  )}
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.14em]"
                    style={{ fontFamily: 'var(--font-cmg), system-ui, sans-serif', background: '#CDB079', color: '#171918' }}
                  >
                    {read ? 'Read again' : 'Read'}
                    <ArrowRight size={11} />
                  </span>
                </span>

                {item.chip && (
                  <span
                    className="absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.14em] backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-0"
                    style={{
                      fontFamily: 'var(--font-cmg), system-ui, sans-serif',
                      borderColor: 'color-mix(in srgb, var(--awd-accent-2) 55%, transparent)',
                      background: 'rgba(23,25,24,0.55)',
                      color: 'var(--awd-accent-2)',
                    }}
                  >
                    {item.chip}
                  </span>
                )}

                {/* Read tick, the streaming "already watched" cue. */}
                {read && (
                  <span
                    className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full backdrop-blur-sm"
                    style={{ background: 'rgba(23,25,24,0.7)', color: '#CDB079' }}
                    title="You have read this"
                  >
                    <Check size={13} strokeWidth={3} />
                  </span>
                )}
      </Artwork>

      {item.kicker && (
        <p
          className="mt-3.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: 'var(--font-cmg), system-ui, sans-serif', color: 'var(--awd-accent-2)' }}
        >
          {item.kicker}
        </p>
      )}
      <h3
        className="mt-1.5 line-clamp-2 text-[1rem] leading-snug transition-colors group-hover:text-[var(--awd-gold)]"
        style={{ fontFamily: 'var(--font-source-serif)', color: '#EEEAE1' }}
      >
        {item.title}
      </h3>
      {item.meta && (
        <p className="mt-1.5 line-clamp-1 text-[0.7rem]" style={{ color: '#AAA79E' }}>
          {item.meta}
        </p>
      )}
    </Link>
  )
}
