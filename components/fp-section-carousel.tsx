'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export type CarouselArticle = {
  slug: string
  title: string
  date: string
  image?: string
  lede: string
  readMins: number
}

export type CarouselSection = {
  id: string
  number: string
  title: string
  desc: string
  articles: CarouselArticle[]
}

export function FPSectionCarousel({ sections }: { sections: CarouselSection[] }) {
  const [current, setCurrent] = useState(0)
  const total = sections.length

  const prev = () => setCurrent((c) => (c - 1 + total) % total)
  const next = () => setCurrent((c) => (c + 1) % total)

  const section = sections[current]
  const [lead, ...rest] = section.articles

  return (
    <div>
      {/* ── Tab navigation + arrows ──────────────────────────────────────── */}
      <div
        className="flex items-stretch border-b"
        style={{ borderColor: '#E2DACE', background: '#FAFAF7' }}
      >
        {sections.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setCurrent(i)}
            className="flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[#F5F1EB] focus:outline-none relative"
            style={{
              borderBottom: i === current ? '2px solid #7A5C1E' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: '0.85rem',
                fontStyle: 'italic',
                color: i === current ? '#C9984A' : '#C0B8AE',
                fontWeight: 500,
              }}
            >
              {s.number}
            </span>
            <span
              className="text-[0.68rem] font-semibold tracking-[0.07em] uppercase"
              style={{ color: i === current ? '#1A1714' : '#9A9189' }}
            >
              {s.title}
            </span>
          </button>
        ))}

        <div className="flex-1" />

        {/* Arrow buttons */}
        <div className="flex items-center border-l" style={{ borderColor: '#E2DACE' }}>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous section"
            className="flex items-center justify-center w-11 h-full transition-colors hover:bg-[#F5F1EB]"
            style={{ color: '#9A9189' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="w-px h-6 self-center" style={{ background: '#E2DACE' }} />
          <button
            type="button"
            onClick={next}
            aria-label="Next section"
            className="flex items-center justify-center w-11 h-full transition-colors hover:bg-[#F5F1EB]"
            style={{ color: '#9A9189' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Section content ─────────────────────────────────────────────── */}
      <div key={section.id} className="pt-10">

        {/* Section header */}
        <div className="flex items-center gap-5 mb-10">
          <span
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '0.8rem',
              fontStyle: 'italic',
              color: '#C9984A',
              fontWeight: 500,
              letterSpacing: '0.04em',
            }}
          >
            {section.number}
          </span>
          <div className="h-px flex-none w-6" style={{ background: '#B8892E' }} />
          <h2
            className="shrink-0 tracking-tight"
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(1.4rem, 2vw, 1.75rem)',
              fontWeight: 500,
              color: '#1A1714',
            }}
          >
            {section.title}
          </h2>
          <div className="flex-1 h-px" style={{ background: '#E2DACE' }} />
          <p
            className="shrink-0 text-[0.62rem] font-medium tracking-[0.1em] uppercase hidden sm:block"
            style={{ color: '#B0A898' }}
          >
            {section.desc}
          </p>
        </div>

        {/* Lead article */}
        {lead && (
          <div
            className="flex flex-col lg:flex-row gap-0 pb-10 mb-10 border-b"
            style={{ borderColor: '#E2DACE' }}
          >
            {lead.image && (
              <Link
                href={`/forum-and-pulpit/${lead.slug}`}
                className="group w-full lg:w-[50%] shrink-0 overflow-hidden mb-6 lg:mb-0 lg:mr-8"
              >
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/10' }}>
                  <Image
                    src={lead.image}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                  />
                </div>
              </Link>
            )}
            <div className={lead.image ? 'flex-1 min-w-0' : 'w-full'}>
              <div
                className="text-[0.58rem] font-semibold tracking-[0.16em] uppercase mb-3"
                style={{ color: '#7A5C1E' }}
              >
                {section.title.toUpperCase()} · {lead.date}
              </div>
              <Link href={`/forum-and-pulpit/${lead.slug}`} className="group block">
                <h3
                  className="leading-[1.15] tracking-tight mb-4 transition-colors group-hover:text-[#7A5C1E]"
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: lead.image ? 'clamp(1.35rem, 2.2vw, 1.9rem)' : 'clamp(1.7rem, 2.8vw, 2.4rem)',
                    fontWeight: 500,
                    color: '#1A1714',
                  }}
                >
                  {lead.title}
                </h3>
              </Link>
              {lead.lede && (
                <p
                  className="text-[0.92rem] leading-[1.85] mb-5"
                  style={{ fontFamily: 'var(--font-source-serif)', color: '#5A544C' }}
                >
                  {lead.lede.slice(0, 480)}{lead.lede.length > 480 ? '…' : ''}
                </p>
              )}
              <div className="flex items-center gap-5">
                <Link
                  href={`/forum-and-pulpit/${lead.slug}`}
                  className="inline-flex items-center gap-1.5 text-[0.68rem] tracking-[0.06em] uppercase font-medium transition-colors hover:text-[#7A5C1E]"
                  style={{ color: '#B8892E' }}
                >
                  Read essay
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <span className="text-[0.6rem] font-medium tracking-[0.08em] uppercase" style={{ color: '#C8BFA8' }}>
                  {lead.readMins} min read
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Secondary articles grid */}
        {rest.length > 0 && (
          <div className={`grid gap-8 ${rest.length === 1 ? 'lg:grid-cols-1' : rest.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
            {rest.map((article) => (
              <Link
                key={article.slug}
                href={`/forum-and-pulpit/${article.slug}`}
                className="group flex flex-col"
              >
                {article.image ? (
                  <div className="overflow-hidden mb-4" style={{ aspectRatio: '16/10' }}>
                    <div className="relative w-full h-full overflow-hidden">
                      <Image
                        src={article.image}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    className="overflow-hidden mb-4 flex items-center justify-center"
                    style={{ aspectRatio: '16/10', background: '#1A1714' }}
                  >
                    <span className="text-[0.58rem] font-medium tracking-[0.18em] uppercase" style={{ color: '#7A5C1E' }}>
                      Forum &amp; Pulpit
                    </span>
                  </div>
                )}
                <div className="text-[0.58rem] font-medium tracking-[0.12em] uppercase mb-2" style={{ color: '#B8892E' }}>
                  {article.date}
                </div>
                <h4
                  className="leading-[1.25] tracking-tight mb-3 transition-colors group-hover:text-[#7A5C1E]"
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: 'clamp(1.1rem, 1.5vw, 1.3rem)',
                    fontWeight: 500,
                    color: '#1A1714',
                  }}
                >
                  {article.title}
                </h4>
                {article.lede && (
                  <p
                    className="text-[0.85rem] leading-[1.75] line-clamp-4"
                    style={{ fontFamily: 'var(--font-source-serif)', color: '#7A6F65' }}
                  >
                    {article.lede}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
