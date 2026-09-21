import type { Metadata } from 'next'
import { getPublishedSermons, type Sermon } from '@/lib/sermons'
import { getPublishedSeries, type Series } from '@/lib/series'
import { pathFor } from '@/lib/categories'
import BrowseShell, { type Channel } from '@/components/browse/browse-shell'
import { type CardItem } from '@/components/browse/channel-card'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Browse',
  description:
    'Everything in one place: In the Text, Sermons, Word for Word, Exegetica, and Forum & Pulpit.',
}

/*
  The browse hub. Five channels, each a horizontal shelf, in the Apple TV
  pattern: a featured item on top, then a row per channel with See all linking
  to that channel's own page.

  Every piece lives in one table read through lib/sermons, with exactly one
  category, and each channel here is exactly one category: teaching is In the
  Text, sermon is Sermons, episode is Word for Word, paper is Exegetica and
  commentary is Forum & Pulpit. Piece URLs always come from pathFor(); series
  live at /series/[slug].

  CardItem.slug is the bare piece slug, which is what ReadMarker writes to the
  read_articles key from the shared piece page, so the ticks are real.
*/

const BLACK = '#171918'

function fmt(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  })
}

function clean(text?: string): string {
  if (!text) return ''
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\\([_*[\]])/g, '$1')
    .trim()
}

/* A database failure renders empty channels rather than crashing the page. */
async function loadLibrary(): Promise<{ pieces: Sermon[]; series: Series[] }> {
  try {
    const [pieces, series] = await Promise.all([getPublishedSermons(), getPublishedSeries()])
    return { pieces, series }
  } catch (err) {
    console.warn('[browse] database read failed, rendering empty channels', err)
    return { pieces: [], series: [] }
  }
}

/* The old frontmatter.image, resolved from what a piece carries now. */
function imageFor(p: Sermon): string | undefined {
  return (
    p.heroStillUrl ??
    p.artworkUrl ??
    p.seriesArtworkUrl ??
    (p.youtubeId ? `https://i.ytimg.com/vi/${p.youtubeId}/hqdefault.jpg` : undefined)
  )
}

function toCard(a: Sermon, extra: Partial<CardItem> = {}): CardItem {
  return {
    title: a.title,
    href: pathFor(a),
    slug: a.slug,
    image: imageFor(a),
    blurb: clean(a.summary || a.description),
    meta: a.date ? fmt(a.date) : undefined,
    ...extra,
  }
}

export default async function BrowsePage() {
  const { pieces, series } = await loadLibrary()

  // getPublishedSermons returns newest first, so each list is already sorted.
  const allSermons = pieces.filter(p => p.category === 'sermon')
  const allTeaching = pieces.filter(p => p.category === 'teaching')
  const allWfw = pieces.filter(p => p.category === 'episode')
  const allExegetica = pieces.filter(p => p.category === 'paper')
  const allForum = pieces.filter(p => p.category === 'commentary')

  // ── Channel shelves ─────────────────────────────────────────────────────────
  /*
    In the Text is built to be worked through in order, so its sessions run
    series by series, first session first. The shell groups this channel into
    one shelf per kicker, which makes a shelf per series. The series themselves
    follow as a last shelf: they carry no kicker, so the shell names it Series.
  */
  const teachingSeries = series.filter(s => allTeaching.some(t => t.seriesSlug === s.slug))
  const seriesRank = new Map(teachingSeries.map((s, i) => [s.slug, i]))
  const rankOf = (p: Sermon) => seriesRank.get(p.seriesSlug ?? '') ?? teachingSeries.length
  const sessionCards: CardItem[] = [...allTeaching]
    .sort((a, b) =>
      rankOf(a) - rankOf(b) ||
      (a.week ?? 0) - (b.week ?? 0) ||
      (a.date ?? '').localeCompare(b.date ?? ''))
    .map(a => toCard(a, {
      kicker: a.seriesTitle ?? 'Single sessions',
      meta: [a.week ? `Session ${a.week}` : '', a.date ? fmt(a.date) : ''].filter(Boolean).join(' · ') || undefined,
    }))

  const seriesCards: CardItem[] = teachingSeries.map(s => {
    const count = allTeaching.filter(t => t.seriesSlug === s.slug).length
    return {
      title: s.title,
      href: `/series/${s.slug}`,
      slug: s.slug,
      image: s.artworkUrl ?? s.bannerUrl,
      meta: `${count} ${count === 1 ? 'session' : 'sessions'}`,
      blurb: clean(s.subtitle || s.description),
      chip: `${count} ${count === 1 ? 'session' : 'sessions'}`,
    }
  })

  const sermonCards: CardItem[] = allSermons.map(a => toCard(a, { kicker: a.passage || undefined }))
  const wfwCards: CardItem[] = allWfw.map(a => toCard(a))
  const exegeticaCards: CardItem[] = allExegetica.map(a => toCard(a))
  const forumCards: CardItem[] = allForum.map(a => toCard(a))

  const channels: Channel[] = [
    {
      id: 'in-the-text',
      label: 'In the Text',
      blurb: 'Book studies and biblical theology, built to be worked through in order.',
      href: '/teaching',
      seeAll: 'All series',
      items: [...sessionCards, ...seriesCards],
    },
    {
      id: 'sermons',
      label: 'Sermons',
      blurb: 'Sunday preaching at Crosswalk, written out in full.',
      href: '/sermons',
      seeAll: 'All sermons',
      items: sermonCards,
    },
    {
      id: 'word-for-word',
      label: 'Word for Word',
      blurb: 'Straight answers to the questions people actually ask.',
      href: '/word-for-word',
      seeAll: 'All questions',
      items: wfwCards,
    },
    {
      id: 'exegetica',
      label: 'Exegetica',
      blurb: 'Longer scholarly work, with the Greek and Hebrew left in.',
      href: '/exegetica',
      seeAll: 'All papers',
      items: exegeticaCards,
    },
    {
      id: 'forum-and-pulpit',
      label: 'Forum & Pulpit',
      blurb: 'What Scripture has to say about what is actually happening now.',
      href: '/forum-and-pulpit',
      seeAll: 'All commentary',
      items: forumCards,
    },
  ]

  const latestCards: CardItem[] = [
    ...allSermons.slice(0, 4).map(a => ({ a, section: 'Sermon' })),
    ...allTeaching.slice(0, 4).map(a => ({ a, section: 'In the Text' })),
    ...allWfw.slice(0, 4).map(a => ({ a, section: 'Word for Word' })),
    ...allExegetica.slice(0, 2).map(a => ({ a, section: 'Exegetica' })),
    ...allForum.slice(0, 2).map(a => ({ a, section: 'Forum & Pulpit' })),
  ]
    .sort((x, y) => ((x.a.date ?? '') < (y.a.date ?? '') ? 1 : -1))
    .slice(0, 16)
    .map(({ a, section }) => toCard(a, { kicker: section }))

  return (
    <div style={{ background: BLACK }}>
      {/* ── Channel rail + grid ────────────────────────────────────────── */}
      <BrowseShell channels={channels} highlights={latestCards} />
    </div>
  )
}
