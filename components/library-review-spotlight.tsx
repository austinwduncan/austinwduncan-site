'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export type ReviewItem = {
  slug: string
  category: string
  book: string
  author: string
  cover: string
  pullQuote: string
  excerpt: string
  amazonUrl?: string
}

function buildAmazonUrl(url?: string): string {
  if (!url) return ''
  const id = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID
  if (!id || url.includes('tag=')) return url
  return `${url}${url.includes('?') ? '&' : '?'}tag=${id}`
}

export function LibraryReviewSpotlight({ reviews }: { reviews: ReviewItem[] }) {
  const [idx, setIdx] = useState(0)
  const total = reviews.length

  // Random initial review on mount
  useEffect(() => {
    setIdx(Math.floor(Math.random() * total))
  }, [total])

  const prev = () => setIdx((i) => (i - 1 + total) % total)
  const next = () => setIdx((i) => (i + 1) % total)

  const review = reviews[idx]
  const amazonHref = buildAmazonUrl(review.amazonUrl)

  return (
    <div style={{ background: '#F5F0E6', borderTop: '1px solid #DDD5C4' }}>
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-16 lg:py-20">

        {/* Section label + navigation */}
        <div
          className="flex items-center gap-3 mb-14"
          style={{ borderBottom: '1px solid #DDD5C4', paddingBottom: '0.875rem' }}
        >
          <span
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1rem',
              fontStyle: 'italic',
              color: '#7A5C1E',
            }}
          >
            From the Desk
          </span>
          <span className="flex-1 h-px" style={{ background: '#DDD5C4' }} />

          {/* Review counter + arrows */}
          <div className="flex items-center gap-3">
            <span
              className="text-[0.58rem] font-semibold tracking-[0.16em] uppercase"
              style={{ color: '#B0A080' }}
            >
              {idx + 1} / {total}
            </span>
            <div className="flex items-center gap-0 border" style={{ borderColor: '#D4C4A0' }}>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous review"
                className="flex items-center justify-center w-8 h-8 transition-colors hover:bg-[#EDE4D0]"
                style={{ color: '#9A8870' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <div className="w-px h-4 self-center" style={{ background: '#D4C4A0' }} />
              <button
                type="button"
                onClick={next}
                aria-label="Next review"
                className="flex items-center justify-center w-8 h-8 transition-colors hover:bg-[#EDE4D0]"
                style={{ color: '#9A8870' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Pull-quote card */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">

          {/* Left: editorial text */}
          <div className="flex-1 min-w-0 relative order-2 lg:order-1">
            {/* Decorative opening mark */}
            <div
              aria-hidden
              className="absolute -top-4 -left-3 select-none pointer-events-none"
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: '9rem',
                lineHeight: 1,
                color: '#C9984A',
                opacity: 0.11,
              }}
            >
              &#8220;
            </div>

            {/* Pull quote */}
            <blockquote
              className="leading-[1.65] mb-8 relative z-10"
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: 'clamp(1.45rem, 2.2vw, 1.9rem)',
                color: '#1A1410',
              }}
            >
              {review.pullQuote}
            </blockquote>

            {/* Attribution */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-px" style={{ background: '#B8892E' }} />
              <p
                className="text-[0.72rem] tracking-[0.04em]"
                style={{ fontFamily: 'var(--font-source-serif)', color: '#6A5E52', fontStyle: 'italic' }}
              >
                Austin Duncan, on{' '}
                <em style={{ fontStyle: 'normal', color: '#3A2E24' }}>{review.book}</em>
                {' '}by {review.author}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/library/browse?category=${encodeURIComponent(review.category)}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-[0.68rem] font-semibold tracking-[0.12em] uppercase transition-all duration-200 hover:opacity-80"
                style={{ background: '#7A5C1E', color: '#F9F6F0' }}
              >
                More books like this
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>

              {amazonHref && (
                <a
                  href={amazonHref}
                  target="_blank"
                  rel="noreferrer sponsored"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border text-[0.68rem] font-semibold tracking-[0.12em] uppercase transition-all duration-200 hover:border-[#7A5C1E] hover:text-[#4A3810]"
                  style={{ borderColor: '#C4B48C', color: '#7A5C1E' }}
                >
                  View on Amazon
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Right: book cover */}
          <div className="shrink-0 order-1 lg:order-2" style={{ width: 'clamp(120px, 18vw, 200px)' }}>
            <div
              className="relative overflow-hidden"
              style={{
                aspectRatio: '2/3',
                boxShadow: '8px 16px 40px rgba(26,20,10,0.24), 2px 4px 10px rgba(26,20,10,0.16)',
                transform: 'rotate(1.5deg)',
              }}
            >
              <Image
                src={review.cover}
                alt={review.book}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 200px, 140px"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
