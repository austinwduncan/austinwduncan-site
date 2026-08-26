import type { Metadata } from 'next'
import { getShow } from '@/lib/library/queries'
import type { Piece } from '@/lib/library/types'
import ScrollReveal from '@/components/scroll-reveal'
import {
  EmptyState,
  FilterLinks,
  PieceCard,
  PieceGrid,
  PropertyHero,
  SectionHeading,
  SERIF,
  STONE,
  BLACK,
  type FilterOption,
} from '@/components/property-index'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Word for Word',
  description: 'Clear answers to common questions about the Christian faith.',
}

/*
  Word for Word, the index.

  This route used to be a WordPress magazine clone: a trending ticker, a
  popular posts sidebar, category badges pinned to the corner of every image,
  and a mosaic of card grids. All of it is gone.

  What is here now is the show: a hero with a real count, the eight named
  seasons as honest filter links, and one grid of episodes. Season and episode
  come from Postgres, which is the source of truth. The Sanity read that used
  to merge into the MDX list is gone with it.

  The richer season by season experience lives at /library/word-for-word. This
  page points at it rather than duplicating it.
*/

const FALLBACK_TAGLINE = 'Clear answers to common questions about the Christian faith.'

// Newest first. Episode numbers are global and canonical, so they sort the
// show correctly even where a publish date is missing.
function newestFirst(a: Piece, b: Piece): number {
  if (a.episode != null && b.episode != null) return b.episode - a.episode
  return (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '')
}

export default async function WordForWordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const show = await getShow('word-for-word')
  const seasonParam = (await searchParams).season
  const requested = Array.isArray(seasonParam) ? seasonParam[0] : seasonParam

  const seasons = show?.seasons ?? []
  const active = seasons.some(s => s.slug === requested) ? requested! : null

  const seasonOf = new Map<string, string>()
  for (const season of seasons) {
    for (const episode of season.episodes) seasonOf.set(episode.id, season.name)
  }

  const everything: Piece[] = [...seasons.flatMap(s => s.episodes), ...(show?.loose ?? [])]
  const pieces = (active
    ? (seasons.find(s => s.slug === active)?.episodes ?? [])
    : everything
  ).slice().sort(newestFirst)

  const options: FilterOption[] = seasons.map(s => ({
    slug: s.slug,
    label: s.name,
    count: s.episodes.length,
  }))

  const total = show?.count ?? everything.length
  const meta = seasons.length
    ? `${total} episodes across ${seasons.length} seasons`
    : `${total} episodes`

  return (
    <div style={{ background: BLACK }}>
      <PropertyHero
        eyebrow="Library collection"
        name="Word for Word"
        tagline={show?.tagline ?? FALLBACK_TAGLINE}
        description={show?.description}
        meta={meta}
        libraryHref="/library/word-for-word"
        libraryLabel="Browse season by season in the Library"
      />

      <section className="mx-auto max-w-[1180px] px-6 pb-28 lg:px-8 lg:pb-36">
        <ScrollReveal>
          <div className="flex flex-col gap-6">
            <SectionHeading>Every episode</SectionHeading>
            <FilterLinks
              options={options}
              active={active}
              basePath="/word-for-word"
              allLabel="All"
              legend="Filter Word for Word by season"
            />
            <p className="text-[0.85rem]" style={{ fontFamily: SERIF, color: STONE }}>
              {pieces.length === 1 ? '1 episode' : `${pieces.length} episodes`}
              {active ? ' in this season' : ', newest first'}
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-12">
          {pieces.length ? (
            <ScrollReveal delay={80}>
              <PieceGrid>
                {pieces.map((piece, i) => (
                  <PieceCard
                    key={piece.id}
                    piece={piece}
                    kicker={seasonOf.get(piece.id) ?? null}
                    priority={i < 4}
                  />
                ))}
              </PieceGrid>
            </ScrollReveal>
          ) : (
            <EmptyState message="Nothing is published in this season yet." />
          )}
        </div>
      </section>
    </div>
  )
}
