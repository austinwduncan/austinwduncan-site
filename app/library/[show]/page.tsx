import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ScrollReveal from '@/components/scroll-reveal'
import { getShow, getShows } from '@/lib/library/queries'
import ShowHero from '@/components/library/show/show-hero'
import SeasonNav from '@/components/library/show/season-nav'
import EpisodeList from '@/components/library/show/episode-list'
import PieceGrid from '@/components/library/show/piece-grid'
import { HEADING, BODY, byNewest } from '@/components/library/show/meta'

/*
  A show page: Word for Word, In the Text, Sermons, Exegetica, Forum and Pulpit.

  The whole page is a server component. Season selection is a ?season= search
  param rather than client state, which means every season has its own URL, the
  first paint is already the right season, and there is no hydration cost for
  what is really just navigation.

  Seasons are named, never numbered, and episode numbers are global to the
  show. A season lists its episodes by their own ascending number, gaps and
  all, because the number was minted at production and typeset into the
  artwork. It is never re-derived from the grouping a piece sits in.
*/

type Params = Promise<{ show: string }>
type Search = Promise<{ [key: string]: string | string[] | undefined }>

export async function generateStaticParams() {
  const shows = await getShows()
  return shows.map(show => ({ show: show.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { show: slug } = await params
  const show = await getShow(slug)
  if (!show) return { title: 'Not found' }

  const description =
    show.tagline ??
    show.description ??
    `${show.count} pieces from ${show.name}, in the library of Austin W. Duncan.`

  const seasonNote = show.seasons.length
    ? ` ${show.seasons.length} seasons, ${show.count} episodes.`
    : ` ${show.count} pieces.`

  return {
    title: show.name,
    description: `${description}${seasonNote}`,
    alternates: { canonical: `/library/${show.slug}` },
    openGraph: {
      type: 'website',
      title: `${show.name} | Austin W. Duncan`,
      description,
      url: `/library/${show.slug}`,
      ...(show.artwork?.startsWith('http') ? { images: [{ url: show.artwork }] } : {}),
    },
  }
}

export default async function ShowPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: Search
}) {
  const { show: slug } = await params
  const show = await getShow(slug)
  if (!show) notFound()

  const query = await searchParams
  const requested = Array.isArray(query.season) ? query.season[0] : query.season

  // An unknown or missing season falls back to the first one rather than
  // 404ing, so a stale link still lands somewhere useful.
  const active = show.seasons.find(s => s.slug === requested) ?? show.seasons[0] ?? null
  const loose = [...show.loose].sort(byNewest)

  return (
    <div style={{ background: 'var(--awd-black)' }}>
      <ShowHero show={show} />

      <section className="mx-auto max-w-[1180px] px-6 py-28 lg:px-8 lg:py-36">
        {active ? (
          <>
            {/* The season menu is a stacking context of its own, so it needs an
                explicit z-index to open over the episode list below it. */}
            <ScrollReveal className="relative z-30">
              <SeasonNav showSlug={show.slug} seasons={show.seasons} activeSlug={active.slug} />
            </ScrollReveal>

            <ScrollReveal delay={60} className="relative z-0">
              <EpisodeList season={active} />
            </ScrollReveal>

            {loose.length > 0 && (
              <ScrollReveal className="mt-28 lg:mt-36">
                <PieceGrid
                  pieces={loose}
                  heading="Outside the seasons"
                  note="Standalone episodes that belong to the show but not to any of its runs."
                />
              </ScrollReveal>
            )}
          </>
        ) : loose.length > 0 ? (
          <ScrollReveal>
            <PieceGrid pieces={loose} heading="Every piece, newest first" lead />
          </ScrollReveal>
        ) : (
          <p
            className="text-[1.05rem] leading-relaxed"
            style={{ fontFamily: BODY, color: 'rgba(238,234,225,0.6)' }}
          >
            Nothing is published in this show yet.{' '}
            <span style={{ fontFamily: HEADING, fontWeight: 600, color: 'var(--awd-gold)' }}>
              Check back soon.
            </span>
          </p>
        )}
      </section>
    </div>
  )
}
