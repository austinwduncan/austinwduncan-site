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

  const featuredIdx = raw.findIndex((s) => s.frontmatter.featured)
  const startHere = sermons[featuredIdx >= 0 ? featuredIdx : sermons.length - 1]
  const latest = sermons[0]
  const showLatestSeparately = latest.slug !== startHere.slug

  const booksInData = new Set(sermons.flatMap((s) => s.allBooks))
  const availableBooks = BOOK_ORDER.filter((b) => booksInData.has(b))

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
            </p>
            <div className="hidden sm:flex gap-8 shrink-0">
              <Stat num={sermons.length} label="Messages" />
              <Stat num={booksInData.size} label="Books" />
              <Stat num={uniqueSeries} label="Series" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Start Here — full-bleed warm section ────────────────────────── */}
      <div
        style={{
          backgroundColor: '#F6F1E4',
          backgroundImage: `repeating-linear-gradient(
            45deg, transparent, transparent 12px,
            rgba(184,137,46,0.045) 12px, rgba(184,137,46,0.045) 13px
          )`,
          borderBottom: '1px solid #E2DACE',
        }}
      >
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-12 lg:py-16">
          {/* Label */}
          <div
            className="flex items-center gap-2.5 text-[0.68rem] font-medium tracking-[0.14em] uppercase mb-8"
            style={{ color: '#7A5C1E' }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            If you&rsquo;re new here
            <span className="flex-1 h-px" style={{ background: '#C8BFA8' }} />
          </div>

          {/* Horizontal editorial card */}
          <Link
            href={`/sermons/${startHere.slug}`}
            className="group flex flex-col lg:flex-row gap-8 lg:gap-14 items-center"
          >
            {/* Image */}
            <div className="w-full lg:w-[42%] shrink-0">
              <div
                className="relative rounded-md overflow-hidden border transition-shadow duration-300 group-hover:shadow-lg"
                style={{ aspectRatio: '4/3', background: '#E8E0D0', borderColor: '#C8BFA8' }}
              >
                {startHere.image && (
                  <Image
                    src={startHere.image}
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 1024px) 42vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p
                className="text-[0.88rem] italic mb-3"
                style={{ fontFamily: 'var(--font-source-serif)', color: '#9A9189' }}
              >
                A good place to begin
              </p>
              {(startHere.scripture ?? startHere.primaryBook) && (
                <div
                  className="text-[0.68rem] font-medium tracking-[0.12em] uppercase mb-3"
                  style={{ color: '#7A5C1E' }}
                >
                  {startHere.scripture ?? startHere.primaryBook}
                </div>
              )}
              <h2
                className="leading-[1.15] tracking-tight mb-4 transition-colors group-hover:text-[#7A5C1E]"
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: 'clamp(1.9rem, 3vw, 2.6rem)',
                  fontWeight: 500,
                  color: '#1A1714',
                }}
              >
                {startHere.title}
              </h2>
              {startHere.excerpt && (
                <p
                  className="text-[0.95rem] leading-[1.75] mb-5 line-clamp-4"
                  style={{ fontFamily: 'var(--font-source-serif)', color: '#5A544C' }}
                >
                  {startHere.excerpt.replace(/\*\*/g, '')}
                </p>
              )}
              <div
                className="flex items-center gap-2 text-[0.72rem] mb-5"
                style={{ color: '#9A9189' }}
              >
                {startHere.formattedDate && <span>{startHere.formattedDate}</span>}
                {startHere.formattedDate && (
                  <span className="h-[3px] w-[3px] rounded-full inline-block" style={{ background: '#C8BFA8' }} />
                )}
                <span>{startHere.readingMinutes} min read</span>
              </div>
              <span
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-[0.76rem] font-medium tracking-[0.04em] text-white transition-colors"
                style={{ background: '#7A5C1E' }}
              >
                Read this sermon
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Latest Message — full-bleed white section ────────────────────── */}
      {showLatestSeparately && (
        <div style={{ background: '#fff', borderBottom: '1px solid #E2DACE' }}>
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-10 lg:py-12">
            {/* Label */}
            <div
              className="flex items-center gap-2.5 text-[0.68rem] font-medium tracking-[0.12em] uppercase mb-7"
              style={{ color: '#9A9189' }}
            >
              Latest Message
              <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
            </div>

            {/* Horizontal strip — content left, image right */}
            <Link
              href={`/sermons/${latest.slug}`}
              className="group flex flex-col-reverse lg:flex-row items-center gap-8 lg:gap-12"
            >
              {/* Content */}
              <div className="flex-1 min-w-0">
                {(latest.scripture ?? latest.primaryBook) && (
                  <div
                    className="text-[0.68rem] font-medium tracking-[0.12em] uppercase mb-2.5"
                    style={{ color: '#7A5C1E' }}
                  >
                    {latest.scripture ?? latest.primaryBook}
                  </div>
                )}
                <h2
                  className="leading-snug tracking-tight mb-3 transition-colors group-hover:text-[#7A5C1E]"
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)',
                    fontWeight: 500,
                    color: '#1A1714',
                  }}
                >
                  {latest.title}
                </h2>
                {latest.excerpt && (
                  <p
                    className="text-[0.92rem] leading-[1.7] mb-4 line-clamp-2"
                    style={{ fontFamily: 'var(--font-source-serif)', color: '#5A544C' }}
                  >
                    {latest.excerpt.replace(/\*\*/g, '')}
                  </p>
                )}
                <div
                  className="flex items-center gap-2 text-[0.72rem] mb-5"
                  style={{ color: '#9A9189' }}
                >
                  {latest.formattedDate && <span>{latest.formattedDate}</span>}
                  {latest.formattedDate && (
                    <span className="h-[3px] w-[3px] rounded-full inline-block" style={{ background: '#C8BFA8' }} />
                  )}
                  <span>{latest.readingMinutes} min read</span>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 text-[0.76rem] font-medium tracking-[0.04em] pb-px border-b transition-colors"
                  style={{ color: '#7A5C1E', borderColor: '#EFE3C4' }}
                >
                  Read this sermon
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>

              {/* Image */}
              <div className="w-full lg:w-[38%] shrink-0">
                <div
                  className="relative rounded-md overflow-hidden border transition-shadow duration-300 group-hover:shadow-md"
                  style={{ aspectRatio: '16/9', background: '#F2EFE7', borderColor: '#E2DACE' }}
                >
                  {latest.image && (
                    <Image
                      src={latest.image}
                      alt=""
                      fill
                      priority
                      sizes="(min-width: 1024px) 38vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  )}
                  {/* "New" indicator */}
                  <span
                    className="absolute top-3 right-3 text-[0.6rem] font-semibold tracking-[0.12em] uppercase px-2 py-1 rounded"
                    style={{ background: 'rgba(20,18,16,0.75)', color: '#B8892E', backdropFilter: 'blur(4px)' }}
                  >
                    Latest
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* ── All Sermons ──────────────────────────────────────────────────── */}
      <div style={{ background: '#FAFAF7' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 pt-12 pb-20">
          <div
            className="flex items-center gap-2.5 text-[0.68rem] font-medium tracking-[0.12em] uppercase mb-5"
            style={{ color: '#9A9189' }}
          >
            All Sermons
            <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
          </div>
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
