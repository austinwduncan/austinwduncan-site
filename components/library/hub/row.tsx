'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/*
  A horizontal row that takes whatever cards it is given.

  The original Shelf only accepted piece cards, which is why the Library could
  not offer a row of shows. This takes children instead, so the same scroller
  carries shows, genres or episodes without three copies of the mechanics.

  Native scrolling with snap points does the work. The arrows are an addition
  and appear only when there is somewhere to go, so a row of four cards on a
  wide screen shows no controls at all.

  The negative margin plus padding pair exists so a card lifting on hover is not
  clipped by the scroller's own overflow.
*/

const GUTTER = 'px-6 lg:px-10'

export default function Row({
  children,
  count,
}: {
  children: React.ReactNode
  /** How many cards, so the arrows know whether they are needed. */
  count: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const onScroll = () => {
    const el = ref.current
    if (!el) return
    setAtStart(el.scrollLeft < 8)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8)
  }

  const nudge = (direction: 1 | -1) => {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: direction * Math.round(el.clientWidth * 0.82), behavior: 'smooth' })
  }

  return (
    <div className="group/row relative">
      {[-1, 1].map(direction => {
        const hidden = direction === -1 ? atStart : atEnd
        return (
          <button
            key={direction}
            type="button"
            aria-label={direction === -1 ? 'Scroll left' : 'Scroll right'}
            onClick={() => nudge(direction as 1 | -1)}
            className={`absolute inset-y-0 z-30 hidden w-12 items-center justify-center transition-opacity duration-200 lg:flex ${
              hidden ? 'pointer-events-none opacity-0' : 'opacity-0 group-hover/row:opacity-100'
            } ${direction === -1 ? 'left-0' : 'right-0'}`}
            style={{
              background:
                direction === -1
                  ? 'linear-gradient(90deg, var(--awd-black) 30%, transparent)'
                  : 'linear-gradient(270deg, var(--awd-black) 30%, transparent)',
              color: 'var(--awd-bone)',
            }}
          >
            {direction === -1 ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
          </button>
        )
      })}

      <div
        ref={ref}
        onScroll={onScroll}
        className={`-my-4 flex snap-x gap-5 overflow-x-auto py-4 ${GUTTER}`}
        style={{ scrollbarWidth: 'none' }}
      >
        {children}
      </div>
    </div>
  )
}
