'use client'

import { useCallback, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PieceCard from '@/components/library/hub/piece-card'
import type { HubCard } from '@/components/library/hub/cards'

/*
  One horizontal row of the Library home.

  This is a sibling of components/browse/shelf.tsx rather than a reuse of it.
  That shelf takes a set of read slugs and has no See all affordance, and the
  Library rows need a linked heading plus a route into the browse view, so the
  treatment is copied and the component is kept separate. Nothing here reaches
  into components/browse.

  Scrolling itself stays native, snap plus overflow, so trackpad, touch and
  keyboard all keep working. The arrows are an addition, not the mechanism,
  and they only appear when there is somewhere to go in that direction.

  The scroller carries its own overflow, so the page body never moves
  sideways. Cards lift on hover, hence the vertical padding with a matching
  negative margin: without it the lift gets clipped.
*/

const HEADING = 'var(--font-cmg), system-ui, sans-serif'
const GUTTER = 'px-6 lg:px-10'

export type ShelfProps = {
  title: string
  cards: HubCard[]
  /** Where the heading itself points, for example a show page. Optional. */
  titleHref?: string
  /** The See all route. Always a filtered browse view. */
  seeAllHref: string
  seeAllLabel?: string
  /** Size of the whole grouping, which can exceed the cards shown. */
  total?: number
}

export default function Shelf({
  title, cards, titleHref, seeAllHref, seeAllLabel = 'See all', total,
}: ShelfProps) {
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

  // An empty grouping is not a shelf. It simply does not exist.
  if (!cards.length) return null

  const heading = (
    <>
      {title}
      <span className="ml-2.5 opacity-50">{total ?? cards.length}</span>
    </>
  )

  return (
    <section className="group/shelf mt-14">
      <div className={`mb-5 flex items-baseline justify-between gap-6 ${GUTTER}`}>
        <h2
          className="min-w-0 text-[0.82rem] font-semibold uppercase tracking-[0.16em]"
          style={{ fontFamily: HEADING, color: 'rgba(238,234,225,0.72)' }}
        >
          {titleHref ? (
            <Link href={titleHref} className="transition-colors hover:text-[var(--awd-gold)]">
              {heading}
            </Link>
          ) : (
            heading
          )}
        </h2>

        <Link
          href={seeAllHref}
          className="group/see inline-flex shrink-0 items-center gap-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.16em] transition-colors hover:text-[var(--awd-gold)]"
          style={{ fontFamily: HEADING, color: 'var(--awd-stone)' }}
        >
          {seeAllLabel}
          <ChevronRight size={13} className="transition-transform group-hover/see:translate-x-0.5" />
        </Link>
      </div>

      <div className="relative">
        {([-1, 1] as const).map(dir => {
          const hidden = dir === -1 ? atStart : atEnd
          const Icon = dir === -1 ? ChevronLeft : ChevronRight
          return (
            <button
              key={dir}
              type="button"
              aria-label={dir === -1 ? 'Scroll left' : 'Scroll right'}
              onClick={() => nudge(dir)}
              className={`absolute inset-y-4 z-30 hidden w-11 items-center justify-center transition-opacity duration-200 lg:flex ${
                hidden ? 'pointer-events-none opacity-0' : 'opacity-0 group-hover/shelf:opacity-100'
              } ${dir === -1 ? 'left-0' : 'right-0'}`}
              style={{
                color: 'var(--awd-bone)',
                background: dir === -1
                  ? 'linear-gradient(90deg, rgba(23,25,24,0.94) 40%, rgba(23,25,24,0))'
                  : 'linear-gradient(270deg, rgba(23,25,24,0.94) 40%, rgba(23,25,24,0))',
              }}
            >
              <Icon size={22} />
            </button>
          )
        })}

        <div
          ref={ref}
          onScroll={sync}
          className={`shelf-scroller -my-4 flex snap-x scroll-pl-6 gap-5 overflow-x-auto py-4 lg:scroll-pl-10 ${GUTTER}`}
        >
          {cards.map(card => (
            <div key={card.id} className="w-[13.5rem] shrink-0 snap-start sm:w-[15.5rem]">
              <PieceCard card={card} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
