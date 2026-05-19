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

function ArticleCard({ article, sizes = '33vw', priority = false }: { article: WFWItem; sizes?: string; priority?: boolean }) {
  const t = getTag(article)
  return (
    <Link href={`/word-for-word/${article.slug}`} className="group flex flex-col">
      <div className="relative overflow-hidden mb-3.5" style={{ aspectRatio: '16/10' }}>
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
          <div className="w-full h-full flex items-center justify-center" style={{ background: '#1C1916' }}>
            <span className="text-[0.58rem] font-medium tracking-[0.16em] uppercase" style={{ color: '#7A5C1E' }}>
              Word for Word
            </span>
          </div>
        )}
      </div>
      {t && (
        <div className="text-[0.58rem] font-medium tracking-[0.12em] uppercase mb-1.5" style={{ color: '#B8892E' }}>
          {t.short}
        </div>
      )}
      <h3
        className="leading-[1.28] tracking-tight transition-colors group-hover:text-[#7A5C1E]"
        style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: 'clamp(1rem, 1.4vw, 1.22rem)',
          fontWeight: 500,
          color: '#1A1714',
        }}
      >
        {article.title}
      </h3>
    </Link>
  )
}

export function WFWBrowser({ articles }: { articles: WFWItem[] }) {
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [search, setSearch] = useState('')

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

  const featured = articles[0]
  const secondary = articles.slice(1, 4)

  return (
    <>
      {/* ── Trending Questions strip ─────────────────────────────────────── */}
      <div style={{ background: '#0A0907', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
          <div className="flex items-stretch gap-0" style={{ height: 44 }}>

            {/* Label */}
            <div
              className="shrink-0 flex items-center gap-2 pr-5 mr-5 border-r"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#B8892E' }} />
              <span className="text-[0.52rem] font-bold tracking-[0.24em] uppercase" style={{ color: '#B8892E' }}>
                Trending
              </span>
            </div>

            {/* Scrollable list */}
            <div
              className="flex items-center gap-5 overflow-x-auto flex-1"
              style={{ scrollbarWidth: 'none' }}
            >
              {articles.slice(0, 14).map((a, i) => (
                <Link
                  key={a.slug}
                  href={`/word-for-word/${a.slug}`}
                  className="shrink-0 flex items-center gap-2 transition-opacity hover:opacity-100"
                  style={{ opacity: 0.5 }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: '0.8rem',
                      fontStyle: 'italic',
                      color: '#C9984A',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="text-[0.62rem] font-medium whitespace-nowrap"
                    style={{ color: 'rgba(249,246,240,0.68)' }}
                  >
                    {a.title}
                  </span>
                </Link>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* ── Hero Grid ───────────────────────────────────────────────────── */}
      {!isFiltering && featured && (
        <div style={{ background: '#FAFAF7', borderBottom: '1px solid #E2DACE' }}>
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-12 lg:py-14">

            {/* Dateline */}
            <div className="flex items-center gap-4 mb-10">
              <span className="text-[0.55rem] font-bold tracking-[0.22em] uppercase" style={{ color: '#B8892E' }}>
                Latest Questions
              </span>
              <div className="flex-1 h-px" style={{ background: '#D8D0C4' }} />
              <span className="text-[0.55rem] font-medium tracking-[0.1em] uppercase" style={{ color: '#B0A898' }}>
                {articles.length} answered
              </span>
            </div>

            <div className="grid lg:grid-cols-[1fr_300px] gap-10 lg:gap-12">

              {/* Featured article */}
              <Link href={`/word-for-word/${featured.slug}`} className="group">
                <div className="relative w-full overflow-hidden mb-6" style={{ aspectRatio: '16/9' }}>
                  {featured.image ? (
                    <Image
                      src={featured.image}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      sizes="(min-width: 1024px) 58vw, 100vw"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: '#1C1916' }}>
                      <span className="text-[0.72rem] font-medium tracking-[0.2em] uppercase" style={{ color: '#7A5C1E' }}>
                        Word for Word
                      </span>
                    </div>
                  )}
                </div>
                {getTag(featured) && (
                  <div className="text-[0.6rem] font-medium tracking-[0.14em] uppercase mb-3" style={{ color: '#B8892E' }}>
                    {getTag(featured)!.label}
                  </div>
                )}
                <h2
                  className="leading-[1.1] tracking-tight mb-4 transition-colors group-hover:text-[#7A5C1E]"
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)',
                    fontWeight: 500,
                    color: '#1A1714',
                  }}
                >
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p
                    className="text-[0.9rem] leading-[1.8] mb-5"
                    style={{ fontFamily: 'var(--font-source-serif)', color: '#5A544C', maxWidth: 520 }}
                  >
                    {featured.excerpt.length > 220 ? featured.excerpt.slice(0, 217) + '…' : featured.excerpt}
                  </p>
                )}
                <span
                  className="inline-flex items-center gap-1.5 text-[0.72rem] tracking-[0.06em] pb-px border-b transition-colors group-hover:text-[#7A5C1E] group-hover:border-[#7A5C1E]"
                  style={{ color: '#9A9189', borderColor: '#E2DACE' }}
                >
                  Read answer
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>

              {/* Secondary 3 */}
              <div className="flex flex-col lg:pl-10 lg:border-l space-y-0" style={{ borderColor: '#E2DACE' }}>
                {secondary.map((article, i) => (
                  <div key={article.slug}>
                    {i > 0 && <div className="border-t my-5" style={{ borderColor: '#E2DACE' }} />}
                    <Link href={`/word-for-word/${article.slug}`} className="group flex gap-4">
                      {article.image && (
                        <div className="relative shrink-0 overflow-hidden" style={{ width: 76, height: 56 }}>
                          <Image src={article.image} alt="" fill className="object-cover" sizes="76px" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        {getTag(article) && (
                          <div className="text-[0.56rem] font-medium tracking-[0.12em] uppercase mb-1" style={{ color: '#B8892E' }}>
                            {getTag(article)!.short}
                          </div>
                        )}
                        <h3
                          className="leading-[1.28] tracking-tight transition-colors group-hover:text-[#7A5C1E] line-clamp-3"
                          style={{
                            fontFamily: 'var(--font-cormorant)',
                            fontSize: 'clamp(0.95rem, 1.4vw, 1.12rem)',
                            fontWeight: 500,
                            color: '#1A1714',
                          }}
                        >
                          {article.title}
                        </h3>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Topic Explorer ──────────────────────────────────────────────── */}
      <div style={{ background: '#141210' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-10 lg:py-12">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[0.55rem] font-bold tracking-[0.22em] uppercase" style={{ color: '#7A5C1E' }}>
              Explore by Topic
            </span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            {isFiltering && (
              <button
                onClick={() => { setSearch(''); setActiveKey(null) }}
                className="text-[0.6rem] tracking-[0.06em] transition-colors hover:text-white"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                Clear ×
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {topics.map((t) => {
              const active = activeKey === t.key
              return (
                <button
                  key={t.key}
                  onClick={() => { setActiveKey(active ? null : t.key); setSearch('') }}
                  className="text-left p-4 border transition-all duration-200"
                  style={{
                    background: active ? 'rgba(122,92,30,0.18)' : 'rgba(255,255,255,0.025)',
                    borderColor: active ? '#7A5C1E' : 'rgba(255,255,255,0.07)',
                  }}
                >
                  <div
                    className="text-[0.54rem] font-bold tracking-[0.18em] uppercase mb-2"
                    style={{ color: active ? '#C9984A' : '#4A4540' }}
                  >
                    {t.n}
                  </div>
                  <div
                    className="leading-tight mb-1.5"
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: '1.05rem',
                      fontWeight: 500,
                      color: active ? '#F9F6F0' : 'rgba(249,246,240,0.52)',
                    }}
                  >
                    {t.label}
                  </div>
                  <div
                    className="text-[0.56rem] font-medium"
                    style={{ color: active ? '#B8892E' : 'rgba(255,255,255,0.2)' }}
                  >
                    {t.articles.length} question{t.articles.length !== 1 ? 's' : ''}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Search strip ────────────────────────────────────────────────── */}
      <div style={{ background: '#F0EDE6', borderBottom: '1px solid #E2DACE' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-3.5">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-[380px]">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9A9189" strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search questions…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setActiveKey(null) }}
                className="w-full pl-9 pr-4 py-2 text-[0.85rem] border outline-none transition-colors"
                style={{
                  fontFamily: 'var(--font-source-serif)',
                  background: '#FAFAF7',
                  borderColor: '#D8D0C4',
                  color: '#1A1714',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#B8892E')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#D8D0C4')}
              />
            </div>
            <p className="text-[0.62rem] font-medium tracking-[0.1em] uppercase shrink-0" style={{ color: '#9A9189' }}>
              {isFiltering
                ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`
                : `${articles.length} questions`}
            </p>
            {isFiltering && (
              <button
                onClick={() => { setSearch(''); setActiveKey(null) }}
                className="text-[0.62rem] tracking-[0.06em] transition-colors hover:text-[#B8892E] shrink-0"
                style={{ color: '#B0A898' }}
              >
                Clear ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div style={{ background: '#FAFAF7' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 pt-12 pb-20">

          {isFiltering ? (

            /* ── Filtered results ───────────────────────────────────── */
            <>
              <div className="flex items-center gap-4 mb-8">
                <span className="text-[0.6rem] font-medium tracking-[0.12em] uppercase" style={{ color: '#9A9189' }}>
                  {activeTopic ? activeTopic.label : `"${search.trim()}"`}
                </span>
                <div className="flex-1 h-px" style={{ background: '#E2DACE' }} />
                <span className="text-[0.6rem] font-medium" style={{ color: '#B0A898' }}>
                  {filtered.length} question{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {filtered.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                  {filtered.map((a) => (
                    <ArticleCard
                      key={a.slug}
                      article={a}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center">
                  <p className="text-[0.95rem] italic mb-3" style={{ fontFamily: 'var(--font-source-serif)', color: '#9A9189' }}>
                    No questions found.
                  </p>
                  <button
                    onClick={() => { setSearch(''); setActiveKey(null) }}
                    className="text-[0.72rem] tracking-[0.06em] transition-colors hover:text-[#B8892E]"
                    style={{ color: '#B0A898' }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </>

          ) : (

            /* ── Default view: topic sections + full index ─────────── */
            <>

              {/* Per-topic article blocks */}
              {topics.map((t, ti) => (
                <div
                  key={t.key}
                  className={ti > 0 ? 'mt-14 pt-12 border-t' : ''}
                  style={{ borderColor: '#E2DACE' }}
                >
                  {/* Section header */}
                  <div className="flex items-center gap-4 mb-8">
                    <span
                      className="shrink-0 text-[0.52rem] font-bold tracking-[0.2em] uppercase px-2.5 py-1"
                      style={{ background: '#141210', color: '#C9984A' }}
                    >
                      {t.n}
                    </span>
                    <h2
                      className="leading-tight tracking-tight"
                      style={{
                        fontFamily: 'var(--font-cormorant)',
                        fontSize: 'clamp(1.25rem, 2vw, 1.55rem)',
                        fontWeight: 500,
                        color: '#1A1714',
                      }}
                    >
                      {t.label}
                    </h2>
                    <div className="flex-1 h-px" style={{ background: '#E2DACE' }} />
                    <button
                      onClick={() => setActiveKey(t.key)}
                      className="shrink-0 text-[0.58rem] font-medium tracking-[0.1em] transition-colors hover:text-[#7A5C1E]"
                      style={{ color: '#B0A898' }}
                    >
                      All {t.articles.length} →
                    </button>
                  </div>

                  <div
                    className={`grid gap-8 ${
                      t.articles.length === 1
                        ? ''
                        : t.articles.length === 2
                        ? 'sm:grid-cols-2'
                        : 'sm:grid-cols-2 lg:grid-cols-3'
                    }`}
                  >
                    {t.articles.slice(0, 3).map((a) => (
                      <ArticleCard
                        key={a.slug}
                        article={a}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* All questions index + sidebar */}
              <div className="mt-14 pt-12 border-t" style={{ borderColor: '#E2DACE' }}>
                <div className="flex gap-10 xl:gap-14 items-start">

                  {/* Numbered question list */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-8">
                      <span className="text-[0.55rem] font-bold tracking-[0.22em] uppercase" style={{ color: '#B8892E' }}>
                        All Questions
                      </span>
                      <div className="flex-1 h-px" style={{ background: '#E2DACE' }} />
                      <span className="text-[0.55rem] font-medium tracking-[0.08em] uppercase" style={{ color: '#B0A898' }}>
                        {articles.length} total
                      </span>
                    </div>

                    <div>
                      {articles.map((a, i) => {
                        const t = getTag(a)
                        return (
                          <div key={a.slug}>
                            <Link href={`/word-for-word/${a.slug}`} className="group flex items-start gap-5 py-4">
                              <span
                                className="shrink-0 pt-px"
                                style={{
                                  fontFamily: 'var(--font-cormorant)',
                                  fontSize: '1rem',
                                  fontStyle: 'italic',
                                  color: '#C9984A',
                                  width: 28,
                                  lineHeight: 1.5,
                                }}
                              >
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              <div className="flex-1 min-w-0">
                                {t && (
                                  <span
                                    className="text-[0.54rem] font-medium tracking-[0.12em] uppercase mr-2"
                                    style={{ color: '#B8892E' }}
                                  >
                                    {t.short} ·{' '}
                                  </span>
                                )}
                                <span
                                  className="text-[0.97rem] leading-snug transition-colors group-hover:text-[#7A5C1E]"
                                  style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, color: '#1A1714' }}
                                >
                                  {a.title}
                                </span>
                              </div>
                              <span
                                className="shrink-0 text-[0.6rem] pt-1 hidden sm:block"
                                style={{ color: '#B0A898' }}
                              >
                                {a.formattedDate}
                              </span>
                            </Link>
                            {i < articles.length - 1 && (
                              <div className="h-px" style={{ background: '#EDEAE1' }} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Sidebar */}
                  <aside className="hidden lg:block shrink-0 sticky top-8" style={{ width: 220 }}>

                    <div
                      className="text-[0.55rem] font-bold tracking-[0.18em] uppercase mb-4 pb-2 border-b"
                      style={{ color: '#B8892E', borderColor: '#E2DACE' }}
                    >
                      Browse by Topic
                    </div>
                    <div className="space-y-3 mb-8">
                      {topics.map((t) => (
                        <button
                          key={t.key}
                          onClick={() => setActiveKey(t.key)}
                          className="w-full flex items-baseline justify-between gap-3 text-left group"
                        >
                          <span
                            className="text-[0.75rem] leading-snug transition-colors group-hover:text-[#7A5C1E]"
                            style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, color: '#3A3530' }}
                          >
                            {t.label}
                          </span>
                          <span className="shrink-0 text-[0.58rem] font-medium" style={{ color: '#B0A898' }}>
                            {t.articles.length}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div
                      className="text-[0.55rem] font-bold tracking-[0.18em] uppercase mb-3 pb-2 border-b"
                      style={{ color: '#B8892E', borderColor: '#E2DACE' }}
                    >
                      About This Series
                    </div>
                    <p
                      className="text-[0.77rem] leading-[1.72] italic"
                      style={{ fontFamily: 'var(--font-source-serif)', color: '#7A6F65' }}
                    >
                      Word for Word answers the hardest questions about the Christian faith — from the text of Scripture, with clarity and care.
                    </p>

                  </aside>

                </div>
              </div>

            </>
          )}

        </div>
      </div>
    </>
  )
}
