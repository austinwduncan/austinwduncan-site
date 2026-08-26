import type { Metadata } from 'next'
import Link from 'next/link'
import ScrollReveal from '@/components/scroll-reveal'
import { getBookCoverage, type BookCount } from '@/components/library/scripture/data'
import {
  BONE, GOLD, HEADING, SERIF, STONE, Eyebrow, Heading, Lede, Page, Section, Stat,
} from '@/components/library/scripture/kit'

/*
  The canon as an index.

  Every book is present, in canonical order, whether or not anything has been
  taught from it. A book with no teaching is not hidden and is not styled to
  look broken: it keeps its frame, loses its link, and says so plainly.
*/

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const { piecesWithScripture, booksCovered, books } = await getBookCoverage()
  return {
    title: 'Scripture',
    description:
      `Everything Austin W. Duncan has taught, entered through the text. ${piecesWithScripture} pieces across ${booksCovered} of ${books.length} books of the Bible.`,
    alternates: { canonical: '/scripture' },
    openGraph: {
      title: 'Scripture | Austin W. Duncan',
      description: `${piecesWithScripture} pieces of teaching, indexed by book, chapter and passage.`,
      type: 'website',
    },
  }
}

function BookTile({ entry }: { entry: BookCount }) {
  const { book, count } = entry
  const noun = count === 1 ? 'piece' : 'pieces'

  const frame = 'relative flex min-w-0 flex-col justify-between rounded-[3px] border px-5 py-5'

  if (count === 0) {
    return (
      <div
        className={frame}
        style={{ borderColor: 'rgba(238,234,225,0.07)', background: 'transparent' }}
      >
        <Heading as="h3" size="xs" uppercase color="rgba(238,234,225,0.42)" className="break-words">
          {book.name}
        </Heading>
        <div
          className="mt-6 uppercase"
          style={{ fontFamily: HEADING, fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.14em', color: 'rgba(170,167,158,0.55)' }}
        >
          Nothing yet
        </div>
      </div>
    )
  }

  return (
    <Link
      href={`/scripture/${book.slug}`}
      className={`group ${frame} transition-colors`}
      style={{ borderColor: 'rgba(238,234,225,0.13)', background: 'rgba(238,234,225,0.02)' }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[3px] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(205,176,121,0.7)' }}
      />
      <span className="block text-bone transition-colors group-hover:text-gold">
        <Heading as="h3" size="xs" uppercase color="currentColor" className="break-words">
          {book.name}
        </Heading>
      </span>
      <div className="mt-6 flex items-baseline justify-between gap-3">
        <span
          style={{ fontFamily: HEADING, fontSize: '0.95rem', fontWeight: 700, letterSpacing: '-0.02em', color: GOLD, fontVariantNumeric: 'tabular-nums' }}
        >
          {count}
          <span
            className="ml-1.5 uppercase"
            style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.14em', color: STONE }}
          >
            {noun}
          </span>
        </span>
        <span
          className="uppercase"
          style={{ fontFamily: HEADING, fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.14em', color: 'rgba(170,167,158,0.7)', fontVariantNumeric: 'tabular-nums' }}
        >
          {book.chapter_count === 1 ? '1 ch' : `${book.chapter_count} ch`}
        </span>
      </div>
    </Link>
  )
}

function Testament({
  label,
  note,
  entries,
}: {
  label: string
  note: string
  entries: BookCount[]
}) {
  const taught = entries.filter(e => e.count > 0).length
  return (
    <ScrollReveal>
      <div className="border-t pt-10" style={{ borderColor: 'rgba(238,234,225,0.12)' }}>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <Heading as="h2" size="md" uppercase>{label}</Heading>
            <p
              className="mt-2"
              style={{ fontFamily: SERIF, fontSize: '0.98rem', lineHeight: 1.6, color: 'rgba(238,234,225,0.55)' }}
            >
              {note}
            </p>
          </div>
          <div
            className="uppercase"
            style={{ fontFamily: HEADING, fontSize: '0.66rem', fontWeight: 600, letterSpacing: '0.14em', color: STONE }}
          >
            {`${taught} of ${entries.length} books taught`}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gap: '0.7rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 13rem), 1fr))',
          }}
        >
          {entries.map(entry => (
            <BookTile key={entry.book.id} entry={entry} />
          ))}
        </div>
      </div>
    </ScrollReveal>
  )
}

export default async function ScripturePage() {
  const { books, piecesWithScripture, booksCovered } = await getBookCoverage()

  const ot = books.filter(b => b.book.testament === 'OT')
  const nt = books.filter(b => b.book.testament === 'NT')
  const chapters = books.reduce((a, b) => a + b.book.chapter_count, 0)

  return (
    <Page>
      <Section className="pb-10 lg:pb-14">
        <ScrollReveal>
          <Eyebrow>The Library</Eyebrow>
          <Heading as="h1" size="xl" uppercase className="mt-6">Scripture</Heading>
          <Lede className="mt-7">
            Everything Austin has taught, entered through the text itself rather than
            through a series title or a date. Choose a book, then a chapter, and see
            every sermon, study and article that touches it.
          </Lede>

          <div
            className="mt-12 flex flex-wrap gap-x-14 gap-y-8 border-t pt-10"
            style={{ borderColor: 'rgba(238,234,225,0.12)' }}
          >
            <Stat value={piecesWithScripture} label="Pieces in the text" />
            <Stat value={`${booksCovered} of ${books.length}`} label="Books taught" />
            <Stat value={chapters} label="Chapters indexed" />
          </div>
        </ScrollReveal>
      </Section>

      <Section tight className="pt-0">
        <div className="flex flex-col gap-16">
          <Testament
            label="Old Testament"
            note="Law, history, wisdom and the prophets."
            entries={ot}
          />
          <Testament
            label="New Testament"
            note="Gospels, Acts, the letters and Revelation."
            entries={nt}
          />
        </div>
      </Section>

      <Section tight className="pt-0">
        <ScrollReveal>
          <div
            className="flex flex-wrap items-center justify-between gap-6 border-t pt-10"
            style={{ borderColor: 'rgba(238,234,225,0.12)' }}
          >
            <p style={{ fontFamily: SERIF, fontSize: '1rem', lineHeight: 1.7, color: 'rgba(238,234,225,0.6)' }}>
              Looking for a theme rather than a passage?
            </p>
            <Link
              href="/topics"
              className="group inline-flex items-center gap-3 border px-6 py-3 transition-colors"
              style={{ borderColor: 'rgba(205,176,121,0.45)', color: GOLD, fontFamily: HEADING, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.14em' }}
            >
              <span className="uppercase">Browse topics</span>
              <span aria-hidden style={{ color: BONE }}>&rarr;</span>
            </Link>
          </div>
        </ScrollReveal>
      </Section>
    </Page>
  )
}
