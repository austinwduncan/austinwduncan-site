'use client'

import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'

export type ResourceBook = {
  asin: string
  amazonUrl: string
  coverImage: string
  title?: string
  category: string
}

type ResourcesBooksProps = {
  books: ResourceBook[]
  categories: string[]
}

export default function ResourcesBooks({ books, categories }: ResourcesBooksProps) {
  const [selectedCategory, setSelectedCategory] = useState('All')

  const visibleBooks = useMemo(() => {
    if (selectedCategory === 'All') return books
    return books.filter((book) => book.category === selectedCategory)
  }, [books, selectedCategory])

  return (
    <div className="space-y-10">
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

      {visibleBooks.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {visibleBooks.map((book) => (
            <article key={book.asin} className="group">
              <a href={book.amazonUrl} target="_blank" rel="noreferrer sponsored" className="block">
                <div className="flex aspect-[2/3] items-center justify-center overflow-hidden border border-zinc-200 bg-zinc-50">
                  {book.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.coverImage}
                      alt={book.title ? `${book.title} cover` : ''}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  ) : (
                    <span className="px-3 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-300">
                      Cover unavailable
                    </span>
                  )}
                </div>
                <div className="mt-3 space-y-1.5">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: '#cdb079' }}
                  >
                    {book.category}
                  </p>
                  {book.title && (
                    <h3 className="line-clamp-2 text-[14px] font-semibold leading-snug tracking-tight text-zinc-900 transition-colors group-hover:text-zinc-500">
                      {book.title}
                    </h3>
                  )}
                  <p className="flex items-center gap-1.5 text-[12px] text-zinc-400">
                    Amazon <ExternalLink size={12} />
                  </p>
                </div>
              </a>
            </article>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-zinc-200 px-6 py-14 text-center">
          <p className="text-sm text-zinc-500">
            No books found for this category yet.
          </p>
        </div>
      )}
    </div>
  )
}
