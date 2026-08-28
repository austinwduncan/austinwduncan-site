'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

export type EssentialBook = {
  title: string
  author: string
  coverImageUrl: string
  shortRecommendation?: string
  recommendationLevel?: string
  amazonUrl?: string
  categories?: string[]
}

function buildAmazonUrl(url?: string): string {
  if (!url) return ''
  const id = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID
  if (!id || url.includes('tag=')) return url
  return `${url}${url.includes('?') ? '&' : '?'}tag=${id}`
}

function Modal({ book, onClose }: { book: EssentialBook; onClose: () => void }) {
  const backdropRef = useRef<HTMLDivElement>(null)
  const href = buildAmazonUrl(book.amazonUrl)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
      onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-lg overflow-hidden bg-white shadow-2xl">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 p-1.5 text-zinc-500 transition-colors hover:text-zinc-900"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Cover */}
        <div className="shrink-0 w-[140px] relative bg-zinc-100">
          <Image
            src={book.coverImageUrl}
            alt={book.title}
            fill
            className="object-cover"
            sizes="140px"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col flex-1 min-w-0 p-6 overflow-y-auto">
          {book.recommendationLevel && (
            <span
              className="inline-block self-start px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] mb-3"
              style={{ background: '#FEF3C7', color: '#92400E' }}
            >
              {book.recommendationLevel}
            </span>
          )}
          <h2
            className="mb-1"
            style={{ fontFamily: 'var(--font-cmg), system-ui, sans-serif', fontSize: '1.4rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.15, color: '#1A1714' }}
          >
            {book.title}
          </h2>
          <p className="text-[0.78rem] mb-4" style={{ color: '#7A6F65' }}>{book.author}</p>

          {book.categories && book.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {book.categories.slice(0, 3).map((cat) => (
                <span
                  key={cat}
                  className="px-2 py-0.5 text-[0.58rem] font-medium tracking-[0.08em] uppercase border"
                  style={{ borderColor: '#E2DACE', color: '#9A9189' }}
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          {book.shortRecommendation && (
            <p
              className="text-[0.88rem] leading-[1.75] mb-6 flex-1"
              style={{ fontFamily: 'var(--font-cmg), system-ui, sans-serif', color: '#5A544C' }}
            >
              {book.shortRecommendation}
            </p>
          )}

          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer sponsored"
              className="flex items-center justify-center gap-2 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.1em] transition-opacity hover:opacity-80"
              style={{ background: '#7A5C1E', color: '#F9F6F0' }}
            >
              View on Amazon
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function LibraryEssentialGrid({ books }: { books: EssentialBook[] }) {
  const [selected, setSelected] = useState<EssentialBook | null>(null)

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-5">
        {books.map((book) => (
          <button
            key={book.title}
            type="button"
            onClick={() => setSelected(book)}
            className="group block relative overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 text-left"
            style={{ aspectRatio: '2/3' }}
            title={book.title}
          >
            <Image
              src={book.coverImageUrl}
              alt={book.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
              sizes="(min-width: 1024px) 15vw, (min-width: 640px) 22vw, 30vw"
            />
            {/* Hover overlay */}
            <div
              className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(to top, rgba(14,12,10,0.97) 0%, rgba(14,12,10,0.88) 45%, rgba(14,12,10,0.3) 100%)',
              }}
            >
              <div
                className="text-[0.48rem] font-bold tracking-[0.18em] uppercase mb-1"
                style={{ color: '#CDB079' }}
              >
                {book.recommendationLevel ?? 'Essential'}
              </div>
              <h3
                className="mb-1"
                style={{ fontFamily: 'var(--font-cmg), system-ui, sans-serif', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1.15, color: '#F9F6F0' }}
              >
                {book.title}
              </h3>
              <span
                className="text-[0.55rem] font-medium tracking-[0.08em] uppercase mt-1.5"
                style={{ color: '#CDB079' }}
              >
                Click for details →
              </span>
            </div>
          </button>
        ))}
      </div>

      {selected && <Modal book={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
