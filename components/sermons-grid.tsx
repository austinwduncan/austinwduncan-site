'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export type SermonListItem = {
  slug: string
  title: string
  date: string
  formattedDate: string
  excerpt: string
  image?: string
  scripture?: string
  primaryBook: string
  allBooks: string[]
  readingMinutes: number
}

const PAGE_SIZE = 9

export default function SermonsGrid({
  sermons,
  availableBooks,
}: {
  sermons: SermonListItem[]
  availableBooks: string[]
}) {
  const [activeBook, setActiveBook] = useState<string>('all')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const filtered = activeBook === 'all'
    ? sermons
    : sermons.filter((s) => s.allBooks.includes(activeBook))

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  function selectBook(book: string) {
    setActiveBook(book)
    setVisibleCount(PAGE_SIZE)
  }

  return (
    <div>
      {/* Filter bar */}
      <div
        className="flex flex-wrap items-stretch gap-0 mb-8 rounded-md border p-1.5"
        style={{ background: '#fff', borderColor: '#E2DACE' }}
      >
        <span
          className="flex items-center text-[0.65rem] font-medium tracking-[0.1em] uppercase pr-3 pl-1 border-r mr-1.5 shrink-0"
          style={{ color: '#9A9189', borderColor: '#E2DACE' }}
        >
          Book
        </span>
        <div className="flex flex-wrap gap-1 flex-1">
          <FilterPill
            label="All"
            count={sermons.length}
            active={activeBook === 'all'}
            onClick={() => selectBook('all')}
          />
          {availableBooks.map((book) => {
            const count = sermons.filter((s) => s.allBooks.includes(book)).length
            return (
              <FilterPill
                key={book}
                label={book}
                count={count}
                active={activeBook === book}
                onClick={() => selectBook(book)}
              />
            )
          })}
        </div>
        <Link
          href="/sermons/scripture-index"
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded border text-[0.71rem] font-medium tracking-[0.04em] shrink-0 transition-colors"
          style={{ borderColor: '#C8BFA8', color: '#7A5C1E' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          Scripture Index
        </Link>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="col-span-3 text-center py-16">
          <div
            className="text-3xl font-light mb-2"
            style={{ fontFamily: 'var(--font-cormorant)', color: '#9A9189' }}
          >
            ∅
          </div>
          <p
            className="text-sm italic"
            style={{ fontFamily: 'var(--font-source-serif)', color: '#9A9189' }}
          >
            No sermons in this book yet — check back soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((sermon) => (
            <SermonCard key={sermon.slug} sermon={sermon} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="text-center pt-10">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="inline-flex items-center gap-2 px-8 py-3 border rounded text-[0.76rem] font-medium tracking-[0.05em] uppercase transition-colors"
            style={{ borderColor: '#C8BFA8', color: '#5A544C' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
            Load More
          </button>
        </div>
      )}
    </div>
  )
}

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[0.73rem] tracking-[0.02em] transition-all border border-transparent"
      style={
        active
          ? { background: '#1A1714', color: '#fff' }
          : { color: '#5A544C' }
      }
    >
      {label}
      <span
        className="text-[0.65rem]"
        style={{ opacity: active ? 0.6 : 0.55 }}
      >
        {count}
      </span>
    </button>
  )
}

function SermonCard({ sermon }: { sermon: SermonListItem }) {
  const label = sermon.scripture ?? sermon.primaryBook

  return (
    <Link
      href={`/sermons/${sermon.slug}`}
      className="group flex flex-col rounded-md overflow-hidden border bg-white transition-all duration-200 hover:-translate-y-0.5"
      style={{ borderColor: '#E2DACE' }}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden shrink-0"
        style={{ aspectRatio: '3/2', background: '#F2EFE7' }}
      >
        {sermon.image && (
          <Image
            src={sermon.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        )}
        {/* Gold accent bar on hover */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{
            background: 'linear-gradient(90deg, #7A5C1E, #B8892E 50%, transparent)',
          }}
        />
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 px-5 py-5">
        {label && (
          <div
            className="text-[0.66rem] font-medium tracking-[0.1em] uppercase mb-1.5"
            style={{ color: '#7A5C1E' }}
          >
            {label}
          </div>
        )}
        <h3
          className="font-medium leading-snug mb-2.5 flex-1 transition-colors group-hover:text-[#7A5C1E]"
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '1.2rem',
            color: '#1A1714',
          }}
        >
          {sermon.title}
        </h3>
        <p
          className="text-[0.84rem] leading-relaxed mb-3 line-clamp-3"
          style={{ fontFamily: 'var(--font-source-serif)', color: '#5A544C' }}
        >
          {sermon.excerpt.replace(/\*\*/g, '')}
        </p>
        <div
          className="flex items-center justify-between pt-3 border-t text-[0.71rem] mt-auto"
          style={{ borderColor: '#E2DACE', color: '#9A9189' }}
        >
          <span>{sermon.formattedDate}</span>
          <span>{sermon.readingMinutes} min</span>
        </div>
      </div>
    </Link>
  )
}
