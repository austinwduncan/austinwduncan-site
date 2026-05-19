import type { Metadata } from 'next'
import Link from 'next/link'
import LibraryBrowser, { type LibraryBook } from '@/components/library-browser'
import rawBooks from '@/data/books.json'

export const metadata: Metadata = {
  title: 'Browse the Library — Austin W. Duncan',
  description:
    'Browse and search 800+ recommended books for biblical study, theology, ministry, and Christian formation.',
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

export default function LibraryBrowsePage() {
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
                <Link
                  href="/library"
                  className="transition-colors hover:text-[#F9F6F0]"
                  style={{ color: 'rgba(249,246,240,0.4)' }}
                >
                  Library
                </Link>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>→</span>
                <span className="inline-block h-px w-[18px]" style={{ background: '#B8892E' }} />
                Browse
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
                All Books
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
                Search, filter, and browse the full library.
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

      {/* ── Library browser ───────────────────────────────────────────────── */}
      <section className="pb-16 pt-0">
        <div className="h-[3px] w-full" style={{ backgroundColor: '#7A5C1E' }} />
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
