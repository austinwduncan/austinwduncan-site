import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { type LibraryBook } from '@/components/library-browser'
import rawBooks from '@/data/books.json'

export const metadata: Metadata = {
  title: 'Library — Austin W. Duncan',
  description:
    'A curated reading list for biblical study, theology, ministry, and Christian formation.',
}

const allBooks: LibraryBook[] = (rawBooks as (LibraryBook & { internalNotes?: string })[]).map(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ internalNotes, ...rest }) => rest,
)

// Deduplicated essential books with covers for the landing
const seen = new Set<string>()
const essentialBooks = allBooks
  .filter((b) => {
    if (b.recommendationLevel !== 'Essential' || !b.coverImageUrl || !b.featured) return false
    if (seen.has(b.title)) return false
    seen.add(b.title)
    return true
  })
  .slice(0, 12)

// Hero display — 6 books across 2 columns
const heroBooks = essentialBooks.slice(0, 6)

// Category cards — one cover image per category
const CATEGORY_DEFS: { name: string; cover?: string }[] = [
  { name: 'Theology',       cover: '/book-covers/knowing-god.webp' },
  { name: 'Apologetics',    cover: '/book-covers/another-gospel.webp' },
  { name: 'Classics',       cover: '/book-covers/mere-christianity.webp' },
  { name: 'Bible Study',    cover: '/book-covers/how-to-read-the-bible-for-all-its-worth.webp' },
  { name: 'Christian Living', cover: '/book-covers/gentle-and-lowly.webp' },
  { name: 'Church History', cover: '/book-covers/the-oxford-dictionary-of-the-christian-church.webp' },
  { name: 'Hermeneutics',   cover: '/book-covers/how-to-read-the-bible-for-all-its-worth.webp' },
  { name: 'Prayer',         cover: '/book-covers/the-valley-of-vision.webp' },
  { name: 'Preaching',      cover: '/book-covers/expository-exultation.webp' },
  { name: 'Pastoral',       cover: '/book-covers/the-flourishing-pastor.webp' },
  { name: 'Discipleship',   cover: '/book-covers/the-cost-of-discipleship.webp' },
  { name: 'Christology',    cover: '/book-covers/the-reason-for-god.webp' },
]

const categories = CATEGORY_DEFS.map((def) => ({
  ...def,
  count: allBooks.filter((b) => b.categories.includes(def.name)).length,
})).filter((c) => c.count > 0)

export default function LibraryPage() {
  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ background: '#141210' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 pt-14">
          <div
            className="flex items-end justify-between gap-8 pb-10 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <div>
              <div
                className="flex items-center gap-2 text-[0.7rem] font-medium tracking-[0.12em] uppercase mb-3"
                style={{ color: '#B8892E' }}
              >
                <span className="inline-block h-px w-[18px]" style={{ background: '#B8892E' }} />
                Resources
              </div>
              <h1
                className="leading-[1.1] tracking-tight"
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: 'clamp(2.2rem, 3.5vw, 3rem)',
                  fontWeight: 400,
                  color: '#F9F6F0',
                }}
              >
                Library
              </h1>
            </div>
            <div className="text-right pb-0.5 shrink-0">
              <p
                className="text-[0.9rem] italic leading-relaxed mb-1 hidden sm:block"
                style={{
                  fontFamily: 'var(--font-source-serif)',
                  color: 'rgba(255,255,255,0.35)',
                  maxWidth: 300,
                }}
              >
                Books worth your time — for study, formation, and ministry.
              </p>
              <p
                className="text-[0.68rem] font-medium tracking-[0.1em] uppercase"
                style={{ color: 'rgba(255,255,255,0.18)' }}
              >
                {allBooks.length} books
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Amber strip ────────────────────────────────────────────────────── */}
      <div
        className="h-[14px] w-full"
        style={{
          backgroundColor: '#7A5C1E',
          backgroundImage: `
            repeating-linear-gradient(60deg, transparent, transparent 6px, rgba(255,255,255,0.07) 6px, rgba(255,255,255,0.07) 7px),
            repeating-linear-gradient(-60deg, transparent, transparent 6px, rgba(255,255,255,0.07) 6px, rgba(255,255,255,0.07) 7px)
          `,
        }}
      />

      {/* ── Hero — split layout ────────────────────────────────────────────── */}
      <div style={{ background: '#141210' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row gap-14 lg:gap-16 items-center">

            {/* Left: editorial statement */}
            <div className="flex-1 min-w-0">
              <div
                className="text-[0.6rem] font-semibold tracking-[0.2em] uppercase mb-6"
                style={{ color: '#7A5C1E' }}
              >
                A Reading List Worth Your Time
              </div>
              <h2
                className="leading-[1.08] tracking-tight mb-6"
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: 'clamp(2.4rem, 4.5vw, 4rem)',
                  fontWeight: 300,
                  color: '#F9F6F0',
                }}
              >
                Books that shape
                <br />
                <em style={{ color: '#C9984A' }}>faithful minds.</em>
              </h2>
              <p
                className="text-[0.95rem] leading-[1.85] mb-8"
                style={{
                  fontFamily: 'var(--font-source-serif)',
                  fontStyle: 'italic',
                  color: 'rgba(249,246,240,0.42)',
                  maxWidth: 420,
                }}
              >
                {allBooks.length} books curated for biblical study, theology, preaching,
                and Christian formation — from the essential classics to the most important
                titles being written today.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/library/browse"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 transition-all duration-200"
                  style={{
                    background: '#7A5C1E',
                    color: '#F9F6F0',
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: '1rem',
                    fontWeight: 500,
                    letterSpacing: '0.04em',
                  }}
                >
                  Browse the Full Library
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <a
                  href="#essential"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border transition-all duration-200 hover:border-[#7A5C1E] hover:text-[#F9F6F0]"
                  style={{
                    borderColor: 'rgba(255,255,255,0.12)',
                    color: 'rgba(249,246,240,0.45)',
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: '1rem',
                    letterSpacing: '0.04em',
                  }}
                >
                  Essential Reading ↓
                </a>
              </div>
            </div>

            {/* Right: book cover collage */}
            <div className="w-full lg:w-[40%] shrink-0">
              <div className="grid grid-cols-3 gap-2.5">
                {heroBooks.map((book) => (
                  <div
                    key={book.title}
                    className="relative overflow-hidden shadow-lg"
                    style={{ aspectRatio: '2/3' }}
                  >
                    <Image
                      src={book.coverImageUrl!}
                      alt={book.title}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 13vw, 30vw"
                      priority
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Essential Reading ──────────────────────────────────────────────── */}
      <div id="essential" style={{ background: '#FAFAF7', borderTop: '1px solid #E2DACE', borderBottom: '1px solid #E2DACE' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-14">

          <div
            className="flex items-center gap-2.5 text-[0.63rem] font-medium tracking-[0.12em] uppercase mb-10"
            style={{ color: '#9A9189' }}
          >
            Essential Reading
            <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
            <span style={{ color: '#B8892E' }}>Must-read titles</span>
          </div>

          {/* Portrait book grid — 4 columns desktop */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-5 mb-10">
            {essentialBooks.map((book) => (
              <Link
                key={book.title}
                href="/library/browse"
                className="group block relative overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                style={{ aspectRatio: '2/3' }}
                title={book.title}
              >
                <Image
                  src={book.coverImageUrl!}
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
                    style={{ color: '#B8892E' }}
                  >
                    Essential
                  </div>
                  <h3
                    className="leading-snug mb-1.5"
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: '0.82rem',
                      fontWeight: 500,
                      color: '#F9F6F0',
                    }}
                  >
                    {book.title}
                  </h3>
                  {book.shortRecommendation && (
                    <p
                      className="text-[0.6rem] leading-snug line-clamp-3"
                      style={{ fontFamily: 'var(--font-source-serif)', color: 'rgba(249,246,240,0.52)' }}
                    >
                      {book.shortRecommendation}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <div className="flex justify-end">
            <Link
              href="/library/browse"
              className="text-[0.68rem] font-medium tracking-[0.1em] uppercase transition-colors hover:text-[#7A5C1E]"
              style={{ color: '#B8892E' }}
            >
              View all essential books →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Browse by Category ────────────────────────────────────────────── */}
      <div style={{ background: '#F0EDE6' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-14">

          <div
            className="flex items-center gap-2.5 text-[0.63rem] font-medium tracking-[0.12em] uppercase mb-10"
            style={{ color: '#9A9189' }}
          >
            Browse by Category
            <span className="flex-1 h-px" style={{ background: '#D8D0C4' }} />
          </div>

          {/* Category image tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4 mb-12">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href="/library/browse"
                className="group relative overflow-hidden block"
                style={{ aspectRatio: '4/3' }}
              >
                {cat.cover ? (
                  <Image
                    src={cat.cover}
                    alt=""
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.08]"
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0" style={{ background: '#1A1714' }} />
                )}
                {/* Dark overlay — darker on edges, lighter in center bottom */}
                <div
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(to top, rgba(14,12,10,0.88) 0%, rgba(14,12,10,0.6) 50%, rgba(14,12,10,0.3) 100%)' }}
                />
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <span
                    className="text-[0.55rem] font-semibold tracking-[0.14em] uppercase mb-1 transition-colors group-hover:text-[#C9984A]"
                    style={{ color: '#B8892E' }}
                  >
                    {cat.count} books
                  </span>
                  <h3
                    className="leading-tight tracking-tight transition-colors group-hover:text-[#F9F6F0]"
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
                      fontWeight: 500,
                      color: 'rgba(249,246,240,0.9)',
                    }}
                  >
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Explore CTA ───────────────────────────────────────────────────── */}
      <div style={{ background: '#0E0C0A' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-16 lg:py-20 flex flex-col items-center text-center">
          <div
            className="text-[0.6rem] font-semibold tracking-[0.2em] uppercase mb-4"
            style={{ color: '#7A5C1E' }}
          >
            The Full Library
          </div>
          <h2
            className="leading-tight tracking-tight mb-4"
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              fontWeight: 300,
              color: '#F9F6F0',
            }}
          >
            {allBooks.length} books. Every category.
            <br />
            <em style={{ color: 'rgba(249,246,240,0.35)' }}>Search, filter, explore.</em>
          </h2>
          <p
            className="text-[0.88rem] leading-relaxed mb-8 max-w-sm"
            style={{
              fontFamily: 'var(--font-source-serif)',
              fontStyle: 'italic',
              color: 'rgba(249,246,240,0.35)',
            }}
          >
            Filter by topic, audience, reading level, or recommendation — or just browse.
          </p>
          <Link
            href="/library/browse"
            className="inline-flex items-center gap-3 px-8 py-4 border transition-all duration-200 hover:bg-[#7A5C1E] hover:border-[#7A5C1E] hover:text-[#F9F6F0]"
            style={{
              borderColor: '#B8892E',
              color: '#B8892E',
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.1rem',
              fontWeight: 500,
              letterSpacing: '0.04em',
            }}
          >
            Browse the Full Library
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </>
  )
}
