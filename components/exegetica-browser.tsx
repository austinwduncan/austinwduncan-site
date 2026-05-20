'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { COLLECTION_DEFS } from '@/lib/exegetica-collections'

function formatReadingTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min read`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m read` : `${h}h read`
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type ExegeticaItem = {
  slug: string
  title: string
  formattedDate: string
  image: string
  abstract: string
  readingMinutes: number
  wordCount: number
}

export type ExegeticaCollection = {
  id: string
  title: string
  subtitle: string
  desc: string
  items: ExegeticaItem[]
}

// ─── Section header ──────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-4 mb-1.5">
        <div style={{ borderLeft: '4px solid #B8892E', paddingLeft: '0.6rem' }} className="shrink-0">
          <h2 className="text-[0.72rem] font-black tracking-[0.12em] uppercase" style={{ color: '#1A1714' }}>{title}</h2>
        </div>
        <div className="flex-1 h-px" style={{ background: '#D8D0C4' }} />
        {action}
      </div>
      {subtitle && (
        <p className="text-[0.8rem] italic" style={{ fontFamily: 'var(--font-source-serif)', color: '#9A9189', paddingLeft: '0.85rem' }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

// ─── Widget header (sidebar) ──────────────────────────────────────────────────

function WidgetHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div style={{ width: 3, height: 12, background: '#B8892E', flexShrink: 0 }} />
      <span className="text-[0.62rem] font-black tracking-[0.18em] uppercase" style={{ color: '#B8892E' }}>{title}</span>
    </div>
  )
}

// ─── Study card ──────────────────────────────────────────────────────────────

function StudyCard({ item, studyNum, sizes = '33vw' }: { item: ExegeticaItem; studyNum: number; sizes?: string }) {
  return (
    <Link href={`/exegetica/${item.slug}`} className="group flex flex-col">
      <div className="relative overflow-hidden mb-3.5" style={{ aspectRatio: '16/9' }}>
        {item.image ? (
          <Image
            src={item.image} alt="" fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes={sizes}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: '#1A1714' }}>
            <span className="text-[0.6rem] font-medium tracking-[0.18em] uppercase" style={{ color: '#7A5C1E' }}>Exegetica</span>
          </div>
        )}
        {/* Study number badge */}
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5" style={{ background: 'rgba(14,12,10,0.82)' }}>
          <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '0.7rem', color: '#C9984A', fontStyle: 'italic' }}>
            Study {String(studyNum).padStart(2, '0')}
          </span>
        </div>
        {/* Abstract hover overlay */}
        {item.abstract && (
          <div
            className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(to top, rgba(14,12,10,0.97) 0%, rgba(14,12,10,0.88) 55%, rgba(14,12,10,0.5) 100%)' }}
          >
            <div className="text-[0.5rem] font-black tracking-[0.14em] uppercase mb-1.5" style={{ color: '#B8892E' }}>Abstract</div>
            <p className="text-[0.72rem] leading-[1.6] line-clamp-4" style={{ fontFamily: 'var(--font-source-serif)', fontStyle: 'italic', color: 'rgba(249,246,240,0.7)' }}>
              {item.abstract}
            </p>
            <span className="inline-flex items-center gap-1 mt-2.5 text-[0.56rem] font-medium tracking-[0.1em] uppercase" style={{ color: '#C9984A' }}>
              Read study
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[0.58rem] font-medium tracking-[0.1em] uppercase" style={{ color: '#B8892E' }}>{item.formattedDate}</span>
        <span className="w-1 h-1 rounded-full inline-block shrink-0" style={{ background: '#C8BFA8' }} />
        <span className="text-[0.58rem] font-medium tracking-[0.08em] uppercase" style={{ color: '#9A9189' }}>{formatReadingTime(item.readingMinutes)}</span>
      </div>
      <h3
        className="leading-[1.25] tracking-tight transition-colors group-hover:text-[#7A5C1E]"
        style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1rem, 1.5vw, 1.28rem)', fontWeight: 500, color: '#1A1714' }}
      >
        {item.title}
      </h3>
    </Link>
  )
}

// ─── Featured study ───────────────────────────────────────────────────────────

function FeaturedStudy({ item, studyNum }: { item: ExegeticaItem; studyNum: number }) {
  return (
    <div className="mb-8 pb-8 border-b" style={{ borderColor: '#D8D0C4' }}>
      <div className="flex items-center gap-3 text-[0.6rem] font-medium tracking-[0.14em] uppercase mb-6" style={{ color: '#9A9189' }}>
        <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1rem', color: '#C9984A', fontStyle: 'italic' }}>
          Study {String(studyNum).padStart(2, '0')}
        </span>
        <div className="flex-1 h-px" style={{ background: '#D8D0C4' }} />
        <span>Latest Study</span>
      </div>
      <Link href={`/exegetica/${item.slug}`} className="group flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        {item.image && (
          <div className="w-full lg:w-[52%] shrink-0 relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <Image
              src={item.image} alt="" fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              sizes="(min-width: 1024px) 50vw, 100vw" priority
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2
            className="leading-[1.15] tracking-tight mb-4 transition-colors group-hover:text-[#7A5C1E]"
            style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.6rem, 2.8vw, 2.25rem)', fontWeight: 500, color: '#1A1714' }}
          >
            {item.title}
          </h2>
          {item.abstract && (
            <>
              <p className="text-[0.6rem] font-medium tracking-[0.14em] uppercase mb-2" style={{ color: '#9A9189' }}>Abstract</p>
              <p className="text-[0.9rem] leading-[1.8] mb-5" style={{ fontFamily: 'var(--font-source-serif)', color: '#5A544C' }}>
                {item.abstract.length > 300 ? item.abstract.slice(0, 297) + '…' : item.abstract}
              </p>
            </>
          )}
          <div className="flex items-center gap-5">
            <span
              className="inline-flex items-center gap-1.5 text-[0.72rem] tracking-[0.04em] pb-px border-b transition-colors group-hover:text-[#7A5C1E] group-hover:border-[#7A5C1E]"
              style={{ color: '#9A9189', borderColor: '#D8D0C4' }}
            >
              Read study
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </span>
            <span className="text-[0.6rem] font-medium tracking-[0.08em] uppercase" style={{ color: '#C8BFA8' }}>
              {formatReadingTime(item.readingMinutes)} · {item.wordCount.toLocaleString()} words
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}

// ─── Abstract Spotlight (rotating interstitial) ───────────────────────────────

function AbstractSpotlight({ items }: { items: ExegeticaItem[] }) {
  const pool = items.filter((a) => a.abstract.length > 120)
  const [idx, setIdx] = useState(0)
  const [fade, setFade] = useState(true)

  const advance = useCallback((next: number) => {
    setFade(false)
    setTimeout(() => { setIdx(next); setFade(true) }, 380)
  }, [])

  useEffect(() => {
    if (pool.length < 2) return
    const t = setInterval(() => advance((idx + 1) % pool.length), 6500)
    return () => clearInterval(t)
  }, [idx, pool.length, advance])

  if (pool.length === 0) return null
  const current = pool[idx]

  return (
    <div style={{ background: '#0D0B09', borderTop: '2px solid #B8892E', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'linear-gradient(rgba(184,137,46,1) 1px, transparent 1px), linear-gradient(90deg, rgba(184,137,46,1) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      <div className="relative mx-auto max-w-[820px] px-6 py-16 text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-8" style={{ background: '#B8892E' }} />
          <span className="text-[0.52rem] font-black tracking-[0.28em] uppercase" style={{ color: '#B8892E' }}>From the Studies</span>
          <div className="h-px w-8" style={{ background: '#B8892E' }} />
        </div>
        <div style={{ opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 0.38s ease, transform 0.38s ease' }}>
          <div aria-hidden style={{ fontFamily: 'Georgia, serif', fontSize: '4rem', lineHeight: 0.75, color: '#B8892E', marginBottom: '0.5rem', userSelect: 'none' }}>&ldquo;</div>
          <blockquote style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.3rem, 2.2vw, 1.8rem)', fontStyle: 'italic', fontWeight: 500, color: 'rgba(249,246,240,0.88)', lineHeight: 1.6, marginBottom: '2rem' }}>
            {current.abstract.length > 340 ? current.abstract.slice(0, 337) + '…' : current.abstract}
          </blockquote>
          <div className="flex flex-col items-center gap-2">
            <div style={{ width: 32, height: 1, background: '#B8892E' }} />
            <Link href={`/exegetica/${current.slug}`} className="group inline-flex items-center gap-2 mt-1">
              <span className="text-[0.6rem] font-black tracking-[0.16em] uppercase transition-colors group-hover:text-[#C9984A]" style={{ color: 'rgba(255,255,255,0.38)' }}>
                {current.title.length > 70 ? current.title.slice(0, 67) + '…' : current.title}
              </span>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#B8892E" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
        {pool.length > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {pool.slice(0, 8).map((_, i) => (
              <button
                key={i}
                onClick={() => advance(i)}
                aria-label={`Study ${i + 1}`}
                style={{ width: i === idx ? 18 : 5, height: 5, background: i === idx ? '#B8892E' : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.35s ease' }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Browse Collections strip ─────────────────────────────────────────────────

function BrowseCollections({ collections, onSelect }: { collections: ExegeticaCollection[]; onSelect: (id: string) => void }) {
  const total = collections.reduce((sum, c) => sum + c.items.length, 0)
  return (
    <div style={{ background: '#1A1714', borderTop: '1px solid rgba(184,137,46,0.18)', borderBottom: '1px solid rgba(184,137,46,0.18)' }}>
      <div className="mx-auto max-w-[1200px] px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start lg:items-center">
          <div className="shrink-0">
            <div className="text-[0.52rem] font-black tracking-[0.28em] uppercase mb-1" style={{ color: '#B8892E' }}>Browse by Collection</div>
            <p className="text-[0.78rem]" style={{ fontFamily: 'var(--font-source-serif)', color: 'rgba(249,246,240,0.35)' }}>
              {total} {total === 1 ? 'study' : 'studies'} across {collections.filter((c) => c.items.length > 0).length} collections
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {collections.filter((c) => c.items.length > 0).map((col) => (
              <button
                key={col.id}
                onClick={() => onSelect(col.id)}
                className="flex items-center gap-2 px-4 py-2 border transition-all hover:border-[#B8892E] group"
                style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'transparent' }}
              >
                <span className="text-[0.62rem] font-black tracking-[0.1em] uppercase transition-colors group-hover:text-white" style={{ color: 'rgba(249,246,240,0.45)' }}>
                  {col.title}
                </span>
                <span className="text-[0.55rem] font-medium px-1.5 py-0.5" style={{ background: 'rgba(184,137,46,0.15)', color: '#B8892E' }}>
                  {col.items.length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Stats panel ─────────────────────────────────────────────────────────────

function useCountUp(target: number, active: boolean, duration = 1200) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    const start = performance.now()
    const frame = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }, [active, target, duration])
  return count
}

function StatsPanel({ itemCount, collectionCount, avgReadMinutes, totalWords }: {
  itemCount: number; collectionCount: number; avgReadMinutes: number; totalWords: number
}) {
  const [active, setActive] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setActive(true); obs.disconnect() } }, { threshold: 0.5 })
    obs.observe(el); return () => obs.disconnect()
  }, [])

  const sCount = useCountUp(itemCount, active)
  const cCount = useCountUp(collectionCount, active, 800)
  const rCount = useCountUp(avgReadMinutes, active, 900)
  const wCount = useCountUp(Math.round(totalWords / 1000), active, 1500)

  const statStyle = { fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2.6rem, 4vw, 3.6rem)', fontWeight: 500, lineHeight: 1, marginBottom: '0.4rem' }
  const labelStyle = { color: '#9A9189' }

  return (
    <div ref={ref} style={{ background: '#FAFAF7', borderTop: '1px solid #E2DACE', borderBottom: '1px solid #E2DACE' }}>
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x" style={{ '--tw-divide-color': '#E2DACE' } as React.CSSProperties}>
          <div className="flex flex-col items-center text-center lg:px-8">
            <div style={{ ...statStyle, color: '#1A1714' }}>{sCount}</div>
            <div className="text-[0.58rem] font-black tracking-[0.18em] uppercase" style={labelStyle}>Published Studies</div>
          </div>
          <div className="flex flex-col items-center text-center lg:px-8">
            <div style={{ ...statStyle, color: '#B8892E' }}>{cCount}</div>
            <div className="text-[0.58rem] font-black tracking-[0.18em] uppercase" style={labelStyle}>Collections</div>
          </div>
          <div className="flex flex-col items-center text-center lg:px-8">
            <div style={{ ...statStyle, color: '#1A1714' }}>~{rCount} min</div>
            <div className="text-[0.58rem] font-black tracking-[0.18em] uppercase" style={labelStyle}>Avg. Read</div>
          </div>
          <div className="flex flex-col items-center text-center col-span-2 lg:col-span-1 lg:px-8">
            <div style={{ ...statStyle, color: '#1A1714' }}>{wCount}k</div>
            <div className="text-[0.58rem] font-black tracking-[0.18em] uppercase" style={labelStyle}>Total Words</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main browser ─────────────────────────────────────────────────────────────

export function ExegeticaBrowser({ collections, allItems, avgReadMinutes, totalWords }: {
  collections: ExegeticaCollection[]
  allItems: ExegeticaItem[]
  avgReadMinutes: number
  totalWords: number
}) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const mainRef = useRef<HTMLDivElement>(null)

  const isFiltering = !!activeId || search.trim().length > 1

  const handleCollectionSelect = useCallback((id: string) => {
    setActiveId(id)
    setSearch('')
    mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const activeCollection = activeId ? collections.find((c) => c.id === activeId) ?? null : null
  const searchResults = search.trim().length > 1
    ? allItems.filter((a) =>
        a.title.toLowerCase().includes(search.trim().toLowerCase()) ||
        a.abstract.toLowerCase().includes(search.trim().toLowerCase())
      )
    : null

  const studyNumMap = Object.fromEntries(allItems.map((a, i) => [a.slug, i + 1]))
  const featured = allItems[0]
  const recentGrid = allItems.slice(1, 4)

  function Sidebar() {
    return (
      <aside className="hidden lg:block shrink-0 sticky top-6" style={{ width: 260, maxHeight: 'calc(100vh - 4rem)', overflowY: 'auto' }}>
        {/* Search */}
        <div className="mb-8">
          <WidgetHeader title="Search" />
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9A9189" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search studies…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setActiveId(null) }}
              className="w-full pl-8 pr-3 py-2 text-[0.8rem] border outline-none"
              style={{ background: '#F0EDE6', borderColor: '#D8D0C4', color: '#1A1714' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#B8892E')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#D8D0C4')}
            />
          </div>
          {isFiltering && (
            <button onClick={() => { setSearch(''); setActiveId(null) }} className="mt-1.5 text-[0.58rem] transition-colors hover:text-[#7A5C1E]" style={{ color: '#9A9189' }}>
              Clear filters ×
            </button>
          )}
        </div>

        {/* Collections */}
        <div className="mb-8">
          <WidgetHeader title="Collections" />
          <div className="flex flex-col gap-0">
            {collections.filter((c) => c.items.length > 0).map((col, i) => (
              <div key={col.id}>
                {i > 0 && <div className="h-px" style={{ background: '#E2DACE' }} />}
                <button onClick={() => handleCollectionSelect(col.id)} className="w-full flex items-center justify-between gap-3 py-2.5 text-left group">
                  <span
                    className="text-[0.78rem] leading-snug transition-colors group-hover:text-[#7A5C1E]"
                    style={{ fontFamily: 'var(--font-cormorant)', fontWeight: activeId === col.id ? 700 : 500, color: activeId === col.id ? '#7A5C1E' : '#1A1714' }}
                  >
                    {col.title}
                  </span>
                  <span
                    className="shrink-0 text-[0.58rem] font-black min-w-[22px] text-center py-0.5 px-1.5"
                    style={{ background: activeId === col.id ? '#B8892E' : '#E2DACE', color: activeId === col.id ? '#ffffff' : '#9A9189' }}
                  >
                    {col.items.length}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        <div>
          <WidgetHeader title="About Exegetica" />
          <p className="text-[0.78rem] leading-[1.7]" style={{ fontFamily: 'var(--font-source-serif)', color: '#5A544C', fontStyle: 'italic' }}>
            Close readings of biblical texts — grammar, syntax, and literary context in service of faithful interpretation. Each study engages the text with scholarly rigor and pastoral care.
          </p>
        </div>
      </aside>
    )
  }

  return (
    <>
      <style>{`
        @keyframes exe-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .exe-track { display: flex; width: max-content; animation: exe-scroll 80s linear infinite; }
        .exe-track:hover { animation-play-state: paused; }
      `}</style>

      {/* Ticker */}
      <div style={{ background: '#0D0B09', borderBottom: '1px solid rgba(184,137,46,0.2)' }}>
        <div className="mx-auto max-w-[1200px] px-5">
          <div className="flex items-stretch" style={{ height: 38 }}>
            <div className="shrink-0 flex items-center gap-2 pr-4 mr-4 border-r" style={{ borderColor: 'rgba(184,137,46,0.2)' }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#B8892E' }} />
              <span className="text-[0.5rem] font-black tracking-[0.24em] uppercase whitespace-nowrap" style={{ color: '#B8892E' }}>Recent Studies</span>
            </div>
            <div className="flex-1 overflow-hidden flex items-center">
              <div className="exe-track">
                {[...allItems, ...allItems].map((a, i) => (
                  <Link key={`${a.slug}-${i}`} href={`/exegetica/${a.slug}`} className="flex items-center shrink-0 group">
                    <span
                      className="text-[0.57rem] whitespace-nowrap transition-colors group-hover:text-[#B8892E] px-5"
                      style={{ color: 'rgba(255,255,255,0.38)', fontFamily: 'var(--font-source-serif)', fontStyle: 'italic' }}
                    >
                      {a.title}
                    </span>
                    <span className="text-[0.5rem] shrink-0" style={{ color: 'rgba(184,137,46,0.28)' }}>·</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section A: Featured + recent (with sidebar) */}
      <div ref={mainRef} style={{ background: '#FAFAF7' }}>
        <div className="mx-auto max-w-[1200px] px-6 pt-8 pb-0">
          <div className="flex gap-10 items-start">
            <div className="flex-1 min-w-0">

              {isFiltering ? (
                <>
                  {searchResults ? (
                    <>
                      <SectionHeader
                        title={`Results: "${search.trim()}"`}
                        action={<button onClick={() => setSearch('')} className="text-[0.6rem] transition-colors hover:text-[#7A5C1E]" style={{ color: '#9A9189' }}>Clear ×</button>}
                      />
                      {searchResults.length === 0 ? (
                        <p className="text-[0.88rem] italic py-12" style={{ fontFamily: 'var(--font-source-serif)', color: '#9A9189' }}>No studies matched your search.</p>
                      ) : (
                        <div className={`grid gap-6 mb-10 ${searchResults.length >= 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : searchResults.length === 2 ? 'sm:grid-cols-2' : ''}`}>
                          {searchResults.map((a) => <StudyCard key={a.slug} item={a} studyNum={studyNumMap[a.slug]} sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw" />)}
                        </div>
                      )}
                    </>
                  ) : activeCollection ? (
                    <>
                      <div className="mb-5">
                        <div className="flex items-center gap-4 mb-1.5">
                          <div style={{ borderLeft: '4px solid #B8892E', paddingLeft: '0.6rem' }} className="shrink-0">
                            <h2 className="text-[0.72rem] font-black tracking-[0.12em] uppercase" style={{ color: '#1A1714' }}>{activeCollection.title}</h2>
                          </div>
                          <div className="flex-1 h-px" style={{ background: '#D8D0C4' }} />
                          <button onClick={() => setActiveId(null)} className="text-[0.6rem] transition-colors hover:text-[#7A5C1E]" style={{ color: '#9A9189' }}>
                            All studies ×
                          </button>
                        </div>
                        <p className="text-[0.8rem] italic mb-3" style={{ fontFamily: 'var(--font-source-serif)', color: '#9A9189', paddingLeft: '0.85rem' }}>
                          {activeCollection.subtitle}
                        </p>
                        <p className="text-[0.84rem] leading-[1.7] mb-6 pb-6 border-b" style={{ fontFamily: 'var(--font-source-serif)', color: '#5A544C', borderColor: '#E2DACE' }}>
                          {activeCollection.desc}
                        </p>
                      </div>
                      <div className={`grid gap-6 mb-10 ${activeCollection.items.length >= 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : activeCollection.items.length === 2 ? 'sm:grid-cols-2' : ''}`}>
                        {activeCollection.items.map((a) => <StudyCard key={a.slug} item={a} studyNum={studyNumMap[a.slug]} sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw" />)}
                      </div>
                    </>
                  ) : null}
                </>
              ) : (
                <>
                  <p className="text-[0.88rem] leading-[1.7] mb-7 pb-7 border-b" style={{ fontFamily: 'var(--font-source-serif)', color: '#5A544C', borderColor: '#E2DACE' }}>
                    Exegetica is a series of scholarly exegetical studies engaging the biblical text with rigor and care — from canonical hermeneutics and Pauline theology to Christology, apocalyptic literature, and the grand arc of redemptive history. Each study brings grammatical, syntactical, and literary analysis to bear in service of faithful interpretation.
                  </p>
                  {featured && <FeaturedStudy item={featured} studyNum={studyNumMap[featured.slug]} />}
                  {recentGrid.length > 0 && (
                    <div className="mb-8 pb-8 border-b" style={{ borderColor: '#E2DACE' }}>
                      <SectionHeader title="Recent Studies" />
                      <div className={`grid gap-6 ${recentGrid.length >= 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : recentGrid.length === 2 ? 'sm:grid-cols-2' : ''}`}>
                        {recentGrid.map((a) => <StudyCard key={a.slug} item={a} studyNum={studyNumMap[a.slug]} sizes="(min-width: 1200px) 215px, (min-width: 640px) 30vw, 100vw" />)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <Sidebar />
          </div>
        </div>
      </div>

      {/* Abstract Spotlight interstitial */}
      {!isFiltering && <AbstractSpotlight items={allItems} />}

      {/* Section B: Collections (with sidebar) */}
      {!isFiltering && (
        <div style={{ background: '#F0EDE6' }}>
          <div className="mx-auto max-w-[1200px] px-6 pt-10 pb-4">
            <div className="flex gap-10 items-start">
              <div className="flex-1 min-w-0">
                {collections.filter((c) => c.items.length > 0).map((col, ci) => (
                  <div key={col.id} className={ci > 0 ? 'pt-8' : ''}>
                    <div className="mb-6 pb-8 border-b" style={{ borderColor: '#D8D0C4' }}>
                      <SectionHeader
                        title={col.title}
                        subtitle={col.subtitle}
                        action={
                          <button onClick={() => handleCollectionSelect(col.id)} className="shrink-0 text-[0.6rem] font-bold tracking-[0.06em] transition-colors hover:text-[#7A5C1E]" style={{ color: '#9A9189' }}>
                            All {col.items.length} →
                          </button>
                        }
                      />
                      <p className="text-[0.83rem] leading-[1.7] mb-5 -mt-1" style={{ fontFamily: 'var(--font-source-serif)', color: '#5A544C' }}>
                        {col.desc}
                      </p>
                      <div className={`grid gap-6 ${col.items.length >= 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : col.items.length === 2 ? 'sm:grid-cols-2' : ''}`}>
                        {col.items.slice(0, 3).map((a) => <StudyCard key={a.slug} item={a} studyNum={studyNumMap[a.slug]} sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw" />)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      {/* Browse Collections strip */}
      {!isFiltering && <BrowseCollections collections={collections} onSelect={handleCollectionSelect} />}

      {/* Stats */}
      {!isFiltering && (
        <StatsPanel
          itemCount={allItems.length}
          collectionCount={collections.filter((c) => c.items.length > 0).length}
          avgReadMinutes={avgReadMinutes}
          totalWords={totalWords}
        />
      )}

      {/* All Studies list */}
      <div style={{ background: '#FAFAF7', borderTop: '1px solid #E2DACE' }}>
        <div className="mx-auto max-w-[1200px] px-6 pt-8 pb-16">
          {!isFiltering && (
            <>
              <SectionHeader title="All Studies" action={<span className="shrink-0 text-[0.58rem] font-medium" style={{ color: '#9A9189' }}>{allItems.length} published</span>} />
              <div>
                {allItems.map((a, i) => (
                  <div key={a.slug}>
                    <Link href={`/exegetica/${a.slug}`} className="group flex items-start gap-4 py-3">
                      <span className="shrink-0" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '0.9rem', fontStyle: 'italic', color: '#C9984A', width: 26, lineHeight: 1.6 }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[0.92rem] leading-snug transition-colors group-hover:text-[#7A5C1E]"
                          style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, color: '#1A1714' }}>
                          {a.title}
                        </h4>
                      </div>
                      <div className="shrink-0 text-right hidden md:block">
                        <div className="text-[0.58rem]" style={{ color: '#9A9189' }}>{a.formattedDate}</div>
                        <div className="text-[0.55rem]" style={{ color: '#C8BFA8' }}>{formatReadingTime(a.readingMinutes)}</div>
                      </div>
                    </Link>
                    {i < allItems.length - 1 && <div className="h-px" style={{ background: '#EDE9E2' }} />}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
