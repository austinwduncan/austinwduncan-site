import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import LibraryBrowser, { type LibraryBook } from '@/components/library-browser'
import rawBooks from '@/data/books.json'

export const metadata: Metadata = {
  title: 'Library — Austin W. Duncan',
  description:
    'A curated library of recommended books for biblical study, theology, ministry, and Christian formation.',
}

const books: LibraryBook[] = (rawBooks as (LibraryBook & { internalNotes?: string })[]).map(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ internalNotes, ...rest }) => rest,
)

const READING_LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const REC_LEVELS = ['Essential', 'Highly Recommended', 'Recommended', 'Optional']

const categoryOrder = [
  'Apologetics', 'Archaeology & Biblical History', 'Bible Dictionaries', 'Bible Languages/Tools',
  'Bible Study', 'Biblical Reference', 'Business', 'Christian Living', 'Christology', 'Church History',
  'Church Life', 'Classics', 'Comparative Religions', 'Death/Dying', 'Denominational Concerns',
  'Devotionals', 'Discipleship', 'Eschatology/End Times', 'Ethics', 'Evangelism', 'Faith', 'Finance',
  'God/Theology Proper', 'Grief & Comfort', 'Hermeneutics', 'Leadership', 'Love & Marriage', 'Men',
  'Parenting', 'Pastoral', 'Philosophy', 'Prayer', 'Preaching', 'Reference', 'Sermons', 'Social Issues',
  'Spiritual Warfare', 'Theology', 'Women', 'World Religions', 'Worship',
]

const availableCategories = categoryOrder.filter((cat) =>
  books.some((b) => b.categories.includes(cat)),
)

const allAudienceTags = [
  'General', 'New Believers', 'Growing Believers', 'Mature Believers', 'Seekers', 'Pastors',
  'Leaders', 'Teachers', 'Missionaries', 'Students', 'Scholars', 'Men', 'Women', 'Young Adults',
  'Singles', 'Married Couples', 'Parents', 'Worship Leaders',
].filter((tag) => books.some((b) => b.audienceTags.includes(tag)))

const allUseCaseTags = [
  'Personal Reading', 'Small Group', 'Gift', 'Discipleship', 'Sermon Prep', 'Teaching',
  'Bible Study', 'Reference', 'Academic', 'Counseling', 'Evangelism',
].filter((tag) => books.some((b) => b.useCaseTags.includes(tag)))

// Curated landing categories
const LANDING_CATEGORIES = [
  'Theology', 'Apologetics', 'Classics', 'Bible Study',
  'Christian Living', 'Church History', 'Christology', 'Hermeneutics',
  'Prayer', 'Preaching', 'Pastoral', 'Discipleship',
].filter((c) => availableCategories.includes(c))

// Featured essential books with cover images (deduplicated)
const seen = new Set<string>()
const featuredBooks = books
  .filter((b) => {
    if (b.recommendationLevel !== 'Essential' || !b.coverImageUrl || !b.featured) return false
    if (seen.has(b.title)) return false
    seen.add(b.title)
    return true
  })
  .slice(0, 12)

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
                {books.length} books · {availableCategories.length} categories
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

      {/* ── Essential Reading ──────────────────────────────────────────────── */}
      <div style={{ background: '#FAFAF7', borderBottom: '1px solid #E2DACE' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 pt-14 pb-12">

          <div
            className="flex items-center gap-2.5 text-[0.63rem] font-medium tracking-[0.12em] uppercase mb-10"
            style={{ color: '#9A9189' }}
          >
            Essential Reading
            <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
            <span style={{ color: '#B8892E' }}>{featuredBooks.length} books</span>
          </div>

          {/* Portrait book grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-5 mb-12">
            {featuredBooks.map((book) => (
              <a
                key={book.title}
                href="#all-books"
                className="group block relative overflow-hidden"
                style={{ aspectRatio: '2/3' }}
                title={book.title}
              >
                <Image
                  src={book.coverImageUrl!}
                  alt={book.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  sizes="(min-width: 1024px) 16vw, (min-width: 640px) 25vw, 33vw"
                />
                {/* Hover overlay */}
                <div
                  className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(to top, rgba(14,12,10,0.97) 0%, rgba(14,12,10,0.88) 50%, rgba(14,12,10,0.4) 100%)' }}
                >
                  <div
                    className="text-[0.5rem] font-bold tracking-[0.18em] uppercase mb-1"
                    style={{ color: '#B8892E' }}
                  >
                    Essential
                  </div>
                  <h3
                    className="leading-tight mb-1.5"
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      color: '#F9F6F0',
                    }}
                  >
                    {book.title}
                  </h3>
                  <p
                    className="text-[0.62rem] leading-snug line-clamp-3"
                    style={{ fontFamily: 'var(--font-source-serif)', color: 'rgba(249,246,240,0.55)' }}
                  >
                    {book.shortRecommendation}
                  </p>
                </div>
              </a>
            ))}
          </div>

          {/* Browse by Category */}
          <div
            className="flex items-center gap-2.5 text-[0.63rem] font-medium tracking-[0.12em] uppercase mb-6"
            style={{ color: '#9A9189' }}
          >
            Browse by Category
            <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
          </div>

          <div className="flex flex-wrap gap-2 mb-10">
            {LANDING_CATEGORIES.map((cat) => {
              const count = books.filter((b) => b.categories.includes(cat)).length
              return (
                <a
                  key={cat}
                  href="#all-books"
                  className="group inline-flex items-center gap-2 px-3.5 py-2 border transition-all duration-200"
                  style={{
                    borderColor: '#D8D0C4',
                    background: '#F5F2EB',
                  }}
                >
                  <span
                    className="text-[0.67rem] font-medium tracking-[0.08em] transition-colors group-hover:text-[#7A5C1E]"
                    style={{ color: '#4A4038' }}
                  >
                    {cat}
                  </span>
                  <span
                    className="text-[0.56rem] font-medium tracking-[0.06em] transition-colors group-hover:text-[#B8892E]"
                    style={{ color: '#B0A898' }}
                  >
                    {count}
                  </span>
                </a>
              )
            })}
          </div>

          {/* View all CTA */}
          <div className="flex justify-center">
            <a
              href="#all-books"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 border transition-all duration-200 hover:bg-[#7A5C1E] hover:border-[#7A5C1E] hover:text-[#F9F6F0]"
              style={{
                borderColor: '#B8892E',
                color: '#7A5C1E',
                fontFamily: 'var(--font-cormorant)',
                fontSize: '1rem',
                fontWeight: 500,
                letterSpacing: '0.04em',
              }}
            >
              View All {books.length} Books
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* ── Full Library Browser ───────────────────────────────────────────── */}
      <section id="all-books" className="pb-16 pt-0">
        <div
          className="h-[3px] w-full"
          style={{ backgroundColor: '#7A5C1E' }}
        />
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <LibraryBrowser
            books={books}
            categories={availableCategories}
            readingLevels={READING_LEVELS}
            recLevels={REC_LEVELS}
            audienceTags={allAudienceTags}
            useCaseTags={allUseCaseTags}
          />
        </div>
      </section>
    </>
  )
}
