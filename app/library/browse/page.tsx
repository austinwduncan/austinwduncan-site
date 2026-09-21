import type { Metadata } from 'next'
import Link from 'next/link'
import LibraryBrowser, { type LibraryBook } from '@/components/library-browser'
import rawBooks from '@/data/books.json'

export const metadata: Metadata = {
  title: 'Browse the Library',
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

export default async function LibraryBrowsePage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>
}) {
  const resolvedParams = await searchParams
  const initialCategory = resolvedParams?.category
  return (
    <div style={{ background: '#FFFFFF', color: '#171918', fontFamily: 'var(--font-cmg), system-ui, sans-serif' }}>
      {/* ── Header: the same voice as the Library landing ─────────────────── */}
      <div className="mx-auto max-w-[1500px] px-6 pt-10 lg:px-10 lg:pt-14">
        <p className="text-[0.9rem] font-semibold">
          <Link href="/library" className="underline decoration-2 underline-offset-4 hover:no-underline">
            Library
          </Link>
          <span className="px-2" style={{ color: 'rgba(23,25,24,0.4)' }}>/</span>
          <span style={{ color: 'rgba(23,25,24,0.6)' }}>{initialCategory ?? 'All books'}</span>
        </p>
        <div className="mt-5 flex items-end justify-between gap-8 pb-8" style={{ borderBottom: '7px solid #171918' }}>
          <h1
            style={{
              fontWeight: 800,
              fontSize: 'clamp(3rem, 10vw, 10rem)',
              lineHeight: 0.82,
              letterSpacing: '-0.055em',
              marginLeft: '-0.05em',
            }}
          >
            {initialCategory ?? 'All books'}
          </h1>
          <p className="hidden shrink-0 pb-1 text-right tabular-nums sm:block" style={{ fontWeight: 700, fontSize: 'clamp(1.1rem, 2vw, 2rem)', lineHeight: 1, letterSpacing: '-0.03em' }}>
            {books.length}
            <span className="mt-1 block text-[0.8rem] font-medium tracking-normal" style={{ color: 'rgba(23,25,24,0.55)' }}>
              books in {availableCategories.length} subjects
            </span>
          </p>
        </div>
      </div>

      {/* ── Library browser ───────────────────────────────────────────────── */}
      <section className="pb-20 pt-2">
        <div className="mx-auto max-w-[1500px] px-6 lg:px-10">
          <LibraryBrowser
            books={books}
            categories={availableCategories}
            readingLevels={READING_LEVELS}
            recLevels={REC_LEVELS}
            audienceTags={allAudienceTags}
            useCaseTags={allUseCaseTags}
            initialCategory={initialCategory}
          />
        </div>
      </section>
    </div>
  )
}
