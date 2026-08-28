import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getCanonCoverage, getPieces, getShows } from '@/lib/library/queries'
import type { Piece, Show } from '@/lib/library/types'
import ScrollReveal from '@/components/scroll-reveal'
import ChannelWall, { type WallChannel } from '@/components/library/hub/channel-wall'
import Row from '@/components/library/hub/row'
import PieceCard from '@/components/library/hub/piece-card'
import CanonMap from '@/components/library/hub/canon-map'
import { kickerFor, toCard } from '@/components/library/hub/cards'

/*
  The Library home is a chooser.

  Its only job is getting a reader to the right property. It used to answer that
  with shelves, which asked a visitor to recognise a piece before they could
  recognise a channel, and buried the four things Austin actually wants
  understood under rows of similar looking cards.

  So: one row of what is newest, for a reader who already knows the place, and
  then five bands. Each band is a channel presenting itself with its own mark,
  a sentence saying what it is, what it holds, and a way in. Depth lives on the
  channel page, which is where a reader arrives having already chosen.
*/

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Library',
  description:
    'Everything Austin W. Duncan has taught in one place: book studies, questions answered, sermons, scholarly papers and cultural commentary.',
}

const HEADING = 'var(--font-cmg), system-ui, sans-serif'

/*
  Channels with footage of their own. Encoded from Austin's uploads into muted
  loops under a megabyte and served locally, so there is no YouTube iframe and
  no player chrome over the artwork.
*/
const CHANNEL_VIDEO: Record<string, string> = {
  sermons: '/video/brand-loop.mp4',
  // No footage of its own yet, so it borrows the teaching loop, which is the
  // closest thing to what these studies are.
  'in-the-text': '/video/grow-loop.mp4',
  'word-for-word': '/video/wfw-bumper.mp4',
  // Three clips stitched into one, taken from the middle of each.
  exegetica: '/video/exegetica-loop.mp4',
  /*
    Austin's own footage as the spine with news b-roll cut in: AP Archive's
    Supreme Court exterior and the Paris opening ceremony. The inserts are taken
    down to near monochrome with a contrast lift so they read as archival
    against his colour, which is what tells a viewer which shots are his.
  */
  'forum-and-pulpit': '/video/forum-pulpit-loop.mp4',
}
const BROWSE = '/library/browse'

/** What a channel calls its pieces, so a count reads like the thing it counts. */
const UNIT: Record<string, [string, string]> = {
  'in-the-text': ['study', 'studies'],
  'word-for-word': ['question', 'questions'],
  sermons: ['sermon', 'sermons'],
  exegetica: ['paper', 'papers'],
  'forum-and-pulpit': ['essay', 'essays'],
}

function countLabel(slug: string, n: number): string {
  const [one, many] = UNIT[slug] ?? ['piece', 'pieces']
  return `${n} ${n === 1 ? one : many}`
}

export default async function LibraryHomePage() {
  const [all, shows, canon] = await Promise.all([
    getPieces({ sort: 'newest' }),
    getShows(),
    getCanonCoverage(),
  ])

  if (!all.length) {
    return (
      <div className="px-6 py-40 lg:px-10" style={{ background: 'var(--awd-black)' }}>
        <p
          className="text-[0.82rem] font-semibold uppercase tracking-[0.16em]"
          style={{ fontFamily: HEADING, color: 'var(--awd-stone)' }}
        >
          The Library is empty
        </p>
      </div>
    )
  }

  /*
    Latest takes at most two per channel. Austin's recent publishing is heavily
    one property, so a straight newest first row was the same channel four times
    and told a reader nothing about the breadth underneath.
  */
  const perChannel = new Map<number, number>()
  const latest: Piece[] = []
  for (const piece of all) {
    const key = piece.collection?.id ?? -1
    const used = perChannel.get(key) ?? 0
    if (used >= 2) continue
    perChannel.set(key, used + 1)
    latest.push(piece)
    if (latest.length === 12) break
  }
  const latestKicker = kickerFor(latest)

  const piecesOf = (show: Show) => all.filter(p => p.collection?.id === show.id)

  const wall: WallChannel[] = shows
    .map(show => {
      const mine = piecesOf(show)
      const seasons = show.seasons.filter(s => s.episodes.length)
      return {
        id: show.id,
        name: show.name,
        slug: show.slug,
        logo: show.logo,
        blurb: show.blurb,
        href: `/library/${show.slug}`,
        meta: seasons.length
          ? `${seasons.length} ${seasons.length === 1 ? 'show' : 'shows'} · ${countLabel(show.slug, mine.length)}`
          : countLabel(show.slug, mine.length),
        covers: mine.map(p => p.artwork).filter(Boolean).slice(0, 4) as string[],
        video: CHANNEL_VIDEO[show.slug] ?? null,
        accent: show.accent,
        count: mine.length,
      }
    })
    .filter(c => c.count > 0)

  return (
    /*
      Slid up under the sticky 60px nav so the page's own ground runs behind it,
      the way the homepage hero does. Without this the nav sits on whatever is
      behind the page rather than on the page itself, and its transparent at
      rest state has nothing to be transparent over.
    */
    <div className="-mt-[60px]" style={{ background: 'var(--awd-black)' }}>
      {/*
        The header has to do the explaining, because the wall below it shows
        five marks and a reader who does not already know the properties cannot
        infer what they are from a logo. So: the name, one line saying what the
        place is, and a paragraph that names all five avenues in plain words
        before a single brand appears.

        Kept deliberately tight. Every line here pushes the wall down, and the
        whole point of the wall is that all five channels clear the fold.
      */}
      {/*
        The header leads with what the place is, not what it is called.

        It used to headline THE LIBRARY, which the nav already says two inches
        above it, and then explain itself in a paragraph. The name is demoted to
        an eyebrow and the counts do the work instead, because the scale is the
        point and a number states it faster than a sentence can.

        Everything here is CMG Sans. There is no serif anywhere on this site.
      */}
      <section className="px-6 pb-9 pt-[7.5rem] lg:px-10 lg:pb-11 lg:pt-[8.25rem]">
        <div className="flex items-center gap-3">
          <span aria-hidden className="h-px w-10" style={{ background: 'var(--awd-gold)' }} />
          <span
            className="text-[0.7rem] font-semibold uppercase tracking-[0.24em]"
            style={{ fontFamily: HEADING, color: 'var(--awd-gold)' }}
          >
            The Library
          </span>
        </div>

        <div className="mt-6 flex flex-col gap-y-8 lg:flex-row lg:items-end lg:justify-between lg:gap-x-20">
          <h1
            className="min-w-0 max-w-[20ch] uppercase"
            style={{
              fontFamily: HEADING,
              fontWeight: 700,
              fontSize: 'clamp(2.1rem, 4.8vw, 3.7rem)',
              letterSpacing: '-0.025em',
              lineHeight: 0.94,
              color: 'var(--awd-bone)',
            }}
          >
            Everything I have taught, in one place
          </h1>

          <p
            className="max-w-[30rem] text-[0.95rem] leading-relaxed lg:pb-2"
            style={{ fontFamily: HEADING, fontWeight: 400, color: 'rgba(238,234,225,0.66)' }}
          >
            Five properties. Sunday preaching, book studies worked verse by verse, honest
            answers to hard questions, academic papers, and commentary on what is happening
            now.
          </p>
        </div>

        {/*
          The counts, set the way the canon map sets them, so the two sections
          of this page speak with one voice.
        */}
        <dl className="mt-11 flex flex-wrap gap-x-12 gap-y-5">
          {([
            [String(all.length), 'pieces'],
            [String(wall.length), 'properties'],
            [`${canon.filter(b => b.taught > 0).length} of ${canon.length}`, 'books of the Bible'],
            [String(canon.reduce((n, b) => n + b.taught, 0)), 'chapters taught'],
          ] as [string, string][]).map(([value, label]) => (
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
      </section>





      <section className="px-6 lg:px-10">
        <ChannelWall channels={wall} />
      </section>

      <section className="pb-20 pt-20 lg:pb-24 lg:pt-24">
        <ScrollReveal>
          <div className="mb-6 flex items-baseline justify-between gap-6 px-6 lg:px-10">
            <h2
              className="text-[0.74rem] font-semibold uppercase tracking-[0.2em]"
              style={{ fontFamily: HEADING, color: 'var(--awd-bone)' }}
            >
              Latest
            </h2>
            <Link
              href={`${BROWSE}?sort=newest`}
              className="group/see inline-flex shrink-0 items-center gap-1.5 text-[0.66rem] font-semibold uppercase tracking-[0.16em] transition-colors hover:text-[var(--awd-gold)]"
              style={{ fontFamily: HEADING, color: 'var(--awd-stone)' }}
            >
              See all
              <ArrowRight size={12} className="transition-transform duration-200 group-hover/see:translate-x-0.5" />
            </Link>
          </div>
          <Row count={latest.length}>
            {latest.map(piece => (
              <div key={piece.id} className="w-[14.5rem] shrink-0 snap-start sm:w-[16.5rem]">
                <PieceCard card={toCard(piece, latestKicker(piece))} />
              </div>
            ))}
          </Row>
        </ScrollReveal>
      </section>



      <section
        className="border-t px-6 py-20 lg:px-10 lg:py-24"
        style={{ borderColor: 'rgba(238,234,225,0.12)' }}
      >
        <CanonMap books={canon} />
      </section>

      <section
        className="border-t px-6 py-12 lg:px-10 lg:py-14"
        style={{ borderColor: 'rgba(238,234,225,0.12)' }}
      >
        <Link
          href={BROWSE}
          className="group/all inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition-colors hover:text-[var(--awd-gold)]"
          style={{ fontFamily: HEADING, color: 'var(--awd-bone)' }}
        >
          Browse all {all.length} pieces
          <ArrowRight size={14} className="transition-transform duration-200 group-hover/all:translate-x-0.5" />
        </Link>
      </section>
    </div>
  )
}
