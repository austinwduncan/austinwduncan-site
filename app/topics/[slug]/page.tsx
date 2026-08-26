import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ScrollReveal from '@/components/scroll-reveal'
import { getPieces, getTaxonomy } from '@/lib/library/queries'
import type { TopicRow } from '@/lib/library/database.types'
import {
  GOLD, HEADING, SERIF, STONE, EmptyState, Eyebrow, Heading, Lede, Page, PieceList, Section, Stat,
} from '@/components/library/scripture/kit'

/*
  One topic.

  A topic here can hold a single study or a hundred and twelve, so the page is
  built from ruled rows rather than a card grid: one row reads as a deliberate
  single entry, a hundred rows read as a body of work, and neither leaves a
  lonely tile stranded in white space.

  Parent and child topics appear when the taxonomy has them. No topic carries a
  parent yet, so the section stays out of the way until one does, and the
  neighbouring topics strip below is what actually carries a thin page.
*/

export const revalidate = 300

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  const { topics } = await getTaxonomy()
  return topics.map(t => ({ slug: t.slug }))
}

async function load(slug: string): Promise<TopicRow | null> {
  const { topics } = await getTaxonomy()
  return (topics as TopicRow[]).find(t => t.slug === slug) ?? null
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const topic = await load(slug)
  if (!topic) return { title: 'Not found' }

  const pieces = await getPieces({ topic: slug })
  const noun = pieces.length === 1 ? 'piece' : 'pieces'
  const description =
    topic.description ??
    `${pieces.length} ${noun} on ${topic.name.toLowerCase()} from Austin W. Duncan: sermons, studies and articles gathered by theme.`

  return {
    title: topic.name,
    description,
    alternates: { canonical: `/topics/${topic.slug}` },
    openGraph: { title: `${topic.name} | Austin W. Duncan`, description, type: 'website' },
  }
}

export default async function TopicPage({ params }: { params: Params }) {
  const { slug } = await params
  const topic = await load(slug)
  if (!topic) notFound()

  const { topics } = await getTaxonomy()
  const all = topics as TopicRow[]
  const parent = topic.parent_id ? all.find(t => t.id === topic.parent_id) ?? null : null
  const children = all.filter(t => t.parent_id === topic.id)

  const pieces = await getPieces({ topic: slug })

  // Topics that keep company with this one, tallied from the pieces already in
  // hand. On a single piece topic this is the section that carries the page.
  const company = new Map<number, { name: string; slug: string; n: number }>()
  for (const piece of pieces) {
    for (const t of piece.topics) {
      if (t.id === topic.id) continue
      const seen = company.get(t.id)
      if (seen) seen.n += 1
      else company.set(t.id, { name: t.name, slug: t.slug, n: 1 })
    }
  }
  const alongside = [...company.values()].sort((a, b) => b.n - a.n).slice(0, 10)

  const books = new Map<string, { name: string; slug: string; n: number }>()
  for (const piece of pieces) {
    const seen = new Set<string>()
    for (const ref of piece.scripture) {
      if (seen.has(ref.bookSlug)) continue
      seen.add(ref.bookSlug)
      const row = books.get(ref.bookSlug)
      if (row) row.n += 1
      else books.set(ref.bookSlug, { name: ref.book, slug: ref.bookSlug, n: 1 })
    }
  }
  const topBooks = [...books.values()].sort((a, b) => b.n - a.n).slice(0, 6)

  return (
    <Page>
      <Section className="pb-10 lg:pb-14">
        <ScrollReveal>
          <div
            className="mb-8 flex flex-wrap items-center gap-2 uppercase"
            style={{ fontFamily: HEADING, fontSize: '0.66rem', fontWeight: 600, letterSpacing: '0.14em', color: STONE }}
          >
            <Link href="/topics" className="transition-colors hover:text-gold">Topics</Link>
            {parent && (
              <>
                <span aria-hidden style={{ opacity: 0.5 }}>/</span>
                <Link href={`/topics/${parent.slug}`} className="transition-colors hover:text-gold">
                  {parent.name}
                </Link>
              </>
            )}
            <span aria-hidden style={{ opacity: 0.5 }}>/</span>
            <span style={{ color: 'rgba(238,234,225,0.75)' }}>{topic.name}</span>
          </div>

          <Eyebrow>Topic</Eyebrow>
          {/* Topic names are dynamic and can run long, so they are never
              uppercased. Only static labels and book names are. */}
          <Heading as="h1" size="lg" className="mt-6">{topic.name}</Heading>

          {topic.description ? (
            <Lede className="mt-7">{topic.description}</Lede>
          ) : (
            <Lede className="mt-7">
              {pieces.length === 1
                ? `One piece in the library is gathered under this theme.`
                : `${pieces.length} pieces in the library are gathered under this theme, across sermons, studies and written work.`}
            </Lede>
          )}

          <div
            className="mt-12 flex flex-wrap gap-x-14 gap-y-8 border-t pt-10"
            style={{ borderColor: 'rgba(238,234,225,0.12)' }}
          >
            <Stat value={pieces.length} label={pieces.length === 1 ? 'Piece' : 'Pieces'} />
            <Stat value={books.size} label={books.size === 1 ? 'Book of the Bible' : 'Books of the Bible'} />
            <Stat value={alongside.length} label="Neighbouring topics" />
          </div>

          {children.length > 0 && (
            <div className="mt-10">
              <div
                className="mb-4 uppercase"
                style={{ fontFamily: HEADING, fontSize: '0.66rem', fontWeight: 600, letterSpacing: '0.14em', color: STONE }}
              >
                Within this topic
              </div>
              <div className="flex flex-wrap gap-2">
                {children.map(c => (
                  <Link
                    key={c.id}
                    href={`/topics/${c.slug}`}
                    className="rounded-[2px] border px-3 py-1.5 transition-colors hover:text-gold"
                    style={{ borderColor: 'rgba(238,234,225,0.16)', fontFamily: HEADING, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em', color: 'rgba(238,234,225,0.75)' }}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </ScrollReveal>
      </Section>

      <Section tight className="pt-0">
        <ScrollReveal>
          <div className="border-t pt-10" style={{ borderColor: 'rgba(238,234,225,0.12)' }}>
            <div className="mb-2 flex flex-wrap items-end justify-between gap-4">
              <Heading as="h2" size="sm" uppercase>
                {pieces.length === 1 ? 'The piece' : 'The pieces'}
              </Heading>
              {pieces.length > 1 && (
                <span
                  className="uppercase"
                  style={{ fontFamily: HEADING, fontSize: '0.66rem', fontWeight: 600, letterSpacing: '0.14em', color: STONE }}
                >
                  Newest first
                </span>
              )}
            </div>

            {pieces.length > 0 ? (
              <div className="mt-8">
                <PieceList
                  pieces={pieces}
                  dense={pieces.length > 14}
                  reasonsFor={p => p.scripture.filter(s => s.isPrimary).slice(0, 2).map(s => s.label)}
                />
              </div>
            ) : (
              <div className="mt-8">
                <EmptyState
                  title="Nothing filed here yet"
                  body="This theme exists in the taxonomy but nothing has been gathered under it so far."
                />
              </div>
            )}
          </div>
        </ScrollReveal>
      </Section>

      {(topBooks.length > 0 || alongside.length > 0) && (
        <Section tight className="pt-0">
          <ScrollReveal>
            <div
              className="grid gap-12 border-t pt-10 lg:grid-cols-2"
              style={{ borderColor: 'rgba(238,234,225,0.12)' }}
            >
              {topBooks.length > 0 && (
                <div className="min-w-0">
                  <Heading as="h2" size="sm" uppercase>Where it lands in Scripture</Heading>
                  <p
                    className="mt-3"
                    style={{ fontFamily: SERIF, fontSize: '0.96rem', lineHeight: 1.65, color: 'rgba(238,234,225,0.55)' }}
                  >
                    The books this theme is taught from most often.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {topBooks.map(b => (
                      <Link
                        key={b.slug}
                        href={`/scripture/${b.slug}`}
                        className="group rounded-[2px] border px-3 py-1.5 uppercase transition-colors"
                        style={{ borderColor: 'rgba(205,176,121,0.3)', fontFamily: HEADING, fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(238,234,225,0.8)' }}
                      >
                        {b.name}
                        <span className="ml-2" style={{ color: GOLD, fontVariantNumeric: 'tabular-nums' }}>{b.n}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {alongside.length > 0 && (
                <div className="min-w-0">
                  <Heading as="h2" size="sm" uppercase>Taught alongside</Heading>
                  <p
                    className="mt-3"
                    style={{ fontFamily: SERIF, fontSize: '0.96rem', lineHeight: 1.65, color: 'rgba(238,234,225,0.55)' }}
                  >
                    Themes that keep company with this one.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {alongside.map(t => (
                      <Link
                        key={t.slug}
                        href={`/topics/${t.slug}`}
                        className="rounded-[2px] border px-3 py-1.5 transition-colors hover:text-gold"
                        style={{ borderColor: 'rgba(238,234,225,0.14)', fontFamily: HEADING, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em', color: 'rgba(238,234,225,0.72)' }}
                      >
                        {t.name}
                        <span className="ml-2" style={{ color: STONE, fontVariantNumeric: 'tabular-nums' }}>{t.n}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollReveal>
        </Section>
      )}
    </Page>
  )
}
