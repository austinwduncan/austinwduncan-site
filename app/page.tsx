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
import rawBooks from '@/data/books.json'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Austin W. Duncan',
  description:
    'Pastor, teacher, and theologian — sermons, biblical teaching, scholarly articles, and cultural commentary.',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  })
}

function cleanExcerpt(text?: string): string {
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[11px] font-semibold tracking-[0.14em] uppercase"
      style={{ color: '#cdb079' }}
    >
      {children}
    </span>
  )
}

function SectionHeader({ title, href, label }: { title: string; href: string; label?: string }) {
  return (
    <div
      className="flex items-center gap-3 mb-8 pb-3"
      style={{ borderBottom: '2px solid #cdb079' }}
    >
      <span className="text-[12px] font-bold tracking-[0.22em] uppercase text-zinc-900">
        {label ?? title}
      </span>
      <div className="flex-1" />
      <Link
        href={href}
        className="flex items-center gap-1.5 text-[11px] tracking-[0.12em] uppercase text-zinc-400 hover:text-zinc-900 transition-colors"
      >
        See All <ArrowRight size={10} />
      </Link>
    </div>
  )
}

// ─── Static path options ──────────────────────────────────────────────────────

const PATH_OPTIONS = [
  {
    Icon: BookOpen,
    title: 'Understand the Bible',
    description: 'Verse-by-verse exposition and topical series through Scripture.',
    href: '/teaching',
    label: 'Teaching & Sermons',
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

// ─── Library book type (minimal) ─────────────────────────────────────────────
type BookPreview = { title: string; author: string; coverImageUrl?: string; recommendationLevel?: string; featured?: boolean; category?: string }

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  // ── Content fetching ───────────────────────────────────────────────────────
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

  // ── Teaching series (grouped by last tag, sorted most-recently-active first) ─
  const seriesMap = new Map<string, { image?: string; count: number; slug: string; type: 'expositional' | 'topical'; excerpt?: string }>()
  for (const { frontmatter: fm, slug, teachingType } of allTeachingRaw) {
    const series = fm.tags?.[fm.tags.length - 1] ?? 'Teaching'
    if (!seriesMap.has(series)) {
      seriesMap.set(series, { image: fm.image, count: 0, slug, type: teachingType, excerpt: fm.excerpt })
    }
    seriesMap.get(series)!.count++
    if (fm.image && !seriesMap.get(series)!.image) seriesMap.get(series)!.image = fm.image
  }
  const seriesList = [...seriesMap.entries()]
  const featuredSeries = seriesList[0] ?? null
  const otherSeries = seriesList.slice(1, 4)

  // ── Ticker items (mix from all sections) ───────────────────────────────────
  const tickerItems: TickerItem[] = [
    ...allSermons.slice(0, 2).map(a => ({ title: a.frontmatter.title, date: formatDate(a.frontmatter.date), slug: a.slug, href: `/sermons/${a.slug}` })),
    ...allWfw.slice(0, 2).map(a => ({ title: a.frontmatter.title, date: formatDate(a.frontmatter.date), slug: a.slug, href: `/word-for-word/${a.slug}` })),
    ...allForum.slice(0, 2).map(a => ({ title: a.frontmatter.title, date: formatDate(a.frontmatter.date), slug: a.slug, href: `/forum-and-pulpit/${a.slug}` })),
    ...allExegetica.slice(0, 1).map(a => ({ title: a.frontmatter.title, date: formatDate(a.frontmatter.date), slug: a.slug, href: `/exegetica/${a.slug}` })),
  ]

  // ── Hero: featured sermon + side picks ────────────────────────────────────
  const heroSermon = allSermons[0] ?? null
  const sidePicks = [
    allWfw[0] && { section: 'Word for Word', href: `/word-for-word/${allWfw[0].slug}`, title: allWfw[0].frontmatter.title, date: formatDate(allWfw[0].frontmatter.date), category: allWfw[0].frontmatter.tags?.[0] },
    allForum[0] && { section: 'Forum & Pulpit', href: `/forum-and-pulpit/${allForum[0].slug}`, title: allForum[0].frontmatter.title, date: formatDate(allForum[0].frontmatter.date), category: allForum[0].frontmatter.tags?.[0] },
    allExegetica[0] && { section: 'Exegetica', href: `/exegetica/${allExegetica[0].slug}`, title: allExegetica[0].frontmatter.title, date: formatDate(allExegetica[0].frontmatter.date), category: allExegetica[0].frontmatter.tags?.[0] },
  ].filter(Boolean) as { section: string; href: string; title: string; date: string; category?: string }[]

  // ── Essential books ────────────────────────────────────────────────────────
  const essentialBooks = (rawBooks as BookPreview[])
    .filter(b => b.recommendationLevel === 'Essential' && b.coverImageUrl && b.featured)
    .slice(0, 5)

  return (
    <>
      {/* ── Trending ticker ────────────────────────────────────────────────── */}
      {tickerItems.length > 0 && <FPTicker items={tickerItems} />}

      {/* ── Hero: who Austin is + featured article ─────────────────────────── */}
      <section className="bg-zinc-950 border-b border-zinc-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-[58fr_42fr]">

            {/* Left: positioning statement */}
            <div className="py-14 lg:py-18 lg:pr-14 flex flex-col justify-center gap-6">
              <Greeting />
              <div>
                <h1
                  className="text-4xl sm:text-5xl lg:text-[3.2rem] font-bold leading-[1.05] tracking-tight text-white"
                  style={{ fontFamily: 'var(--font-cormorant)' }}
                >
                  Helping normal Christians read the Bible more carefully.
                </h1>
                <p className="mt-5 text-[16px] text-zinc-400 leading-relaxed max-w-lg font-light">
                  Sermons, teaching series, scholarly studies, and honest answers to hard questions
                  — from a pastor committed to serious, accessible biblical exposition.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#paths"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-[12px] font-bold tracking-[0.14em] uppercase border border-[#cdb079] text-[#cdb079] hover:bg-[rgba(205,176,121,0.1)] transition-colors"
                >
                  Start Here <ArrowRight size={12} />
                </a>
                {heroSermon && (
                  <Link
                    href={`/sermons/${heroSermon.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-[12px] font-bold tracking-[0.14em] uppercase text-zinc-300 border border-zinc-700 hover:border-zinc-500 hover:text-white transition-colors"
                  >
                    Latest Sermon <ArrowRight size={12} />
                  </Link>
                )}
              </div>
            </div>

            {/* Right: featured article + secondary picks */}
            <div className="hidden lg:flex flex-col border-l border-zinc-800">
              {/* Featured sermon */}
              {heroSermon && (
                <Link
                  href={`/sermons/${heroSermon.slug}`}
                  className="group block border-b border-zinc-800 overflow-hidden"
                >
                  {heroSermon.frontmatter.image ? (
                    <div className="relative aspect-[16/9] overflow-hidden bg-zinc-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={heroSermon.frontmatter.image}
                        alt=""
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-85 transition-opacity duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <div className="text-[10px] font-bold tracking-[0.18em] uppercase mb-2" style={{ color: '#cdb079' }}>
                          Currently Featured
                        </div>
                        <h2 className="text-[17px] font-semibold text-white leading-snug group-hover:text-zinc-200 transition-colors">
                          {heroSermon.frontmatter.title}
                        </h2>
                        <p className="mt-1.5 text-[12px] text-zinc-400">{formatDate(heroSermon.frontmatter.date)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-zinc-900">
                      <div className="text-[10px] font-bold tracking-[0.18em] uppercase mb-3" style={{ color: '#cdb079' }}>Currently Featured</div>
                      <h2 className="text-[17px] font-semibold text-white leading-snug">{heroSermon.frontmatter.title}</h2>
                      <p className="mt-2 text-[12px] text-zinc-400">{formatDate(heroSermon.frontmatter.date)}</p>
                    </div>
                  )}
                </Link>
              )}

              {/* Secondary picks */}
              <div className="flex-1 flex flex-col divide-y divide-zinc-800 px-7 py-2">
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-500 py-4">Also —</p>
                {sidePicks.map(pick => (
                  <Link key={pick.href} href={pick.href} className="group py-4">
                    <SectionLabel>{pick.section}</SectionLabel>
                    <h3 className="mt-1.5 text-[14px] font-semibold leading-snug text-zinc-300 group-hover:text-white transition-colors line-clamp-2">
                      {pick.title}
                    </h3>
                    <p className="mt-1 text-[12px] text-zinc-600">{pick.date}</p>
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
          <div className="mb-10">
            <h2 className="text-[12px] font-bold tracking-[0.22em] uppercase text-zinc-900 mb-1">Where Would You Like to Start?</h2>
            <div className="h-0.5 w-full mt-3" style={{ backgroundColor: '#cdb079' }} />
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

      {/* ── Featured teaching series ────────────────────────────────────────── */}
      {seriesList.length > 0 && (
        <section className="border-b border-zinc-100 py-14 lg:py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <SectionHeader title="Teaching Series" href="/teaching" />
            <div className="grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-12">

              {/* Featured series (large) */}
              {featuredSeries && (
                <Link
                  href={`/teaching/${featuredSeries[1].type}/${featuredSeries[1].slug}`}
                  className="group"
                >
                  {featuredSeries[1].image && (
                    <div className="mb-5 overflow-hidden bg-zinc-100 aspect-[16/9]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={featuredSeries[1].image}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-[10px] font-bold tracking-[0.18em] uppercase px-2 py-0.5"
                      style={{ backgroundColor: '#cdb079', color: '#fff' }}
                    >
                      {featuredSeries[1].type === 'expositional' ? 'Expositional' : 'Topical'}
                    </span>
                    <span className="text-[11px] text-zinc-400">{featuredSeries[1].count} session{featuredSeries[1].count !== 1 ? 's' : ''}</span>
                  </div>
                  <h2
                    className="text-2xl lg:text-[1.85rem] font-bold leading-tight tracking-tight text-zinc-900 group-hover:text-zinc-600 transition-colors mb-3"
                    style={{ fontFamily: 'var(--font-cormorant)' }}
                  >
                    {featuredSeries[0]}
                  </h2>
                  {featuredSeries[1].excerpt && (
                    <p className="text-[14px] text-zinc-500 leading-relaxed line-clamp-2">
                      {cleanExcerpt(featuredSeries[1].excerpt)}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-1.5 text-[12px] font-bold tracking-[0.12em] uppercase transition-opacity hover:opacity-70" style={{ color: '#cdb079' }}>
                    Begin Series <ArrowRight size={11} />
                  </div>
                </Link>
              )}

              {/* Other series (stacked) */}
              {otherSeries.length > 0 && (
                <div className="flex flex-col divide-y divide-zinc-100 border-t border-zinc-100 lg:border-t-0 lg:border-l lg:border-zinc-200 lg:pl-10">
                  <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-400 pb-5 hidden lg:block">
                    Also in this series —
                  </p>
                  {otherSeries.map(([name, data]) => (
                    <Link
                      key={name}
                      href={`/teaching/${data.type}/${data.slug}`}
                      className="group py-5 first:pt-0"
                    >
                      <div className="flex gap-4">
                        {data.image && (
                          <div className="flex-shrink-0 w-20 aspect-[16/9] overflow-hidden bg-zinc-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={data.image} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <SectionLabel>{data.type === 'expositional' ? 'Expositional' : 'Topical'}</SectionLabel>
                          <h3 className="mt-1 text-[14px] font-semibold leading-snug text-zinc-800 group-hover:text-zinc-500 transition-colors">
                            {name}
                          </h3>
                          <p className="mt-0.5 text-[12px] text-zinc-400">{data.count} sessions</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <div className="pt-5">
                    <Link
                      href="/teaching"
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] uppercase transition-opacity hover:opacity-70"
                      style={{ color: '#cdb079' }}
                    >
                      All Teaching Series <ArrowRight size={10} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Latest from the study (4 lanes) ────────────────────────────────── */}
      <section className="border-b border-zinc-100 bg-zinc-50 py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div
            className="flex items-center gap-3 mb-10 pb-3"
            style={{ borderBottom: '2px solid #cdb079' }}
          >
            <span className="text-[12px] font-bold tracking-[0.22em] uppercase text-zinc-900">Latest from the Study</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">

            {/* Sermons lane */}
            {allSermons[0] && (() => { const fm = allSermons[0].frontmatter; const slug = allSermons[0].slug; return (
              <div className="flex flex-col gap-3 border-t-2 pt-4" style={{ borderColor: '#cdb079' }}>
                <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-zinc-900">Sermons</p>
                <Link href={`/sermons/${slug}`} className="group">
                  {fm.image && (
                    <div className="mb-3 overflow-hidden bg-zinc-200 aspect-[16/9]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={fm.image} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                    </div>
                  )}
                  <SectionLabel>{primaryBookFromScripture(fm.scripture) ?? 'Sermon'}</SectionLabel>
                  <h3 className="mt-1.5 text-[14px] font-semibold leading-snug text-zinc-900 group-hover:text-zinc-500 transition-colors line-clamp-3">{fm.title}</h3>
                  <p className="mt-1.5 text-[12px] text-zinc-400">{formatDate(fm.date)}</p>
                </Link>
                <Link href="/sermons" className="mt-auto flex items-center gap-1 text-[11px] tracking-[0.1em] uppercase text-zinc-400 hover:text-zinc-900 transition-colors">
                  See all <ArrowRight size={9} />
                </Link>
              </div>
            )})()}

            {/* Word for Word lane */}
            {allWfw[0] && (() => { const fm = allWfw[0].frontmatter; const slug = allWfw[0].slug; return (
              <div className="flex flex-col gap-3 border-t-2 pt-4" style={{ borderColor: '#cdb079' }}>
                <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-zinc-900">Word for Word</p>
                <Link href={`/word-for-word/${slug}`} className="group">
                  {fm.image && (
                    <div className="mb-3 overflow-hidden bg-zinc-200 aspect-[16/9]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={fm.image} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                    </div>
                  )}
                  <SectionLabel>{fm.tags?.[0] ?? 'Word for Word'}</SectionLabel>
                  <h3 className="mt-1.5 text-[14px] font-semibold leading-snug text-zinc-900 group-hover:text-zinc-500 transition-colors line-clamp-3">{fm.title}</h3>
                  <p className="mt-1.5 text-[12px] text-zinc-400">{formatDate(fm.date)}</p>
                </Link>
                <Link href="/word-for-word" className="mt-auto flex items-center gap-1 text-[11px] tracking-[0.1em] uppercase text-zinc-400 hover:text-zinc-900 transition-colors">
                  See all <ArrowRight size={9} />
                </Link>
              </div>
            )})()}

            {/* Exegetica lane */}
            {allExegetica[0] && (() => { const fm = allExegetica[0].frontmatter; const slug = allExegetica[0].slug; return (
              <div className="flex flex-col gap-3 border-t-2 pt-4" style={{ borderColor: '#cdb079' }}>
                <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-zinc-900">Exegetica</p>
                <Link href={`/exegetica/${slug}`} className="group">
                  {fm.image && (
                    <div className="mb-3 overflow-hidden bg-zinc-200 aspect-[16/9]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={fm.image} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                    </div>
                  )}
                  <SectionLabel>{fm.tags?.[0] ?? 'Exegetica'}</SectionLabel>
                  <h3 className="mt-1.5 text-[14px] font-semibold leading-snug text-zinc-900 group-hover:text-zinc-500 transition-colors line-clamp-3">{fm.title}</h3>
                  <p className="mt-1.5 text-[12px] text-zinc-400">{formatDate(fm.date)}</p>
                </Link>
                <Link href="/exegetica" className="mt-auto flex items-center gap-1 text-[11px] tracking-[0.1em] uppercase text-zinc-400 hover:text-zinc-900 transition-colors">
                  See all <ArrowRight size={9} />
                </Link>
              </div>
            )})()}

            {/* Forum & Pulpit lane */}
            {allForum[0] && (() => { const fm = allForum[0].frontmatter; const slug = allForum[0].slug; return (
              <div className="flex flex-col gap-3 border-t-2 pt-4" style={{ borderColor: '#cdb079' }}>
                <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-zinc-900">Forum & Pulpit</p>
                <Link href={`/forum-and-pulpit/${slug}`} className="group">
                  {fm.image && (
                    <div className="mb-3 overflow-hidden bg-zinc-200 aspect-[16/9]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={fm.image} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                    </div>
                  )}
                  <SectionLabel>{fm.tags?.[0] ?? 'Forum & Pulpit'}</SectionLabel>
                  <h3 className="mt-1.5 text-[14px] font-semibold leading-snug text-zinc-900 group-hover:text-zinc-500 transition-colors line-clamp-3">{fm.title}</h3>
                  <p className="mt-1.5 text-[12px] text-zinc-400">{formatDate(fm.date)}</p>
                </Link>
                <Link href="/forum-and-pulpit" className="mt-auto flex items-center gap-1 text-[11px] tracking-[0.1em] uppercase text-zinc-400 hover:text-zinc-900 transition-colors">
                  See all <ArrowRight size={9} />
                </Link>
              </div>
            )})()}
          </div>
        </div>
      </section>

      {/* ── Library preview ─────────────────────────────────────────────────── */}
      <section className="bg-zinc-950 border-b border-zinc-800 py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-center">

            {/* Left: copy */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8" style={{ backgroundColor: '#cdb079' }} />
                <span className="text-[11px] font-bold tracking-[0.24em] uppercase" style={{ color: '#cdb079' }}>Library</span>
              </div>
              <h2
                className="text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight mb-4"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                Books Worth Your Time
              </h2>
              <p className="text-[15px] text-zinc-400 leading-relaxed max-w-lg mb-8">
                793 books curated for Bible study, theology, and Christian formation.
                Organized for pastors, teachers, and serious readers.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
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
                className="inline-flex items-center gap-2 px-5 py-2.5 text-[12px] font-bold tracking-[0.14em] uppercase border transition-colors"
                style={{ borderColor: '#cdb079', color: '#cdb079' }}
              >
                Explore the Library <ArrowRight size={12} />
              </Link>
            </div>

            {/* Right: essential book covers */}
            {essentialBooks.length > 0 && (
              <div className="hidden lg:flex gap-3 items-end">
                {essentialBooks.map((book, i) => (
                  <div
                    key={book.title}
                    className="flex-shrink-0 overflow-hidden bg-zinc-800 shadow-xl"
                    style={{ width: 80 + i * 8, transform: `rotate(${(i - 2) * 1.5}deg)` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={book.coverImageUrl} alt={book.title} className="w-full h-auto" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── About ───────────────────────────────────────────────────────────── */}
      <section className="py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <SectionLabel>About</SectionLabel>
            <h2
              className="mt-3 text-2xl lg:text-3xl font-bold text-zinc-900 leading-tight tracking-tight mb-4"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              I&apos;m Austin.
            </h2>
            <p className="text-[15px] text-zinc-600 leading-relaxed mb-6">
              I serve as a pastor and teacher committed to the faithful exposition of Holy Scripture.
              This site gathers my sermons, articles, teaching series, studies, and reading
              recommendations — built to help Christians grow in Scripture, doctrine, and faithful
              practice, without being talked down to.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.14em] uppercase transition-opacity hover:opacity-70"
              style={{ color: '#cdb079' }}
            >
              About Austin <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
