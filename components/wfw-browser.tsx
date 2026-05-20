'use client'

import { useState, useMemo } from 'react'
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

function getTag(a: WFWItem) {
  return TOPICS.find((t) => a.tags.includes(t.key)) ?? null
}

/* ── Section header: left amber border + uppercase label + rule ── */
function SectionHeader({
  title,
  number,
  action,
}: {
  title: string
  number?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <div style={{ borderLeft: '4px solid #B8892E', paddingLeft: '0.6rem' }} className="flex items-center gap-2 shrink-0">
        {number && (
          <span className="text-[0.5rem] font-black tracking-[0.18em] uppercase" style={{ color: '#B8892E' }}>
            {number}
          </span>
        )}
        <h2 className="text-[0.74rem] font-black tracking-[0.12em] uppercase" style={{ color: '#1a1a1a' }}>
          {title}
        </h2>
      </div>
      <div className="flex-1 h-px" style={{ background: '#e8e8e8' }} />
      {action}
    </div>
  )
}

/* ── Category badge: amber bg, white text ── */
function CategoryBadge({ label }: { label: string }) {
  return (
    <span
      className="inline-block text-[0.52rem] font-black tracking-[0.1em] uppercase px-2 py-0.5"
      style={{ background: '#B8892E', color: '#ffffff' }}
    >
      {label}
    </span>
  )
}

/* ── Standard article card (16:9 image, badge, headline, date) ── */
function ArticleCard({ article, sizes = '25vw', priority = false }: { article: WFWItem; sizes?: string; priority?: boolean }) {
  const t = getTag(article)
  return (
    <Link href={`/word-for-word/${article.slug}`} className="group flex flex-col">
      <div className="relative overflow-hidden mb-2.5" style={{ aspectRatio: '16/9' }}>
        {article.image ? (
          <Image
            src={article.image}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes={sizes}
            priority={priority}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: '#1a1a1a' }}>
            <span className="text-[0.55rem] font-bold tracking-[0.16em] uppercase" style={{ color: '#B8892E' }}>
              Word for Word
            </span>
          </div>
        )}
        {t && (
          <div className="absolute top-0 left-0">
            <CategoryBadge label={t.short} />
          </div>
        )}
      </div>
      <h3
        className="leading-[1.28] mb-1.5 transition-colors group-hover:text-[#7A5C1E] line-clamp-2"
        style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(0.95rem, 1.4vw, 1.15rem)', fontWeight: 700, color: '#1a1a1a' }}
      >
        {article.title}
      </h3>
      <span className="text-[0.62rem]" style={{ color: '#888888' }}>{article.formattedDate}</span>
    </Link>
  )
}

/* ── Sidebar widget header (same left-border style, smaller) ── */
function WidgetHeader({ title }: { title: string }) {
  return (
    <div
      className="flex items-center gap-3 mb-4 pb-2"
      style={{ borderLeft: '4px solid #B8892E', paddingLeft: '0.6rem', borderBottom: '1px solid #e8e8e8' }}
    >
      <h3 className="text-[0.68rem] font-black tracking-[0.12em] uppercase" style={{ color: '#1a1a1a' }}>
        {title}
      </h3>
    </div>
  )
}

export function WFWBrowser({ articles }: { articles: WFWItem[] }) {
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [dontMissTab, setDontMissTab] = useState<string | null>(null)

  const topics = useMemo(
    () =>
      TOPICS.map((t) => ({
        ...t,
        articles: articles.filter((a) => a.tags.includes(t.key)),
      })).filter((t) => t.articles.length > 0),
    [articles],
  )

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

  return (
    <>
      {/* ── Trending ticker ─────────────────────────────────────────────── */}
      <style>{`
        @keyframes wfw-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .wfw-track {
          display: flex;
          width: max-content;
          animation: wfw-scroll 80s linear infinite;
        }
        .wfw-track:hover { animation-play-state: paused; }
      `}</style>

      <div style={{ background: '#111111', borderBottom: '2px solid #B8892E' }}>
        <div className="mx-auto max-w-[1200px] px-5">
          <div className="flex items-stretch" style={{ height: 40 }}>
            <div
              className="shrink-0 flex items-center gap-2 pr-4 mr-4 border-r"
              style={{ borderColor: 'rgba(184,137,46,0.35)' }}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#B8892E' }} />
              <span className="text-[0.52rem] font-black tracking-[0.24em] uppercase whitespace-nowrap" style={{ color: '#B8892E' }}>
                Trending Now
              </span>
            </div>
            <div className="flex-1 overflow-hidden flex items-center">
              <div className="wfw-track">
                {[...articles.slice(0, 16), ...articles.slice(0, 16)].map((a, i) => (
                  <Link
                    key={`${a.slug}-${i}`}
                    href={`/word-for-word/${a.slug}`}
                    className="flex items-center gap-0 shrink-0 group"
                  >
                    <span
                      className="text-[0.6rem] font-medium whitespace-nowrap transition-colors group-hover:text-[#B8892E] px-4"
                      style={{ color: 'rgba(255,255,255,0.55)' }}
                    >
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

      {/* ── Main layout: content + sidebar ─────────────────────────────── */}
      <div style={{ background: '#ffffff' }}>
        <div className="mx-auto max-w-[1200px] px-5 pt-7 pb-16">
          <div className="flex gap-8 items-start">

            {/* ── Main content column ─────────────────────────────────── */}
            <div className="flex-1 min-w-0">

              {isFiltering ? (
                /* ── Filtered results view ──────────────────────────── */
                <>
                  <SectionHeader
                    title={activeTopic ? activeTopic.label : `Results: "${search.trim()}"`}
                    action={
                      <button
                        onClick={() => { setSearch(''); setActiveKey(null) }}
                        className="shrink-0 text-[0.62rem] font-medium transition-colors hover:text-[#7A5C1E]"
                        style={{ color: '#888888' }}
                      >
                        Clear ×
                      </button>
                    }
                  />
                  <p className="text-[0.65rem] mb-6 -mt-1" style={{ color: '#888888' }}>
                    {filtered.length} question{filtered.length !== 1 ? 's' : ''}
                  </p>
                  {filtered.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filtered.map((a) => (
                        <ArticleCard
                          key={a.slug}
                          article={a}
                          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center">
                      <p className="text-[0.9rem] italic mb-3" style={{ fontFamily: 'var(--font-source-serif)', color: '#888888' }}>
                        No questions found.
                      </p>
                      <button
                        onClick={() => { setSearch(''); setActiveKey(null) }}
                        className="text-[0.72rem] transition-colors hover:text-[#7A5C1E]"
                        style={{ color: '#888888' }}
                      >
                        Clear filters
                      </button>
                    </div>
                  )}
                </>

              ) : (
                /* ── Default editorial view ─────────────────────────── */
                <>

                  {/* ── Hero article ──────────────────────────────────── */}
                  {hero && (
                    <div className="mb-6 pb-6 border-b" style={{ borderColor: '#e8e8e8' }}>
                      <Link href={`/word-for-word/${hero.slug}`} className="group block">
                        <div className="relative w-full overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
                          {hero.image ? (
                            <Image
                              src={hero.image}
                              alt=""
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                              sizes="(min-width: 1200px) 820px, 70vw"
                              priority
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: '#1a1a1a' }}>
                              <span style={{ color: '#B8892E', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>
                                Word for Word
                              </span>
                            </div>
                          )}
                          {getTag(hero) && (
                            <div className="absolute top-0 left-0">
                              <CategoryBadge label={getTag(hero)!.short} />
                            </div>
                          )}
                        </div>
                        <h2
                          className="leading-[1.1] mb-3 transition-colors group-hover:text-[#7A5C1E]"
                          style={{
                            fontFamily: 'var(--font-cormorant)',
                            fontSize: 'clamp(2rem, 3.2vw, 2.75rem)',
                            fontWeight: 700,
                            color: '#1a1a1a',
                          }}
                        >
                          {hero.title}
                        </h2>
                        {hero.excerpt && (
                          <p
                            className="text-[0.9rem] leading-[1.65] mb-2"
                            style={{ fontFamily: 'var(--font-source-serif)', color: '#555555', maxWidth: 580 }}
                          >
                            {hero.excerpt.length > 240 ? hero.excerpt.slice(0, 237) + '…' : hero.excerpt}
                          </p>
                        )}
                        <span className="text-[0.65rem]" style={{ color: '#888888' }}>{hero.formattedDate}</span>
                      </Link>
                    </div>
                  )}

                  {/* ── 4-up recent grid ──────────────────────────────── */}
                  {recentGrid.length > 0 && (
                    <div className="mb-7 pb-7 border-b" style={{ borderColor: '#e8e8e8' }}>
                      <SectionHeader title="This Week" />
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {recentGrid.map((a) => (
                          <ArticleCard
                            key={a.slug}
                            article={a}
                            sizes="(min-width: 1200px) 185px, (min-width: 640px) 30vw, 100vw"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Don't Miss (tabbed) ───────────────────────────── */}
                  <div className="mb-7 pb-7 border-b" style={{ borderColor: '#e8e8e8' }}>
                    <SectionHeader title="Don't Miss" />

                    {/* Category tab row */}
                    <div className="flex items-end gap-0 mb-6 border-b" style={{ borderColor: '#e8e8e8' }}>
                      {[{ key: null, label: 'All' }, ...topics.slice(0, 5).map((t) => ({ key: t.key, label: t.short }))].map(
                        ({ key, label }) => (
                          <button
                            key={String(key)}
                            onClick={() => setDontMissTab(key)}
                            className="px-3.5 py-2 text-[0.64rem] font-black tracking-[0.08em] uppercase border-b-2 -mb-px transition-all whitespace-nowrap"
                            style={{
                              borderColor: dontMissTab === key ? '#B8892E' : 'transparent',
                              color: dontMissTab === key ? '#B8892E' : '#888888',
                            }}
                          >
                            {label}
                          </button>
                        ),
                      )}
                    </div>

                    {/* 1 large + 4 stacked */}
                    {dontMissFeature && (
                      <div className="grid lg:grid-cols-2 gap-0">
                        {/* Large feature left */}
                        <Link href={`/word-for-word/${dontMissFeature.slug}`} className="group pr-6">
                          <div className="relative overflow-hidden mb-3.5" style={{ aspectRatio: '3/2' }}>
                            {dontMissFeature.image ? (
                              <Image
                                src={dontMissFeature.image}
                                alt=""
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                sizes="(min-width: 1200px) 380px, 40vw"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center" style={{ background: '#1a1a1a' }}>
                                <span className="text-[0.55rem] font-bold tracking-[0.16em] uppercase" style={{ color: '#B8892E' }}>
                                  Word for Word
                                </span>
                              </div>
                            )}
                            {getTag(dontMissFeature) && (
                              <div className="absolute top-0 left-0">
                                <CategoryBadge label={getTag(dontMissFeature)!.short} />
                              </div>
                            )}
                          </div>
                          <h3
                            className="leading-[1.2] mb-2.5 transition-colors group-hover:text-[#7A5C1E]"
                            style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.3rem, 2vw, 1.65rem)', fontWeight: 700, color: '#1a1a1a' }}
                          >
                            {dontMissFeature.title}
                          </h3>
                          {dontMissFeature.excerpt && (
                            <p
                              className="text-[0.84rem] leading-[1.65] line-clamp-3 mb-1.5"
                              style={{ fontFamily: 'var(--font-source-serif)', color: '#555555' }}
                            >
                              {dontMissFeature.excerpt}
                            </p>
                          )}
                          <span className="text-[0.62rem]" style={{ color: '#888888' }}>{dontMissFeature.formattedDate}</span>
                        </Link>

                        {/* 4 stacked small right */}
                        <div className="pl-6 flex flex-col justify-between">
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
                                  {getTag(a) && (
                                    <div className="mb-1">
                                      <CategoryBadge label={getTag(a)!.short} />
                                    </div>
                                  )}
                                  <h4
                                    className="leading-[1.3] line-clamp-2 transition-colors group-hover:text-[#7A5C1E]"
                                    style={{ fontFamily: 'var(--font-cormorant)', fontSize: '0.98rem', fontWeight: 700, color: '#1a1a1a' }}
                                  >
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

                  {/* ── Per-topic sections ────────────────────────────── */}
                  {topics.map((t) => (
                    <div key={t.key} className="mb-7 pb-7 border-b" style={{ borderColor: '#e8e8e8' }}>
                      <SectionHeader
                        title={t.label}
                        number={t.n}
                        action={
                          <button
                            onClick={() => setActiveKey(t.key)}
                            className="shrink-0 text-[0.6rem] font-bold tracking-[0.06em] transition-colors hover:text-[#7A5C1E]"
                            style={{ color: '#888888' }}
                          >
                            All {t.articles.length} →
                          </button>
                        }
                      />
                      <div
                        className={`grid gap-5 ${
                          t.articles.length >= 3
                            ? 'sm:grid-cols-2 lg:grid-cols-3'
                            : t.articles.length === 2
                            ? 'sm:grid-cols-2'
                            : ''
                        }`}
                      >
                        {t.articles.slice(0, 3).map((a) => (
                          <ArticleCard
                            key={a.slug}
                            article={a}
                            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw"
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* ── All Questions numbered list ───────────────────── */}
                  <div>
                    <SectionHeader
                      title="All Questions"
                      action={
                        <span className="shrink-0 text-[0.6rem] font-medium" style={{ color: '#888888' }}>
                          {articles.length} answered
                        </span>
                      }
                    />
                    <div>
                      {articles.map((a, i) => {
                        const t = getTag(a)
                        return (
                          <div key={a.slug}>
                            <Link href={`/word-for-word/${a.slug}`} className="group flex items-start gap-4 py-3">
                              <span
                                className="shrink-0"
                                style={{
                                  fontFamily: 'var(--font-cormorant)',
                                  fontSize: '0.92rem',
                                  fontStyle: 'italic',
                                  color: '#C9984A',
                                  width: 26,
                                  lineHeight: 1.6,
                                  flexShrink: 0,
                                }}
                              >
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              <div className="flex-1 min-w-0 flex flex-wrap items-start gap-x-2 gap-y-1">
                                {t && (
                                  <span
                                    className="shrink-0 text-[0.5rem] font-black tracking-[0.1em] uppercase px-1.5 py-0.5"
                                    style={{ background: '#f7f7f7', color: '#B8892E', border: '1px solid #e8e8e8', marginTop: 2 }}
                                  >
                                    {t.short}
                                  </span>
                                )}
                                <span
                                  className="text-[0.93rem] leading-snug transition-colors group-hover:text-[#7A5C1E]"
                                  style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, color: '#1a1a1a' }}
                                >
                                  {a.title}
                                </span>
                              </div>
                              <span className="shrink-0 text-[0.6rem] pt-1 hidden md:block" style={{ color: '#888888' }}>
                                {a.formattedDate}
                              </span>
                            </Link>
                            {i < articles.length - 1 && (
                              <div className="h-px" style={{ background: '#f3f3f3' }} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                </>
              )}

            </div>

            {/* ── Sidebar (280px, sticky) ──────────────────────────────── */}
            <aside
              className="hidden lg:flex flex-col gap-7 shrink-0 sticky top-7"
              style={{ width: 280, maxHeight: 'calc(100vh - 4rem)', overflowY: 'auto' }}
            >

              {/* Search */}
              <div>
                <WidgetHeader title="Search" />
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888888" strokeWidth="2"
                  >
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
                  <button
                    onClick={() => { setSearch(''); setActiveKey(null) }}
                    className="mt-2 text-[0.6rem] transition-colors hover:text-[#7A5C1E]"
                    style={{ color: '#888888' }}
                  >
                    Clear filters ×
                  </button>
                )}
              </div>

              {/* Popular Posts */}
              <div>
                <WidgetHeader title="Popular Posts" />
                <div className="flex flex-col gap-0">
                  {articles.slice(0, 5).map((a, i) => (
                    <div key={a.slug}>
                      {i > 0 && <div className="border-t my-3" style={{ borderColor: '#e8e8e8' }} />}
                      <Link href={`/word-for-word/${a.slug}`} className="group flex gap-3 items-start">
                        <span
                          className="shrink-0"
                          style={{
                            fontFamily: 'var(--font-cormorant)',
                            fontSize: '0.95rem',
                            fontStyle: 'italic',
                            color: '#C9984A',
                            width: 22,
                            lineHeight: 1.4,
                            fontWeight: 700,
                          }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div className="flex-1 min-w-0">
                          {getTag(a) && (
                            <div className="mb-1">
                              <span
                                className="text-[0.5rem] font-black tracking-[0.1em] uppercase"
                                style={{ color: '#B8892E' }}
                              >
                                {getTag(a)!.short}
                              </span>
                            </div>
                          )}
                          <h4
                            className="text-[0.82rem] leading-[1.35] line-clamp-2 transition-colors group-hover:text-[#7A5C1E]"
                            style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, color: '#1a1a1a' }}
                          >
                            {a.title}
                          </h4>
                          <span className="text-[0.58rem]" style={{ color: '#888888' }}>{a.formattedDate}</span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <WidgetHeader title="Categories" />
                <div className="flex flex-col gap-0">
                  {topics.map((t, i) => (
                    <div key={t.key}>
                      {i > 0 && <div className="h-px" style={{ background: '#f3f3f3' }} />}
                      <button
                        onClick={() => { setActiveKey(activeKey === t.key ? null : t.key); setSearch('') }}
                        className="w-full flex items-center justify-between gap-3 py-2.5 text-left group"
                      >
                        <span
                          className="text-[0.8rem] leading-snug transition-colors group-hover:text-[#7A5C1E]"
                          style={{
                            fontFamily: 'var(--font-cormorant)',
                            fontWeight: activeKey === t.key ? 700 : 500,
                            color: activeKey === t.key ? '#7A5C1E' : '#1a1a1a',
                          }}
                        >
                          {t.label}
                        </span>
                        <span
                          className="shrink-0 text-[0.6rem] font-black min-w-[26px] text-center py-0.5 px-1.5"
                          style={{
                            background: activeKey === t.key ? '#B8892E' : '#f7f7f7',
                            color: activeKey === t.key ? '#ffffff' : '#888888',
                          }}
                        >
                          {t.articles.length}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* About */}
              <div>
                <WidgetHeader title="About" />
                <p
                  className="text-[0.8rem] leading-[1.7]"
                  style={{ fontFamily: 'var(--font-source-serif)', color: '#555555' }}
                >
                  Word for Word answers the hardest questions about the Christian faith — directly from Scripture, with clarity and care. Published weekly.
                </p>
              </div>

            </aside>

          </div>
        </div>
      </div>
    </>
  )
}
