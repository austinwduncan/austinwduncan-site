'use client'

import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type LibraryBook = {
  id?: number
  slug?: string
  title: string
  author: string
  additionalAuthors?: string
  category: string
  subcategory?: string
  topicTags: string[]
  audienceTags: string[]
  useCaseTags: string[]
  readingLevel?: string
  recommendationLevel?: string
  featured: boolean
  priority?: string
  shortRecommendation?: string
  publicCaution?: string
  coverImageUrl?: string
  isbn13?: string
  amazonUrl?: string
  publisher?: string
  publicationYear?: number
}

type Filters = {
  category: string
  readingLevels: string[]
  recLevels: string[]
  audienceTags: string[]
  useCaseTags: string[]
}

type SortKey = 'az' | 'za' | 'newest' | 'oldest' | 'essential-first'

type Props = {
  books: LibraryBook[]
  categories: string[]
  readingLevels: string[]
  recLevels: string[]
  audienceTags: string[]
  useCaseTags: string[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GOLD = '#cdb079'
const REC_ORDER: Record<string, number> = {
  Essential: 0,
  'Highly Recommended': 1,
  Recommended: 2,
  Optional: 3,
}
const EMPTY_FILTERS: Filters = {
  category: 'All',
  readingLevels: [],
  recLevels: [],
  audienceTags: [],
  useCaseTags: [],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildAmazonUrl(url?: string): string {
  if (!url) return ''
  const id = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID
  if (!id || url.includes('tag=')) return url
  return `${url}${url.includes('?') ? '&' : '?'}tag=${id}`
}

function matchesFilters(book: LibraryBook, f: Filters, exclude?: keyof Filters): boolean {
  if (exclude !== 'category' && f.category !== 'All' && book.category !== f.category) return false
  if (
    exclude !== 'readingLevels' &&
    f.readingLevels.length > 0 &&
    !f.readingLevels.includes(book.readingLevel ?? '')
  )
    return false
  if (
    exclude !== 'recLevels' &&
    f.recLevels.length > 0 &&
    !f.recLevels.includes(book.recommendationLevel ?? '')
  )
    return false
  if (
    exclude !== 'audienceTags' &&
    f.audienceTags.length > 0 &&
    !book.audienceTags.some((t) => f.audienceTags.includes(t))
  )
    return false
  if (
    exclude !== 'useCaseTags' &&
    f.useCaseTags.length > 0 &&
    !book.useCaseTags.some((t) => f.useCaseTags.includes(t))
  )
    return false
  return true
}

function applySearch(books: LibraryBook[], q: string): LibraryBook[] {
  if (!q.trim()) return books
  const lq = q.toLowerCase()
  return books.filter(
    (b) =>
      b.title.toLowerCase().includes(lq) ||
      b.author.toLowerCase().includes(lq) ||
      b.topicTags.some((t) => t.toLowerCase().includes(lq)) ||
      (b.shortRecommendation?.toLowerCase().includes(lq) ?? false),
  )
}

function sortBooks(books: LibraryBook[], sort: SortKey): LibraryBook[] {
  const out = [...books]
  switch (sort) {
    case 'az':
      return out.sort((a, b) => a.title.localeCompare(b.title))
    case 'za':
      return out.sort((a, b) => b.title.localeCompare(a.title))
    case 'newest':
      return out.sort((a, b) => (b.publicationYear ?? 0) - (a.publicationYear ?? 0))
    case 'oldest':
      return out.sort((a, b) => (a.publicationYear ?? 0) - (b.publicationYear ?? 0))
    case 'essential-first':
      return out.sort(
        (a, b) =>
          (REC_ORDER[a.recommendationLevel ?? ''] ?? 99) -
          (REC_ORDER[b.recommendationLevel ?? ''] ?? 99),
      )
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RecBadge({ level }: { level?: string }) {
  if (!level) return null
  const colors: Record<string, string> = {
    Essential: 'bg-amber-100 text-amber-800',
    'Highly Recommended': 'bg-zinc-100 text-zinc-700',
    Recommended: 'bg-zinc-50 text-zinc-500',
    Optional: 'bg-zinc-50 text-zinc-400',
  }
  return (
    <span
      className={`inline-block rounded-sm px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] ${colors[level] ?? 'bg-zinc-50 text-zinc-400'}`}
    >
      {level}
    </span>
  )
}

function CoverPlaceholder({ title, author }: { title: string; author: string }) {
  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-3 p-5 text-center"
      style={{ backgroundColor: GOLD }}
    >
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

function BookCard({
  book,
  onClick,
}: {
  book: LibraryBook
  onClick: (b: LibraryBook) => void
}) {
  const [imgFailed, setImgFailed] = useState(false)
  const hasImage = Boolean(book.coverImageUrl) && !imgFailed
  const href = buildAmazonUrl(book.amazonUrl)

  return (
    <article className="group flex h-full flex-col overflow-hidden bg-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg">
      {/* Cover + title info — clickable to open modal */}
      <button
        type="button"
        onClick={() => onClick(book)}
        className="flex min-h-0 flex-1 flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-[#cdb079]"
        aria-label={`View details for ${book.title}`}
      >
        {/* Cover */}
        <div className="relative overflow-hidden bg-zinc-100" style={{ flex: '0 0 65%' }}>
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.coverImageUrl}
              alt={`${book.title} cover`}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <CoverPlaceholder title={book.title} author={book.author} />
          )}
          {book.featured && (
            <span
              className="absolute right-2 top-2 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white"
              style={{ backgroundColor: GOLD }}
            >
              Featured
            </span>
          )}
        </div>

        {/* Title + author */}
        <div className="flex flex-1 flex-col justify-between overflow-hidden border-t border-zinc-100 px-3 py-2.5 text-left">
          <div className="min-h-0 space-y-0.5">
            <h3 className="line-clamp-2 text-[12px] font-semibold leading-snug tracking-tight text-zinc-900">
              {book.title}
            </h3>
            <p className="line-clamp-1 text-[11px] text-zinc-500">{book.author}</p>
          </div>
          <RecBadge level={book.recommendationLevel} />
        </div>
      </button>

      {/* Amazon CTA — full-width bottom strip */}
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer sponsored"
          onClick={(e) => e.stopPropagation()}
          className="flex shrink-0 items-center justify-center gap-1.5 border-t border-zinc-100 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-opacity hover:opacity-70"
          style={{ color: GOLD }}
          aria-label={`Buy ${book.title} on Amazon`}
        >
          View on Amazon →
        </a>
      ) : (
        <div className="shrink-0 border-t border-zinc-100 py-2.5" />
      )}
    </article>
  )
}

function BookModal({
  book,
  onClose,
}: {
  book: LibraryBook
  onClose: () => void
}) {
  const [imgFailed, setImgFailed] = useState(false)
  const hasImage = Boolean(book.coverImageUrl) && !imgFailed
  const href = buildAmazonUrl(book.amazonUrl)
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose()
      }}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-1.5 text-zinc-500 transition-colors hover:text-zinc-900"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Cover + scrollable details */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto sm:flex-row">
          {/* Cover — fills the left panel at full height */}
          <div className="relative shrink-0 bg-zinc-100 sm:w-[220px] sm:self-stretch">
            {hasImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={book.coverImageUrl}
                alt={`${book.title} cover`}
                className="h-full max-h-[280px] w-full object-cover sm:absolute sm:inset-0 sm:max-h-none"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <div className="flex min-h-[200px] w-full items-center justify-center sm:absolute sm:inset-0 sm:min-h-0">
                <CoverPlaceholder title={book.title} author={book.author} />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
            {/* Title + meta */}
            <div>
              <RecBadge level={book.recommendationLevel} />
              <h2 className="mt-2 text-[18px] font-bold leading-tight tracking-tight text-zinc-900">
                {book.title}
              </h2>
              <p className="mt-1 text-[14px] text-zinc-500">
                {book.author}
                {book.additionalAuthors && (
                  <span className="text-zinc-400"> &amp; {book.additionalAuthors}</span>
                )}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[12px] text-zinc-400">
                {book.publicationYear && <span>{book.publicationYear}</span>}
                {book.publisher && <span>{book.publisher}</span>}
              </div>
            </div>

            {/* Austin's thoughts */}
            {book.shortRecommendation && (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                  Austin&rsquo;s Thoughts on {book.title}
                </p>
                <p className="border-l-2 pl-4 text-[13px] leading-relaxed text-zinc-700" style={{ borderColor: GOLD }}>
                  {book.shortRecommendation}
                </p>
              </div>
            )}

            {/* ISBN */}
            {book.isbn13 && (
              <p className="text-[11px] text-zinc-400">ISBN-13: {book.isbn13}</p>
            )}
          </div>
        </div>

        {/* Sticky Amazon CTA */}
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noreferrer sponsored"
            className="flex shrink-0 items-center justify-center py-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: GOLD }}
          >
            View on Amazon
          </a>
        )}
      </div>
    </div>
  )
}

function FilterSection({
  label,
  options,
  counts,
  selected,
  onToggle,
}: {
  label: string
  options: string[]
  counts: Record<string, number>
  selected: string[]
  onToggle: (v: string) => void
}) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="border-b border-zinc-100 py-4">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-700">
          {label}
        </span>
        {collapsed ? <ChevronDown size={13} className="text-zinc-400" /> : <ChevronUp size={13} className="text-zinc-400" />}
      </button>
      {!collapsed && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {options.map((opt) => {
            const active = selected.includes(opt)
            const count = counts[opt] ?? 0
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onToggle(opt)}
                disabled={!active && count === 0}
                className={[
                  'flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all',
                  active
                    ? 'border-transparent text-white'
                    : count === 0
                      ? 'cursor-not-allowed border-zinc-100 text-zinc-300'
                      : 'border-zinc-200 text-zinc-600 hover:border-zinc-400 hover:text-zinc-900',
                ].join(' ')}
                style={active ? { backgroundColor: GOLD, borderColor: GOLD } : {}}
              >
                {opt}
                {!active && count > 0 && (
                  <span className="text-[10px] text-zinc-400">{count}</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LibraryBrowser({
  books,
  categories,
  readingLevels,
  recLevels,
  audienceTags,
  useCaseTags,
}: Props) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [sortKey, setSortKey] = useState<SortKey>('essential-first')
  const [rawQuery, setRawQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(rawQuery), 150)
    return () => clearTimeout(timer)
  }, [rawQuery])

  // Faceted counts — per-dimension counts based on all other active filters
  const facetCounts = useMemo(() => {
    const countFor = (
      exclude: keyof Filters,
      getValues: (b: LibraryBook) => string[],
    ): Record<string, number> => {
      const counts: Record<string, number> = {}
      for (const b of applySearch(books.filter((b) => matchesFilters(b, filters, exclude)), debouncedQuery)) {
        for (const v of getValues(b)) {
          counts[v] = (counts[v] ?? 0) + 1
        }
      }
      return counts
    }
    return {
      category: countFor('category', (b) => [b.category]),
      readingLevels: countFor('readingLevels', (b) => (b.readingLevel ? [b.readingLevel] : [])),
      recLevels: countFor('recLevels', (b) => (b.recommendationLevel ? [b.recommendationLevel] : [])),
      audienceTags: countFor('audienceTags', (b) => b.audienceTags),
      useCaseTags: countFor('useCaseTags', (b) => b.useCaseTags),
    }
  }, [books, filters, debouncedQuery])

  // Visible books (filtered + searched + sorted)
  const visible = useMemo(() => {
    const filtered = books.filter((b) => matchesFilters(b, filters))
    const searched = applySearch(filtered, debouncedQuery)
    return sortBooks(searched, sortKey)
  }, [books, filters, debouncedQuery, sortKey])

  const hasFilter =
    filters.category !== 'All' ||
    filters.readingLevels.length > 0 ||
    filters.recLevels.length > 0 ||
    filters.audienceTags.length > 0 ||
    filters.useCaseTags.length > 0 ||
    debouncedQuery.trim().length > 0

  const clearAll = useCallback(() => {
    setFilters(EMPTY_FILTERS)
    setRawQuery('')
    setDebouncedQuery('')
  }, [])

  const toggleMulti = useCallback(
    (dim: 'readingLevels' | 'recLevels' | 'audienceTags' | 'useCaseTags', value: string) => {
      setFilters((prev) => {
        const arr = prev[dim] as string[]
        return {
          ...prev,
          [dim]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
        }
      })
    },
    [],
  )

  const FilterSidebar = (
    <aside className="w-full lg:w-56 lg:shrink-0">
      {/* Category — single select list */}
      <div className="border-b border-zinc-100 py-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-700">
          Category
        </p>
        <div className="flex flex-col gap-0.5">
          {(['All', ...categories] as const).map((cat) => {
            const active = filters.category === cat
            const count = cat === 'All' ? undefined : facetCounts.category[cat] ?? 0
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilters((p) => ({ ...p, category: cat }))}
                disabled={cat !== 'All' && !active && (count ?? 1) === 0}
                className={[
                  'flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-[12px] transition-colors',
                  active
                    ? 'font-semibold text-zinc-900'
                    : (count ?? 1) === 0 && cat !== 'All'
                      ? 'cursor-not-allowed text-zinc-300'
                      : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900',
                ].join(' ')}
              >
                <span
                  className={active ? 'flex items-center gap-1.5' : ''}
                >
                  {active && (
                    <span
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: GOLD }}
                    />
                  )}
                  {cat}
                </span>
                {cat !== 'All' && count !== undefined && count > 0 && !active && (
                  <span className="text-[10px] text-zinc-400">{count}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <FilterSection
        label="Recommendation"
        options={recLevels}
        counts={facetCounts.recLevels}
        selected={filters.recLevels}
        onToggle={(v) => toggleMulti('recLevels', v)}
      />
      <FilterSection
        label="Reading Level"
        options={readingLevels}
        counts={facetCounts.readingLevels}
        selected={filters.readingLevels}
        onToggle={(v) => toggleMulti('readingLevels', v)}
      />
      <FilterSection
        label="Audience"
        options={audienceTags}
        counts={facetCounts.audienceTags}
        selected={filters.audienceTags}
        onToggle={(v) => toggleMulti('audienceTags', v)}
      />
      <FilterSection
        label="Use Case"
        options={useCaseTags}
        counts={facetCounts.useCaseTags}
        selected={filters.useCaseTags}
        onToggle={(v) => toggleMulti('useCaseTags', v)}
      />
    </aside>
  )

  return (
    <div>
      {/* ── Sticky search / sort bar ─────────────────────────────────────── */}
      <div className="sticky top-[60px] z-20 border-b border-zinc-100 bg-white pb-4 pt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={14}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="search"
              placeholder="Search by title, author, or topic…"
              value={rawQuery}
              onChange={(e) => setRawQuery(e.target.value)}
              className="w-full border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <label
              htmlFor="sort-select"
              className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500"
            >
              Sort
            </label>
            <select
              id="sort-select"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="border border-zinc-200 bg-white py-2.5 pl-3 pr-8 text-[12px] text-zinc-700 focus:border-zinc-400 focus:outline-none"
            >
              <option value="essential-first">Essential First</option>
              <option value="az">A → Z</option>
              <option value="za">Z → A</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>

            {/* Mobile filter toggle */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((o) => !o)}
              className="flex items-center gap-1.5 border border-zinc-200 bg-white px-3 py-2.5 text-[12px] font-medium text-zinc-700 transition-colors hover:border-zinc-400 lg:hidden"
            >
              <SlidersHorizontal size={13} />
              Filters
              {hasFilter && (
                <span
                  className="ml-0.5 inline-block h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: GOLD }}
                />
              )}
            </button>
          </div>
        </div>

        {/* Result count + clear */}
        <div className="mt-3 flex items-center justify-between">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
            Showing {visible.length.toLocaleString()} of {books.length.toLocaleString()} books
            {filters.category !== 'All' && (
              <span className="ml-2 normal-case text-zinc-300">· {filters.category}</span>
            )}
          </p>
          {hasFilter && (
            <button
              type="button"
              onClick={clearAll}
              className="text-[12px] font-semibold text-zinc-400 transition-colors hover:text-zinc-900"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile filter panel ──────────────────────────────────────────── */}
      {mobileFiltersOpen && (
        <div className="mb-4 border-b border-zinc-200 bg-zinc-50 px-4 py-4 lg:hidden">
          {FilterSidebar}
        </div>
      )}

      {/* ── Main layout ──────────────────────────────────────────────────── */}
      <div className="flex gap-8 pt-6">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">{FilterSidebar}</div>

        {/* Book grid */}
        <div className="min-w-0 flex-1">
          {visible.length > 0 ? (
            <div className="grid auto-rows-[380px] grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((book) => (
                <BookCard
                  key={`${book.id ?? book.slug ?? book.title}||${book.author}`}
                  book={book}
                  onClick={setSelectedBook}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-5 h-[2px] w-8" style={{ backgroundColor: GOLD }} />
              <p className="text-[15px] font-semibold text-zinc-900">No books found</p>
              <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">
                Try adjusting your search or selecting different filters.
              </p>
              <button
                type="button"
                onClick={clearAll}
                className="mt-6 text-[12px] font-semibold uppercase tracking-[0.1em] transition-opacity hover:opacity-60"
                style={{ color: GOLD }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Book modal ───────────────────────────────────────────────────── */}
      {selectedBook && (
        <BookModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  )
}
