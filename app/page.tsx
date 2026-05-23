import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  getAll,
  getAllTeaching,
  sortByDate,
  isPublished,
  type SermonFrontmatter,
  type ArticleFrontmatter,
  type TeachingFrontmatter,
} from '@/lib/content'
import { FPTicker, type TickerItem } from '@/components/fp-ticker'
import TeachingSeriesPicker, { type SeriesItem } from '@/components/teaching-series-picker'
import BookCovers from '@/components/book-covers'
import HomeHero from '@/components/home-hero'
import HomeExplore, { type ExploreSection } from '@/components/home-explore'
import ScrollReveal from '@/components/scroll-reveal'
import rawBooks from '@/data/books.json'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Austin W. Duncan',
  description:
    'Pastor, teacher, and theologian — sermons, biblical teaching, scholarly articles, and cultural commentary.',
}

const AMBER_STRIP = `
  repeating-linear-gradient(60deg, transparent, transparent 6px, rgba(255,255,255,0.07) 6px, rgba(255,255,255,0.07) 7px),
  repeating-linear-gradient(-60deg, transparent, transparent 6px, rgba(255,255,255,0.07) 6px, rgba(255,255,255,0.07) 7px)
`

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

type BookPreview = { title: string; author: string; coverImageUrl?: string; recommendationLevel?: string; featured?: boolean }

export default function HomePage() {
  const allSermons   = sortByDate(getAll<SermonFrontmatter>('sermons').filter(a => isPublished(a.frontmatter.date)))
  const allWfw       = sortByDate(getAll<ArticleFrontmatter>('word-for-word').filter(a => isPublished(a.frontmatter.date)))
  const allExegetica = sortByDate(getAll<ArticleFrontmatter>('exegetica').filter(a => isPublished(a.frontmatter.date)))
  const allForum     = sortByDate(getAll<ArticleFrontmatter>('forum-and-pulpit').filter(a => isPublished(a.frontmatter.date)))

  const allTeachingRaw = sortByDate([
    ...getAllTeaching<TeachingFrontmatter>('expositional')
      .filter(a => isPublished(a.frontmatter.date))
      .map(a => ({ ...a, teachingType: 'expositional' as const })),
    ...getAllTeaching<TeachingFrontmatter>('topical')
      .filter(a => isPublished(a.frontmatter.date))
      .map(a => ({ ...a, teachingType: 'topical' as const })),
  ])

  // ── Teaching series ──────────────────────────────────────────────────────────
  const seriesMap = new Map<string, SeriesItem>()
  for (const { frontmatter: fm, slug, teachingType } of allTeachingRaw) {
    const name = fm.tags?.[fm.tags.length - 1] ?? 'Teaching'
    if (!seriesMap.has(name)) {
      seriesMap.set(name, { name, image: fm.image, count: 0, slug, type: teachingType, excerpt: fm.excerpt ? clean(fm.excerpt) : undefined })
    }
    seriesMap.get(name)!.count++
    if (fm.image && !seriesMap.get(name)!.image) seriesMap.get(name)!.image = fm.image
  }
  const seriesList: SeriesItem[] = [...seriesMap.values()]

  // ── Ticker ───────────────────────────────────────────────────────────────────
  const makeTickerItems = (
    items: { frontmatter: { title: string; date: string }; slug: string }[],
    base: string
  ): TickerItem[] =>
    items.slice(0, 4).map(a => ({ title: a.frontmatter.title, date: fmt(a.frontmatter.date), slug: a.slug, href: `${base}/${a.slug}` }))

  const tickerRaw: TickerItem[] = []
  const s = makeTickerItems(allSermons, '/sermons')
  const w = makeTickerItems(allWfw, '/word-for-word')
  const f = makeTickerItems(allForum, '/forum-and-pulpit')
  const e = makeTickerItems(allExegetica, '/exegetica')
  const t = allTeachingRaw.slice(0, 4).map(a => ({ title: a.frontmatter.title, date: fmt(a.frontmatter.date), slug: a.slug, href: `/teaching/${a.teachingType}/${a.slug}` }))
  const maxLen = Math.max(s.length, w.length, f.length, e.length, t.length)
  for (let i = 0; i < maxLen; i++) {
    if (s[i]) tickerRaw.push(s[i])
    if (w[i]) tickerRaw.push(w[i])
    if (f[i]) tickerRaw.push(f[i])
    if (e[i]) tickerRaw.push(e[i])
    if (t[i]) tickerRaw.push(t[i])
  }

  // ── Hero data ────────────────────────────────────────────────────────────────
  const heroSermon = allSermons[0] ?? null
  const totalArticles = allWfw.length + allExegetica.length + allForum.length

  const heroStats = [
    { label: 'Sermons', value: allSermons.length },
    { label: 'Articles', value: totalArticles },
    { label: 'Teaching Sessions', value: allTeachingRaw.length },
    { label: 'Books Curated', value: 793 },
  ]

  // ── Explore sections ─────────────────────────────────────────────────────────
  const exploreSections: ExploreSection[] = [
    {
      slug: 'sermons',
      label: 'Sermons',
      description: 'Weekly expository preaching through the Bible — available anytime, with scripture index.',
      count: allSermons.length,
      countLabel: 'messages',
      href: '/sermons',
    },
    {
      slug: 'word-for-word',
      label: 'Word for Word',
      description: 'Hard questions about Scripture answered clearly, without hedging or condescension.',
      count: allWfw.length,
      countLabel: 'articles',
      href: '/word-for-word',
    },
    {
      slug: 'teaching',
      label: 'Bible Teaching',
      description: 'Multi-part series working verse-by-verse through books and tracing themes across Scripture.',
      count: allTeachingRaw.length,
      countLabel: 'sessions',
      href: '/teaching',
    },
    {
      slug: 'exegetica',
      label: 'Exegetica',
      description: 'Detailed text studies with attention to Greek and Hebrew, argument flow, and historical context.',
      count: allExegetica.length,
      countLabel: 'studies',
      href: '/exegetica',
    },
    {
      slug: 'library',
      label: 'Library',
      description: 'Books curated for pastors, teachers, and serious readers — organized by topic and level.',
      count: 793,
      countLabel: 'books',
      href: '/library',
    },
    {
      slug: 'forum',
      label: 'Forum & Pulpit',
      description: 'Cultural commentary, pastoral reflection, and occasional provocation on faith and public life.',
      count: allForum.length,
      countLabel: 'pieces',
      href: '/forum-and-pulpit',
    },
  ]

  // ── Recently published ───────────────────────────────────────────────────────
  const recentItems = [
    allSermons[0] && {
      section: 'Sermon',
      title: allSermons[0].frontmatter.title,
      href: `/sermons/${allSermons[0].slug}`,
      date: fmt(allSermons[0].frontmatter.date),
      excerpt: clean(allSermons[0].frontmatter.excerpt),
      scripture: allSermons[0].frontmatter.scripture,
    },
    allWfw[0] && {
      section: 'Word for Word',
      title: allWfw[0].frontmatter.title,
      href: `/word-for-word/${allWfw[0].slug}`,
      date: fmt(allWfw[0].frontmatter.date),
      excerpt: clean(allWfw[0].frontmatter.excerpt),
    },
    allExegetica[0] && {
      section: 'Exegetica',
      title: allExegetica[0].frontmatter.title,
      href: `/exegetica/${allExegetica[0].slug}`,
      date: fmt(allExegetica[0].frontmatter.date),
      excerpt: clean(allExegetica[0].frontmatter.excerpt),
    },
    allForum[0] && {
      section: 'Forum & Pulpit',
      title: allForum[0].frontmatter.title,
      href: `/forum-and-pulpit/${allForum[0].slug}`,
      date: fmt(allForum[0].frontmatter.date),
      excerpt: clean(allForum[0].frontmatter.excerpt),
    },
  ].filter(Boolean) as {
    section: string; title: string; href: string; date: string; excerpt?: string; scripture?: string
  }[]

  // ── Books ────────────────────────────────────────────────────────────────────
  const essentialBooks = (rawBooks as BookPreview[])
    .filter(b => b.recommendationLevel === 'Essential' && b.coverImageUrl && b.featured)
    .slice(0, 3)
    .map(b => ({ title: b.title, author: b.author, coverImageUrl: b.coverImageUrl! }))

  return (
    <>
      {/* ── Ticker ─────────────────────────────────────────────────────────── */}
      {tickerRaw.length > 0 && <FPTicker items={tickerRaw} />}

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <HomeHero
        stats={heroStats}
        primaryCtaHref={heroSermon ? `/sermons/${heroSermon.slug}` : '/sermons'}
        primaryCtaLabel="Latest Sermon"
        secondaryCtaHref="/teaching"
        secondaryCtaLabel="Explore Bible Teaching"
      />

      {/* ── Amber strip ────────────────────────────────────────────────────── */}
      <div
        className="h-[14px] w-full"
        style={{ backgroundColor: '#7A5C1E', backgroundImage: AMBER_STRIP }}
      />

      {/* ── Explore ────────────────────────────────────────────────────────── */}
      <div style={{ background: '#FAFAF7', borderBottom: '1px solid #E2DACE' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-12 pb-10">
          <div
            className="flex items-center gap-2.5 text-[0.68rem] font-medium tracking-[0.14em] uppercase mb-8"
            style={{ color: '#7A5C1E' }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Explore the site
            <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
          </div>
        </div>
        <HomeExplore sections={exploreSections} />
      </div>

      {/* ── Recently published ─────────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E2DACE' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-14">
          <ScrollReveal>
            <div
              className="flex items-center gap-2.5 text-[0.68rem] font-medium tracking-[0.12em] uppercase mb-8"
              style={{ color: '#9A9189' }}
            >
              Recently published
              <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
              <span style={{ color: '#C8BFA8' }}>one from each section</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: '#E2DACE' }}>
              {recentItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex flex-col p-5 transition-colors hover:bg-[#F9F6F0]"
                  style={{ background: '#fff' }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="text-[0.58rem] font-medium tracking-[0.12em] uppercase px-2 py-0.5"
                      style={{ background: '#F2EFE7', color: '#7A5C1E', border: '1px solid #E2DACE' }}
                    >
                      {item.section}
                    </span>
                    <span className="text-[0.68rem]" style={{ color: '#C8BFA8' }}>{item.date}</span>
                  </div>
                  {item.scripture && (
                    <p className="text-[0.65rem] font-medium tracking-[0.08em] uppercase mb-1.5" style={{ color: '#B8892E' }}>
                      {item.scripture}
                    </p>
                  )}
                  <h3
                    className="leading-snug mb-2 flex-1 transition-colors duration-150 group-hover:text-[#7A5C1E]"
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: '1.1rem',
                      fontWeight: 500,
                      color: '#1A1714',
                    }}
                  >
                    {item.title}
                  </h3>
                  {item.excerpt && (
                    <p
                      className="text-[0.78rem] leading-[1.55] line-clamp-2"
                      style={{ fontFamily: 'var(--font-source-serif)', color: '#9A9189' }}
                    >
                      {item.excerpt}
                    </p>
                  )}
                  <div
                    className="mt-3 flex items-center gap-1 text-[0.7rem] font-medium tracking-[0.05em] uppercase transition-colors group-hover:text-[#7A5C1E]"
                    style={{ color: '#C8BFA8' }}
                  >
                    Read <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* ── Teaching series ────────────────────────────────────────────────── */}
      {seriesList.length > 0 && (
        <div style={{ background: '#FAFAF7', borderBottom: '1px solid #E2DACE' }}>
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-14">
            <ScrollReveal>
              <div
                className="flex items-center gap-2.5 text-[0.68rem] font-medium tracking-[0.12em] uppercase mb-8"
                style={{ color: '#9A9189' }}
              >
                Teaching series
                <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
                <Link
                  href="/teaching"
                  className="flex items-center gap-1 transition-colors hover:text-[#7A5C1E]"
                  style={{ color: '#C8BFA8' }}
                >
                  All series <ArrowRight size={10} />
                </Link>
              </div>
              <TeachingSeriesPicker series={seriesList} />
            </ScrollReveal>
          </div>
        </div>
      )}

      {/* ── Library ────────────────────────────────────────────────────────── */}
      <div style={{ background: '#141210', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 lg:py-16">
          <ScrollReveal>
            <div className="grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <span className="inline-block h-px w-8" style={{ background: '#B8892E' }} />
                  <span
                    className="text-[0.65rem] font-medium tracking-[0.22em] uppercase"
                    style={{ color: '#B8892E' }}
                  >
                    Library
                  </span>
                </div>
                <h2
                  className="leading-tight tracking-tight mb-4"
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
                    fontWeight: 400,
                    color: '#F9F6F0',
                  }}
                >
                  Books Worth Your Time
                </h2>
                <p
                  className="leading-relaxed mb-7 max-w-lg text-[0.92rem]"
                  style={{ fontFamily: 'var(--font-source-serif)', color: 'rgba(255,255,255,0.4)' }}
                >
                  793 books organized for Bible study, theology, pastoral ministry, and Christian formation.
                  Curated for pastors, teachers, and serious readers.
                </p>
                <div className="flex flex-wrap gap-2 mb-7">
                  {['Bible Study', 'Theology', 'Pastoral', 'Church History', 'Apologetics', 'Christian Living'].map(cat => (
                    <Link
                      key={cat}
                      href={`/library?category=${encodeURIComponent(cat)}`}
                      className="text-[0.7rem] font-medium tracking-[0.08em] uppercase px-3 py-1.5 transition-colors hover:text-[#B8892E]"
                      style={{
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.3)',
                      }}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
                <Link
                  href="/library"
                  className="inline-flex items-center gap-2 px-6 py-3 text-[0.8rem] font-medium tracking-[0.04em] text-white transition-opacity hover:opacity-85"
                  style={{ background: '#7A5C1E' }}
                >
                  Explore the Library <ArrowRight size={13} />
                </Link>
              </div>
              {essentialBooks.length > 0 && <BookCovers books={essentialBooks} />}
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* ── About ──────────────────────────────────────────────────────────── */}
      <div style={{ background: '#F9F6F0', borderTop: '1px solid #E2DACE' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 lg:py-16">
          <ScrollReveal>
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
              <div className="flex-1 max-w-xl">
                <div className="flex items-center gap-3 mb-5">
                  <span className="inline-block h-px w-8" style={{ background: '#B8892E' }} />
                  <span
                    className="text-[0.65rem] font-medium tracking-[0.18em] uppercase"
                    style={{ color: '#B8892E' }}
                  >
                    About
                  </span>
                </div>
                <h2
                  className="leading-tight tracking-tight mb-4"
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: 'clamp(2rem, 3vw, 2.6rem)',
                    fontWeight: 400,
                    color: '#1A1714',
                  }}
                >
                  I&apos;m Austin.
                </h2>
                <p
                  className="leading-[1.75] mb-6 text-[0.95rem]"
                  style={{ fontFamily: 'var(--font-source-serif)', color: '#5A544C' }}
                >
                  I&apos;m a pastor and Bible teacher. This site is where I collect everything I&apos;m writing,
                  preaching, and studying — sermons, multi-part teaching series, detailed text studies,
                  cultural commentary, and a reading list I&apos;ve been building for years. The goal is
                  simple: help Christians go deeper into the Bible without making it harder than it needs
                  to be.
                </p>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-1.5 text-[0.75rem] font-medium tracking-[0.1em] uppercase transition-colors hover:text-[#7A5C1E]"
                  style={{ color: '#B8892E' }}
                >
                  More about Austin <ArrowRight size={11} />
                </Link>
              </div>

              {/* Where to start card */}
              <div
                className="lg:w-72 shrink-0 w-full"
                style={{ border: '1px solid #E2DACE', background: '#fff' }}
              >
                <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #E2DACE' }}>
                  <p
                    className="text-[0.62rem] font-medium tracking-[0.2em] uppercase"
                    style={{ color: '#9A9189' }}
                  >
                    Not sure where to start?
                  </p>
                </div>
                {[
                  { label: 'I have a Bible question', section: 'Word for Word', href: '/word-for-word' },
                  { label: 'I want to study more deeply', section: 'Exegetica', href: '/exegetica' },
                  { label: 'I need a book recommendation', section: 'Library', href: '/library' },
                  { label: 'I want to hear a sermon', section: 'Sermons', href: '/sermons' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-[#F9F6F0]"
                    style={{ borderTop: '1px solid #F0EDE6' }}
                  >
                    <span
                      className="text-[0.82rem] leading-snug transition-colors group-hover:text-[#7A5C1E]"
                      style={{ fontFamily: 'var(--font-source-serif)', color: '#5A544C' }}
                    >
                      {item.label}
                    </span>
                    <span
                      className="text-[0.62rem] font-medium tracking-[0.08em] uppercase shrink-0 ml-3 flex items-center gap-1 transition-colors group-hover:text-[#7A5C1E]"
                      style={{ color: '#C8BFA8' }}
                    >
                      {item.section} <ArrowRight size={9} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </>
  )
}
