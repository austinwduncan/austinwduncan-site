'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const TOPICS = [
  { key: 'The Nature and Character of God',        label: 'God & Theology',   short: 'Theology',    n: '01' },
  { key: 'Basic Christian Thought & Spiritual Growth', label: 'Christian Life',   short: 'Life',        n: '02' },
  { key: 'Basic Apologetics',                       label: 'Apologetics',      short: 'Apologetics', n: '03' },
  { key: 'New Testament Issues',                    label: 'New Testament',    short: 'NT Issues',   n: '04' },
  { key: 'Old Testament Issues',                    label: 'Old Testament',    short: 'OT Issues',   n: '05' },
  { key: 'Historical Jesus and Christology',        label: 'Christology',      short: 'Christology', n: '06' },
  { key: 'Spiritual Gifts',                         label: 'Spiritual Gifts',  short: 'Gifts',       n: '07' },
  { key: 'Holidays',                                label: 'Holidays',         short: 'Holidays',    n: '08' },
]

export type WFWItem = {
  slug: string
  title: string
  formattedDate: string
  image: string
  tags: string[]
  excerpt: string
}

function tag(a: WFWItem) {
  return TOPICS.find((t) => a.tags.includes(t.key)) ?? null
}

export function WFWBrowser({ articles }: { articles: WFWItem[] }) {
  const [search, setSearch] = useState('')
  const [activeKey, setActiveKey] = useState<string | null>(null)

  const topics = useMemo(
    () =>
      TOPICS.map((t) => ({
        ...t,
        count: articles.filter((a) => a.tags.includes(t.key)).length,
        previews: articles
          .filter((a) => a.tags.includes(t.key))
          .slice(0, 2)
          .map((a) => a.title),
      })),
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

  return (
    <>
      {/* ── Topic Explorer ───────────────────────────────────────────────── */}
      <div style={{ background: '#0E0C0A' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-10 lg:py-12">
          <div
            className="flex items-center gap-2.5 text-[0.63rem] font-medium tracking-[0.14em] uppercase mb-8"
            style={{ color: '#7A5C1E' }}
          >
            Browse by Topic
            <span className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {topics.map((t) => {
              const active = activeKey === t.key
              return (
                <button
                  key={t.key}
                  onClick={() => {
                    setActiveKey(active ? null : t.key)
                    setSearch('')
                  }}
                  className="text-left p-4 border transition-all duration-200"
                  style={{
                    background: active ? '#1C1916' : 'rgba(255,255,255,0.02)',
                    borderColor: active ? '#7A5C1E' : 'rgba(255,255,255,0.07)',
                  }}
                >
                  <div
                    className="text-[0.58rem] font-medium tracking-[0.16em] uppercase mb-2"
                    style={{ color: active ? '#B8892E' : '#4A4540' }}
                  >
                    {t.n}
                  </div>
                  <div
                    className="leading-tight mb-2.5"
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: '1.05rem',
                      fontWeight: 500,
                      color: active ? '#F9F6F0' : 'rgba(249,246,240,0.5)',
                    }}
                  >
                    {t.label}
                  </div>
                  <div
                    className="text-[0.58rem] font-medium tracking-[0.08em] mb-3"
                    style={{ color: active ? '#B8892E' : '#6A5C40' }}
                  >
                    {t.count} questions
                  </div>
                  <ul className="space-y-1.5">
                    {t.previews.map((q, i) => (
                      <li
                        key={i}
                        className="text-[0.6rem] leading-snug line-clamp-2"
                        style={{ color: 'rgba(255,255,255,0.22)' }}
                      >
                        {q}
                      </li>
                    ))}
                  </ul>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Search strip ────────────────────────────────────────────────── */}
      <div
        className="border-b"
        style={{ background: '#F0EDE6', borderColor: '#E2DACE' }}
      >
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-[380px]">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9A9189"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search questions…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setActiveKey(null) }}
                className="w-full pl-9 pr-4 py-2 text-[0.87rem] border outline-none transition-colors"
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

            {isFiltering ? (
              <>
                <p
                  className="text-[0.63rem] font-medium tracking-[0.1em] uppercase shrink-0"
                  style={{ color: '#9A9189' }}
                >
                  {filtered.length} question{filtered.length !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={() => { setSearch(''); setActiveKey(null) }}
                  className="text-[0.63rem] tracking-[0.06em] transition-colors hover:text-[#B8892E] shrink-0"
                  style={{ color: '#B0A898' }}
                >
                  Clear ×
                </button>
              </>
            ) : (
              <p
                className="text-[0.63rem] font-medium tracking-[0.1em] uppercase shrink-0"
                style={{ color: '#9A9189' }}
              >
                {articles.length} questions
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Results ──────────────────────────────────────────────────────── */}
      <div style={{ background: '#FAFAF7' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 pt-12 pb-20">

          {isFiltering ? (
            /* ── Filtered grid ───────────────────────────────────────── */
            <>
              <div
                className="flex items-center gap-2.5 text-[0.63rem] font-medium tracking-[0.12em] uppercase mb-8"
                style={{ color: '#9A9189' }}
              >
                {activeTopic ? activeTopic.label : `"${search.trim()}"`}
                <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
                <span>{filtered.length} question{filtered.length !== 1 ? 's' : ''}</span>
              </div>

              {filtered.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                  {filtered.map((a) => {
                    const t = tag(a)
                    return (
                      <Link key={a.slug} href={`/word-for-word/${a.slug}`} className="group flex flex-col">
                        <div className="overflow-hidden mb-4" style={{ aspectRatio: '4/3' }}>
                          {a.image ? (
                            <div className="relative w-full h-full overflow-hidden">
                              <Image
                                src={a.image}
                                alt=""
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                              />
                            </div>
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center"
                              style={{ background: '#1C1916' }}
                            >
                              <span className="text-[0.6rem] font-medium tracking-[0.16em] uppercase" style={{ color: '#7A5C1E' }}>
                                Word for Word
                              </span>
                            </div>
                          )}
                        </div>
                        {t && (
                          <div className="text-[0.6rem] font-medium tracking-[0.12em] uppercase mb-2" style={{ color: '#B8892E' }}>
                            {t.short}
                          </div>
                        )}
                        <h3
                          className="leading-[1.3] tracking-tight transition-colors group-hover:text-[#7A5C1E]"
                          style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.05rem, 1.4vw, 1.25rem)', fontWeight: 500, color: '#1A1714' }}
                        >
                          {a.title}
                        </h3>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="py-24 text-center">
                  <p className="text-[0.95rem] italic mb-3" style={{ fontFamily: 'var(--font-source-serif)', color: '#9A9189' }}>
                    No questions found{search.trim() ? ` matching "${search.trim()}"` : ''}.
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
            /* ── Default: featured cards + full compact list ─────────── */
            <>
              {/* Latest 3 — visual cards */}
              <div
                className="flex items-center gap-2.5 text-[0.63rem] font-medium tracking-[0.12em] uppercase mb-8"
                style={{ color: '#9A9189' }}
              >
                Latest Questions
                <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 mb-14">
                {articles.slice(0, 3).map((a) => {
                  const t = tag(a)
                  return (
                    <Link key={a.slug} href={`/word-for-word/${a.slug}`} className="group flex flex-col">
                      <div className="overflow-hidden mb-4" style={{ aspectRatio: '4/3' }}>
                        {a.image ? (
                          <div className="relative w-full h-full overflow-hidden">
                            <Image
                              src={a.image}
                              alt=""
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                              priority
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ background: '#1C1916' }}>
                            <span className="text-[0.6rem] font-medium tracking-[0.16em] uppercase" style={{ color: '#7A5C1E' }}>Word for Word</span>
                          </div>
                        )}
                      </div>
                      {t && (
                        <div className="text-[0.6rem] font-medium tracking-[0.12em] uppercase mb-2.5" style={{ color: '#B8892E' }}>
                          {t.label}
                        </div>
                      )}
                      <h3
                        className="leading-[1.3] tracking-tight transition-colors group-hover:text-[#7A5C1E]"
                        style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.1rem, 1.5vw, 1.3rem)', fontWeight: 500, color: '#1A1714' }}
                      >
                        {a.title}
                      </h3>
                    </Link>
                  )
                })}
              </div>

              {/* All questions — compact scannable list */}
              <div
                className="flex items-center gap-2.5 text-[0.63rem] font-medium tracking-[0.12em] uppercase mb-6"
                style={{ color: '#9A9189' }}
              >
                All {articles.length} Questions
                <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
              </div>

              <div>
                {articles.slice(3).map((a, i) => {
                  const t = tag(a)
                  return (
                    <div key={a.slug}>
                      <Link
                        href={`/word-for-word/${a.slug}`}
                        className="group flex items-start gap-4 py-3.5"
                      >
                        <span
                          className="shrink-0 text-[0.58rem] font-medium tracking-[0.1em] uppercase pt-0.5"
                          style={{ color: '#B8892E', width: 96 }}
                        >
                          {t?.short ?? ''}
                        </span>
                        <h3
                          className="flex-1 text-[0.97rem] leading-snug transition-colors group-hover:text-[#7A5C1E]"
                          style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, color: '#1A1714' }}
                        >
                          {a.title}
                        </h3>
                        <span
                          className="shrink-0 text-[0.62rem] pt-0.5 hidden sm:block"
                          style={{ color: '#9A9189' }}
                        >
                          {a.formattedDate}
                        </span>
                      </Link>
                      {i < articles.length - 4 && (
                        <div className="h-px" style={{ background: '#EDEAE1' }} />
                      )}
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
