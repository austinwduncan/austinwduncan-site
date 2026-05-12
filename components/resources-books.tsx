'use client'

import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'

export type ResourceBook = {
  title: string
  author: string
  category: string
  subcategory: string
  amazonUrl: string
}

type Props = {
  books: ResourceBook[]
  categories: string[]
}

function buildAmazonUrl(baseUrl: string): string {
  const affiliateId = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID
  if (!affiliateId || baseUrl.includes('&tag=')) return baseUrl
  return `${baseUrl}&tag=${affiliateId}`
}

export default function ResourcesBooks({ books, categories }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('All')

  const visibleBooks = useMemo(() => {
    if (selectedCategory === 'All') return books
    return books.filter((book) => book.category === selectedCategory)
  }, [books, selectedCategory])

  return (
    <div className="space-y-10">
      {/* Category filters */}
      <div className="border-y border-zinc-200 py-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['All', ...categories].map((category) => {
            const isSelected = category === selectedCategory
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={[
                  'shrink-0 border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors',
                  isSelected
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-900 hover:text-zinc-900',
                ].join(' ')}
              >
                {category}
              </button>
            )
          })}
        </div>
      </div>

      {/* Count + clear */}
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
          {visibleBooks.length} {visibleBooks.length === 1 ? 'Book' : 'Books'}
        </p>
        {selectedCategory !== 'All' && (
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className="text-[12px] font-semibold text-zinc-400 transition-colors hover:text-zinc-900"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Grid */}
      {visibleBooks.length > 0 ? (
        <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleBooks.map((book) => (
            <article key={`${book.title}-${book.author}`} className="group border-t border-zinc-200 pt-5 pb-6 pr-6">
              <a
                href={buildAmazonUrl(book.amazonUrl)}
                target="_blank"
                rel="noreferrer sponsored"
                className="block"
              >
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: '#cdb079' }}
                >
                  {book.subcategory || book.category}
                </span>
                <h3 className="mt-2 text-[14px] font-semibold leading-snug tracking-tight text-zinc-900 transition-colors group-hover:text-zinc-500 line-clamp-2">
                  {book.title}
                </h3>
                <p className="mt-1 text-[13px] text-zinc-500">{book.author}</p>
                <p className="mt-3 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-400 transition-colors group-hover:text-zinc-600">
                  Amazon <ExternalLink size={10} />
                </p>
              </a>
            </article>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-zinc-200 px-6 py-14 text-center">
          <p className="text-sm text-zinc-500">No books found for this category yet.</p>
        </div>
      )}
    </div>
  )
}
