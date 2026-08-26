'use client'

import { useCallback, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ChannelCard, { type CardItem } from '@/components/browse/channel-card'

/*
  A horizontal shelf with arrow controls, the Netflix row.

  Arrows appear on hover and only when there is somewhere to go in that
  direction, which is why scroll position is tracked. Scrolling itself stays
  native (snap + overflow) so keyboard, trackpad and touch all keep working;
  the arrows are an addition, not the mechanism.

  Cards grow on hover, so the scroller carries vertical padding with a matching
  negative margin, otherwise the lift gets clipped.
*/

const HEADING = 'var(--font-cmg), system-ui, sans-serif'

export default function Shelf({
  title,
  items,
  readSlugs,
  accentTitle = false,
  numbered = false,
}: {
  title: string
  items: CardItem[]
  readSlugs: Set<string>
  /** Marks a shelf that is personal to the reader, e.g. New to you. */
  accentTitle?: boolean
  /** Rank numerals behind the cards, the Top 10 device. */
  numbered?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const sync = useCallback(() => {
    const el = ref.current
    if (!el) return
    setAtStart(el.scrollLeft < 8)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8)
  }, [])

  const nudge = (dir: 1 | -1) => {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.8), behavior: 'smooth' })
  }

  if (!items.length) return null

  return (
    <section className="group/shelf relative mt-12 first:mt-0">
      <h3
        className="mb-4 text-[0.82rem] font-semibold uppercase tracking-[0.16em]"
        style={{ fontFamily: HEADING, color: accentTitle ? 'var(--awd-accent-2)' : 'rgba(238,234,225,0.72)' }}
      >
        {title}
        <span className="ml-2.5 opacity-50">{items.length}</span>
      </h3>

      {([-1, 1] as const).map(dir => {
        const hidden = dir === -1 ? atStart : atEnd
        const Icon = dir === -1 ? ChevronLeft : ChevronRight
        return (
          <button
            key={dir}
            type="button"
            aria-label={dir === -1 ? 'Scroll left' : 'Scroll right'}
            onClick={() => nudge(dir)}
            className={`absolute top-[3.2rem] z-30 hidden h-[5.5rem] w-10 items-center justify-center rounded-[3px] backdrop-blur-sm transition-opacity duration-200 lg:flex ${
              hidden ? 'pointer-events-none opacity-0' : 'opacity-0 group-hover/shelf:opacity-100'
            } ${dir === -1 ? 'left-0' : 'right-0'}`}
            style={{ background: 'rgba(23,25,24,0.72)', color: '#EEEAE1' }}
          >
            <Icon size={20} />
          </button>
        )
      })}

      <div
        ref={ref}
        onScroll={sync}
        className="shelf-scroller -my-4 flex snap-x gap-5 overflow-x-auto py-4"
      >
        {items.map((item, i) => (
          <div
            key={item.href}
            className={`relative shrink-0 snap-start ${numbered ? 'flex items-end pl-9' : ''}`}
            style={{ width: numbered ? '17.5rem' : '15.5rem' }}
          >
            {numbered && (
              <span
                aria-hidden
                className="absolute bottom-8 left-0 select-none leading-none"
                style={{
                  fontFamily: HEADING,
                  fontSize: '5.5rem',
                  fontWeight: 700,
                  color: 'transparent',
                  WebkitTextStroke: '1.5px rgba(205,176,121,0.45)',
                }}
              >
                {i + 1}
              </span>
            )}
            <div className="w-full">
              <ChannelCard item={item} read={readSlugs.has(item.slug)} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
