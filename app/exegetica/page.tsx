import type { Metadata } from 'next'
import { getShow } from '@/lib/library/queries'
import type { Piece } from '@/lib/library/types'
import ScrollReveal from '@/components/scroll-reveal'
import {
  EmptyState,
  FilterLinks,
  PieceRow,
  PropertyHero,
  SectionHeading,
  SERIF,
  STONE,
  BLACK,
  HAIRLINE,
  type FilterOption,
} from '@/components/property-index'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Exegetica',
  description: 'Scholarly exegetical studies on key biblical texts and themes.',
}

/*
  Exegetica, the index.

  The magazine furniture is gone: no ticker, no sidebar widgets, no badges
  pinned to artwork, no hand kept slug lists deciding which study belongs in
  which cluster. Fifteen studies is a small enough set to give each one a full
  row with its artwork, title, and lede.

  Data comes from Postgres. The Sanity read this page used to merge in is
  gone, since Austin is moving off Sanity.
*/

const FALLBACK_TAGLINE =
  'Close readings of biblical texts: grammar, syntax, and literary context in service of faithful interpretation.'

function newest(a: Piece, b: Piece): number {
  return (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '')
}

export default async function ExegeticaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const show = await getShow('exegetica')
  const seasonParam = (await searchParams).season
  const requested = Array.isArray(seasonParam) ? seasonParam[0] : seasonParam

  // Seasons only earn controls once there is more than one of them.
  const seasons = (show?.seasons ?? []).length > 1 ? (show?.seasons ?? []) : []
  const active = seasons.some(s => s.slug === requested) ? requested! : null

  const everything: Piece[] = [
    ...(show?.seasons ?? []).flatMap(s => s.episodes),
    ...(show?.loose ?? []),
  ]
  const pieces = (active
    ? (seasons.find(s => s.slug === active)?.episodes ?? [])
    : everything
  ).slice().sort(newest)

  const options: FilterOption[] = seasons.map(s => ({
    slug: s.slug,
    label: s.name,
    count: s.episodes.length,
  }))

  const total = show?.count ?? everything.length

  return (
    <div style={{ background: BLACK }}>
      <PropertyHero
        eyebrow="Library collection"
        name="Exegetica"
        tagline={show?.tagline ?? FALLBACK_TAGLINE}
        description={show?.description}
        meta={total === 1 ? '1 study' : `${total} studies`}
        libraryHref="/library/exegetica"
        libraryLabel="See this collection in the Library"
      />

      <section className="mx-auto max-w-[1180px] px-6 pb-28 lg:px-8 lg:pb-36">
        <ScrollReveal>
          <div className="flex flex-col gap-6">
            <SectionHeading>All studies</SectionHeading>
            <FilterLinks
              options={options}
              active={active}
              basePath="/exegetica"
              allLabel="All"
              legend="Filter Exegetica by season"
            />
            <p className="text-[0.85rem]" style={{ fontFamily: SERIF, color: STONE }}>
              {options.length
                ? `${pieces.length === 1 ? '1 study' : `${pieces.length} studies`}, newest first`
                : 'Newest first.'}
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-12">
          {pieces.length ? (
            <ul className="flex flex-col">
              {pieces.map((piece, i) => (
                <li
                  key={piece.id}
                  className={i === 0 ? 'pb-12' : 'border-t pt-12 pb-12'}
                  style={i === 0 ? undefined : { borderColor: HAIRLINE }}
                >
                  <ScrollReveal delay={i < 4 ? i * 60 : 0}>
                    <PieceRow piece={piece} priority={i < 2} />
                  </ScrollReveal>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState message="Nothing is published here yet." />
          )}
        </div>
      </section>
    </div>
  )
}
