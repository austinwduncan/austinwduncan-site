import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { type LibraryBook } from '@/components/library-browser'
import { LibraryEssentialGrid, type EssentialBook } from '@/components/library-essential-grid'
import { LibraryCategoryExpander } from '@/components/library-category-expander'
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

// Hero display — first 6 essential books
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

// Placeholder book reviews — one per major section
const BOOK_REVIEWS = [
  {
    slug: 'the-knowledge-of-the-holy',
    category: 'Theology',
    book: 'The Knowledge of the Holy',
    author: 'A. W. Tozer',
    cover: '/book-covers/the-knowledge-of-the-holy.webp',
    excerpt:
      'There are few books that have shaped my theology more than this brief, luminous meditation on the character of God. Tozer writes not as a scholar constructing an argument, but as a worshiper beholding a mystery. Every sentence carries weight. I return to it every few years and leave more humbled than when I started.',
  },
  {
    slug: 'the-reason-for-god',
    category: 'Apologetics',
    book: 'The Reason for God',
    author: 'Timothy Keller',
    cover: '/book-covers/the-reason-for-god.webp',
    excerpt:
      'Keller does what few apologists manage: he takes the skeptic\'s best objections seriously and answers them with intellectual rigor and pastoral warmth. This is the book I hand to every thoughtful unbeliever I know — and to every believer who has stopped asking hard questions.',
  },
  {
    slug: 'mere-christianity',
    category: 'Classics',
    book: 'Mere Christianity',
    author: 'C. S. Lewis',
    cover: '/book-covers/mere-christianity.webp',
    excerpt:
      'Lewis writes with a clarity that makes difficult things feel obvious in the best way. His moral argument for God\'s existence alone is worth the price of the book. I have read this at least six times and find something new on every pass. It remains one of the most important books in my library.',
  },
  {
    slug: 'how-to-read-the-bible-for-all-its-worth',
    category: 'Bible Study',
    book: 'How to Read the Bible for All Its Worth',
    author: 'Gordon D. Fee & Douglas Stuart',
    cover: '/book-covers/how-to-read-the-bible-for-all-its-worth.webp',
    excerpt:
      'If I could require one book for every church member, it might be this one. Fee and Stuart equip ordinary readers to engage Scripture with intelligence and humility — honoring the text\'s genre, history, and original audience — without requiring seminary training to do so.',
  },
  {
    slug: 'gentle-and-lowly',
    category: 'Christian Living',
    book: 'Gentle and Lowly',
    author: 'Dane Ortlund',
    cover: '/book-covers/gentle-and-lowly.webp',
    excerpt:
      'Ortlund draws from the Puritans and the Gospels to make the case that the deepest truth about Jesus is his tenderness toward sinners and sufferers. I\'ve watched this book quietly change people. Pastors especially need it — perhaps more than anyone.',
  },
  {
    slug: 'the-valley-of-vision',
    category: 'Prayer',
    book: 'The Valley of Vision',
    author: 'Arthur Bennett (ed.)',
    cover: '/book-covers/the-valley-of-vision.webp',
    excerpt:
      'The Puritan prayers in this collection are the most honest, theologically rich prayers I have ever encountered. They have taught me to pray with more precision and more desperation. My copy is worn from daily use. There is nothing else quite like it.',
  },
  {
    slug: 'biblical-preaching',
    category: 'Preaching',
    book: 'Biblical Preaching',
    author: 'Haddon Robinson',
    cover: '/book-covers/biblical-preaching.webp',
    excerpt:
      'Robinson\'s exposition of expository preaching formed an entire generation of preachers, and for good reason. The "big idea" method he teaches keeps the text in the driver\'s seat and the preacher where he belongs — as a herald, not a performer. Required reading for anyone who stands behind a pulpit.',
  },
  {
    slug: 'the-cost-of-discipleship',
    category: 'Discipleship',
    book: 'The Cost of Discipleship',
    author: 'Dietrich Bonhoeffer',
    cover: '/book-covers/the-cost-of-discipleship.webp',
    excerpt:
      'Bonhoeffer wrote this from a position of costly obedience, and it shows. His distinction between cheap grace and costly grace remains one of the most important diagnoses of contemporary Christianity. Difficult, searching, and ultimately transformative.',
  },
]

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
      <div id="essential" style={{ background: '#FAFAF7', borderTop: '1px solid #E2DACE', borderBottom: '1px solid #E2DACE' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-14">
          <div
            className="flex items-center gap-2.5 text-[0.63rem] font-medium tracking-[0.12em] uppercase mb-10"
            style={{ color: '#9A9189' }}
          >
            Essential Reading
            <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
            <span style={{ color: '#B8892E' }}>Click any book for details &amp; Amazon link</span>
          </div>

          {/* Client component: portrait grid with modal + Amazon */}
          <LibraryEssentialGrid books={essentialBooks} />

          <div className="flex justify-end mt-8">
            <Link
              href="/library/browse?category=Classics"
              className="text-[0.68rem] font-medium tracking-[0.1em] uppercase transition-colors hover:text-[#7A5C1E]"
              style={{ color: '#B8892E' }}
            >
              View all essential books →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Browse by Category (featured + expandable all) ─────────────────── */}
      <div style={{ background: '#F0EDE6' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-14">
          <LibraryCategoryExpander featured={featuredCategories} all={allCategories} />
        </div>
      </div>

      {/* ── From the Desk — featured review hero ─────────────────────────── */}
      {(() => {
        const review = BOOK_REVIEWS[0]
        return (
          <div style={{ background: '#141210' }}>
            <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-16 lg:py-20">

              {/* Label row */}
              <div
                className="flex items-center gap-3 mb-12"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem' }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: '1.05rem',
                    fontWeight: 400,
                    fontStyle: 'italic',
                    color: '#C9984A',
                  }}
                >
                  From the Desk
                </span>
                <span className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <span
                  className="text-[0.6rem] font-medium tracking-[0.14em] uppercase"
                  style={{ color: 'rgba(249,246,240,0.22)' }}
                >
                  Book Reviews
                </span>
              </div>

              {/* Hero layout */}
              <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">

                {/* Left: cover */}
                <div className="shrink-0 lg:w-[200px] xl:w-[220px]">
                  <div
                    className="relative overflow-hidden shadow-2xl"
                    style={{ aspectRatio: '2/3', width: '100%', maxWidth: 220 }}
                  >
                    <Image
                      src={review.cover}
                      alt={review.book}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 220px, 160px"
                    />
                  </div>
                </div>

                {/* Right: review text */}
                <div className="flex-1 min-w-0 pt-1">
                  <div
                    className="inline-block px-2.5 py-1 text-[0.55rem] font-bold tracking-[0.18em] uppercase mb-5"
                    style={{ background: 'rgba(122,92,30,0.25)', color: '#C9984A' }}
                  >
                    {review.category}
                  </div>

                  <h2
                    className="leading-[1.06] tracking-tight mb-2"
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                      fontWeight: 400,
                      color: '#F9F6F0',
                    }}
                  >
                    {review.book}
                  </h2>
                  <p
                    className="text-[0.78rem] mb-8 font-medium tracking-[0.06em] uppercase"
                    style={{ color: 'rgba(249,246,240,0.35)' }}
                  >
                    {review.author}
                  </p>

                  <div className="h-px mb-8" style={{ background: 'rgba(255,255,255,0.06)' }} />

                  <p
                    className="leading-[1.9] mb-8"
                    style={{
                      fontFamily: 'var(--font-source-serif)',
                      fontStyle: 'italic',
                      fontSize: 'clamp(0.9rem, 1.1vw, 1.05rem)',
                      color: 'rgba(249,246,240,0.58)',
                    }}
                  >
                    &ldquo;{review.excerpt}&rdquo;
                  </p>

                  <Link
                    href={`/library/browse?category=${encodeURIComponent(review.category)}`}
                    className="inline-flex items-center gap-2.5 text-[0.68rem] font-semibold tracking-[0.12em] uppercase transition-colors hover:text-[#F9F6F0]"
                    style={{ color: '#B8892E' }}
                  >
                    More in {review.category}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        )
      })()}

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
