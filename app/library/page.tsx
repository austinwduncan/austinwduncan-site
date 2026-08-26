import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getPieces, getShows, getTaxonomy } from '@/lib/library/queries'
import type { Piece } from '@/lib/library/types'
import ScrollReveal from '@/components/scroll-reveal'
import Billboard from '@/components/library/hub/billboard'
import Shelf, { type ShelfProps } from '@/components/library/hub/shelf'
import { kickerFor, toCard } from '@/components/library/hub/cards'

/*
  The Library home.

  Everything Austin has taught, entered the way a streaming home is entered: a
  billboard, then shelves. The collections keep their names but they are one
  row among several, not the spine, which is why a topic row and a depth row
  sit alongside them.

  One read of the whole set feeds every row. getPieces and getShows are both
  wrapped in React cache and getShows asks for the same newest sorted set, so
  the three awaits below collapse into a single trip and every grouping after
  that is done in memory.
*/

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Library',
  description:
    'Everything Austin W. Duncan has taught in one place: sermons, book studies, questions answered, scholarly papers and cultural commentary.',
}

/** Cards per row. Enough to feel deep, short enough to stay cheap. */
const ROW = 24

const BROWSE = '/library/browse'

export default async function LibraryHomePage() {
  const [all, shows, tax] = await Promise.all([
    getPieces({ sort: 'newest' }),
    getShows(),
    getTaxonomy(),
  ])

  if (!all.length) {
    return (
      <div className="px-6 py-40 lg:px-10" style={{ background: 'var(--awd-black)' }}>
        <p
          className="text-[0.82rem] font-semibold uppercase tracking-[0.16em]"
          style={{ fontFamily: 'var(--font-cmg), system-ui, sans-serif', color: 'var(--awd-stone)' }}
        >
          The Library is empty
        </p>
      </div>
    )
  }

  // The billboard needs artwork to be a billboard, and something to say.
  const featured =
    all.find(p => p.artwork && (p.subtitle || p.summary)) ?? all.find(p => p.artwork) ?? all[0]

  const shelves: ShelfProps[] = []

  // ── Latest across everything ──────────────────────────────────────────────
  // The featured piece is already the top of the page, so it is not repeated
  // immediately underneath itself.
  /*
    Latest takes at most two per show. Austin's recent publishing is almost all
    one collection, so a straight newest-first row was four In the Text pieces
    that then repeated in the In the Text row directly beneath it. Capping per
    show makes the row say what it means: the newest thing across everything.
  */
  const perShow = new Map<number, number>()
  const latest: Piece[] = []
  for (const p of all) {
    if (p.id === featured.id) continue
    const key = p.collection?.id ?? -1
    const used = perShow.get(key) ?? 0
    if (used >= 2) continue
    perShow.set(key, used + 1)
    latest.push(p)
    if (latest.length === ROW) break
  }
  const latestKicker = kickerFor(latest)

  shelves.push({
    title: 'Latest',
    cards: latest.map(p => toCard(p, latestKicker(p))),
    seeAllHref: `${BROWSE}?sort=newest`,
    seeAllLabel: 'See all',
    total: all.length,
  })

  // ── One row per show ──────────────────────────────────────────────────────
  // The heading goes to the show itself, the See all goes to the same set
  // inside the browse view, so both routes into a collection are available.
  for (const show of shows) {
    const mine = all.filter(p => p.collection?.id === show.id)
    if (!mine.length) continue
    const row = mine.slice(0, ROW)
    const kicker = kickerFor(row)
    shelves.push({
      title: show.name,
      cards: row.map(p => toCard(p, kicker(p))),
      titleHref: `/library/${show.slug}`,
      seeAllHref: `${BROWSE}?collection=${show.slug}`,
      seeAllLabel: 'See all',
      total: mine.length,
    })
  }

  // ── Start here ────────────────────────────────────────────────────────────
  // Levels are ordered by depth, so the first row is the shallowest one.
  const shallowest = tax.levels[0]
  const startHere: Piece[] = shallowest
    ? all.filter(p => p.level?.slug === shallowest.slug)
    : []
  if (startHere.length) {
    shelves.push({
      title: 'Start here',
      cards: (() => { const r = startHere.slice(0, ROW); const k = kickerFor(r); return r.map(p => toCard(p, k(p))) })(),
      seeAllHref: `${BROWSE}?level=${shallowest.slug}`,
      seeAllLabel: 'See all',
      total: startHere.length,
    })
  } else {
    /*
      Depth has not been assigned yet: the import carried format, collection
      and scripture across but the level column is still filling in during
      enrichment. Rather than drop the on ramp entirely, the shortest reads
      stand in for it, which is the same promise the row is making. Once
      levels land, the branch above takes over on its own.
    */
    const shortest = all
      .filter(p => p.readingMinutes != null && p.artwork)
      .sort((a, b) => (a.readingMinutes ?? 0) - (b.readingMinutes ?? 0))
      .slice(0, ROW)
    if (shortest.length) {
      shelves.push({
        title: 'Start here',
        cards: (() => { const r = shortest; const k = kickerFor(r); return r.map(p => toCard(p, k(p))) })(),
        seeAllHref: `${BROWSE}?sort=newest`,
        seeAllLabel: 'See all',
      })
    }
  }

  // ── The largest topics ────────────────────────────────────────────────────
  // Topics came out of the content itself, so a few of them still shadow a
  // collection or a series name. Those are dropped: a topic row that is just
  // a show row again teaches the reader nothing.
  const shadowed = new Set<string>([
    ...tax.collections.map(c => c.slug),
    ...tax.series.map(s => s.slug),
  ])
  const topicCounts = new Map<string, { name: string; slug: string; n: number }>()
  for (const p of all) {
    for (const t of p.topics) {
      if (shadowed.has(t.slug)) continue
      const seen = topicCounts.get(t.slug)
      if (seen) seen.n += 1
      else topicCounts.set(t.slug, { name: t.name, slug: t.slug, n: 1 })
    }
  }
  const biggest = [...topicCounts.values()].filter(t => t.n >= 5).sort((a, b) => b.n - a.n).slice(0, 2)
  for (const topic of biggest) {
    const mine = all.filter(p => p.topics.some(t => t.slug === topic.slug))
    shelves.push({
      title: topic.name,
      cards: (() => { const r = mine.slice(0, ROW); const k = kickerFor(r); return r.map(p => toCard(p, k(p))) })(),
      seeAllHref: `${BROWSE}?topic=${topic.slug}`,
      seeAllLabel: 'See all',
      total: mine.length,
    })
  }

  return (
    <div style={{ background: 'var(--awd-black)' }}>
      <Billboard piece={featured} pieceCount={all.length} showCount={shows.filter(s => s.count).length} />

      {/*
        The billboard already carries its own bottom padding, so the shelves
        open a little tighter than the house py-28 and still close on it.
      */}
      <div className="pb-28 pt-16 lg:pb-36 lg:pt-20">
        {shelves.map((shelf, i) => (
          <ScrollReveal key={`${shelf.title}-${shelf.seeAllHref}`} delay={i === 0 ? 0 : 60}>
            <Shelf {...shelf} />
          </ScrollReveal>
        ))}

        <div className="mt-20 px-6 lg:px-10">
          <div className="h-px w-full" style={{ background: 'rgba(238,234,225,0.1)' }} />
          <Link
            href={BROWSE}
            className="mt-8 inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] transition-colors hover:text-[var(--awd-gold)]"
            style={{ fontFamily: 'var(--font-cmg), system-ui, sans-serif', color: 'var(--awd-bone)' }}
          >
            Browse everything
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
