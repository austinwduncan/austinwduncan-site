import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ScrollReveal from '@/components/scroll-reveal'
import { getPieces, getTaxonomy } from '@/lib/library/queries'
import type { BibleBookRow } from '@/lib/library/database.types'
import { labelsFor, specificity } from '@/components/library/scripture/data'
import {
  GOLD, HEADING, STONE, EmptyState, Eyebrow, Heading, Lede, Page, PieceList, Section,
} from '@/components/library/scripture/kit'

/*
  One chapter.

  This is the page that answers "what have you taught on Romans 8". Every row
  carries the exact reference that matched, so a reader can see whether a piece
  expounds the chapter or only passes through it. A reference is a closed
  interval, so a survey of the whole letter honestly appears here too, labelled
  as what it is.

  Chapters are rendered on demand rather than prebuilt. There are 1,189 of them
  and the range query behind each one is index backed, so prebuilding buys
  nothing.
*/

export const revalidate = 300

type Params = Promise<{ book: string; chapter: string }>

async function load(slug: string): Promise<BibleBookRow | null> {
  const { books } = await getTaxonomy()
  return books.find(b => b.slug === slug) ?? null
}

function parseChapter(raw: string, book: BibleBookRow): number | null {
  if (!/^[0-9]+$/.test(raw)) return null
  const n = Number(raw)
  if (!Number.isInteger(n) || n < 1 || n > book.chapter_count) return null
  return n
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { book: slug, chapter: raw } = await params
  const book = await load(slug)
  if (!book) return { title: 'Not found' }
  const chapter = parseChapter(raw, book)
  if (chapter === null) return { title: 'Not found' }

  const pieces = await getPieces({ book: slug, chapter })
  const title = `${book.name} ${chapter}`
  const noun = pieces.length === 1 ? 'piece' : 'pieces'
  const description = pieces.length
    ? `${pieces.length} ${noun} of teaching that touch ${title}, each shown with the passage that matched.`
    : `Nothing in the library touches ${title} yet.`

  return {
    title,
    description,
    alternates: { canonical: `/scripture/${book.slug}/${chapter}` },
    openGraph: { title: `${title} | Austin W. Duncan`, description, type: 'website' },
  }
}

export default async function ChapterPage({ params }: { params: Params }) {
  const { book: slug, chapter: raw } = await params
  const book = await load(slug)
  if (!book) notFound()

  const chapter = parseChapter(raw, book)
  if (chapter === null) notFound()

  const pieces = await getPieces({ book: slug, chapter })

  const ordered = [...pieces].sort((a, b) => {
    const d = specificity(a, slug) - specificity(b, slug)
    if (d !== 0) return d
    return (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '')
  })

  const prev = chapter > 1 ? chapter - 1 : null
  const next = chapter < book.chapter_count ? chapter + 1 : null

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
            <Link href={`/scripture/${book.slug}`} className="transition-colors hover:text-gold">{book.name}</Link>
            <span aria-hidden style={{ opacity: 0.5 }}>/</span>
            <span style={{ color: 'rgba(238,234,225,0.75)' }}>{chapter}</span>
          </div>

          <Eyebrow>{`Chapter ${chapter} of ${book.chapter_count}`}</Eyebrow>
          <Heading as="h1" size="xl" uppercase className="mt-6">
            {`${book.name} ${chapter}`}
          </Heading>

          <Lede className="mt-7">
            {ordered.length > 0
              ? `${ordered.length} ${ordered.length === 1 ? 'piece' : 'pieces'} in the library reach this chapter. The passage beside each one is the reference that matched.`
              : `Nothing in the library reaches this chapter yet.`}
          </Lede>
        </ScrollReveal>
      </Section>

      <Section tight className="pt-0">
        <ScrollReveal>
          <div className="border-t pt-10" style={{ borderColor: 'rgba(238,234,225,0.12)' }}>
            {ordered.length > 0 ? (
              <PieceList
                pieces={ordered}
                dense={ordered.length > 14}
                reasonsFor={p => labelsFor(p, slug, chapter)}
              />
            ) : (
              <EmptyState
                title="Nothing here yet"
                body={`No sermon, study or article in the library touches ${book.name} ${chapter}. Try a neighbouring chapter, or read the book from the top.`}
              />
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
              href={`/scripture/${book.slug}/${prev}`}
              className="group uppercase transition-colors"
              style={{ fontFamily: HEADING, fontSize: '0.66rem', fontWeight: 600, letterSpacing: '0.14em', color: STONE }}
            >
              <span style={{ opacity: 0.7 }}>Previous</span>
              <span className="mt-2 block text-bone transition-colors group-hover:text-gold" style={{ fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
                {`${book.name} ${prev}`}
              </span>
            </Link>
          ) : <span />}

          <Link
            href={`/scripture/${book.slug}`}
            className="uppercase transition-colors hover:text-gold"
            style={{ fontFamily: HEADING, fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.14em', color: GOLD }}
          >
            {`All of ${book.name}`}
          </Link>

          {next ? (
            <Link
              href={`/scripture/${book.slug}/${next}`}
              className="group text-right uppercase transition-colors"
              style={{ fontFamily: HEADING, fontSize: '0.66rem', fontWeight: 600, letterSpacing: '0.14em', color: STONE }}
            >
              <span style={{ opacity: 0.7 }}>Next</span>
              <span className="mt-2 block text-bone transition-colors group-hover:text-gold" style={{ fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
                {`${book.name} ${next}`}
              </span>
            </Link>
          ) : <span />}
        </div>
      </Section>
    </Page>
  )
}
