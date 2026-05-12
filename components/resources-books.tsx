'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'

export type ResourceBook = {
  title: string
  author: string
  category: string
  subcategory: string
  amazonUrl: string
  asin?: string
  coverUrl?: string
}

type Props = {
  books: ResourceBook[]
  categories: string[]
}

function buildAmazonUrl(base: string): string {
  const id = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID
  if (!id || base.includes('&tag=')) return base
  return `${base}&tag=${id}`
}

// Gold placeholder — styled intentionally, not as a broken state.
function CoverPlaceholder({ title, author }: { title: string; author: string }) {
  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-3 p-5 text-center"
      style={{ backgroundColor: '#cdb079' }}
    >
      {/* Small diamond ornament */}
      <svg width="22" height="22" viewBox="0 0 60 60" className="shrink-0 opacity-40">
        <path d="M30 2L58 30L30 58L2 30Z" fill="none" stroke="white" strokeWidth="4" />
        <path d="M30 16L44 30L30 44L16 30Z" fill="none" stroke="white" strokeWidth="3" />
      </svg>
      <p className="line-clamp-4 text-[11px] font-bold uppercase leading-snug tracking-[0.1em] text-white">
        {title}
      </p>
      <p className="line-clamp-1 text-[10px] text-white/70">{author}</p>
    </div>
  )
}

function BookCard({ book }: { book: ResourceBook }) {
  const [imgFailed, setImgFailed] = useState(false)
  const href = buildAmazonUrl(book.amazonUrl)
  const hasImage = Boolean(book.coverUrl) && !imgFailed

  return (
    <article className="group h-full">
      <a
        href={href}
        target="_blank"
        rel="noreferrer sponsored"
        className="flex h-full flex-col overflow-hidden bg-white shadow-sm transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-lg"
      >
        {/* Cover — 65% of card height */}
        <div className="relative overflow-hidden bg-zinc-100" style={{ height: '65%' }}>
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.coverUrl}
              alt={`${book.title} cover`}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <CoverPlaceholder title={book.title} author={book.author} />
          )}
        </div>

        {/* Info — 35% of card height */}
        <div
          className="flex flex-col justify-between overflow-hidden border-t border-zinc-100 bg-white px-3 py-3"
          style={{ height: '35%' }}
        >
          <div className="min-h-0 space-y-0.5">
            <h3 className="line-clamp-2 text-[12px] font-semibold leading-snug tracking-tight text-zinc-900">
              {book.title}
            </h3>
            <p className="line-clamp-1 text-[11px] text-zinc-500">{book.author}</p>
          </div>
          <p className="shrink-0 text-[11px] font-semibold" style={{ color: '#cdb079' }}>
            Amazon →
          </p>
        </div>
      </a>
    </article>
  )
}

export default function ResourcesBooks({ books, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [query, setQuery] = useState('')

  const visible = useMemo(() => {
    let out = books
    if (activeCategory !== 'All') {
      out = out.filter((b) => b.category === activeCategory)
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      out = out.filter(
        (b) =>
          b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      )
    }
    return out
  }, [books, activeCategory, query])

  const hasFilter = activeCategory !== 'All' || query.trim().length > 0

  return (
    <div>
      {/* ── Sticky filter bar ───────────────────────────────────────────── */}
      {/* top-[60px] = below the sticky nav (h-[60px]) */}
      <div className="sticky top-[60px] z-20 border-b border-zinc-100 bg-white pb-4 pt-6">
        {/* Search */}
        <div className="relative mb-4">
          <Search
            size={14}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="search"
            placeholder="Search by title or author…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
          />
        </div>

        {/* Category pills — overflows horizontally, bleeds into page padding */}
        <div className="-mx-6 overflow-x-auto px-6 lg:-mx-8 lg:px-8">
          <div className="flex gap-2 pb-1">
            {(['All', ...categories] as string[]).map((cat) => {
              const active = cat === activeCategory
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={[
                    'shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.09em] transition-all duration-150',
                    active
                      ? 'border-transparent text-white'
                      : 'border-zinc-200 bg-transparent text-zinc-600 hover:border-zinc-400 hover:text-zinc-900',
                  ].join(' ')}
                  style={active ? { backgroundColor: '#cdb079', borderColor: '#cdb079' } : {}}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Result count ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between py-5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
          Showing {visible.length.toLocaleString()} of {books.length.toLocaleString()} books
          {activeCategory !== 'All' && (
            <span className="ml-2 normal-case text-zinc-300">· {activeCategory}</span>
          )}
        </p>
        {hasFilter && (
          <button
            type="button"
            onClick={() => {
              setActiveCategory('All')
              setQuery('')
            }}
            className="text-[12px] font-semibold text-zinc-400 transition-colors hover:text-zinc-900"
          >
            Clear all
          </button>
        )}
      </div>

      {/* ── Book grid ───────────────────────────────────────────────────── */}
      {visible.length > 0 ? (
        <div className="grid auto-rows-[380px] grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((book) => (
            <BookCard key={`${book.title}||${book.author}`} book={book} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-5 h-[2px] w-8" style={{ backgroundColor: '#cdb079' }} />
          <p className="text-[15px] font-semibold text-zinc-900">No books found</p>
          <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">
            Try adjusting your search or selecting a different category.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('All')
              setQuery('')
            }}
            className="mt-6 text-[12px] font-semibold uppercase tracking-[0.1em] transition-opacity hover:opacity-60"
            style={{ color: '#cdb079' }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
