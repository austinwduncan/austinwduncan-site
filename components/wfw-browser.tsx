'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const TOPICS = [
  { key: 'The Nature and Character of God',           label: 'God & Theology',  short: 'Theology',    n: '01' },
  { key: 'Basic Christian Thought & Spiritual Growth', label: 'Christian Life',  short: 'Life',        n: '02' },
  { key: 'Basic Apologetics',                          label: 'Apologetics',     short: 'Apologetics', n: '03' },
  { key: 'New Testament Issues',                       label: 'New Testament',   short: 'NT Issues',   n: '04' },
  { key: 'Old Testament Issues',                       label: 'Old Testament',   short: 'OT Issues',   n: '05' },
  { key: 'Historical Jesus and Christology',           label: 'Christology',     short: 'Christology', n: '06' },
  { key: 'Spiritual Gifts',                            label: 'Spiritual Gifts', short: 'Gifts',       n: '07' },
  { key: 'Holidays',                                   label: 'Holidays',        short: 'Holidays',    n: '08' },
]

export type WFWItem = {
  slug: string
  title: string
  formattedDate: string
  image: string
  tags: string[]
  excerpt: string
}

type TopicWithArticles = (typeof TOPICS)[number] & { articles: WFWItem[] }

function getTag(a: WFWItem) {
  return TOPICS.find((t) => a.tags.includes(t.key)) ?? null
}

/* ── Reusable section header ── */
function SectionHeader({ title, number, action }: { title: string; number?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <div style={{ borderLeft: '4px solid #B8892E', paddingLeft: '0.6rem' }} className="flex items-center gap-2 shrink-0">
        {number && <span className="text-[0.5rem] font-black tracking-[0.18em] uppercase" style={{ color: '#B8892E' }}>{number}</span>}
        <h2 className="text-[0.74rem] font-black tracking-[0.12em] uppercase" style={{ color: '#1a1a1a' }}>{title}</h2>
      </div>
      <div className="flex-1 h-px" style={{ background: '#e8e8e8' }} />
      {action}
    </div>
  )
}

/* ── Category badge ── */
function CategoryBadge({ label }: { label: string }) {
  return (
    <span className="inline-block text-[0.52rem] font-black tracking-[0.1em] uppercase px-2 py-0.5" style={{ background: '#B8892E', color: '#ffffff' }}>
      {label}
    </span>
  )
}

/* ── Standard article card ── */
function ArticleCard({ article, sizes = '25vw', priority = false }: { article: WFWItem; sizes?: string; priority?: boolean }) {
  const t = getTag(article)
  return (
    <Link href={`/word-for-word/${article.slug}`} className="group flex flex-col">
      <div className="relative overflow-hidden mb-2.5" style={{ aspectRatio: '16/9' }}>
        {article.image ? (
          <Image src={article.image} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" sizes={sizes} priority={priority} />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: '#1a1a1a' }}>
            <span className="text-[0.55rem] font-bold tracking-[0.16em] uppercase" style={{ color: '#B8892E' }}>Word for Word</span>
          </div>
        )}
        {t && <div className="absolute top-0 left-0"><CategoryBadge label={t.short} /></div>}
      </div>
      <h3 className="leading-[1.28] mb-1.5 transition-colors group-hover:text-[#7A5C1E] line-clamp-2"
        style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(0.95rem, 1.4vw, 1.15rem)', fontWeight: 700, color: '#1a1a1a' }}>
        {article.title}
      </h3>
      <span className="text-[0.62rem]" style={{ color: '#888888' }}>{article.formattedDate}</span>
    </Link>
  )
}

/* ── Sidebar widget header ── */
function WidgetHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4 pb-2" style={{ borderLeft: '4px solid #B8892E', paddingLeft: '0.6rem', borderBottom: '1px solid #e8e8e8' }}>
      <h3 className="text-[0.68rem] font-black tracking-[0.12em] uppercase" style={{ color: '#1a1a1a' }}>{title}</h3>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   INTERSTITIAL 1 — Question Spotlight
   Full-width dark section; one question at a time, auto-rotates
   ══════════════════════════════════════════════════════════════ */
function QuestionSpotlight({ articles }: { articles: WFWItem[] }) {
  const pool = articles.filter((a) => a.title.endsWith('?') || a.title.includes('?')).slice(0, 12)
  const items = pool.length >= 4 ? pool : articles.slice(0, 12)

  const [idx, setIdx] = useState(0)
  const [fade, setFade] = useState(true)

  const advance = useCallback((next: number) => {
    setFade(false)
    setTimeout(() => {
      setIdx(next)
      setFade(true)
    }, 380)
  }, [])

  useEffect(() => {
    const t = setInterval(() => advance((idx + 1) % items.length), 5500)
    return () => clearInterval(t)
  }, [idx, items.length, advance])

  const current = items[idx]
  const tag = getTag(current)

  return (
    <div style={{ background: '#0D0B09', position: 'relative', overflow: 'hidden' }}>
      {/* Subtle grid texture */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'linear-gradient(rgba(184,137,46,1) 1px, transparent 1px), linear-gradient(90deg, rgba(184,137,46,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-[820px] px-5 py-16 lg:py-20 text-center">

        {/* Label */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-8" style={{ background: '#B8892E' }} />
          <span className="text-[0.52rem] font-black tracking-[0.3em] uppercase" style={{ color: '#B8892E' }}>
            Explore a Question
          </span>
          <div className="h-px w-8" style={{ background: '#B8892E' }} />
        </div>

        {/* Question display */}
        <div style={{ minHeight: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 0.38s ease, transform 0.38s ease' }}>
            {tag && (
              <div className="mb-4 flex justify-center">
                <CategoryBadge label={tag.label} />
              </div>
            )}
            <h2
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 'clamp(1.7rem, 3.5vw, 2.8rem)',
                fontWeight: 700,
                color: 'rgba(249,246,240,0.92)',
                lineHeight: 1.2,
                marginBottom: '2rem',
              }}
            >
              {current.title}
            </h2>
          </div>

          <Link
            href={`/word-for-word/${current.slug}`}
            className="inline-flex items-center gap-2 transition-all hover:gap-3"
            style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.38s ease' }}
          >
            <span
              className="text-[0.65rem] font-black tracking-[0.16em] uppercase px-5 py-2.5 border transition-colors hover:border-[#B8892E] hover:text-[#B8892E]"
              style={{ color: 'rgba(249,246,240,0.55)', borderColor: 'rgba(255,255,255,0.15)' }}
            >
              Read the Answer
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: '#B8892E' }}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Navigation dots */}
        <div className="flex items-center justify-center gap-2 mt-10">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => advance(i)}
              aria-label={`Question ${i + 1}`}
              style={{
                height: 4,
                width: i === idx ? 24 : 6,
                background: i === idx ? '#B8892E' : 'rgba(255,255,255,0.18)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.35s ease',
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* Counter */}
        <p className="mt-5 text-[0.55rem] font-medium tracking-[0.14em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {String(idx + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
        </p>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   INTERSTITIAL 2 — Browse Strip
   Full-width amber-on-dark; topic pills with counts, click to filter
   ══════════════════════════════════════════════════════════════ */
function BrowseStrip({ topics, onSelect }: { topics: TopicWithArticles[]; onSelect: (key: string) => void }) {
  return (
    <div style={{ background: '#111111', borderTop: '3px solid #B8892E', borderBottom: '3px solid #B8892E' }}>
      <div className="mx-auto max-w-[1200px] px-5 py-10 lg:py-12">

        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">

          {/* Left heading */}
          <div className="shrink-0">
            <p className="text-[0.52rem] font-black tracking-[0.28em] uppercase mb-1" style={{ color: '#B8892E' }}>
              Find Your Question
            </p>
            <h2
              className="leading-tight"
              style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 700, color: '#F9F6F0' }}
            >
              Browse by Topic
            </h2>
          </div>

          {/* Vertical rule */}
          <div className="hidden lg:block shrink-0 w-px self-stretch" style={{ background: 'rgba(184,137,46,0.25)' }} />

          {/* Topic pills */}
          <div className="flex flex-wrap gap-3">
            {topics.map((t) => (
              <button
                key={t.key}
                onClick={() => onSelect(t.key)}
                className="group flex items-center gap-2.5 border transition-all duration-200 hover:border-[#B8892E]"
                style={{ borderColor: 'rgba(255,255,255,0.1)', padding: '0.55rem 1rem' }}
              >
                <span
                  className="text-[0.52rem] font-black tracking-[0.14em] uppercase transition-colors group-hover:text-[#C9984A]"
                  style={{ color: '#7A5C1E' }}
                >
                  {t.n}
                </span>
                <span
                  className="text-[0.78rem] font-medium transition-colors group-hover:text-white"
                  style={{ fontFamily: 'var(--font-cormorant)', color: 'rgba(249,246,240,0.65)', fontWeight: 500 }}
                >
                  {t.label}
                </span>
                <span
                  className="text-[0.52rem] font-black px-1.5 py-0.5 transition-colors group-hover:bg-[#B8892E] group-hover:text-white"
                  style={{ background: 'rgba(184,137,46,0.15)', color: '#B8892E' }}
                >
                  {t.articles.length}
                </span>
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   INTERSTITIAL 3 — Pull Quote Carousel
   Full-width light; auto-rotates article excerpts
   ══════════════════════════════════════════════════════════════ */
function PullQuoteCarousel({ articles }: { articles: WFWItem[] }) {
  const pool = articles.filter((a) => a.excerpt && a.excerpt.length > 60)
  const [idx, setIdx] = useState(0)
  const [fade, setFade] = useState(true)
  const DURATION = 7000
  const visibleDots = Math.min(pool.length, 10)

  const go = useCallback((next: number) => {
    setFade(false)
    setTimeout(() => { setIdx(next); setFade(true) }, 320)
  }, [])

  useEffect(() => {
    if (pool.length < 2) return
    const t = setTimeout(() => go((idx + 1) % pool.length), DURATION)
    return () => clearTimeout(t)
  }, [idx, pool.length, go])

  if (pool.length === 0) return null
  const current = pool[idx]
  const tag = getTag(current)
  const excerpt = current.excerpt.length > 320 ? current.excerpt.slice(0, 317) + '…' : current.excerpt

  return (
    <div style={{ background: '#f7f7f7', borderTop: '3px solid #B8892E', borderBottom: '1px solid #e8e8e8' }}>
      <div className="mx-auto max-w-[820px] px-6 lg:px-8" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>

        {/* "From Word for Word" label with flanking rules */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px" style={{ background: '#e0d9ce' }} />
          <span
            className="shrink-0 text-[0.58rem] font-black tracking-[0.22em] uppercase"
            style={{ color: '#B8892E' }}
          >
            From Word for Word
          </span>
          <div className="flex-1 h-px" style={{ background: '#e0d9ce' }} />
        </div>

        {/* Fading quote block */}
        <div
          className="text-center"
          style={{
            opacity: fade ? 1 : 0,
            transform: fade ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.32s ease, transform 0.32s ease',
          }}
        >
          {/* Opening quotation mark */}
          <div
            aria-hidden
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: '4.5rem',
              lineHeight: 0.75,
              color: '#B8892E',
              marginBottom: '0.75rem',
              userSelect: 'none',
            }}
          >
            &ldquo;
          </div>

          {/* Quote text */}
          <blockquote
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(1.55rem, 2.6vw, 2.1rem)',
              fontStyle: 'italic',
              fontWeight: 500,
              color: '#1a1a1a',
              lineHeight: 1.55,
              marginBottom: '2.25rem',
            }}
          >
            {excerpt}
          </blockquote>

          {/* Attribution */}
          <div className="flex flex-col items-center gap-3">
            {/* Short amber rule */}
            <div style={{ width: 40, height: 2, background: '#B8892E' }} />
            {tag && <CategoryBadge label={tag.label} />}
            <Link
              href={`/word-for-word/${current.slug}`}
              className="group inline-flex items-center gap-2 mt-1"
            >
              <span
                className="text-[0.63rem] font-black tracking-[0.16em] uppercase"
                style={{ color: '#555555', transition: 'color 0.2s' }}
              >
                {current.title}
              </span>
              <svg
                width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="#B8892E" strokeWidth="2.5"
                style={{ transition: 'stroke 0.2s' }}
                className="group-hover:[stroke:#7A5C1E]"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Navigation */}
        {pool.length > 1 && (
          <div className="flex flex-col items-center gap-4 mt-12">

            {/* Progress bar */}
            <div
              style={{
                width: 200,
                height: 2,
                background: '#e0d9ce',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: '#B8892E',
                  animation: `wfw-progress ${DURATION}ms linear forwards`,
                  transformOrigin: 'left',
                }}
              />
            </div>

            {/* Dot indicators */}
            <div className="flex items-center gap-2.5">
              {Array.from({ length: visibleDots }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Quote ${i + 1}`}
                  style={{
                    width: i === idx ? 22 : 6,
                    height: 6,
                    background: i === idx ? '#B8892E' : '#ccc9c0',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'width 0.35s ease, background 0.35s ease',
                  }}
                />
              ))}
            </div>

            {/* Counter */}
            <span
              className="text-[0.58rem] tracking-[0.18em] uppercase tabular-nums"
              style={{ color: '#B8892E' }}
            >
              {idx + 1}&thinsp;/&thinsp;{visibleDots}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   INTERSTITIAL 4 — Animated Stats Bar
   Full-width; counts up when scrolled into view
   ══════════════════════════════════════════════════════════════ */
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

function StatItem({ value, label, suffix = '' }: { value: number; label: string; suffix?: string; active: boolean }) {
  const [active, setActive] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const count = useCountUp(value, active)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setActive(true); obs.disconnect() } }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <div
        style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: 'clamp(3rem, 5vw, 4.5rem)',
          fontWeight: 700,
          color: '#1a1a1a',
          lineHeight: 1,
          marginBottom: '0.5rem',
        }}
      >
        {count}{suffix}
      </div>
      <div className="text-[0.62rem] font-black tracking-[0.2em] uppercase" style={{ color: '#888888' }}>
        {label}
      </div>
    </div>
  )
}

function StatsBar({ articleCount, topicCount }: { articleCount: number; topicCount: number }) {
  const [active, setActive] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setActive(true); obs.disconnect() } }, { threshold: 0.4 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const qCount = useCountUp(articleCount, active)
  const tCount = useCountUp(topicCount, active)
  const yCount = useCountUp(new Date().getFullYear(), active, 1800)

  return (
    <div ref={ref} style={{ background: '#ffffff', borderTop: '1px solid #e8e8e8', borderBottom: '1px solid #e8e8e8' }}>
      <div className="mx-auto max-w-[1200px] px-5 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x" style={{ '--tw-divide-color': '#e8e8e8' } as React.CSSProperties}>

          <div className="flex flex-col items-center text-center lg:px-8">
            <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(3rem, 5vw, 4rem)', fontWeight: 700, color: '#1a1a1a', lineHeight: 1, marginBottom: '0.5rem' }}>
              {qCount}
            </div>
            <div className="text-[0.62rem] font-black tracking-[0.2em] uppercase" style={{ color: '#888888' }}>Questions Answered</div>
          </div>

          <div className="flex flex-col items-center text-center lg:px-8">
            <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(3rem, 5vw, 4rem)', fontWeight: 700, color: '#1a1a1a', lineHeight: 1, marginBottom: '0.5rem' }}>
              {tCount}
            </div>
            <div className="text-[0.62rem] font-black tracking-[0.2em] uppercase" style={{ color: '#888888' }}>Topics Covered</div>
          </div>

          <div className="flex flex-col items-center text-center lg:px-8">
            <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(3rem, 5vw, 4rem)', fontWeight: 700, color: '#1a1a1a', lineHeight: 1, marginBottom: '0.5rem' }}>
              {yCount}
            </div>
            <div className="text-[0.62rem] font-black tracking-[0.2em] uppercase" style={{ color: '#888888' }}>Publishing Since</div>
          </div>

          <div className="flex flex-col items-center text-center col-span-2 lg:col-span-1 lg:px-8">
            <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(3rem, 5vw, 4rem)', fontWeight: 700, color: '#B8892E', lineHeight: 1, marginBottom: '0.5rem' }}>
              Weekly
            </div>
            <div className="text-[0.62rem] font-black tracking-[0.2em] uppercase" style={{ color: '#888888' }}>New Answers</div>
          </div>

        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
export function WFWBrowser({ articles }: { articles: WFWItem[] }) {
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [dontMissTab, setDontMissTab] = useState<string | null>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  const topics = useMemo(
    () => TOPICS.map((t) => ({ ...t, articles: articles.filter((a) => a.tags.includes(t.key)) })).filter((t) => t.articles.length > 0),
    [articles],
  ) as TopicWithArticles[]

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return articles.filter((a) => {
      const matchTag = !activeKey || a.tags.includes(activeKey)
      const matchSearch = !q || a.title.toLowerCase().includes(q)
      return matchTag && matchSearch
    })
  }, [articles, activeKey, search])

  const isFiltering = !!search.trim() || !!activeKey
  const activeTopic = topics.find((t) => t.key === activeKey) ?? null

  const dontMissPool = useMemo(() => {
    if (!dontMissTab) return articles.slice(4, 10)
    return articles.filter((a) => a.tags.includes(dontMissTab)).slice(0, 6)
  }, [articles, dontMissTab])

  const hero = articles[0]
  const recentGrid = articles.slice(1, 5)
  const dontMissFeature = dontMissPool[0]
  const dontMissList = dontMissPool.slice(1, 5)

  const handleTopicSelect = (key: string) => {
    setActiveKey(key)
    setSearch('')
    mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  /* ── Shared sidebar ── */
  const Sidebar = () => (
    <aside className="hidden lg:flex flex-col gap-7 shrink-0 sticky top-7" style={{ width: 280, maxHeight: 'calc(100vh - 4rem)', overflowY: 'auto' }}>
      <div>
        <WidgetHeader title="Search" />
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search questions…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setActiveKey(null) }}
            className="w-full pl-8 pr-3 py-2 text-[0.82rem] border outline-none transition-colors"
            style={{ background: '#f7f7f7', borderColor: '#e8e8e8', color: '#1a1a1a' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#B8892E')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#e8e8e8')}
          />
        </div>
        {(search || activeKey) && (
          <button onClick={() => { setSearch(''); setActiveKey(null) }} className="mt-2 text-[0.6rem] transition-colors hover:text-[#7A5C1E]" style={{ color: '#888888' }}>
            Clear filters ×
          </button>
        )}
      </div>

      <div>
        <WidgetHeader title="Popular Posts" />
        <div className="flex flex-col gap-0">
          {articles.slice(0, 5).map((a, i) => (
            <div key={a.slug}>
              {i > 0 && <div className="border-t my-3" style={{ borderColor: '#e8e8e8' }} />}
              <Link href={`/word-for-word/${a.slug}`} className="group flex gap-3 items-start">
                <span className="shrink-0" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '0.95rem', fontStyle: 'italic', color: '#C9984A', width: 22, lineHeight: 1.4, fontWeight: 700 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  {getTag(a) && <div className="text-[0.5rem] font-black tracking-[0.1em] uppercase mb-0.5" style={{ color: '#B8892E' }}>{getTag(a)!.short}</div>}
                  <h4 className="text-[0.82rem] leading-[1.35] line-clamp-2 transition-colors group-hover:text-[#7A5C1E]" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, color: '#1a1a1a' }}>{a.title}</h4>
                  <span className="text-[0.58rem]" style={{ color: '#888888' }}>{a.formattedDate}</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div>
        <WidgetHeader title="Categories" />
        <div className="flex flex-col gap-0">
          {topics.map((t, i) => (
            <div key={t.key}>
              {i > 0 && <div className="h-px" style={{ background: '#f3f3f3' }} />}
              <button onClick={() => handleTopicSelect(t.key)} className="w-full flex items-center justify-between gap-3 py-2.5 text-left group">
                <span className="text-[0.8rem] leading-snug transition-colors group-hover:text-[#7A5C1E]"
                  style={{ fontFamily: 'var(--font-cormorant)', fontWeight: activeKey === t.key ? 700 : 500, color: activeKey === t.key ? '#7A5C1E' : '#1a1a1a' }}>
                  {t.label}
                </span>
                <span className="shrink-0 text-[0.6rem] font-black min-w-[26px] text-center py-0.5 px-1.5"
                  style={{ background: activeKey === t.key ? '#B8892E' : '#f7f7f7', color: activeKey === t.key ? '#ffffff' : '#888888' }}>
                  {t.articles.length}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <WidgetHeader title="About" />
        <p className="text-[0.8rem] leading-[1.7]" style={{ fontFamily: 'var(--font-source-serif)', color: '#555555' }}>
          Word for Word answers the hardest questions about the Christian faith — directly from Scripture, with clarity and care. Published weekly.
        </p>
      </div>
    </aside>
  )

  return (
    <>
      {/* ── Trending ticker ──────────────────────────────────────────────── */}
      <style>{`
        @keyframes wfw-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .wfw-track { display: flex; width: max-content; animation: wfw-scroll 90s linear infinite; }
        .wfw-track:hover { animation-play-state: paused; }
        .lg\\:divide-x > * + * { border-left: 1px solid #e8e8e8; }
        @keyframes wfw-progress { from { width: 0%; } to { width: 100%; } }
      `}</style>

      <div style={{ background: '#111111', borderBottom: '2px solid #B8892E' }}>
        <div className="mx-auto max-w-[1200px] px-5">
          <div className="flex items-stretch" style={{ height: 40 }}>
            <div className="shrink-0 flex items-center gap-2 pr-4 mr-4 border-r" style={{ borderColor: 'rgba(184,137,46,0.35)' }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#B8892E' }} />
              <span className="text-[0.52rem] font-black tracking-[0.24em] uppercase whitespace-nowrap" style={{ color: '#B8892E' }}>Trending Now</span>
            </div>
            <div className="flex-1 overflow-hidden flex items-center">
              <div className="wfw-track">
                {[...articles.slice(0, 16), ...articles.slice(0, 16)].map((a, i) => (
                  <Link key={`${a.slug}-${i}`} href={`/word-for-word/${a.slug}`} className="flex items-center gap-0 shrink-0 group">
                    <span className="text-[0.6rem] font-medium whitespace-nowrap transition-colors group-hover:text-[#B8892E] px-4" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      {a.title}
                    </span>
                    <span className="text-[0.55rem] shrink-0" style={{ color: 'rgba(184,137,46,0.4)' }}>/</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION A: Hero + 4-up + Don't Miss (with sidebar) ─────────── */}
      <div ref={mainRef} style={{ background: '#ffffff' }}>
        <div className="mx-auto max-w-[1200px] px-5 pt-7 pb-0">
          <div className="flex gap-8 items-start">
            <div className="flex-1 min-w-0">

              {isFiltering ? (
                <>
                  <SectionHeader
                    title={activeTopic ? activeTopic.label : `Results: "${search.trim()}"`}
                    action={
                      <button onClick={() => { setSearch(''); setActiveKey(null) }} className="shrink-0 text-[0.62rem] font-medium transition-colors hover:text-[#7A5C1E]" style={{ color: '#888888' }}>
                        Clear ×
                      </button>
                    }
                  />
                  <p className="text-[0.65rem] mb-6 -mt-1" style={{ color: '#888888' }}>{filtered.length} question{filtered.length !== 1 ? 's' : ''}</p>
                  {filtered.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-12">
                      {filtered.map((a) => <ArticleCard key={a.slug} article={a} sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw" />)}
                    </div>
                  ) : (
                    <div className="py-20 text-center pb-12">
                      <p className="text-[0.9rem] italic mb-3" style={{ fontFamily: 'var(--font-source-serif)', color: '#888888' }}>No questions found.</p>
                      <button onClick={() => { setSearch(''); setActiveKey(null) }} className="text-[0.72rem] transition-colors hover:text-[#7A5C1E]" style={{ color: '#888888' }}>Clear filters</button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Hero */}
                  {hero && (
                    <div className="mb-6 pb-6 border-b" style={{ borderColor: '#e8e8e8' }}>
                      <Link href={`/word-for-word/${hero.slug}`} className="group block">
                        <div className="relative w-full overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
                          {hero.image ? (
                            <Image src={hero.image} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" sizes="(min-width: 1200px) 820px, 70vw" priority />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: '#1a1a1a' }}>
                              <span style={{ color: '#B8892E', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>Word for Word</span>
                            </div>
                          )}
                          {getTag(hero) && <div className="absolute top-0 left-0"><CategoryBadge label={getTag(hero)!.short} /></div>}
                        </div>
                        <h2 className="leading-[1.1] mb-3 transition-colors group-hover:text-[#7A5C1E]"
                          style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2rem, 3.2vw, 2.75rem)', fontWeight: 700, color: '#1a1a1a' }}>
                          {hero.title}
                        </h2>
                        {hero.excerpt && (
                          <p className="text-[0.9rem] leading-[1.65] mb-2" style={{ fontFamily: 'var(--font-source-serif)', color: '#555555', maxWidth: 580 }}>
                            {hero.excerpt.length > 240 ? hero.excerpt.slice(0, 237) + '…' : hero.excerpt}
                          </p>
                        )}
                        <span className="text-[0.65rem]" style={{ color: '#888888' }}>{hero.formattedDate}</span>
                      </Link>
                    </div>
                  )}

                  {/* 4-up recent grid */}
                  {recentGrid.length > 0 && (
                    <div className="mb-7 pb-7 border-b" style={{ borderColor: '#e8e8e8' }}>
                      <SectionHeader title="This Week" />
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {recentGrid.map((a) => <ArticleCard key={a.slug} article={a} sizes="(min-width: 1200px) 185px, (min-width: 640px) 30vw, 100vw" />)}
                      </div>
                    </div>
                  )}

                  {/* Don't Miss */}
                  <div className="mb-7 pb-7 border-b" style={{ borderColor: '#e8e8e8' }}>
                    <SectionHeader title="Don't Miss" />
                    <div className="flex items-end gap-0 mb-6 border-b" style={{ borderColor: '#e8e8e8' }}>
                      {[{ key: null as string | null, label: 'All' }, ...topics.slice(0, 5).map((t) => ({ key: t.key, label: t.short }))].map(({ key, label }) => (
                        <button key={String(key)} onClick={() => setDontMissTab(key)}
                          className="px-3.5 py-2 text-[0.64rem] font-black tracking-[0.08em] uppercase border-b-2 -mb-px transition-all whitespace-nowrap"
                          style={{ borderColor: dontMissTab === key ? '#B8892E' : 'transparent', color: dontMissTab === key ? '#B8892E' : '#888888' }}>
                          {label}
                        </button>
                      ))}
                    </div>
                    {dontMissFeature && (
                      <div className="grid lg:grid-cols-2 gap-0">
                        <Link href={`/word-for-word/${dontMissFeature.slug}`} className="group pr-6">
                          <div className="relative overflow-hidden mb-3.5" style={{ aspectRatio: '3/2' }}>
                            {dontMissFeature.image ? (
                              <Image src={dontMissFeature.image} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" sizes="(min-width: 1200px) 380px, 40vw" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center" style={{ background: '#1a1a1a' }}>
                                <span className="text-[0.55rem] font-bold tracking-[0.16em] uppercase" style={{ color: '#B8892E' }}>Word for Word</span>
                              </div>
                            )}
                            {getTag(dontMissFeature) && <div className="absolute top-0 left-0"><CategoryBadge label={getTag(dontMissFeature)!.short} /></div>}
                          </div>
                          <h3 className="leading-[1.2] mb-2.5 transition-colors group-hover:text-[#7A5C1E]"
                            style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.3rem, 2vw, 1.65rem)', fontWeight: 700, color: '#1a1a1a' }}>
                            {dontMissFeature.title}
                          </h3>
                          {dontMissFeature.excerpt && (
                            <p className="text-[0.84rem] leading-[1.65] line-clamp-3 mb-1.5" style={{ fontFamily: 'var(--font-source-serif)', color: '#555555' }}>
                              {dontMissFeature.excerpt}
                            </p>
                          )}
                          <span className="text-[0.62rem]" style={{ color: '#888888' }}>{dontMissFeature.formattedDate}</span>
                        </Link>
                        <div className="pl-6 border-l flex flex-col justify-between" style={{ borderColor: '#e8e8e8' }}>
                          {dontMissList.map((a, i) => (
                            <div key={a.slug}>
                              {i > 0 && <div className="border-t my-3" style={{ borderColor: '#e8e8e8' }} />}
                              <Link href={`/word-for-word/${a.slug}`} className="group flex gap-3">
                                {a.image && (
                                  <div className="relative shrink-0 overflow-hidden" style={{ width: 72, height: 52 }}>
                                    <Image src={a.image} alt="" fill className="object-cover" sizes="72px" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  {getTag(a) && <div className="mb-1"><CategoryBadge label={getTag(a)!.short} /></div>}
                                  <h4 className="leading-[1.3] line-clamp-2 transition-colors group-hover:text-[#7A5C1E]"
                                    style={{ fontFamily: 'var(--font-cormorant)', fontSize: '0.98rem', fontWeight: 700, color: '#1a1a1a' }}>
                                    {a.title}
                                  </h4>
                                  <span className="text-[0.6rem]" style={{ color: '#888888' }}>{a.formattedDate}</span>
                                </div>
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <Sidebar />
          </div>
        </div>
      </div>

      {/* ══ INTERSTITIAL 1: Question Spotlight ══ */}
      {!isFiltering && <QuestionSpotlight articles={articles} />}

      {/* ── SECTION B: Topic sections (with sidebar) ────────────────────── */}
      {!isFiltering && (
        <div style={{ background: '#ffffff' }}>
          <div className="mx-auto max-w-[1200px] px-5 pt-7 pb-0">
            <div className="flex gap-8 items-start">
              <div className="flex-1 min-w-0">
                {topics.map((t) => (
                  <div key={t.key} className="mb-7 pb-7 border-b" style={{ borderColor: '#e8e8e8' }}>
                    <SectionHeader title={t.label} number={t.n}
                      action={
                        <button onClick={() => handleTopicSelect(t.key)} className="shrink-0 text-[0.6rem] font-bold tracking-[0.06em] transition-colors hover:text-[#7A5C1E]" style={{ color: '#888888' }}>
                          All {t.articles.length} →
                        </button>
                      }
                    />
                    <div className={`grid gap-5 ${t.articles.length >= 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : t.articles.length === 2 ? 'sm:grid-cols-2' : ''}`}>
                      {t.articles.slice(0, 3).map((a) => <ArticleCard key={a.slug} article={a} sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw" />)}
                    </div>
                  </div>
                ))}
              </div>
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      {/* ══ INTERSTITIAL 2: Pull Quote Carousel ══ */}
      {!isFiltering && <PullQuoteCarousel articles={articles} />}

      {/* ══ INTERSTITIAL 3: Browse Strip ══ */}
      {!isFiltering && <BrowseStrip topics={topics} onSelect={handleTopicSelect} />}

      {/* ── SECTION C: Stats + All Questions list ───────────────────────── */}
      {!isFiltering && <StatsBar articleCount={articles.length} topicCount={topics.length} />}

      <div style={{ background: '#ffffff' }}>
        <div className="mx-auto max-w-[1200px] px-5 pt-8 pb-16">
          {!isFiltering && (
            <>
              <SectionHeader title="All Questions" action={<span className="shrink-0 text-[0.6rem] font-medium" style={{ color: '#888888' }}>{articles.length} answered</span>} />
              <div>
                {articles.map((a, i) => {
                  const t = getTag(a)
                  return (
                    <div key={a.slug}>
                      <Link href={`/word-for-word/${a.slug}`} className="group flex items-start gap-4 py-3">
                        <span className="shrink-0" style={{ fontFamily: 'var(--font-cormorant)', fontSize: '0.92rem', fontStyle: 'italic', color: '#C9984A', width: 26, lineHeight: 1.6 }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div className="flex-1 min-w-0 flex flex-wrap items-start gap-x-2 gap-y-1">
                          {t && (
                            <span className="shrink-0 text-[0.5rem] font-black tracking-[0.1em] uppercase px-1.5 py-0.5" style={{ background: '#f7f7f7', color: '#B8892E', border: '1px solid #e8e8e8', marginTop: 2 }}>
                              {t.short}
                            </span>
                          )}
                          <span className="text-[0.93rem] leading-snug transition-colors group-hover:text-[#7A5C1E]" style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, color: '#1a1a1a' }}>
                            {a.title}
                          </span>
                        </div>
                        <span className="shrink-0 text-[0.6rem] pt-1 hidden md:block" style={{ color: '#888888' }}>{a.formattedDate}</span>
                      </Link>
                      {i < articles.length - 1 && <div className="h-px" style={{ background: '#f3f3f3' }} />}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
