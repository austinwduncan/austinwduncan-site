import type { Metadata } from 'next'
import LibraryBrowser, { type LibraryBook } from '@/components/library-browser'
import rawBooks from '@/data/books.json'

export const metadata: Metadata = {
  title: 'Library',
  description:
    'A curated library of 840+ recommended books for biblical study, theology, ministry, and Christian formation.',
}

// Strip internalNotes before passing to the client component
const books: LibraryBook[] = (rawBooks as (LibraryBook & { internalNotes?: string })[]).map(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ internalNotes, ...rest }) => rest,
)

const READING_LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const REC_LEVELS = ['Essential', 'Highly Recommended', 'Recommended', 'Optional']

const categoryOrder = [
  'Apologetics',
  'Archaeology & Biblical History',
  'Bible Dictionaries',
  'Bible Languages/Tools',
  'Bible Study',
  'Biblical Reference',
  'Business',
  'Christian Living',
  'Christology',
  'Church History',
  'Church Life',
  'Classics',
  'Comparative Religions',
  'Death/Dying',
  'Denominational Concerns',
  'Devotionals',
  'Discipleship',
  'Eschatology/End Times',
  'Ethics',
  'Evangelism',
  'Faith',
  'Finance',
  'God/Theology Proper',
  'Grief & Comfort',
  'Hermeneutics',
  'Leadership',
  'Love & Marriage',
  'Men',
  'Parenting',
  'Pastoral',
  'Philosophy',
  'Prayer',
  'Preaching',
  'Reference',
  'Sermons',
  'Social Issues',
  'Spiritual Warfare',
  'Theology',
  'Women',
  'World Religions',
  'Worship',
]

const availableCategories = categoryOrder.filter((cat) =>
  books.some((b) => b.categories.includes(cat)),
)

const allAudienceTags = [
  'General',
  'New Believers',
  'Growing Believers',
  'Mature Believers',
  'Seekers',
  'Pastors',
  'Leaders',
  'Teachers',
  'Missionaries',
  'Students',
  'Scholars',
  'Men',
  'Women',
  'Young Adults',
  'Singles',
  'Married Couples',
  'Parents',
  'Worship Leaders',
].filter((tag) => books.some((b) => b.audienceTags.includes(tag)))

const allUseCaseTags = [
  'Personal Reading',
  'Small Group',
  'Gift',
  'Discipleship',
  'Sermon Prep',
  'Teaching',
  'Bible Study',
  'Reference',
  'Academic',
  'Counseling',
  'Evangelism',
].filter((tag) => books.some((b) => b.useCaseTags.includes(tag)))

// Same art-deco diamond pattern used across the site
const DECO_PATTERN =
  "data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='%23cdb079' stroke-width='0.9'/%3E%3Cpath d='M30 13L47 30L30 47L13 30Z' fill='none' stroke='%23cdb079' stroke-width='0.5'/%3E%3Ccircle cx='30' cy='0' r='1.8' fill='%23cdb079'/%3E%3Ccircle cx='60' cy='30' r='1.8' fill='%23cdb079'/%3E%3Ccircle cx='30' cy='60' r='1.8' fill='%23cdb079'/%3E%3Ccircle cx='0' cy='30' r='1.8' fill='%23cdb079'/%3E%3Ccircle cx='0' cy='0' r='1.2' fill='%23cdb079'/%3E%3Ccircle cx='60' cy='0' r='1.2' fill='%23cdb079'/%3E%3Ccircle cx='60' cy='60' r='1.2' fill='%23cdb079'/%3E%3Ccircle cx='0' cy='60' r='1.2' fill='%23cdb079'/%3E%3Ccircle cx='30' cy='30' r='1.2' fill='%23cdb079'/%3E%3C/svg%3E"

export default function LibraryPage() {
  return (
    <>
      {/* ── Slim hero banner ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-zinc-800 bg-zinc-950 py-8 text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url("${DECO_PATTERN}")`,
            backgroundSize: '60px 60px',
            opacity: 0.14,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: '#cdb079' }}
          >
            Library
          </span>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Recommended Reading
          </h1>
          <p className="mt-1.5 text-[14px] font-light leading-relaxed text-zinc-500">
            {books.length} books across {availableCategories.length} categories — for study, ministry, and formation.
          </p>
        </div>
      </section>

      {/* ── Library browser ───────────────────────────────────────────────── */}
      <section className="pb-16 pt-0">
        <div className="h-[3px] w-full" style={{ backgroundColor: '#cdb079' }} />
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
