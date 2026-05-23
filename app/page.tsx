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
import { TEACHING_SERIES } from '@/data/teaching-series'

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

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({
  label,
  href,
  count,
}: {
  label: string
  href?: string
  count?: number
}) {
  return (
    <div
      className="flex items-center gap-3 mb-5 pb-2.5"
      style={{ borderBottom: '2px solid #B8892E' }}
    >
      <span
        className="text-[0.72rem] font-black tracking-[0.22em] uppercase"
        style={{ color: '#1A1714' }}
      >
        {label}
      </span>
      <div className="flex-1" />
      {count !== undefined && (
        <span className="text-[0.65rem]" style={{ color: '#9A9189' }}>
          {count}
        </span>
      )}
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-[0.65rem] font-bold tracking-[0.1em] uppercase transition-colors hover:text-[#B8892E]"
          style={{ color: '#9A9189' }}
        >
          All <ArrowRight size={9} />
        </Link>
      )}
    </div>
  )
}

function ArticleCard({
  title,
  href,
  date,
  image,
  section,
}: {
  title: string
  href: string
  date: string
  image?: string
  section: string
}) {
  return (
    <Link href={href} className="group flex flex-col">
      <div
        className="overflow-hidden mb-2.5"
        style={{ aspectRatio: '16/9', background: '#F0EDE6' }}
      >
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        )}
      </div>
      <span
        className="text-[0.55rem] font-bold tracking-[0.14em] uppercase inline-block mb-1.5 px-1.5 py-0.5 text-white self-start"
        style={{ background: '#B8892E' }}
      >
        {section}
      </span>
      <h3
        className="leading-snug transition-colors group-hover:text-[#7A5C1E]"
        style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: '1.05rem',
          fontWeight: 700,
          color: '#1A1714',
        }}
      >
        {title}
      </h3>
      <p className="text-[0.68rem] mt-1" style={{ color: '#9A9189' }}>
        {date}
      </p>
    </Link>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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

  // ── Ticker ───────────────────────────────────────────────────────────────────
  const makeTickerItems = (
    items: { frontmatter: { title: string; date: string }; slug: string }[],
    base: string
  ): TickerItem[] =>
    items.slice(0, 4).map(a => ({
      title: a.frontmatter.title,
      date: fmt(a.frontmatter.date),
      slug: a.slug,
      href: `${base}/${a.slug}`,
    }))

  const tickerRaw: TickerItem[] = []
  const tS = makeTickerItems(allSermons, '/sermons')
  const tW = makeTickerItems(allWfw, '/word-for-word')
  const tF = makeTickerItems(allForum, '/forum-and-pulpit')
  const tE = makeTickerItems(allExegetica, '/exegetica')
  const tT = allTeachingRaw.slice(0, 4).map(a => ({
    title: a.frontmatter.title,
    date: fmt(a.frontmatter.date),
    slug: a.slug,
    href: `/teaching/${a.teachingType}/${a.slug}`,
  }))
  const maxLen = Math.max(tS.length, tW.length, tF.length, tE.length, tT.length)
  for (let i = 0; i < maxLen; i++) {
    if (tS[i]) tickerRaw.push(tS[i])
    if (tW[i]) tickerRaw.push(tW[i])
    if (tF[i]) tickerRaw.push(tF[i])
    if (tE[i]) tickerRaw.push(tE[i])
    if (tT[i]) tickerRaw.push(tT[i])
  }

  // ── Featured pieces ──────────────────────────────────────────────────────────
  const heroSermon = allSermons[0] ?? null

  const dontMiss = [
    allTeachingRaw[0] && {
      section: 'Teaching',
      title: allTeachingRaw[0].frontmatter.title,
      href: `/teaching/${allTeachingRaw[0].teachingType}/${allTeachingRaw[0].slug}`,
      date: fmt(allTeachingRaw[0].frontmatter.date),
      image: allTeachingRaw[0].frontmatter.image,
    },
    allWfw[0] && {
      section: 'Word for Word',
      title: allWfw[0].frontmatter.title,
      href: `/word-for-word/${allWfw[0].slug}`,
      date: fmt(allWfw[0].frontmatter.date),
      image: allWfw[0].frontmatter.image,
    },
    allExegetica[0] && {
      section: 'Exegetica',
      title: allExegetica[0].frontmatter.title,
      href: `/exegetica/${allExegetica[0].slug}`,
      date: fmt(allExegetica[0].frontmatter.date),
      image: allExegetica[0].frontmatter.image,
    },
    allForum[0] && {
      section: 'Forum & Pulpit',
      title: allForum[0].frontmatter.title,
      href: `/forum-and-pulpit/${allForum[0].slug}`,
      date: fmt(allForum[0].frontmatter.date),
      image: allForum[0].frontmatter.image,
    },
  ].filter(Boolean) as { section: string; title: string; href: string; date: string; image?: string }[]

  const featuredSeries = TEACHING_SERIES
    .filter(s => s.featured)
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3)

  const sidebarSeries = TEACHING_SERIES
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5)

  return (
    <>
      {/* ── Masthead ───────────────────────────────────────────────────────── */}
      <div style={{ background: '#FAFAF7', borderBottom: '1px solid #E2DACE' }}>
        <div className="mx-auto max-w-[1200px] px-5">
          <div className="flex items-baseline justify-between py-5">
            <Link
              href="/"
              className="tracking-tight"
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 600,
                color: '#1A1714',
              }}
            >
              Austin W. Duncan
            </Link>
            <p
              className="hidden sm:block text-[0.68rem] font-medium tracking-[0.12em] uppercase"
              style={{ color: '#9A9189' }}
            >
              Pastor · Teacher · Theologian
            </p>
          </div>
        </div>
      </div>

      {/* ── Ticker ─────────────────────────────────────────────────────────── */}
      {tickerRaw.length > 0 && <FPTicker items={tickerRaw} />}

      {/* ── Editorial body ─────────────────────────────────────────────────── */}
      <div style={{ background: '#FAFAF7' }}>
        <div className="mx-auto max-w-[1200px] px-5">
          <div className="flex flex-col lg:flex-row lg:items-start gap-10 lg:gap-14 py-8 lg:py-10">

            {/* ── Main column ─────────────────────────────────────────────── */}
            <main className="flex-1 min-w-0">

              {/* Featured sermon ──────────────────────────────────────────── */}
              {heroSermon && (
                <section className="mb-10">
                  <SectionLabel label="Latest Sermon" href="/sermons" count={allSermons.length} />
                  <Link href={`/sermons/${heroSermon.slug}`} className="group block">
                    {heroSermon.frontmatter.image && (
                      <div
                        className="relative overflow-hidden mb-4"
                        style={{ aspectRatio: '16/9', background: '#F0EDE6' }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={heroSermon.frontmatter.image}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                        <span
                          className="absolute top-3 left-3 text-[0.6rem] font-bold tracking-[0.14em] uppercase px-2 py-0.5 text-white"
                          style={{ background: '#B8892E' }}
                        >
                          Sermon
                        </span>
                      </div>
                    )}
                    {heroSermon.frontmatter.scripture && (
                      <p
                        className="text-[0.68rem] font-bold tracking-[0.14em] uppercase mb-2"
                        style={{ color: '#B8892E' }}
                      >
                        {heroSermon.frontmatter.scripture}
                      </p>
                    )}
                    <h2
                      className="leading-[1.1] tracking-tight mb-3 transition-colors group-hover:text-[#7A5C1E]"
                      style={{
                        fontFamily: 'var(--font-cormorant)',
                        fontSize: 'clamp(1.9rem, 3.5vw, 2.7rem)',
                        fontWeight: 700,
                        color: '#1A1714',
                      }}
                    >
                      {heroSermon.frontmatter.title}
                    </h2>
                    {heroSermon.frontmatter.excerpt && (
                      <p
                        className="text-[0.9rem] leading-relaxed line-clamp-3 mb-4"
                        style={{ fontFamily: 'var(--font-source-serif)', color: '#555' }}
                      >
                        {clean(heroSermon.frontmatter.excerpt)}
                      </p>
                    )}
                    <div className="flex items-center gap-4">
                      <span
                        className="flex items-center gap-1.5 text-[0.7rem] font-bold tracking-[0.14em] uppercase transition-opacity group-hover:opacity-70"
                        style={{ color: '#B8892E' }}
                      >
                        Listen Now <ArrowRight size={11} />
                      </span>
                      <span className="text-[0.75rem]" style={{ color: '#9A9189' }}>
                        {fmt(heroSermon.frontmatter.date)}
                      </span>
                    </div>
                  </Link>
                </section>
              )}

              {/* Don't Miss ───────────────────────────────────────────────── */}
              {dontMiss.length > 0 && (
                <section className="mb-10">
                  <SectionLabel label="Don't Miss" />
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {dontMiss.map((item) => (
                      <ArticleCard key={item.href} {...item} />
                    ))}
                  </div>
                </section>
              )}

              {/* Teaching series ──────────────────────────────────────────── */}
              {featuredSeries.length > 0 && (
                <section className="mb-10">
                  <SectionLabel label="Teaching Series" href="/teaching" />
                  <div className="grid sm:grid-cols-3 gap-5">
                    {featuredSeries.map((series) => (
                      <Link
                        key={series.slug}
                        href={`/teaching/series/${series.slug}`}
                        className="group"
                      >
                        {series.image && (
                          <div
                            className="overflow-hidden mb-2.5"
                            style={{ aspectRatio: '3/1', background: '#F0EDE6' }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={series.image}
                              alt=""
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            />
                          </div>
                        )}
                        <p
                          className="text-[0.6rem] font-bold tracking-[0.12em] uppercase mb-0.5"
                          style={{ color: '#B8892E' }}
                        >
                          {series.primaryLane}
                        </p>
                        <p
                          className="font-bold leading-snug transition-colors group-hover:text-[#7A5C1E]"
                          style={{
                            fontFamily: 'var(--font-cormorant)',
                            fontSize: '1.05rem',
                            color: '#1A1714',
                          }}
                        >
                          {series.title}
                        </p>
                        <p className="text-[0.65rem] mt-0.5" style={{ color: '#9A9189' }}>
                          {series.totalSessions} sessions
                          {series.status === 'Ongoing' ? ' · Ongoing' : ' · Complete'}
                        </p>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-5 pt-4" style={{ borderTop: '1px solid #E2DACE' }}>
                    <Link
                      href="/teaching"
                      className="flex items-center gap-1.5 text-[0.68rem] font-bold tracking-[0.1em] uppercase transition-colors hover:text-[#B8892E]"
                      style={{ color: '#9A9189' }}
                    >
                      Browse all teaching series <ArrowRight size={10} />
                    </Link>
                  </div>
                </section>
              )}

              {/* Word for Word ────────────────────────────────────────────── */}
              {allWfw.length > 0 && (
                <section className="mb-10">
                  <SectionLabel label="Word for Word" href="/word-for-word" count={allWfw.length} />
                  <div
                    className="divide-y"
                    style={{ borderColor: '#E2DACE' }}
                  >
                    {allWfw.slice(0, 7).map((article) => (
                      <Link
                        key={article.slug}
                        href={`/word-for-word/${article.slug}`}
                        className="group flex items-baseline gap-4 py-2.5"
                      >
                        <span
                          className="shrink-0 text-[0.65rem] hidden sm:block"
                          style={{ color: '#C8BFA8', minWidth: 80 }}
                        >
                          {fmt(article.frontmatter.date)}
                        </span>
                        <h3
                          className="text-[0.95rem] font-semibold leading-snug transition-colors group-hover:text-[#7A5C1E]"
                          style={{ fontFamily: 'var(--font-cormorant)', color: '#1A1714' }}
                        >
                          {article.frontmatter.title}
                        </h3>
                        <ArrowRight
                          size={11}
                          className="shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: '#B8892E' }}
                        />
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Exegetica ───────────────────────────────────────────────── */}
              {allExegetica.length > 0 && (
                <section>
                  <SectionLabel label="Exegetica" href="/exegetica" count={allExegetica.length} />
                  <div className="divide-y" style={{ borderColor: '#E2DACE' }}>
                    {allExegetica.slice(0, 5).map((article) => (
                      <Link
                        key={article.slug}
                        href={`/exegetica/${article.slug}`}
                        className="group flex items-baseline gap-4 py-2.5"
                      >
                        <span
                          className="shrink-0 text-[0.65rem] hidden sm:block"
                          style={{ color: '#C8BFA8', minWidth: 80 }}
                        >
                          {fmt(article.frontmatter.date)}
                        </span>
                        <h3
                          className="text-[0.95rem] font-semibold leading-snug transition-colors group-hover:text-[#7A5C1E]"
                          style={{ fontFamily: 'var(--font-cormorant)', color: '#1A1714' }}
                        >
                          {article.frontmatter.title}
                        </h3>
                        <ArrowRight
                          size={11}
                          className="shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: '#B8892E' }}
                        />
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </main>

            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <aside
              className="lg:w-[260px] shrink-0 space-y-9 lg:sticky lg:top-6 lg:self-start"
            >
              {/* About ──────────────────────────────────────────────────── */}
              <div>
                <SectionLabel label="About" href="/about" />
                <p
                  className="text-[0.85rem] leading-[1.75] mb-3"
                  style={{
                    fontFamily: 'var(--font-source-serif)',
                    color: '#5A544C',
                    fontStyle: 'italic',
                  }}
                >
                  I&apos;m a pastor and Bible teacher at Crosswalk Church in Brentwood, TN. This site
                  collects everything I&apos;m writing, preaching, and studying — for Christians who
                  want to go deeper without it being made harder than it needs to be.
                </p>
                <Link
                  href="/about"
                  className="flex items-center gap-1 text-[0.68rem] font-bold tracking-[0.1em] uppercase transition-colors hover:text-[#7A5C1E]"
                  style={{ color: '#B8892E' }}
                >
                  More about Austin <ArrowRight size={9} />
                </Link>
              </div>

              {/* Series ─────────────────────────────────────────────────── */}
              <div>
                <SectionLabel label="Series" href="/teaching" />
                <div className="divide-y" style={{ borderColor: '#E2DACE' }}>
                  {sidebarSeries.map((series) => (
                    <Link
                      key={series.slug}
                      href={`/teaching/series/${series.slug}`}
                      className="group flex items-start gap-3 py-2.5"
                    >
                      {series.image && (
                        <div
                          className="shrink-0 overflow-hidden"
                          style={{ width: 48, aspectRatio: '3/1', background: '#F0EDE6' }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={series.image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p
                          className="text-[0.85rem] font-semibold leading-snug transition-colors group-hover:text-[#7A5C1E]"
                          style={{ fontFamily: 'var(--font-cormorant)', color: '#1A1714' }}
                        >
                          {series.title}
                        </p>
                        <p className="text-[0.65rem] mt-0.5" style={{ color: '#9A9189' }}>
                          {series.totalSessions} sessions
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Library ────────────────────────────────────────────────── */}
              <div>
                <SectionLabel label="Library" href="/library" />
                <p
                  className="text-[0.82rem] leading-[1.65] mb-3"
                  style={{ fontFamily: 'var(--font-source-serif)', color: '#5A544C' }}
                >
                  793 books curated for pastors, teachers, and serious readers.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {['Bible Study', 'Theology', 'Pastoral', 'Church History'].map((cat) => (
                    <Link
                      key={cat}
                      href={`/library?category=${encodeURIComponent(cat)}`}
                      className="text-[0.6rem] font-medium tracking-[0.08em] uppercase px-2 py-0.5 transition-colors hover:text-[#B8892E] hover:border-[#B8892E]"
                      style={{
                        border: '1px solid #E2DACE',
                        color: '#9A9189',
                      }}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
                <Link
                  href="/library"
                  className="flex items-center gap-1 text-[0.68rem] font-bold tracking-[0.1em] uppercase transition-colors hover:text-[#7A5C1E]"
                  style={{ color: '#B8892E' }}
                >
                  Browse the library <ArrowRight size={9} />
                </Link>
              </div>

              {/* Forum & Pulpit ─────────────────────────────────────────── */}
              {allForum.length > 0 && (
                <div>
                  <SectionLabel label="Forum & Pulpit" href="/forum-and-pulpit" />
                  <div className="space-y-3">
                    {allForum.slice(0, 4).map((article) => (
                      <Link
                        key={article.slug}
                        href={`/forum-and-pulpit/${article.slug}`}
                        className="group block"
                      >
                        <p
                          className="text-[0.85rem] font-semibold leading-snug transition-colors group-hover:text-[#7A5C1E] mb-0.5"
                          style={{ fontFamily: 'var(--font-cormorant)', color: '#1A1714' }}
                        >
                          {article.frontmatter.title}
                        </p>
                        <p className="text-[0.65rem]" style={{ color: '#C8BFA8' }}>
                          {fmt(article.frontmatter.date)}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}
