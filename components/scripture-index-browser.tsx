'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export type IndexBook = {
  book: string
  testament: 'ot' | 'nt'
  sermons: IndexSermon[]
}

export type IndexSermon = {
  slug: string
  title: string
  formattedDate: string
  readingMinutes: number
  passage?: string // chapter:verse reference if scripture field set
}

export default function ScriptureIndexBrowser({ books }: { books: IndexBook[] }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const q = query.trim().toLowerCase()
  const filteredBooks = q
    ? books.map((b) => ({
        ...b,
        sermons: b.sermons.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            b.book.toLowerCase().includes(q) ||
            (s.passage && s.passage.toLowerCase().includes(q))
        ),
      })).filter((b) => b.sermons.length > 0)
    : books

  const otBooks = filteredBooks.filter((b) => b.testament === 'ot')
  const ntBooks = filteredBooks.filter((b) => b.testament === 'nt')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-14 pt-10 pb-20 mx-auto max-w-[1100px] px-6 lg:px-8">

      {/* Sidebar */}
      <aside className="hidden lg:block" style={{ position: 'sticky', top: 'calc(60px + 2rem)', alignSelf: 'start' }}>
        <div
          className="text-[0.65rem] font-medium tracking-[0.12em] uppercase mb-3"
          style={{ color: '#9A9189' }}
        >
          Jump to Book
        </div>
        <ul className="flex flex-col border-l" style={{ borderColor: '#E2DACE' }}>
          {ntBooks.length > 0 && (
            <li>
              <a
                href="#new-testament"
                className="flex items-center justify-between px-4 py-2 text-[0.8rem] transition-colors border-l-2 border-transparent -ml-px"
                style={{ color: '#5A544C' }}
              >
                New Testament
              </a>
            </li>
          )}
          {ntBooks.map((b) => (
            <TocLink key={b.book} book={b.book} count={b.sermons.length} />
          ))}
          {otBooks.length > 0 && (
            <li>
              <a
                href="#old-testament"
                className="flex items-center justify-between px-4 py-2 text-[0.8rem] transition-colors border-l-2 border-transparent -ml-px"
                style={{ color: '#5A544C' }}
              >
                Old Testament
              </a>
            </li>
          )}
          {otBooks.map((b) => (
            <TocLink key={b.book} book={b.book} count={b.sermons.length} />
          ))}
        </ul>
        <div className="my-4 h-px" style={{ background: '#E2DACE' }} />
        <Link
          href="/sermons"
          className="inline-flex items-center gap-1.5 text-[0.75rem] transition-colors pl-0.5"
          style={{ color: '#9A9189' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          All Sermons
        </Link>
      </aside>

      {/* Content */}
      <div>
        {/* Search */}
        <div className="relative mb-10">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#9A9189' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by book or sermon title…"
            className="w-full rounded-md border py-3 pl-10 pr-10 text-[0.88rem] outline-none transition-all"
            style={{
              background: '#fff',
              borderColor: '#E2DACE',
              color: '#1A1714',
              fontFamily: 'var(--font-geist-sans)',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: '#9A9189' }}
              aria-label="Clear"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-16">
            <div
              className="text-3xl font-light mb-2"
              style={{ fontFamily: 'var(--font-cormorant)', color: '#9A9189' }}
            >
              No results
            </div>
            <p className="text-sm italic" style={{ color: '#9A9189', fontFamily: 'var(--font-source-serif)' }}>
              Try a different book name or sermon title.
            </p>
          </div>
        )}

        {/* NT */}
        {ntBooks.length > 0 && (
          <>
            <TestamentHeading id="new-testament">New Testament</TestamentHeading>
            {ntBooks.map((b) => (
              <BookBlock key={b.book} data={b} />
            ))}
          </>
        )}

        {/* OT */}
        {otBooks.length > 0 && (
          <>
            <TestamentHeading id="old-testament">Old Testament</TestamentHeading>
            {otBooks.map((b) => (
              <BookBlock key={b.book} data={b} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

function TocLink({ book, count }: { book: string; count: number }) {
  const id = book.toLowerCase().replace(/\s+/g, '-')
  return (
    <li>
      <a
        href={`#${id}`}
        className="flex items-center justify-between px-4 py-2 text-[0.8rem] transition-colors border-l-2 border-transparent -ml-px hover:border-[#B8892E] hover:text-[#7A5C1E]"
        style={{ color: '#5A544C' }}
      >
        {book}
        <span
          className="text-[0.68rem] rounded-full px-2 py-0.5 ml-2"
          style={{ color: '#9A9189', background: '#F2EFE7' }}
        >
          {count}
        </span>
      </a>
    </li>
  )
}

function TestamentHeading({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <div
      id={id}
      className="flex items-center gap-2.5 text-[0.65rem] font-medium tracking-[0.14em] uppercase mb-7 scroll-mt-20"
      style={{ color: '#9A9189' }}
    >
      {children}
      <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
    </div>
  )
}

function BookBlock({ data }: { data: IndexBook }) {
  const id = data.book.toLowerCase().replace(/\s+/g, '-')
  return (
    <div id={id} className="mb-10 scroll-mt-20">
      <div
        className="flex items-baseline gap-3 pb-3 mb-1 border-b"
        style={{ borderColor: '#E2DACE' }}
      >
        <span
          className="leading-none tracking-tight"
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '1.6rem',
            fontWeight: 500,
            color: '#1A1714',
          }}
        >
          {data.book}
        </span>
        <span
          className="text-[0.65rem] font-medium tracking-[0.08em] uppercase"
          style={{ color: '#9A9189' }}
        >
          {data.testament === 'nt' ? 'New Testament' : 'Old Testament'}
        </span>
        <span className="ml-auto text-[0.72rem]" style={{ color: '#9A9189' }}>
          {data.sermons.length} {data.sermons.length === 1 ? 'sermon' : 'sermons'}
        </span>
      </div>

      <div className="flex flex-col">
        {data.sermons.map((s) => (
          <Link
            key={s.slug}
            href={`/sermons/${s.slug}`}
            className="group grid gap-4 py-3.5 border-b last:border-0 rounded hover:bg-[#F2EFE7] transition-colors -mx-3 px-3"
            style={{
              borderColor: '#E2DACE',
              gridTemplateColumns: s.passage ? '110px 1fr auto' : '1fr auto',
            }}
          >
            {s.passage && (
              <span
                className="text-[0.76rem] font-medium tracking-[0.04em] whitespace-nowrap"
                style={{ color: '#7A5C1E' }}
              >
                {s.passage}
              </span>
            )}
            <span
              className="font-medium leading-snug transition-colors group-hover:text-[#7A5C1E]"
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: '1.1rem',
                color: '#1A1714',
              }}
            >
              {s.title}
            </span>
            <span
              className="flex items-center gap-1.5 text-[0.7rem] whitespace-nowrap"
              style={{ color: '#9A9189' }}
            >
              {s.formattedDate}
              <span className="h-[2px] w-[2px] rounded-full" style={{ background: '#C8BFA8' }} />
              {s.readingMinutes} min
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
