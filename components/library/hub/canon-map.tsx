import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { BookCoverage } from '@/lib/library/queries'

/*
  The canon, as a map of what has been taught.

  Browsing by Scripture was a small text link at the foot of the page, which
  buried the single most substantial thing about this library: it reaches almost
  the whole Bible. A number in a sentence does not land the same way that
  sixty-six cells do, most of them lit.

  Every book is a cell, in canonical order, sized by nothing and weighted by
  coverage. A book worked through heavily reads brighter than one touched once,
  so the shape of the teaching is visible at a glance: heavy in Exodus, Isaiah,
  Matthew and John, thinner through the histories.

  Coverage counts distinct chapters, not references, so quoting one verse forty
  times does not make a book look taught. Gold is reserved for the top band, the
  books genuinely worked through, because gold is never a large field here.
*/

const HEADING = 'var(--font-cmg), system-ui, sans-serif'

function Cell({ book }: { book: BookCoverage }) {
  const ratio = book.chapterCount ? book.taught / book.chapterCount : 0
  const taught = book.taught > 0

  // Four bands rather than a continuous ramp, so the map reads as a map and
  // not as noise. The top band is the only place gold appears.
  const band = ratio >= 0.6 ? 3 : ratio >= 0.3 ? 2 : ratio > 0 ? 1 : 0
  const styles = [
    { bg: 'rgba(238,234,225,0.03)', fg: 'rgba(238,234,225,0.26)', bd: 'rgba(238,234,225,0.07)' },
    { bg: 'rgba(238,234,225,0.07)', fg: 'rgba(238,234,225,0.62)', bd: 'rgba(238,234,225,0.12)' },
    { bg: 'rgba(238,234,225,0.13)', fg: 'rgba(238,234,225,0.86)', bd: 'rgba(238,234,225,0.18)' },
    { bg: 'rgba(205,176,121,0.18)', fg: 'var(--awd-gold)', bd: 'rgba(205,176,121,0.42)' },
  ][band]

  const label = taught
    ? `${book.name}, ${book.taught} of ${book.chapterCount} chapters taught`
    : `${book.name}, not taught yet`

  const inner = (
    <>
      <span
        className="block text-[0.62rem] font-semibold uppercase tracking-[0.06em]"
        style={{ fontFamily: HEADING, color: styles.fg }}
      >
        {book.abbreviation}
      </span>
      {taught && (
        <span
          aria-hidden
          className="mt-1 block h-px w-full"
          style={{ background: styles.bd }}
        >
          <span
            className="block h-px"
            style={{ width: `${Math.max(8, ratio * 100)}%`, background: styles.fg }}
          />
        </span>
      )}
    </>
  )

  const shell =
    'flex min-w-0 flex-col justify-center rounded-[2px] border px-1.5 py-2 text-center transition-colors duration-200'

  if (!taught) {
    return (
      <span className={shell} style={{ background: styles.bg, borderColor: styles.bd }} title={label}>
        {inner}
      </span>
    )
  }

  return (
    <Link
      href={`/scripture/${book.slug}`}
      className={`${shell} hover:border-[rgba(205,176,121,0.55)]`}
      style={{ background: styles.bg, borderColor: styles.bd }}
      title={label}
    >
      {inner}
    </Link>
  )
}

export default function CanonMap({ books }: { books: BookCoverage[] }) {
  const ot = books.filter(b => b.testament === 'OT')
  const nt = books.filter(b => b.testament === 'NT')
  const taughtBooks = books.filter(b => b.taught > 0).length
  const taughtChapters = books.reduce((n, b) => n + b.taught, 0)
  const totalChapters = books.reduce((n, b) => n + b.chapterCount, 0)
  const percent = Math.round((taughtChapters / totalChapters) * 100)

  const stats: [string, string][] = [
    [`${taughtBooks} of ${books.length}`, 'books taught'],
    [`${taughtChapters}`, `chapters, ${percent}% of the canon`],
    [`${ot.filter(b => b.taught).length} of ${ot.length}`, 'Old Testament'],
    [`${nt.filter(b => b.taught).length} of ${nt.length}`, 'New Testament'],
  ]

  return (
    <div>
      <div className="flex flex-col gap-y-6 lg:flex-row lg:items-end lg:justify-between lg:gap-x-16">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span aria-hidden className="h-px w-10" style={{ background: 'var(--awd-gold)' }} />
            <span
              className="text-[0.7rem] font-semibold uppercase tracking-[0.24em]"
              style={{ fontFamily: HEADING, color: 'var(--awd-gold)' }}
            >
              Browse by Scripture
            </span>
          </div>

          <h2
            className="mt-4 uppercase"
            style={{
              fontFamily: HEADING,
              fontWeight: 700,
              fontSize: 'clamp(1.9rem, 3.8vw, 2.9rem)',
              letterSpacing: '-0.02em',
              lineHeight: 0.95,
              color: 'var(--awd-bone)',
            }}
          >
            Nearly the whole canon
          </h2>
        </div>

        <p
          className="max-w-[34rem] text-[0.95rem] leading-relaxed lg:pb-1 lg:text-[0.99rem]"
          style={{ fontFamily: 'var(--font-cmg), system-ui, sans-serif', color: 'rgba(238,234,225,0.7)' }}
        >
          Every book below links to what has been taught in it, chapter by chapter. The
          brighter a book, the more of it has been worked through.
        </p>
      </div>

      <dl className="mt-9 flex flex-wrap gap-x-12 gap-y-5">
        {stats.map(([value, label]) => (
          <div key={label}>
            <dt
              className="text-[1.5rem] leading-none lg:text-[1.8rem]"
              style={{ fontFamily: HEADING, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--awd-gold)' }}
            >
              {value}
            </dt>
            <dd
              className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em]"
              style={{ fontFamily: HEADING, color: 'var(--awd-stone)' }}
            >
              {label}
            </dd>
          </div>
        ))}
      </dl>

      {[
        ['Old Testament', ot],
        ['New Testament', nt],
      ].map(([label, list]) => (
        <div key={label as string} className="mt-10">
          <p
            className="mb-3 text-[0.64rem] font-semibold uppercase tracking-[0.2em]"
            style={{ fontFamily: HEADING, color: 'var(--awd-stone)' }}
          >
            {label as string}
          </p>
          <div
            className="grid gap-1.5"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 4.4rem), 1fr))' }}
          >
            {(list as BookCoverage[]).map(book => (
              <Cell key={book.slug} book={book} />
            ))}
          </div>
        </div>
      ))}

      <Link
        href="/scripture"
        className="group/sc mt-10 inline-flex items-center gap-2 rounded-full px-6 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em]"
        style={{ fontFamily: HEADING, background: 'var(--awd-gold)', color: '#171918' }}
      >
        Open the Scripture index
        <ArrowRight size={13} className="transition-transform duration-200 group-hover/sc:translate-x-0.5" />
      </Link>
    </div>
  )
}
