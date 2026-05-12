'use client'

import { useMemo, useState } from 'react'
import { Search, ExternalLink } from 'lucide-react'

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

// Placeholder cover — dark with the gold art-deco diamond ornament.
// Shown while covers load or when no coverUrl is available.
function PlaceholderCover({ title }: { title: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-zinc-900 p-5 text-center">
      <svg width="36" height="36" viewBox="0 0 60 60" className="mb-4 shrink-0 opacity-50">
        <path d="M30 0L60 30L30 60L0 30Z" fill="none" stroke="#cdb079" strokeWidth="2.5" />
        <path d="M30 14L46 30L30 46L14 30Z" fill="none" stroke="#cdb079" strokeWidth="1.4" />
        <circle cx="30" cy="30" r="3" fill="#cdb079" />
      </svg>
      <p className="line-clamp-4 text-[10px] uppercase leading-relaxed tracking-[0.14em] text-zinc-600">
        {title}
      </p>
    </div>
  )
}

function BookCard({ book }: { book: ResourceBook }) {
  const [imgFailed, setImgFailed] = useState(false)
  const href = buildAmazonUrl(book.amazonUrl)

  return (
    <article className="group">
      <a href={href} target="_blank" rel="noreferrer sponsored" className="block">
        {/* Cover */}
        <div className="relative aspect-[2/3] overflow-hidden bg-zinc-100">
          {book.coverUrl && !imgFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.coverUrl}
              alt={`${book.title} cover`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              loading="lazy"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <PlaceholderCover title={book.title} />
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-zinc-950/0 transition-colors duration-200 group-hover:bg-zinc-950/10" />
        </div>

        {/* Metadata */}
        <div className="mt-3 space-y-1 px-0.5">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: '#cdb079' }}
          >
            {book.subcategory || book.category}
          </p>
          <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug tracking-tight text-zinc-900 transition-colors group-hover:text-zinc-500">
            {book.title}
          </h3>
          <p className="text-[12px] text-zinc-500">{book.author}</p>
          <p className="flex items-center gap-1 pt-1 text-[11px] text-zinc-400 transition-colors group-hover:text-zinc-600">
            View on Amazon <ExternalLink size={9} />
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
    if (activeCategory !== 'All') out = out.filter((b) => b.category === activeCategory)
    if (query.trim()) {
      const q = query.toLowerCase()
      out = out.filter(
        (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      )
    }
    return out
  }, [books, activeCategory, query])

  const hasFilter = activeCategory !== 'All' || query.trim().length > 0

  return (
    <div className="space-y-8">
      {/* ── Search ─────────────────────────────────────────────────────── */}
      <div className="relative">
        <Search
          size={14}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
        />
        <input
          type="search"
          placeholder="Search by title or author…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border border-zinc-200 bg-white py-3 pl-10 pr-4 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
        />
      </div>

      {/* ── Category pills ─────────────────────────────────────────────── */}
      <div className="-mx-6 overflow-x-auto px-6 lg:-mx-8 lg:px-8">
        <div className="flex gap-2 pb-2">
          {['All', ...categories].map((cat) => {
            const active = cat === activeCategory
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={[
                  'shrink-0 rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-all',
                  active
                    ? 'border-transparent text-zinc-900'
                    : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400 hover:text-zinc-900',
                ].join(' ')}
                style={active ? { backgroundColor: '#cdb079', borderColor: '#cdb079' } : {}}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Count + clear ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
          {visible.length} {visible.length === 1 ? 'Book' : 'Books'}
          {activeCategory !== 'All' && ` · ${activeCategory}`}
        </p>
        {hasFilter && (
          <button
            type="button"
            onClick={() => { setActiveCategory('All'); setQuery('') }}
            className="text-[12px] font-semibold text-zinc-400 transition-colors hover:text-zinc-900"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Grid ───────────────────────────────────────────────────────── */}
      {visible.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((book) => (
            <BookCard key={`${book.title}||${book.author}`} book={book} />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-zinc-200 px-6 py-16 text-center">
          <p className="text-sm text-zinc-400">No books match your search.</p>
        </div>
      )}
    </div>
  )
}
