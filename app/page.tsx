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
import HeroPathCard from '@/components/hero-path-card'
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

  // ── Latest sermon ──────────────────────────────────────────────────────────
  const heroSermon = allSermons[0] ?? null

  // ── Recently published: 1 each from Teaching, WFW, Exegetica, Forum ───────
  const recentItems = [
    allTeachingRaw[0] && {
      section: 'Teaching',
      title: allTeachingRaw[0].frontmatter.title,
      href: `/teaching/${allTeachingRaw[0].teachingType}/${allTeachingRaw[0].slug}`,
      date: fmt(allTeachingRaw[0].frontmatter.date),
    },
    allWfw[0] && {
      section: 'Word for Word',
      title: allWfw[0].frontmatter.title,
      href: `/word-for-word/${allWfw[0].slug}`,
      date: fmt(allWfw[0].frontmatter.date),
    },
    allExegetica[0] && {
      section: 'Exegetica',
      title: allExegetica[0].frontmatter.title,
      href: `/exegetica/${allExegetica[0].slug}`,
      date: fmt(allExegetica[0].frontmatter.date),
    },
    allForum[0] && {
      section: 'Forum & Pulpit',
      title: allForum[0].frontmatter.title,
      href: `/forum-and-pulpit/${allForum[0].slug}`,
      date: fmt(allForum[0].frontmatter.date),
    },
  ].filter(Boolean) as { section: string; title: string; href: string; date: string }[]

  // ── Essential books (3 covers) ─────────────────────────────────────────────
  const essentialBooks = (rawBooks as BookPreview[])
    .filter(b => b.recommendationLevel === 'Essential' && b.coverImageUrl && b.featured)
    .slice(0, 3)
    .map(b => ({ title: b.title, author: b.author, coverImageUrl: b.coverImageUrl! }))

  return (
    <>
      {/* ── Ticker ─────────────────────────────────────────────────────────── */}
      {tickerRaw.length > 0 && <FPTicker items={tickerRaw} />}

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-[55fr_45fr] gap-0">

            {/* Left: identity + promise */}
            <div className="py-10 lg:py-12 lg:pr-14 flex flex-col justify-center gap-5">
              <span
                className="text-[10px] font-bold tracking-[0.22em] uppercase"
                style={{ color: '#cdb079' }}
              >
                Austin W. Duncan
              </span>
              <div>
                <h1
                  className="text-4xl sm:text-5xl lg:text-[2.75rem] font-bold leading-[1.08] tracking-tight text-zinc-900"
                  style={{ fontFamily: 'var(--font-cormorant)' }}
                >
                  Bible teaching for people who want to read Scripture carefully.
                </h1>
                <p className="mt-4 text-[15px] text-zinc-500 leading-relaxed max-w-md">
                  Sermons, articles, studies, and reading guides — for Christians who want depth
                  without being talked down to.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {heroSermon && (
                  <Link
                    href={`/sermons/${heroSermon.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-[12px] font-bold tracking-[0.14em] uppercase border border-[#cdb079] text-[#cdb079] hover:bg-[#cdb079] hover:text-white transition-colors"
                  >
                    Latest Sermon <ArrowRight size={12} />
                  </Link>
                )}
                <Link
                  href="/library"
                  className="text-[12px] font-semibold tracking-[0.1em] uppercase text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  Browse the Library
                </Link>
              </div>
              {/* Mobile quick links */}
              <div className="flex lg:hidden gap-4 flex-wrap">
                {[
                  { label: 'Sermons', href: '/sermons' },
                  { label: 'Word for Word', href: '/word-for-word' },
                  { label: 'Library', href: '/library' },
                ].map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className="text-[11px] font-semibold tracking-[0.1em] uppercase text-zinc-400 hover:text-zinc-700 transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: path card (desktop only) */}
            <div className="hidden lg:flex items-center justify-center border-l border-zinc-100 pl-10 py-10 lg:py-12">
              <div className="w-full max-w-[340px]">
                <HeroPathCard />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Latest Sermon ──────────────────────────────────────────────────── */}
      {heroSermon && (
        <section className="border-b border-zinc-100 py-10 lg:py-12 bg-zinc-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div
              className="flex items-center gap-3 mb-7 pb-3"
              style={{ borderBottom: '2px solid #cdb079' }}
            >
              <span className="text-[12px] font-bold tracking-[0.22em] uppercase text-zinc-900">
                Latest Sermon
              </span>
            </div>
            <div className="grid sm:grid-cols-[auto_1fr] gap-6 lg:gap-10 items-start">
              {heroSermon.frontmatter.image && (
                <Link href={`/sermons/${heroSermon.slug}`} className="block group">
                  <div className="overflow-hidden bg-zinc-100 aspect-[16/9]" style={{ width: 200 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={heroSermon.frontmatter.image}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  </div>
                </Link>
              )}
              <div>
                {heroSermon.frontmatter.scripture && (
                  <p className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-2" style={{ color: '#cdb079' }}>
                    {heroSermon.frontmatter.scripture}
                  </p>
                )}
                <Link href={`/sermons/${heroSermon.slug}`} className="group">
                  <h2
                    className="text-2xl lg:text-3xl font-bold leading-tight tracking-tight text-zinc-900 group-hover:text-zinc-600 transition-colors mb-2"
                    style={{ fontFamily: 'var(--font-cormorant)' }}
                  >
                    {heroSermon.frontmatter.title}
                  </h2>
                </Link>
                {heroSermon.frontmatter.excerpt && (
                  <p className="text-[14px] text-zinc-500 leading-relaxed mb-4 max-w-xl line-clamp-2">
                    {clean(heroSermon.frontmatter.excerpt)}
                  </p>
                )}
                <div className="flex items-center gap-4">
                  <Link
                    href={`/sermons/${heroSermon.slug}`}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] uppercase transition-opacity hover:opacity-70"
                    style={{ color: '#cdb079' }}
                  >
                    Listen Now <ArrowRight size={10} />
                  </Link>
                  <span className="text-[12px] text-zinc-400">{fmt(heroSermon.frontmatter.date)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Teaching series (interactive picker) ───────────────────────────── */}
      {seriesList.length > 0 && (
        <section className="border-b border-zinc-100 py-12 lg:py-14">
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
      {recentItems.length > 0 && (
        <section className="border-b border-zinc-100 bg-zinc-50 py-12 lg:py-14">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div
              className="flex items-center gap-3 mb-8 pb-3"
              style={{ borderBottom: '2px solid #cdb079' }}
            >
              <span className="text-[12px] font-bold tracking-[0.22em] uppercase text-zinc-900">Recently Published</span>
              <span className="text-[11px] text-zinc-400">— one from each section</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recentItems.map((item) => (
                <Link key={item.href} href={item.href} className="group border-t border-zinc-200 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-[9px] font-bold tracking-[0.16em] uppercase px-1.5 py-0.5 text-white whitespace-nowrap"
                      style={{ backgroundColor: '#cdb079' }}
                    >
                      {item.section}
                    </span>
                    <span className="text-[11px] text-zinc-400">{item.date}</span>
                  </div>
                  <h3 className="text-[14px] font-semibold leading-snug text-zinc-900 group-hover:text-zinc-500 transition-colors line-clamp-3">
                    {item.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Library ─────────────────────────────────────────────────────────── */}
      <section className="bg-zinc-950 border-b border-zinc-800 py-12 lg:py-14">
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
            {essentialBooks.length > 0 && <BookCovers books={essentialBooks} />}
          </div>
        </div>
      </section>

      {/* ── About ───────────────────────────────────────────────────────────── */}
      <section className="relative py-16 lg:py-20 overflow-hidden">
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
