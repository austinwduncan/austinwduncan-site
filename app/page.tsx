import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen, HelpCircle, GraduationCap, Globe, Library } from 'lucide-react'
import {
  getAll,
  getAllTeaching,
  sortByDate,
  isPublished,
  primaryBookFromScripture,
  type SermonFrontmatter,
  type ArticleFrontmatter,
  type TeachingFrontmatter,
} from '@/lib/content'
import { FPTicker, type TickerItem } from '@/components/fp-ticker'
import Greeting from '@/components/greeting'
import TeachingSeriesPicker, { type SeriesItem } from '@/components/teaching-series-picker'
import BookCovers from '@/components/book-covers'
import rawBooks from '@/data/books.json'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Austin W. Duncan',
  description:
    'Pastor, teacher, and theologian — sermons, biblical teaching, scholarly articles, and cultural commentary.',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Static path options ──────────────────────────────────────────────────────

const PATH_OPTIONS = [
  {
    Icon: BookOpen,
    title: 'Understand the Bible',
    description: 'Weekly sermons and verse-by-verse exposition through Scripture.',
    href: '/sermons',
    label: 'Sermons',
  },
  {
    Icon: HelpCircle,
    title: 'Find answers to hard questions',
    description: 'Clear, grounded responses to common questions about the Christian faith.',
    href: '/word-for-word',
    label: 'Word for Word',
  },
  {
    Icon: GraduationCap,
    title: 'Study the text deeply',
    description: 'Scholarly exegesis with attention to the Greek text, grammar, and argument.',
    href: '/exegetica',
    label: 'Exegetica',
  },
  {
    Icon: Globe,
    title: 'Think biblically about the world',
    description: 'Christian witness and cultural commentary from a Reformed perspective.',
    href: '/forum-and-pulpit',
    label: 'Forum & Pulpit',
  },
  {
    Icon: Library,
    title: 'Find books worth reading',
    description: 'Curated reading for Bible study, theology, ministry, and formation.',
    href: '/library',
    label: 'Library',
  },
] as const

type BookPreview = { title: string; author: string; coverImageUrl?: string; recommendationLevel?: string; featured?: boolean }

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  // ── Fetch ──────────────────────────────────────────────────────────────────
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

  // ── Teaching series ────────────────────────────────────────────────────────
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

  // ── Ticker: latest from ALL sections, interleaved ──────────────────────────
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

  // ── Hero ───────────────────────────────────────────────────────────────────
  const heroSermon = allSermons[0] ?? null
  const sidePicks = [
    allWfw[0] && { section: 'Word for Word', href: `/word-for-word/${allWfw[0].slug}`, title: allWfw[0].frontmatter.title, date: fmt(allWfw[0].frontmatter.date) },
    allForum[0] && { section: 'Forum & Pulpit', href: `/forum-and-pulpit/${allForum[0].slug}`, title: allForum[0].frontmatter.title, date: fmt(allForum[0].frontmatter.date) },
    allExegetica[0] && { section: 'Exegetica', href: `/exegetica/${allExegetica[0].slug}`, title: allExegetica[0].frontmatter.title, date: fmt(allExegetica[0].frontmatter.date) },
  ].filter(Boolean) as { section: string; href: string; title: string; date: string }[]

  // ── Recently published: 6 most recent across all sections ──────────────────
  type AnyCard = { category: string; title: string; href: string; date: string; sortDate: string; image?: string }
  const allMixed: AnyCard[] = [
    ...allSermons.map(a => ({ category: primaryBookFromScripture(a.frontmatter.scripture) ?? 'Sermon', title: a.frontmatter.title, href: `/sermons/${a.slug}`, date: fmt(a.frontmatter.date), sortDate: a.frontmatter.date, image: a.frontmatter.image || undefined, _section: 'Sermons' as string })),
    ...allWfw.map(a => ({ category: a.frontmatter.tags?.[0] ?? 'Word for Word', title: a.frontmatter.title, href: `/word-for-word/${a.slug}`, date: fmt(a.frontmatter.date), sortDate: a.frontmatter.date, image: a.frontmatter.image || undefined, _section: 'Word for Word' as string })),
    ...allExegetica.map(a => ({ category: a.frontmatter.tags?.[0] ?? 'Exegetica', title: a.frontmatter.title, href: `/exegetica/${a.slug}`, date: fmt(a.frontmatter.date), sortDate: a.frontmatter.date, image: a.frontmatter.image || undefined, _section: 'Exegetica' as string })),
    ...allForum.map(a => ({ category: a.frontmatter.tags?.[0] ?? 'Forum & Pulpit', title: a.frontmatter.title, href: `/forum-and-pulpit/${a.slug}`, date: fmt(a.frontmatter.date), sortDate: a.frontmatter.date, image: a.frontmatter.image || undefined, _section: 'Forum & Pulpit' as string })),
    ...allTeachingRaw.map(a => ({ category: a.frontmatter.tags?.[a.frontmatter.tags?.length - 1] ?? 'Teaching', title: a.frontmatter.title, href: `/teaching/${a.teachingType}/${a.slug}`, date: fmt(a.frontmatter.date), sortDate: a.frontmatter.date, image: a.frontmatter.image || undefined, _section: 'Teaching' as string })),
  ]
    .sort((a, b) => b.sortDate.localeCompare(a.sortDate))
    .slice(0, 6) as (AnyCard & { _section: string })[]

  // ── Essential books ────────────────────────────────────────────────────────
  const essentialBooks = (rawBooks as BookPreview[])
    .filter(b => b.recommendationLevel === 'Essential' && b.coverImageUrl && b.featured)
    .slice(0, 5)
    .map(b => ({ title: b.title, author: b.author, coverImageUrl: b.coverImageUrl! }))

  return (
    <>
      {/* ── Ticker ─────────────────────────────────────────────────────────── */}
      {tickerRaw.length > 0 && <FPTicker items={tickerRaw} />}

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-[58fr_42fr]">

            {/* Left: positioning */}
            <div className="py-14 lg:py-16 lg:pr-14 flex flex-col justify-center gap-5">
              <Greeting />
              <div>
                <h1
                  className="text-4xl sm:text-5xl lg:text-[3rem] font-bold leading-[1.05] tracking-tight text-zinc-900"
                  style={{ fontFamily: 'var(--font-cormorant)' }}
                >
                  Helping normal Christians read the Bible more carefully.
                </h1>
                <p className="mt-4 text-[15px] text-zinc-500 leading-relaxed max-w-lg">
                  Sermons, teaching series, scholarly studies, and honest answers to hard questions —
                  built for Christians who want depth without being talked down to.
                </p>
              </div>
              {heroSermon && (
                <div className="pt-1">
                  <Link
                    href={`/sermons/${heroSermon.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-[12px] font-bold tracking-[0.14em] uppercase border border-[#cdb079] text-[#cdb079] hover:bg-[#cdb079] hover:text-white transition-colors"
                  >
                    Latest Sermon <ArrowRight size={12} />
                  </Link>
                </div>
              )}
            </div>

            {/* Right: featured sermon + secondary picks */}
            <div className="hidden lg:flex flex-col border-l border-zinc-200">
              {heroSermon && (
                <Link
                  href={`/sermons/${heroSermon.slug}`}
                  className="group block border-b border-zinc-200 overflow-hidden"
                >
                  {heroSermon.frontmatter.image ? (
                    <div className="relative aspect-[16/9] overflow-hidden bg-zinc-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={heroSermon.frontmatter.image}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-1.5" style={{ color: '#cdb079' }}>
                          Currently Featured
                        </p>
                        <h2 className="text-[16px] font-semibold text-white leading-snug group-hover:text-zinc-200 transition-colors">
                          {heroSermon.frontmatter.title}
                        </h2>
                        <p className="mt-1.5 text-[12px] text-zinc-400">{fmt(heroSermon.frontmatter.date)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-zinc-50">
                      <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-3" style={{ color: '#cdb079' }}>Currently Featured</p>
                      <h2 className="text-[16px] font-semibold text-zinc-900 leading-snug">{heroSermon.frontmatter.title}</h2>
                      <p className="mt-2 text-[12px] text-zinc-400">{fmt(heroSermon.frontmatter.date)}</p>
                    </div>
                  )}
                </Link>
              )}
              <div className="flex-1 flex flex-col divide-y divide-zinc-100 px-7 py-2">
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-400 py-4">Also —</p>
                {sidePicks.map(pick => (
                  <Link key={pick.href} href={pick.href} className="group py-4">
                    <span className="text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ color: '#cdb079' }}>
                      {pick.section}
                    </span>
                    <h3 className="mt-1.5 text-[14px] font-semibold leading-snug text-zinc-800 group-hover:text-zinc-500 transition-colors line-clamp-2">
                      {pick.title}
                    </h3>
                    <p className="mt-1 text-[12px] text-zinc-400">{pick.date}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Choose your path ───────────────────────────────────────────────── */}
      <section id="paths" className="border-b border-zinc-100 py-14 lg:py-16 bg-zinc-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div
            className="flex items-center gap-3 mb-10 pb-3"
            style={{ borderBottom: '2px solid #cdb079' }}
          >
            <span className="text-[12px] font-bold tracking-[0.22em] uppercase text-zinc-900">
              Where Would You Like to Start?
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
            {PATH_OPTIONS.map(({ Icon, title, description, href, label }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col gap-3 p-5 bg-white border border-zinc-200 hover:border-[#cdb079] transition-colors duration-200"
              >
                <Icon size={22} style={{ color: '#cdb079' }} className="flex-shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-zinc-900 leading-snug mb-1">{title}</p>
                  <p className="text-[12px] text-zinc-500 leading-relaxed">{description}</p>
                </div>
                <div className="mt-auto pt-2 flex items-center gap-1 text-[11px] font-semibold tracking-[0.1em] uppercase transition-colors" style={{ color: '#cdb079' }}>
                  {label} <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Teaching series (interactive picker) ───────────────────────────── */}
      {seriesList.length > 0 && (
        <section className="border-b border-zinc-100 py-14 lg:py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div
              className="flex items-center gap-3 mb-10 pb-3"
              style={{ borderBottom: '2px solid #cdb079' }}
            >
              <span className="text-[12px] font-bold tracking-[0.22em] uppercase text-zinc-900">Teaching Series</span>
              <div className="flex-1" />
              <Link
                href="/teaching"
                className="flex items-center gap-1.5 text-[11px] tracking-[0.12em] uppercase text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                All Series <ArrowRight size={10} />
              </Link>
            </div>
            <TeachingSeriesPicker series={seriesList} />
          </div>
        </section>
      )}

      {/* ── Recently published ─────────────────────────────────────────────── */}
      <section className="border-b border-zinc-100 bg-zinc-50 py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div
            className="flex items-center gap-3 mb-10 pb-3"
            style={{ borderBottom: '2px solid #cdb079' }}
          >
            <span className="text-[12px] font-bold tracking-[0.22em] uppercase text-zinc-900">Recently Published</span>
            <span className="text-[11px] text-zinc-400">— the latest from across all sections</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
            {(allMixed as (AnyCard & { _section: string })[]).map((item) => (
              <Link key={item.href} href={item.href} className="group border-t border-zinc-200 pt-5">
                {item.image && (
                  <div className="mb-4 overflow-hidden bg-zinc-100 aspect-[16/9]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-[10px] font-bold tracking-[0.16em] uppercase px-1.5 py-0.5 text-white"
                    style={{ backgroundColor: '#cdb079' }}
                  >
                    {item._section}
                  </span>
                  <span className="text-[12px] text-zinc-400">{item.date}</span>
                </div>
                <h3 className="text-[15px] font-semibold leading-snug text-zinc-900 group-hover:text-zinc-500 transition-colors line-clamp-2">
                  {item.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Library ─────────────────────────────────────────────────────────── */}
      <section className="bg-zinc-950 border-b border-zinc-800 py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-8" style={{ backgroundColor: '#cdb079' }} />
                <span className="text-[11px] font-bold tracking-[0.24em] uppercase" style={{ color: '#cdb079' }}>Library</span>
              </div>
              <h2
                className="text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight mb-4"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                Books Worth Your Time
              </h2>
              <p className="text-[15px] text-zinc-400 leading-relaxed max-w-lg mb-7">
                793 books organized for Bible study, theology, pastoral ministry, and Christian formation.
                Curated for pastors, teachers, and serious readers.
              </p>
              <div className="flex flex-wrap gap-2 mb-7">
                {['Bible Study', 'Theology', 'Pastoral', 'Church History', 'Apologetics', 'Christian Living'].map(cat => (
                  <Link
                    key={cat}
                    href={`/library?category=${encodeURIComponent(cat)}`}
                    className="text-[11px] font-semibold tracking-[0.1em] uppercase px-3 py-1.5 border border-zinc-700 text-zinc-400 hover:border-[#cdb079] hover:text-[#cdb079] transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
              <Link
                href="/library"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-[12px] font-bold tracking-[0.14em] uppercase border border-[#cdb079] text-[#cdb079] hover:bg-[#cdb079] hover:text-zinc-950 transition-colors"
              >
                Explore the Library <ArrowRight size={12} />
              </Link>
            </div>
            <BookCovers books={essentialBooks} />
          </div>
        </div>
      </section>

      {/* ── About ───────────────────────────────────────────────────────────── */}
      <section className="relative py-16 lg:py-20 overflow-hidden">
        {/* Subtle background photo */}
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{
            backgroundImage: 'url("/images/Headshots/Austin Duncan Preaching 1.jpg")',
            opacity: 0.06,
          }}
        />
        <div className="absolute inset-0 bg-white/80" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-xl">
            <span className="text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ color: '#cdb079' }}>About</span>
            <h2
              className="mt-3 text-3xl lg:text-4xl font-bold text-zinc-900 leading-tight tracking-tight mb-4"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              I&apos;m Austin.
            </h2>
            <p className="text-[15px] text-zinc-600 leading-relaxed mb-6">
              I&apos;m a pastor and Bible teacher. This site is where I collect everything I&apos;m writing,
              preaching, and studying — sermons, multi-part teaching series, detailed text studies,
              cultural commentary, and a reading list I&apos;ve been building for years. The goal is
              simple: help Christians go deeper into the Bible without making it harder than it needs
              to be.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.14em] uppercase transition-opacity hover:opacity-70"
              style={{ color: '#cdb079' }}
            >
              More about Austin <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
