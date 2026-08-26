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
  title: 'Forum and Pulpit',
  description: 'Essays on the church, culture, and Christian public witness.',
}

/*
  Forum & Pulpit, the index.

  Retired here: the breaking news ticker top and bottom, the front page
  primary plus secondary newspaper block, the right hand sidebar with its
  About, Topics, and All Essays widgets, and the section carousel with its
  hand kept slug lists. That layout also shipped the sidebar plus grid bug
  that scrolled the page sideways.

  Eight essays now get eight full rows, read from Postgres. The Sanity read is
  gone with the rest.
*/

const FALLBACK_TAGLINE =
  'Christian witness in the public square: church, culture, and the moments that demand a response.'

function newest(a: Piece, b: Piece): number {
  return (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '')
}

export default async function ForumAndPulpitPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const show = await getShow('forum-and-pulpit')
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
        name="Forum & Pulpit"
        tagline={show?.tagline ?? FALLBACK_TAGLINE}
        description={show?.description}
        meta={total === 1 ? '1 essay' : `${total} essays`}
        libraryHref="/library/forum-and-pulpit"
        libraryLabel="See this collection in the Library"
      />

      <section className="mx-auto max-w-[1180px] px-6 pb-28 lg:px-8 lg:pb-36">
        <ScrollReveal>
          <div className="flex flex-col gap-6">
            <SectionHeading>All essays</SectionHeading>
            <FilterLinks
              options={options}
              active={active}
              basePath="/forum-and-pulpit"
              allLabel="All"
              legend="Filter Forum and Pulpit by season"
            />
            <p className="text-[0.85rem]" style={{ fontFamily: SERIF, color: STONE }}>
              {options.length
                ? `${pieces.length === 1 ? '1 essay' : `${pieces.length} essays`}, newest first`
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
