import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { type LibraryBook } from '@/components/library-browser'
import { LibraryEssentialGrid, type EssentialBook } from '@/components/library-essential-grid'
import { LibraryCategoryExpander } from '@/components/library-category-expander'
import rawBooks from '@/data/books.json'

export const metadata: Metadata = {
  title: 'Library',
  description:
    'A curated reading list for biblical study, theology, ministry, and Christian formation.',
}

const allBooks: LibraryBook[] = (rawBooks as (LibraryBook & { internalNotes?: string })[]).map(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ internalNotes, ...rest }) => rest,
)

// Deduplicated essential books for the landing
const seen = new Set<string>()
const essentialBooks: EssentialBook[] = (allBooks as LibraryBook[])
  .filter((b) => {
    if (b.recommendationLevel !== 'Essential' || !b.coverImageUrl || !b.featured) return false
    if (seen.has(b.title)) return false
    seen.add(b.title)
    return true
  })
  .slice(0, 12)
  .map((b) => ({
    title: b.title,
    author: b.author,
    coverImageUrl: b.coverImageUrl!,
    shortRecommendation: b.shortRecommendation,
    recommendationLevel: b.recommendationLevel,
    amazonUrl: b.amazonUrl,
    categories: b.categories,
  }))

// Hero display: first 6 essential books
const heroBooks = essentialBooks.slice(0, 6)

// Category tiles for the featured section
const CATEGORY_DEFS: { name: string; cover: string }[] = [
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

const featuredCategories = CATEGORY_DEFS.map((def) => ({
  ...def,
  count: allBooks.filter((b) => b.categories.includes(def.name)).length,
})).filter((c) => c.count > 0)

// All available categories for the "View All" section
const ALL_CATEGORY_ORDER = [
  'Apologetics', 'Archaeology & Biblical History', 'Bible Dictionaries', 'Bible Languages/Tools',
  'Bible Study', 'Biblical Reference', 'Business', 'Christian Living', 'Christology', 'Church History',
  'Church Life', 'Classics', 'Comparative Religions', 'Death/Dying', 'Denominational Concerns',
  'Devotionals', 'Discipleship', 'Eschatology/End Times', 'Ethics', 'Evangelism', 'Faith', 'Finance',
  'God/Theology Proper', 'Grief & Comfort', 'Hermeneutics', 'Leadership', 'Love & Marriage', 'Men',
  'Parenting', 'Pastoral', 'Philosophy', 'Prayer', 'Preaching', 'Reference', 'Sermons', 'Social Issues',
  'Spiritual Warfare', 'Theology', 'Women', 'World Religions', 'Worship',
]
const allCategories = ALL_CATEGORY_ORDER
  .filter((cat) => allBooks.some((b) => b.categories.includes(cat)))
  .map((cat) => ({ name: cat, count: allBooks.filter((b) => b.categories.includes(cat)).length }))


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
                style={{ color: '#CDB079' }}
              >
                <span className="inline-block h-px w-[18px]" style={{ background: '#CDB079' }} />
                Resources
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-cmg), system-ui, sans-serif',
                  fontSize: 'clamp(2.2rem, 3.5vw, 3rem)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.02em',
                  lineHeight: 0.95,
                  color: '#FFFFFF',
                }}
              >
                Library
              </h1>
            </div>
            <div className="text-right pb-0.5 shrink-0">
              <p
                className="text-[0.9rem] italic leading-relaxed mb-1 hidden sm:block"
                style={{
                  fontFamily: 'var(--font-cmg), system-ui, sans-serif',
                  color: 'rgba(255,255,255,0.35)',
                  maxWidth: 300,
                }}
              >
                Books worth your time, for study, formation, and ministry.
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

      {/* ── Hero: split layout ────────────────────────────────────────────── */}
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
                className="mb-6"
                style={{
                  fontFamily: 'var(--font-cmg), system-ui, sans-serif',
                  fontSize: 'clamp(2.4rem, 4.5vw, 4rem)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.02em',
                  lineHeight: 0.95,
                  color: '#FFFFFF',
                }}
              >
                Books that shape
                <br />
                <em style={{ color: '#C9984A', fontStyle: 'normal' }}>faithful minds.</em>
              </h2>
              <p
                className="text-[0.95rem] leading-[1.85] mb-8"
                style={{
                  fontFamily: 'var(--font-cmg), system-ui, sans-serif',
                  fontStyle: 'italic',
                  color: 'rgba(249,246,240,0.42)',
                  maxWidth: 420,
                }}
              >
                {allBooks.length} books curated for biblical study, theology, preaching,
                and Christian formation, from the essential classics to the most important
                titles being written today.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/library/browse"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 transition-all duration-200"
                  style={{
                    background: '#7A5C1E',
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-cmg), system-ui, sans-serif',
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
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
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border transition-all duration-200 hover:border-[#7A5C1E] hover:text-[#FFFFFF]"
                  style={{
                    borderColor: 'rgba(255,255,255,0.12)',
                    color: 'rgba(249,246,240,0.45)',
                    fontFamily: 'var(--font-cmg), system-ui, sans-serif',
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
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
                      src={book.coverImageUrl}
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
      <div id="essential" style={{ background: '#FFFFFF', borderTop: '1px solid #E4E4E7', borderBottom: '1px solid #E4E4E7' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-14">
          <div
            className="flex items-center gap-2.5 text-[0.63rem] font-medium tracking-[0.12em] uppercase mb-10"
            style={{ color: '#9A9189' }}
          >
            Essential Reading
            <span className="flex-1 h-px" style={{ background: '#E4E4E7' }} />
            <span style={{ color: '#6E5A2E' }}>Click any book for details &amp; Amazon link</span>
          </div>

          {/* Client component: portrait grid with modal + Amazon */}
          <LibraryEssentialGrid books={essentialBooks} />

          <div className="flex justify-end mt-8">
            <Link
              href="/library/browse?category=Classics"
              className="text-[0.68rem] font-medium tracking-[0.1em] uppercase transition-colors hover:text-[#7A5C1E]"
              style={{ color: '#6E5A2E' }}
            >
              View all essential books →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Browse by Category (featured + expandable all) ─────────────────── */}
      <div style={{ background: '#F4F4F5' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-14">
          <LibraryCategoryExpander featured={featuredCategories} all={allCategories} />
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
            className="mb-4"
            style={{
              fontFamily: 'var(--font-cmg), system-ui, sans-serif',
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              lineHeight: 0.95,
              color: '#FFFFFF',
            }}
          >
            {allBooks.length} books. Every category.
            <br />
            <em style={{ color: 'rgba(249,246,240,0.35)', fontStyle: 'normal' }}>Search, filter, explore.</em>
          </h2>
          <p
            className="text-[0.88rem] leading-relaxed mb-8 max-w-sm"
            style={{
              fontFamily: 'var(--font-cmg), system-ui, sans-serif',
              fontStyle: 'italic',
              color: 'rgba(249,246,240,0.35)',
            }}
          >
            Filter by topic, audience, reading level, or recommendation, or just browse.
          </p>
          <Link
            href="/library/browse"
            className="inline-flex items-center gap-3 px-8 py-4 border transition-all duration-200 hover:bg-[#7A5C1E] hover:border-[#7A5C1E] hover:text-[#FFFFFF]"
            style={{
              borderColor: '#CDB079',
              color: '#CDB079',
              fontFamily: 'var(--font-cmg), system-ui, sans-serif',
              fontSize: '1.1rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Browse the Full Library
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="mt-10 max-w-md text-[0.72rem] leading-relaxed" style={{ color: 'rgba(255,255,255,0.42)' }}>
            Book links go to Amazon and some are affiliate links, which cost you nothing.{' '}
            <Link href="/about/disclosure" className="underline underline-offset-2 hover:text-white">Read the disclosure</Link>.
          </p>
        </div>
      </div>
    </>
  )
}
