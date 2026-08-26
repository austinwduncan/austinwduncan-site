import type { Metadata } from 'next'
import {
  getAll,
  getAllTeaching,
  sortByDate,
  isPublished,
  type SermonFrontmatter,
  type ArticleFrontmatter,
  type TeachingFrontmatter,
} from '@/lib/content'
import { getArticlesBySection } from '@/sanity/lib/queries'
import { TEACHING_SERIES } from '@/data/teaching-series'
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

  No URLs move for this. The channel pages are the existing section routes;
  this is a surface laid over them, which is why nothing needed redirecting.

  "In the Text" is a display label for the teaching series. The routes are
  still /teaching/... on purpose.
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

export default async function BrowsePage() {
  const mdxSermons = getAll<SermonFrontmatter>('sermons').filter(a => isPublished(a.frontmatter.date))
  const [
    sanitySermonArticles, sanityWfwArticles, sanityExegeticaArticles,
    sanityForumArticles, sanityExpositionalArticles, sanityTopicalArticles,
  ] = await Promise.all([
    getArticlesBySection('sermons'),
    getArticlesBySection('word-for-word'),
    getArticlesBySection('exegetica'),
    getArticlesBySection('forum-and-pulpit'),
    getArticlesBySection('expositional'),
    getArticlesBySection('topical'),
  ])

  const merge = <T extends { title: string; date: string }>(
    mdx: { slug: string; frontmatter: T }[],
    sanity: { slug: string; title: string; date: string; excerpt?: string | null; image?: string | null }[],
  ) => {
    const seen = new Set(mdx.map(a => a.slug))
    return sortByDate([
      ...mdx,
      ...sanity.filter(a => !seen.has(a.slug)).map(a => ({
        slug: a.slug,
        content: '',
        frontmatter: {
          title: a.title, date: a.date,
          excerpt: a.excerpt ?? '', image: a.image ?? undefined,
        } as unknown as T,
      })),
    ])
  }

  const allSermons = merge<SermonFrontmatter>(mdxSermons, sanitySermonArticles)
  const allWfw = merge<ArticleFrontmatter>(
    getAll<ArticleFrontmatter>('word-for-word').filter(a => isPublished(a.frontmatter.date)),
    sanityWfwArticles,
  )
  const allExegetica = merge<ArticleFrontmatter>(
    getAll<ArticleFrontmatter>('exegetica').filter(a => isPublished(a.frontmatter.date)),
    sanityExegeticaArticles,
  )
  const allForum = merge<ArticleFrontmatter>(
    getAll<ArticleFrontmatter>('forum-and-pulpit').filter(a => isPublished(a.frontmatter.date)),
    sanityForumArticles,
  )

  const mdxExpositional = getAllTeaching<TeachingFrontmatter>('expositional').filter(a => isPublished(a.frontmatter.date))
  const mdxTopical = getAllTeaching<TeachingFrontmatter>('topical').filter(a => isPublished(a.frontmatter.date))
  const expoSlugs = new Set(mdxExpositional.map(a => a.slug))
  const topicalSlugs = new Set(mdxTopical.map(a => a.slug))
  const allTeaching = sortByDate([
    ...mdxExpositional.map(a => ({ ...a, teachingType: 'expositional' as const })),
    ...sanityExpositionalArticles.filter(a => !expoSlugs.has(a.slug)).map(a => ({
      slug: a.slug, content: '',
      frontmatter: { title: a.title, date: a.date, excerpt: a.excerpt ?? '', image: a.image ?? undefined, tags: [] } as TeachingFrontmatter,
      teachingType: 'expositional' as const,
    })),
    ...mdxTopical.map(a => ({ ...a, teachingType: 'topical' as const })),
    ...sanityTopicalArticles.filter(a => !topicalSlugs.has(a.slug)).map(a => ({
      slug: a.slug, content: '',
      frontmatter: { title: a.title, date: a.date, excerpt: a.excerpt ?? '', image: a.image ?? undefined, tags: [] } as TeachingFrontmatter,
      teachingType: 'topical' as const,
    })),
  ])

  // ── Channel shelves ─────────────────────────────────────────────────────────
  const seriesCards: CardItem[] = [...TEACHING_SERIES]
    .sort((a, b) => a.priority - b.priority)
    .map(s => ({
      title: s.title,
      href: `/teaching/series/${s.slug}`,
      slug: s.slug,
      image: s.image,
      kicker: s.primaryLane,
      meta: `${s.status} · ${s.totalSessions} sessions`,
      blurb: s.subtitle,
      chip: `${s.totalSessions} sessions`,
    }))

  const sermonCards: CardItem[] = allSermons.slice(0, 30).map(a => ({
    title: a.frontmatter.title,
    href: `/sermons/${a.slug}`,
    slug: a.slug,
    image: a.frontmatter.image,
    blurb: clean(a.frontmatter.excerpt),
    kicker: a.frontmatter.scripture,
    meta: fmt(a.frontmatter.date),
  }))

  const wfwCards: CardItem[] = allWfw.slice(0, 30).map(a => ({
    title: a.frontmatter.title,
    href: `/word-for-word/${a.slug}`,
    slug: a.slug,
    image: a.frontmatter.image,
    blurb: clean(a.frontmatter.excerpt),
    meta: fmt(a.frontmatter.date),
  }))

  const exegeticaCards: CardItem[] = allExegetica.map(a => ({
    title: a.frontmatter.title,
    href: `/exegetica/${a.slug}`,
    slug: a.slug,
    image: a.frontmatter.image,
    blurb: clean(a.frontmatter.excerpt),
    meta: fmt(a.frontmatter.date),
  }))

  const forumCards: CardItem[] = allForum.map(a => ({
    title: a.frontmatter.title,
    href: `/forum-and-pulpit/${a.slug}`,
    slug: a.slug,
    image: a.frontmatter.image,
    blurb: clean(a.frontmatter.excerpt),
    meta: fmt(a.frontmatter.date),
  }))

  const channels: Channel[] = [
    {
      id: 'in-the-text',
      label: 'In the Text',
      blurb: 'Book studies and biblical theology, built to be worked through in order.',
      href: '/teaching',
      seeAll: 'All series',
      items: seriesCards,
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
    ...allSermons.slice(0, 4).map(a => ({ a, section: 'Sermon', base: '/sermons' })),
    ...allTeaching.slice(0, 4).map(a => ({ a, section: 'In the Text', base: `/teaching/${a.teachingType}` })),
    ...allWfw.slice(0, 4).map(a => ({ a, section: 'Word for Word', base: '/word-for-word' })),
    ...allExegetica.slice(0, 2).map(a => ({ a, section: 'Exegetica', base: '/exegetica' })),
    ...allForum.slice(0, 2).map(a => ({ a, section: 'Forum & Pulpit', base: '/forum-and-pulpit' })),
  ]
    .sort((x, y) => (x.a.frontmatter.date < y.a.frontmatter.date ? 1 : -1))
    .slice(0, 16)
    .map(({ a, section, base }) => ({
      title: a.frontmatter.title,
      href: `${base}/${a.slug}`,
      slug: a.slug,
      image: a.frontmatter.image,
      kicker: section,
      meta: fmt(a.frontmatter.date),
      blurb: clean(a.frontmatter.excerpt),
    }))

  return (
    <div style={{ background: BLACK }}>
      {/* ── Channel rail + grid ────────────────────────────────────────── */}
      <BrowseShell channels={channels} highlights={latestCards} />
    </div>
  )
}
