import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ScrollReveal from '@/components/scroll-reveal'
import { getPieces, getTaxonomy } from '@/lib/library/queries'
import type { BibleBookRow } from '@/lib/library/database.types'
import ChapterGrid from '@/components/library/scripture/chapter-grid'
import { chapterCounts, labelsFor, specificity } from '@/components/library/scripture/data'
import {
  GOLD, HEADING, STONE, EmptyState, Eyebrow, Heading, Lede, Page, PieceList, Section, Stat,
} from '@/components/library/scripture/kit'

/*
  One book of the Bible.

  The chapter grid comes first, because the question a reader arrives with is
  almost always positional: what is here on chapter eight. The pieces below it
  are ordered by how tightly they are pinned to this book, so a study of a
  single verse outranks a survey that sweeps the whole letter.
*/

export const revalidate = 300

type Params = Promise<{ book: string }>

export async function generateStaticParams() {
  const { books } = await getTaxonomy()
  return books.map(b => ({ book: b.slug }))
}

async function load(slug: string): Promise<BibleBookRow | null> {
  const { books } = await getTaxonomy()
  return books.find(b => b.slug === slug) ?? null
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { book: slug } = await params
  const book = await load(slug)
  if (!book) return { title: 'Not found' }

  const pieces = await getPieces({ book: slug })
  const noun = pieces.length === 1 ? 'piece' : 'pieces'
  const description = pieces.length
    ? `${pieces.length} ${noun} of teaching from ${book.name}, indexed chapter by chapter across all ${book.chapter_count} chapters.`
    : `${book.name} has no teaching in the library yet. Browse the rest of the canon by chapter and passage.`

  return {
    title: book.name,
    description,
    alternates: { canonical: `/scripture/${book.slug}` },
    openGraph: { title: `${book.name} | Austin W. Duncan`, description, type: 'website' },
  }
}

export default async function BookPage({ params }: { params: Params }) {
  const { book: slug } = await params
  const book = await load(slug)
  if (!book) notFound()

  const { books } = await getTaxonomy()
  const pieces = await getPieces({ book: slug })
  const counts = chapterCounts(pieces, slug, book.chapter_count)
  const busiest = counts.reduce((best, n, i) => (n > counts[best] ? i : best), 0)
  const covered = counts.filter(n => n > 0).length

  const ordered = [...pieces].sort((a, b) => {
    const d = specificity(a, slug) - specificity(b, slug)
    if (d !== 0) return d
    return (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '')
  })

  const index = books.findIndex(b => b.id === book.id)
  const prev = index > 0 ? books[index - 1] : null
  const next = index < books.length - 1 ? books[index + 1] : null

  return (
    <Page>
      <Section className="pb-10 lg:pb-14">
        <ScrollReveal>
          <div
            className="mb-8 flex flex-wrap items-center gap-2 uppercase"
            style={{ fontFamily: HEADING, fontSize: '0.66rem', fontWeight: 600, letterSpacing: '0.14em', color: STONE }}
          >
            <Link href="/scripture" className="transition-colors hover:text-gold">Scripture</Link>
            <span aria-hidden style={{ opacity: 0.5 }}>/</span>
            <span style={{ color: 'rgba(238,234,225,0.75)' }}>{book.name}</span>
          </div>

          <Eyebrow>{book.testament === 'OT' ? 'Old Testament' : 'New Testament'}</Eyebrow>
          <Heading as="h1" size="xl" uppercase className="mt-6">{book.name}</Heading>

          <Lede className="mt-7">
            {pieces.length > 0
              ? `Everything in the library that touches ${book.name}, from a single verse to the whole book. Open a chapter to see why each piece matched.`
              : `Nothing in the library reaches ${book.name} yet. The chapters are listed so the gap is visible rather than hidden.`}
          </Lede>

          <div
            className="mt-12 flex flex-wrap gap-x-14 gap-y-8 border-t pt-10"
            style={{ borderColor: 'rgba(238,234,225,0.12)' }}
          >
            <Stat value={pieces.length} label={pieces.length === 1 ? 'Piece' : 'Pieces'} />
            <Stat value={book.chapter_count} label={book.chapter_count === 1 ? 'Chapter' : 'Chapters'} />
            <Stat value={`${covered} of ${book.chapter_count}`} label="Chapters touched" />
          </div>
        </ScrollReveal>
      </Section>

      <Section tight className="pt-0">
        <ScrollReveal>
          <div className="border-t pt-10" style={{ borderColor: 'rgba(238,234,225,0.12)' }}>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <Heading as="h2" size="sm" uppercase>Chapters</Heading>
              {counts[busiest] > 0 && (
                <Link
                  href={`/scripture/${book.slug}/${busiest + 1}`}
                  className="uppercase transition-colors hover:text-gold"
                  style={{ fontFamily: HEADING, fontSize: '0.66rem', fontWeight: 600, letterSpacing: '0.14em', color: STONE }}
                >
                  {`Most taught: ${book.name} ${busiest + 1}`}
                </Link>
              )}
            </div>

            <ChapterGrid
              bookSlug={book.slug}
              bookName={book.name}
              chapterCount={book.chapter_count}
              counts={counts}
            />
          </div>
        </ScrollReveal>
      </Section>

      <Section tight className="pt-0">
        <ScrollReveal>
          <div className="border-t pt-10" style={{ borderColor: 'rgba(238,234,225,0.12)' }}>
            <div className="mb-2 flex flex-wrap items-end justify-between gap-4">
              <Heading as="h2" size="sm" uppercase>{`Teaching from ${book.name}`}</Heading>
              {ordered.length > 0 && (
                <span
                  className="uppercase"
                  style={{ fontFamily: HEADING, fontSize: '0.66rem', fontWeight: 600, letterSpacing: '0.14em', color: STONE }}
                >
                  Closest reading first
                </span>
              )}
            </div>

            {ordered.length > 0 ? (
              <div className="mt-8">
                <PieceList
                  pieces={ordered}
                  dense={ordered.length > 14}
                  reasonsFor={p => labelsFor(p, slug)}
                />
              </div>
            ) : (
              <div className="mt-8">
                <EmptyState
                  title="No teaching yet"
                  body={`${book.name} is indexed and ready, but nothing in the library reaches it so far. It will appear here the moment something does.`}
                />
              </div>
            )}
          </div>
        </ScrollReveal>
      </Section>

      <Section tight className="pt-0">
        <div
          className="flex flex-wrap items-center justify-between gap-6 border-t pt-10"
          style={{ borderColor: 'rgba(238,234,225,0.12)' }}
        >
          {prev ? (
            <Link
              href={`/scripture/${prev.slug}`}
              className="group min-w-0 transition-colors"
              style={{ fontFamily: HEADING, fontSize: '0.66rem', fontWeight: 600, letterSpacing: '0.14em', color: STONE }}
            >
              <span className="uppercase" style={{ opacity: 0.7 }}>Previous</span>
              <span className="mt-2 block uppercase text-bone transition-colors group-hover:text-gold" style={{ fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
                {prev.name}
              </span>
            </Link>
          ) : <span />}

          <Link
            href="/scripture"
            className="uppercase transition-colors hover:text-gold"
            style={{ fontFamily: HEADING, fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.14em', color: GOLD }}
          >
            All books
          </Link>

          {next ? (
            <Link
              href={`/scripture/${next.slug}`}
              className="group min-w-0 text-right transition-colors"
              style={{ fontFamily: HEADING, fontSize: '0.66rem', fontWeight: 600, letterSpacing: '0.14em', color: STONE }}
            >
              <span className="uppercase" style={{ opacity: 0.7 }}>Next</span>
              <span className="mt-2 block uppercase text-bone transition-colors group-hover:text-gold" style={{ fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
                {next.name}
              </span>
            </Link>
          ) : <span />}
        </div>
      </Section>
    </Page>
  )
}
