import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getPieces, getShows } from '@/lib/library/queries'
import type { Piece, Show } from '@/lib/library/types'
import ScrollReveal from '@/components/scroll-reveal'
import Billboard from '@/components/library/hub/billboard'
import ChannelHeader from '@/components/library/hub/channel-header'
import Row from '@/components/library/hub/row'
import ShowCard from '@/components/library/hub/show-card'
import PieceCard from '@/components/library/hub/piece-card'
import { kickerFor, toCard } from '@/components/library/hub/cards'

/*
  The Library home.

  Organised by channel, and inside a channel by show, because that is how the
  work is actually shaped. Daniel is a show. Hebrews is a show. Words That
  Change Everything is a show. Treating them as loose pieces inside a collection
  called "In the Text" hid them behind a name a visitor has no reason to know.

  So each channel leads with its own wordmark and a sentence saying what it is,
  and then offers whichever unit that channel is really browsed by:

    Bible Teaching Series   six studies, each a show
    Word for Word           eight subjects, each a run of questions
    Sermons                 individual messages, no series
    Exegetica               individual papers
    Forum & Pulpit          individual essays

  There is deliberately no topic row and no "start here" row. Both were rows
  the site invented rather than rows the work suggested, and they sat far down
  a page answering a question nobody had asked.

  One read of the whole set feeds everything. getPieces and getShows are both
  wrapped in React cache and ask for the same newest sorted set, so the two
  awaits collapse into one trip and every grouping after that is in memory.
*/

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Library',
  description:
    'Everything Austin W. Duncan has taught in one place: book studies, questions answered, sermons, scholarly papers and cultural commentary.',
}

const HEADING = 'var(--font-cmg), system-ui, sans-serif'
const BROWSE = '/library/browse'

/** Cards in a row. Deep enough to feel like a library, short enough to stay cheap. */
const ROW = 20

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

function CardWrap({ children }: { children: React.ReactNode }) {
  return <div className="w-[14.5rem] shrink-0 snap-start sm:w-[16.5rem]">{children}</div>
}

/* A channel whose shows are the browse unit. */
function ShowChannel({ show, pieces }: { show: Show; pieces: Piece[] }) {
  const seasons = show.seasons.filter(s => s.episodes.length)
  if (!seasons.length) return null

  return (
    <section className="pt-20 lg:pt-28">
      <ScrollReveal>
        <div className="px-6 lg:px-10">
          <ChannelHeader
            show={show}
            href={`/library/${show.slug}`}
            action={`All ${UNIT[show.slug]?.[1] ?? 'pieces'}`}
            meta={`${seasons.length} ${seasons.length === 1 ? 'show' : 'shows'} · ${countLabel(show.slug, pieces.length)}`}
          />
        </div>
      </ScrollReveal>

      <ScrollReveal delay={80}>
        <div className="mt-11 lg:mt-14" />
        <Row count={seasons.length}>
          {seasons.map(season => (
            <CardWrap key={season.id}>
              <ShowCard
                show={{
                  name: season.name,
                  href: `/library/${show.slug}?season=${season.slug}`,
                  artwork: season.artwork,
                  count: countLabel(show.slug, season.episodes.length),
                }}
              />
            </CardWrap>
          ))}
        </Row>
      </ScrollReveal>
    </section>
  )
}

/* A channel browsed as individual pieces, because it has no series. */
function PieceChannel({ show, pieces }: { show: Show; pieces: Piece[] }) {
  const row = pieces.slice(0, ROW)
  if (!row.length) return null
  const kicker = kickerFor(row)

  return (
    <section className="pt-20 lg:pt-28">
      <ScrollReveal>
        <div className="px-6 lg:px-10">
          <ChannelHeader
            show={show}
            href={`${BROWSE}?collection=${show.slug}`}
            action={`All ${countLabel(show.slug, pieces.length).split(' ')[1]}`}
            meta={countLabel(show.slug, pieces.length)}
          />
        </div>
      </ScrollReveal>

      <ScrollReveal delay={80}>
        <div className="mt-11 lg:mt-14" />
        <Row count={row.length}>
          {row.map(piece => (
            <CardWrap key={piece.id}>
              <PieceCard card={toCard(piece, kicker(piece))} />
            </CardWrap>
          ))}
        </Row>
      </ScrollReveal>
    </section>
  )
}

export default async function LibraryHomePage() {
  const [all, shows] = await Promise.all([getPieces({ sort: 'newest' }), getShows()])

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

  // The billboard needs artwork to be a billboard, and something to say.
  const featured =
    all.find(p => p.artwork && (p.subtitle || p.summary)) ?? all.find(p => p.artwork) ?? all[0]

  const piecesOf = (show: Show) => all.filter(p => p.collection?.id === show.id)

  // Channels that run as series lead, because a show is a bigger invitation
  // than a single piece. Order otherwise follows the collection's position.
  const ordered = [...shows].sort((a, b) => {
    const seriesA = a.seasons.length > 0 ? 0 : 1
    const seriesB = b.seasons.length > 0 ? 0 : 1
    return seriesA - seriesB
  })

  return (
    <div style={{ background: 'var(--awd-black)' }}>
      <Billboard piece={featured} pieceCount={all.length} showCount={shows.reduce((n, s) => n + (s.seasons.length || 1), 0)} />

      <div className="pb-28 lg:pb-36">
        {ordered.map(show =>
          show.seasons.length ? (
            <ShowChannel key={show.id} show={show} pieces={piecesOf(show)} />
          ) : (
            <PieceChannel key={show.id} show={show} pieces={piecesOf(show)} />
          ),
        )}

        <div className="mt-24 px-6 lg:mt-32 lg:px-10">
          <div className="h-px w-full" style={{ background: 'rgba(238,234,225,0.1)' }} />
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              href={BROWSE}
              className="group/all inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition-colors hover:text-[var(--awd-gold)]"
              style={{ fontFamily: HEADING, color: 'var(--awd-bone)' }}
            >
              Browse all {all.length} pieces
              <ArrowRight size={14} className="transition-transform duration-200 group-hover/all:translate-x-0.5" />
            </Link>
            <Link
              href="/scripture"
              className="group/scr inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition-colors hover:text-[var(--awd-gold)]"
              style={{ fontFamily: HEADING, color: 'var(--awd-bone)' }}
            >
              Browse by Scripture
              <ArrowRight size={14} className="transition-transform duration-200 group-hover/scr:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
