import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPieces, getShow, getShows } from '@/lib/library/queries'
import Masthead from '@/components/library/show/masthead'
import SermonsChannel from '@/components/library/show/channels/sermons'
import InTheTextChannel from '@/components/library/show/channels/in-the-text'
import WordForWordChannel from '@/components/library/show/channels/word-for-word'
import ExegeticaChannel from '@/components/library/show/channels/exegetica'
import ForumAndPulpitChannel from '@/components/library/show/channels/forum-and-pulpit'
import { HEADING, byNewest } from '@/components/library/show/meta'

/*
  A channel page. Each of the five is laid out differently on purpose.

  These are not five instances of one thing. A sermon is an occasion, a study
  is a sequence, a Word for Word episode is a question, a paper is a paper, and
  a Forum and Pulpit essay is dated commentary. Giving all five the same grid
  would flatten exactly the distinction the Library home spends a whole screen
  establishing.

  What each leads with was taken from what the data actually holds rather than
  from taste. Every sermon carries a passage and they span six years, so
  Sermons is a record by year. Every Word for Word title is a question, all 71
  of them, so the question is the row. Exegetica runs to a median of 51 minutes,
  so length is stated up front. In the Text is the only channel where sequence
  matters, and it carries no production numbers, so its sessions are counted
  positionally and ordered oldest first.

  The masthead is the one shared element, so arriving here feels like walking
  through the door you picked on the Library wall.
*/

/** What a channel calls one of its pieces, so a count reads like the thing. */
const UNIT: Record<string, string> = {"sermons": "sermon", "in-the-text": "study", "word-for-word": "question", "exegetica": "paper", "forum-and-pulpit": "essay"}

/** What a channel calls a grouping of them. */
const SET: Record<string, string> = { 'in-the-text': 'study', 'word-for-word': 'subject' }

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

  /*
    Every piece in this channel, not just the ones grouped into a season. A
    channel with seasons keeps them; one without gets a flat list. Both come
    from the same read.
  */
  const mine = (await getPieces({ collection: show.slug, sort: 'newest' })).sort(byNewest)

  const seasons = show.seasons.filter(s => s.episodes.length)
  const requestedSeason = show.seasons.find(s => s.slug === requested) ?? seasons[0] ?? null

  const noun = UNIT[show.slug] ?? 'piece'
  const count = `${mine.length} ${mine.length === 1 ? noun : noun + 's'}`
  const meta = seasons.length
    ? `${count} across ${seasons.length} ${seasons.length === 1 ? SET[show.slug] ?? 'set' : (SET[show.slug] ?? 'set') + 's'}`
    : count

  return (
    <div className="-mt-[60px]" style={{ background: 'var(--awd-black)' }}>
      <Masthead show={show} meta={meta} />

      {show.slug === 'sermons' ? (
        <SermonsChannel pieces={mine} />
      ) : show.slug === 'word-for-word' ? (
        <WordForWordChannel seasons={seasons} loose={show.loose} />
      ) : show.slug === 'in-the-text' ? (
        <InTheTextChannel showSlug={show.slug} seasons={seasons} active={requestedSeason} />
      ) : show.slug === 'exegetica' ? (
        <ExegeticaChannel pieces={mine} />
      ) : show.slug === 'forum-and-pulpit' ? (
        <ForumAndPulpitChannel pieces={mine} />
      ) : (
        /* A channel added later renders as a dated list until it earns a voice. */
        <ForumAndPulpitChannel pieces={mine} />
      )}

      {mine.length === 0 && (
        <p
          className="mx-auto max-w-[1180px] px-6 py-24 text-[1.02rem] lg:px-8"
          style={{ fontFamily: HEADING, fontWeight: 400, color: 'rgba(238,234,225,0.6)' }}
        >
          Nothing is published here yet.
        </p>
      )}
    </div>
  )
}
