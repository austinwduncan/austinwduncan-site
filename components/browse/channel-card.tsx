'use client'

import Link from 'next/link'
import { Check, ArrowRight } from 'lucide-react'

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

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")"

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
      <div
        className="relative overflow-hidden rounded-[3px] transition-all duration-300 ease-out group-hover:z-20 group-hover:-translate-y-1.5 group-hover:shadow-[0_22px_50px_rgba(0,0,0,0.55)] group-focus-visible:-translate-y-1.5"
        style={{ aspectRatio: '16/9', background: '#2C302F' }}
      >
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt=""
            loading="lazy"
            className="h-full w-full scale-[1.04] object-cover grayscale contrast-[0.88] brightness-[0.86] transition-all duration-[600ms] ease-out group-hover:scale-[1.09] group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100"
          />
        ) : (
          <span aria-hidden className="section-pattern absolute inset-0" />
        )}

        {/* Grade layers, all lifting on hover. */}
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
      </div>

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
