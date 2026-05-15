import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  getAll,
  sortByDate,
  readingTime,
  bibleBooksFromTags,
  primaryBookFromTags,
  formatDate,
  BIBLE_BOOKS,
  type SermonFrontmatter,
} from '@/lib/content'
import SermonsGrid, { type SermonListItem } from '@/components/sermons-grid'

export const metadata: Metadata = {
  title: 'Sermons',
  description: 'Expository sermons preached verse by verse through books of the Bible.',
}

// Canonical order for filter pills
const BOOK_ORDER = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles',
  'Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon',
  'Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel',
  'Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum',
  'Habakkuk','Zephaniah','Haggai','Zechariah','Malachi',
  'Matthew','Mark','Luke','John','Acts',
  'Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians',
  'Philippians','Colossians','1 Thessalonians','2 Thessalonians',
  '1 Timothy','2 Timothy','Titus','Philemon',
  'Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation',
]

export default function SermonsPage() {
  const raw = sortByDate(getAll<SermonFrontmatter>('sermons'))

  const sermons: SermonListItem[] = raw.map(({ frontmatter: fm, content, slug }) => ({
    slug,
    title: fm.title,
    date: fm.date ?? '',
    formattedDate: formatDate(fm.date),
    excerpt: fm.excerpt ?? '',
    image: fm.image,
    scripture: fm.scripture,
    primaryBook: primaryBookFromTags(fm.tags),
    allBooks: bibleBooksFromTags(fm.tags),
    readingMinutes: readingTime(content),
  }))

  // Featured / Start Here = first sermon with featured:true, else oldest
  const featuredIdx = raw.findIndex((s) => s.frontmatter.featured)
  const featuredItem = sermons[featuredIdx >= 0 ? featuredIdx : sermons.length - 1]
  const latestItem = sermons[0]

  // Books in canonical order that actually appear in data
  const booksInData = new Set(sermons.flatMap((s) => s.allBooks))
  const availableBooks = BOOK_ORDER.filter((b) => booksInData.has(b))

  // Stats
  const sermonTags = raw.flatMap((s) => s.frontmatter.tags ?? [])
  const seriesTags = sermonTags.filter((t) => !BIBLE_BOOKS.has(t) && t !== 'Sermons')
  const uniqueSeries = new Set(seriesTags).size

  return (
    <>
      {/* ── Page Header ─────────────────────────────────────────────────── */}
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
                Preaching
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
                Sermons
              </h1>
            </div>
            <div
              className="text-[0.75rem] tracking-[0.04em] pb-0.5 shrink-0"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              {sermons.length} messages
            </div>
          </div>
        </div>
      </div>

      {/* ── Amber strip ─────────────────────────────────────────────────── */}
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

      {/* ── Intro strip ─────────────────────────────────────────────────── */}
      <div
        className="border-b"
        style={{ background: '#1C1916', borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-7">
          <div className="flex items-center justify-between gap-10">
            <p
              className="text-[0.97rem] leading-[1.7] italic max-w-[560px]"
              style={{ fontFamily: 'var(--font-source-serif)', color: 'rgba(255,255,255,0.42)' }}
            >
              <span style={{ fontStyle: 'normal', color: 'rgba(255,255,255,0.68)' }}>
                Expository sermons preached verse by verse through books of the Bible.
              </span>
              {' '}These are meant to be read as much as heard — take your time.
              If you&rsquo;re new here, the one marked below is a good place to start.
            </p>
            <div className="hidden sm:flex gap-8 shrink-0">
              <Stat num={sermons.length} label="Messages" />
              <Stat num={booksInData.size} label="Books" />
              <Stat num={uniqueSeries} label="Series" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div
        className="mx-auto max-w-[1100px] px-6 lg:px-8 pb-20"
        style={{ background: '#FAFAF7' }}
      >
        {/* Featured Row */}
        <div className="pt-12 pb-14">
          <SectionLabel>Featured</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HeroCard sermon={featuredItem} badge="Start Here" aspectRatio="4/3" />
            <HeroCard sermon={latestItem} badge="Latest Message" aspectRatio="16/9" />
          </div>
        </div>

        {/* All Sermons */}
        <div>
          <SectionLabel>All Sermons</SectionLabel>
          <SermonsGrid sermons={sermons} availableBooks={availableBooks} />
        </div>
      </div>
    </>
  )
}

function Stat({ num, label }: { num: number; label: string }) {
  return (
    <div className="text-center">
      <span
        className="block leading-none mb-1"
        style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: '1.9rem',
          fontWeight: 300,
          color: '#B8892E',
        }}
      >
        {num}
      </span>
      <span
        className="text-[0.65rem] font-medium tracking-[0.1em] uppercase block"
        style={{ color: 'rgba(255,255,255,0.22)' }}
      >
        {label}
      </span>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex items-center gap-2.5 text-[0.68rem] font-medium tracking-[0.12em] uppercase mb-5"
      style={{ color: '#9A9189' }}
    >
      {children}
      <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
    </div>
  )
}

function HeroCard({
  sermon,
  badge,
  aspectRatio,
}: {
  sermon: SermonListItem
  badge: string
  aspectRatio: string
}) {
  return (
    <Link
      href={`/sermons/${sermon.slug}`}
      className="group flex flex-col rounded-lg overflow-hidden border bg-white transition-all duration-200 hover:-translate-y-0.5"
      style={{
        borderColor: '#E2DACE',
        boxShadow: '0 1px 3px rgba(26,23,20,0.06)',
      }}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden shrink-0"
        style={{ aspectRatio, background: '#F2EFE7' }}
      >
        {sermon.image && (
          <Image
            src={sermon.image}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        )}
        <span
          className="absolute top-3.5 left-3.5 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-[0.65rem] font-medium tracking-[0.1em] uppercase text-white"
          style={{ background: '#7A5C1E' }}
        >
          {badge === 'Start Here' && (
            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
          {badge}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 px-6 py-6">
        {(sermon.scripture ?? sermon.primaryBook) && (
          <div
            className="text-[0.68rem] font-medium tracking-[0.1em] uppercase mb-2"
            style={{ color: '#7A5C1E' }}
          >
            {sermon.scripture ?? sermon.primaryBook}
          </div>
        )}
        <h2
          className="leading-snug tracking-tight mb-3 transition-colors group-hover:text-[#7A5C1E]"
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(1.4rem, 2.2vw, 1.9rem)',
            fontWeight: 500,
            color: '#1A1714',
          }}
        >
          {sermon.title}
        </h2>
        {sermon.excerpt && (
          <p
            className="text-[0.94rem] leading-[1.72] mb-4 line-clamp-3"
            style={{ fontFamily: 'var(--font-source-serif)', color: '#5A544C' }}
          >
            {sermon.excerpt.replace(/\*\*/g, '')}
          </p>
        )}
        <div
          className="flex flex-wrap items-center gap-2 text-[0.72rem] mt-auto"
          style={{ color: '#9A9189' }}
        >
          {sermon.formattedDate && <span>{sermon.formattedDate}</span>}
          {sermon.formattedDate && (
            <span className="h-[3px] w-[3px] rounded-full" style={{ background: '#C8BFA8' }} />
          )}
          <span>{sermon.readingMinutes} min read</span>
        </div>
        <span
          className="inline-flex items-center gap-1.5 mt-4 text-[0.76rem] font-medium tracking-[0.04em] self-start pb-px border-b transition-colors"
          style={{ color: '#7A5C1E', borderColor: '#EFE3C4' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
          </svg>
          Read this sermon
        </span>
      </div>
    </Link>
  )
}
