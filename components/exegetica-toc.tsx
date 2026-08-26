'use client'

import { useEffect, useState } from 'react'
import type { TocItem } from '@/lib/content'

export function ExegeticaTOC({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '')
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!items.length) return

    const onScroll = () => {
      const threshold = window.innerHeight * 0.28
      let current = items[0].id
      for (const { id } of items) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= threshold) {
          current = id
        }
      }
      setActiveId(current)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [items])

  const currentIndex = items.findIndex((i) => i.id === activeId)

  function itemColor(idx: number) {
    if (idx === currentIndex) return '#C9984A'
    if (idx < currentIndex) return 'rgba(26,20,14,0.3)'
    return 'rgba(26,20,14,0.62)'
  }

  const TOCList = ({ dark = false }: { dark?: boolean }) => (
    <ul className="space-y-1.5">
      {items.map((item, idx) => (
        <li key={item.id} style={{ paddingLeft: item.level === 3 ? '0.875rem' : 0 }}>
          <a
            href={`#${item.id}`}
            onClick={() => setDrawerOpen(false)}
            className="block text-[0.68rem] leading-[1.5] transition-colors duration-150 hover:text-[#C9984A]"
            style={{
              color: dark
                ? idx === currentIndex
                  ? '#C9984A'
                  : idx < currentIndex
                  ? 'rgba(249,246,240,0.28)'
                  : 'rgba(249,246,240,0.68)'
                : itemColor(idx),
              fontFamily: 'var(--font-source-serif)',
              fontStyle: item.level === 3 ? 'italic' : 'normal',
              fontWeight: idx === currentIndex ? 500 : 400,
            }}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  )

  return (
    <>
      {/* ── Desktop sticky sidebar ────────────────────────────────────────── */}
      <aside
        className="hidden xl:block shrink-0 sticky"
        style={{
          width: 220,
          top: '2rem',
          maxHeight: 'calc(100vh - 4rem)',
          overflowY: 'auto',
          alignSelf: 'flex-start',
        }}
      >
        <div
          className="pl-6 pr-2 py-6 border-l"
          style={{ borderColor: 'rgba(0,0,0,0.08)' }}
        >
          <p
            className="text-[0.5rem] font-bold tracking-[0.22em] uppercase mb-5"
            style={{ color: '#6E5A2E' }}
          >
            In This Study
          </p>
          <TOCList />
        </div>
      </aside>

      {/* ── Mobile: tab + slide-out drawer ───────────────────────────────── */}
      <div className="xl:hidden">
        {/* Floating left-edge tab */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open article outline"
          className="fixed z-40 flex flex-col items-center justify-center gap-1 transition-opacity hover:opacity-90"
          style={{
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#7A5C1E',
            width: 22,
            height: 56,
            borderRadius: '0 4px 4px 0',
          }}
        >
          <span style={{ width: 8, height: 1.5, background: 'rgba(255,255,255,0.75)', borderRadius: 1 }} />
          <span style={{ width: 8, height: 1.5, background: 'rgba(255,255,255,0.75)', borderRadius: 1 }} />
          <span style={{ width: 8, height: 1.5, background: 'rgba(255,255,255,0.75)', borderRadius: 1 }} />
        </button>

        {/* Backdrop */}
        {drawerOpen && (
          <div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.45)' }}
            onClick={() => setDrawerOpen(false)}
          />
        )}

        {/* Drawer */}
        <div
          className="fixed top-0 bottom-0 left-0 z-50 overflow-y-auto"
          style={{
            width: 288,
            background: '#141210',
            transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
            padding: '2rem 1.5rem',
          }}
        >
          <div className="flex items-center justify-between mb-8">
            <span
              className="text-[0.5rem] font-bold tracking-[0.22em] uppercase"
              style={{ color: '#CDB079' }}
            >
              Article Outline
            </span>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="p-1.5 transition-colors hover:text-white"
              style={{ color: 'rgba(255,255,255,0.35)' }}
              aria-label="Close outline"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <TOCList dark />
        </div>
      </div>
    </>
  )
}
