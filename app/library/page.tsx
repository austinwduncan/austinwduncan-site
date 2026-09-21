import type { Metadata } from 'next'
import Link from 'next/link'
import { type LibraryBook } from '@/components/library-browser'
import { LibraryEssentialGrid, type EssentialBook } from '@/components/library-essential-grid'
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


/*
  The shelf: featured covers standing on one black rule, with a category spine
  between every few books. The spines are real links, so the one decorative
  device on the page also navigates. Rendered twice for a seamless drift.
*/
const shelfSeen = new Set<string>()
const shelfBooks = allBooks
  .filter((b) => {
    if (!b.featured || !b.coverImageUrl || shelfSeen.has(b.title)) return false
    shelfSeen.add(b.title)
    return true
  })
  .slice(0, 30)
const spineCategories = allCategories.slice().sort((a, b) => b.count - a.count).slice(0, 6)

type ShelfItem =
  | { kind: 'book'; title: string; cover: string }
  | { kind: 'spine'; name: string; count: number; tone: 'ink' | 'gold' }

const shelf: ShelfItem[] = []
shelfBooks.forEach((b, i) => {
  shelf.push({ kind: 'book', title: b.title, cover: b.coverImageUrl! })
  if (i % 5 === 4) {
    const c = spineCategories[((i + 1) / 5 - 1) % spineCategories.length]
    if (c) shelf.push({ kind: 'spine', name: c.name, count: c.count, tone: ((i + 1) / 5) % 2 === 0 ? 'gold' : 'ink' })
  }
})

const INK = '#171918'
const GOLD = '#CDB079'
const GOLD_INK = '#6E5A2E'
const FACE = 'var(--font-cmg), system-ui, sans-serif'

function Shelf({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-end gap-3 pr-3" aria-hidden={hidden || undefined}>
      {shelf.map((item, i) =>
        item.kind === 'book' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={item.cover}
            alt={hidden ? '' : item.title}
            loading={hidden ? 'lazy' : undefined}
            className="h-[150px] w-auto shrink-0 sm:h-[210px] lg:h-[250px]"
            
          />
        ) : (
          <Link
            key={i}
            href={`/library/browse?category=${encodeURIComponent(item.name)}`}
            tabIndex={hidden ? -1 : undefined}
            className="flex h-[170px] w-[44px] shrink-0 items-center justify-between py-3 sm:h-[236px] sm:w-[54px] lg:h-[280px] lg:w-[62px]"
            style={{
              background: item.tone === 'ink' ? INK : GOLD,
              color: item.tone === 'ink' ? '#FFFFFF' : INK,
              writingMode: 'vertical-rl',
              fontFamily: FACE,
            }}
          >
            <span className="text-[0.95rem] font-bold tracking-[-0.01em] lg:text-[1.1rem]">{item.name}</span>
            <span className="text-[0.7rem] font-semibold tabular-nums opacity-70">{item.count}</span>
          </Link>
        ),
      )}
    </div>
  )
}

export default function LibraryPage() {
  const total = allBooks.length
  return (
    <div style={{ background: '#FFFFFF', color: INK, fontFamily: FACE }}>
      {/* ── The word and the shelf ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-10 lg:pt-14">
        <div className="mx-auto flex max-w-[1500px] items-start justify-between gap-6 px-6 lg:px-10">
          <h1
            className="select-none"
            style={{
              fontFamily: FACE,
              fontWeight: 800,
              fontSize: 'clamp(4.6rem, 19.5vw, 23rem)',
              lineHeight: 0.78,
              letterSpacing: '-0.06em',
              marginLeft: '-0.055em',
              color: INK,
            }}
          >
            Library
          </h1>
          <p
            className="hidden shrink-0 pt-3 text-right tabular-nums sm:block"
            style={{ fontWeight: 700, fontSize: 'clamp(1.1rem, 2.2vw, 2.2rem)', lineHeight: 1, letterSpacing: '-0.03em' }}
          >
            {total}
            <span className="mt-1 block text-[0.8rem] font-medium tracking-normal" style={{ color: 'rgba(23,25,24,0.55)' }}>
              books
            </span>
          </p>
        </div>

        {/* covers stand on the rule; the word sits behind their tops */}
        <div className="relative -mt-[3.2vw] lg:-mt-[2.4vw]">
          <div className="awd-shelf flex w-max items-end">
            <Shelf />
            <Shelf hidden />
          </div>
          <div aria-hidden style={{ height: 7, background: INK }} />
        </div>

        <div className="mx-auto grid max-w-[1500px] gap-8 px-6 py-12 lg:grid-cols-[1.35fr_1fr] lg:items-end lg:px-10 lg:py-16">
          <p style={{ fontSize: 'clamp(1.25rem, 2vw, 1.9rem)', lineHeight: 1.3, fontWeight: 600, letterSpacing: '-0.015em', maxWidth: '28ch' }}>
            Every book I recommend, sorted by subject, reader and how strongly I would push it into your hands.
          </p>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link
              href="/library/browse"
              className="rounded-full px-8 py-4 text-[0.85rem] font-bold transition-transform duration-200 hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ background: INK, color: '#FFFFFF', outlineColor: INK }}
            >
              Browse all {total}
            </Link>
            <a
              href="#essential"
              className="rounded-full border-2 px-8 py-4 text-[0.85rem] font-bold transition-colors duration-200 hover:bg-[#171918] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ borderColor: INK, outlineColor: INK }}
            >
              Start with the essentials
            </a>
          </div>
        </div>
      </section>

      {/* ── Essentials ─────────────────────────────────────────────────────── */}
      <section id="essential" className="scroll-mt-20" style={{ background: '#F4F4F5' }}>
        <div className="mx-auto max-w-[1500px] px-6 py-20 lg:px-10 lg:py-28">
          <div className="mb-12 grid gap-4 lg:grid-cols-[1.35fr_1fr] lg:items-end">
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(2.4rem, 6vw, 5.5rem)', lineHeight: 0.9, letterSpacing: '-0.045em' }}>
              Start here
            </h2>
            <p className="max-w-[44ch] text-[1rem] leading-relaxed lg:justify-self-end" style={{ color: 'rgba(23,25,24,0.7)' }}>
              The books I mark essential. Open any cover for why it is here and who it is for.
            </p>
          </div>
          <LibraryEssentialGrid books={essentialBooks} />
        </div>
      </section>

      {/* ── The index ──────────────────────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-[1500px] px-6 py-20 lg:px-10 lg:py-28">
          <h2 className="mb-10" style={{ fontWeight: 800, fontSize: 'clamp(2.4rem, 6vw, 5.5rem)', lineHeight: 0.9, letterSpacing: '-0.045em' }}>
            By subject
          </h2>
          <ul className="gap-x-12 sm:columns-2 lg:columns-3" style={{ borderTop: `3px solid ${INK}` }}>
            {allCategories.map((cat) => (
              <li key={cat.name} className="break-inside-avoid" style={{ borderBottom: '1px solid rgba(23,25,24,0.16)' }}>
                <Link
                  href={`/library/browse?category=${encodeURIComponent(cat.name)}`}
                  className="group flex items-baseline justify-between gap-4 px-2 py-3 transition-colors duration-150 hover:bg-[#171918] hover:text-white focus-visible:bg-[#171918] focus-visible:text-white focus-visible:outline-none"
                >
                  <span className="text-[1.15rem] font-semibold tracking-[-0.015em] lg:text-[1.3rem]">{cat.name}</span>
                  <span className="text-[0.9rem] font-bold tabular-nums group-hover:text-[#CDB079] group-focus-visible:text-[#CDB079]" style={{ color: GOLD_INK }}>
                    {cat.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Closing block ──────────────────────────────────────────────────── */}
      <section style={{ background: INK, color: '#FFFFFF' }}>
        <div className="mx-auto grid max-w-[1500px] gap-10 px-6 py-20 lg:grid-cols-[1.35fr_1fr] lg:items-end lg:px-10 lg:py-28">
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(2.6rem, 8vw, 8rem)', lineHeight: 0.86, letterSpacing: '-0.05em' }}>
            All {total},<br />searchable.
          </h2>
          <div className="lg:justify-self-end">
            <p className="max-w-[40ch] text-[1rem] leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>
              Filter by subject, audience, reading level or how strongly I recommend it.
            </p>
            <Link
              href="/library/browse"
              className="mt-7 inline-block rounded-full px-8 py-4 text-[0.85rem] font-bold transition-transform duration-200 hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ background: GOLD, color: INK, outlineColor: GOLD }}
            >
              Browse the library
            </Link>
            <p className="mt-8 max-w-[44ch] text-[0.75rem] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Book links go to Amazon and some are affiliate links, which cost you nothing.{' '}
              <Link href="/about/disclosure" className="underline underline-offset-2 hover:text-white">Read the disclosure</Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
