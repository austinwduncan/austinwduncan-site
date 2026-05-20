'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export type TickerItem = { title: string; date: string; slug: string; href?: string }

export function FPTicker({
  items,
  sticky = false,
}: {
  items: TickerItem[]
  sticky?: boolean
}) {
  const [shown, setShown] = useState(!sticky)

  useEffect(() => {
    if (!sticky) return
    const onScroll = () => setShown(window.scrollY > 280)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [sticky])

  const doubled = [...items, ...items]

  return (
    <div
      className="relative flex items-stretch overflow-hidden"
      style={{
        background: '#0E0C0A',
        height: 38,
        borderBottom: sticky ? undefined : '1px solid rgba(255,255,255,0.06)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        ...(sticky
          ? {
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 40,
              transform: shown ? 'translateY(0)' : 'translateY(100%)',
              transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            }
          : {}),
      }}
    >
      {/* Label */}
      <div
        className="shrink-0 flex items-center px-4 z-10"
        style={{ background: '#7A5C1E' }}
      >
        <span
          className="text-[0.58rem] font-bold tracking-[0.2em] uppercase whitespace-nowrap"
          style={{ color: '#F9F6F0' }}
        >
          Latest
        </span>
      </div>

      <div className="w-px shrink-0" style={{ background: '#2A2520' }} />

      {/* Scrolling track */}
      <div className="flex-1 overflow-hidden relative">
        <div className="fp-ticker-track absolute top-0 bottom-0 flex items-center whitespace-nowrap">
          {doubled.map((item, i) => (
            <Link
              key={i}
              href={item.href ?? `/forum-and-pulpit/${item.slug}`}
              className="inline-flex items-center gap-3 group"
              style={{ paddingRight: 36 }}
            >
              <span
                className="text-[0.56rem] font-semibold tracking-[0.12em] uppercase shrink-0"
                style={{ color: '#7A5C1E' }}
              >
                {item.date}
              </span>
              <span
                className="text-[0.72rem] font-semibold transition-colors group-hover:text-[#F9F6F0]"
                style={{ color: 'rgba(249,246,240,0.55)' }}
              >
                {item.title}
              </span>
              <span style={{ color: '#2A2520', fontSize: '0.4rem', paddingLeft: 18 }}>◆</span>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fpScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .fp-ticker-track {
          animation: fpScroll 90s linear infinite;
          will-change: transform;
        }
        .fp-ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
