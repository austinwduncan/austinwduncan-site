'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const TAG_SHORT: Record<string, string> = {
  'The Nature and Character of God': 'God & Theology',
  'Basic Christian Thought & Spiritual Growth': 'Christian Life',
  'Basic Apologetics': 'Apologetics',
  'New Testament Issues': 'New Testament',
  'Old Testament Issues': 'Old Testament',
  'Historical Jesus and Christology': 'Christology',
  'Spiritual Gifts': 'Spiritual Gifts',
  'Holidays': 'Holidays',
}

export type WFWItem = {
  slug: string
  title: string
  formattedDate: string
  image: string
  tags: string[]
  excerpt: string
}

function ArticleCard({ article }: { article: WFWItem }) {
  return (
    <Link href={`/word-for-word/${article.slug}`} className="group flex flex-col">
      {/* Thumbnail */}
      <div className="overflow-hidden mb-4" style={{ aspectRatio: '1 / 1' }}>
        {article.image ? (
          <div className="relative w-full h-full overflow-hidden">
            <Image
              src={article.image}
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
            <span
              className="text-[0.6rem] font-medium tracking-[0.18em] uppercase"
              style={{ color: '#7A5C1E' }}
            >
              Word for Word
            </span>
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 mb-2.5">
        {article.tags[0] && (
          <span
            className="text-[0.6rem] font-medium tracking-[0.12em] uppercase"
            style={{ color: '#B8892E' }}
          >
            {TAG_SHORT[article.tags[0]] ?? article.tags[0]}
          </span>
        )}
        {article.tags[0] && (
          <span
            className="inline-block h-[3px] w-[3px] rounded-full shrink-0"
            style={{ background: '#C8BFA8' }}
          />
        )}
        <span className="text-[0.63rem]" style={{ color: '#9A9189' }}>
          {article.formattedDate}
        </span>
      </div>

      {/* Title — the question */}
      <h3
        className="leading-[1.3] tracking-tight transition-colors group-hover:text-[#7A5C1E]"
        style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: 'clamp(1.05rem, 1.4vw, 1.25rem)',
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
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const allTags = useMemo(() => {
    const counts = new Map<string, number>()
    articles.forEach((a) => a.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)))
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t)
  }, [articles])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return articles.filter((a) => {
      const matchTag = !activeTag || a.tags.includes(activeTag)
      const matchSearch = !q || a.title.toLowerCase().includes(q)
      return matchTag && matchSearch
    })
  }, [articles, activeTag, search])

  const isFiltering = !!search.trim() || !!activeTag
  const featured = articles[0]
  const gridItems = isFiltering ? filtered : filtered.slice(1)

  return (
    <div style={{ background: '#FAFAF7' }}>
      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div className="border-b" style={{ background: '#F0EDE6', borderColor: '#E2DACE' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 pt-6 pb-5">
          {/* Search row */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-4">
            <div className="relative flex-1 max-w-[360px]">
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
                onChange={(e) => setSearch(e.target.value)}
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
            <p
              className="text-[0.63rem] font-medium tracking-[0.1em] uppercase shrink-0"
              style={{ color: '#9A9189' }}
            >
              {filtered.length} of {articles.length} questions
            </p>
          </div>

          {/* Tag chips */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag(null)}
              className="px-3 py-1 text-[0.6rem] font-medium tracking-[0.1em] uppercase border transition-all"
              style={{
                background: !activeTag ? '#7A5C1E' : 'transparent',
                color: !activeTag ? '#F9F6F0' : '#5A544C',
                borderColor: !activeTag ? '#7A5C1E' : '#C8BFA8',
              }}
            >
              All Topics
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className="px-3 py-1 text-[0.6rem] font-medium tracking-[0.1em] uppercase border transition-all"
                style={{
                  background: activeTag === tag ? '#7A5C1E' : 'transparent',
                  color: activeTag === tag ? '#F9F6F0' : '#5A544C',
                  borderColor: activeTag === tag ? '#7A5C1E' : '#C8BFA8',
                }}
              >
                {TAG_SHORT[tag] ?? tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1100px] px-6 lg:px-8 pt-12 pb-20">
        {/* ── Featured latest — hidden while filtering ─────────────────── */}
        {!isFiltering && featured && (
          <div className="mb-14">
            <div
              className="flex items-center gap-2.5 text-[0.63rem] font-medium tracking-[0.12em] uppercase mb-8"
              style={{ color: '#9A9189' }}
            >
              Latest Question
              <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
            </div>

            <Link
              href={`/word-for-word/${featured.slug}`}
              className="group flex flex-col lg:flex-row gap-8 lg:gap-14 items-start"
            >
              <div className="w-full lg:w-[300px] shrink-0 overflow-hidden" style={{ aspectRatio: '1 / 1' }}>
                {featured.image ? (
                  <div className="relative w-full h-full overflow-hidden">
                    <Image
                      src={featured.image}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes="300px"
                      priority
                    />
                  </div>
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: '#1A1714' }}
                  >
                    <span
                      className="text-[0.65rem] font-medium tracking-[0.18em] uppercase"
                      style={{ color: '#B8892E' }}
                    >
                      Word for Word
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 lg:pt-2">
                {featured.tags[0] && (
                  <div
                    className="text-[0.65rem] font-medium tracking-[0.14em] uppercase mb-3"
                    style={{ color: '#B8892E' }}
                  >
                    {TAG_SHORT[featured.tags[0]] ?? featured.tags[0]}
                  </div>
                )}
                <h2
                  className="leading-[1.15] tracking-tight mb-4 transition-colors group-hover:text-[#7A5C1E]"
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: 'clamp(1.8rem, 2.8vw, 2.5rem)',
                    fontWeight: 500,
                    color: '#1A1714',
                  }}
                >
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p
                    className="text-[0.93rem] leading-[1.75] mb-5 line-clamp-3"
                    style={{ fontFamily: 'var(--font-source-serif)', color: '#5A544C' }}
                  >
                    {featured.excerpt}
                  </p>
                )}
                <span
                  className="inline-flex items-center gap-1.5 text-[0.73rem] tracking-[0.04em] pb-px border-b transition-colors group-hover:text-[#7A5C1E] group-hover:border-[#7A5C1E]"
                  style={{ color: '#9A9189', borderColor: '#E2DACE' }}
                >
                  Read article
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          </div>
        )}

        {/* ── Active filter label ──────────────────────────────────────── */}
        {isFiltering && (
          <div
            className="flex items-center gap-2.5 text-[0.63rem] font-medium tracking-[0.12em] uppercase mb-8"
            style={{ color: '#9A9189' }}
          >
            {activeTag
              ? (TAG_SHORT[activeTag] ?? activeTag)
              : `Searching "${search.trim()}"`}
            <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
            <button
              onClick={() => { setSearch(''); setActiveTag(null) }}
              className="text-[0.6rem] tracking-[0.08em] transition-colors hover:text-[#B8892E]"
              style={{ color: '#B0A898' }}
            >
              Clear ×
            </button>
          </div>
        )}

        {/* ── Grid ────────────────────────────────────────────────────── */}
        {gridItems.length > 0 ? (
          <>
            {!isFiltering && (
              <div
                className="flex items-center gap-2.5 text-[0.63rem] font-medium tracking-[0.12em] uppercase mb-8"
                style={{ color: '#9A9189' }}
              >
                All Questions
                <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
              </div>
            )}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
              {gridItems.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </>
        ) : (
          <div className="py-24 text-center">
            <p
              className="text-[0.95rem] italic mb-3"
              style={{ fontFamily: 'var(--font-source-serif)', color: '#9A9189' }}
            >
              No questions found{search.trim() ? ` matching "${search.trim()}"` : ''}.
            </p>
            <button
              onClick={() => { setSearch(''); setActiveTag(null) }}
              className="text-[0.72rem] tracking-[0.06em] transition-colors hover:text-[#B8892E]"
              style={{ color: '#B0A898' }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
