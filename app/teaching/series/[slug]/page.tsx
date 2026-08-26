import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import {
  TEACHING_SERIES,
  getSeriesBySlug,
} from '@/data/teaching-series'
import {
  getAllTeaching,
  sortByDate,
  isPublished,
  formatDate,
  readingTime,
  type TeachingFrontmatter,
} from '@/lib/content'
import SeriesRoadmap from '@/components/series-roadmap'
import ScrollReveal from '@/components/scroll-reveal'

export const revalidate = 1800

type Params = Promise<{ slug: string }>

export function generateStaticParams() {
  return TEACHING_SERIES.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const meta = getSeriesBySlug(slug)
  if (!meta) return {}
  return {
    title: meta.title,
    description: meta.excerpt,
  }
}

const AMBER_STRIP = `
  repeating-linear-gradient(60deg, transparent, transparent 6px, rgba(255,255,255,0.07) 6px, rgba(255,255,255,0.07) 7px),
  repeating-linear-gradient(-60deg, transparent, transparent 6px, rgba(255,255,255,0.07) 6px, rgba(255,255,255,0.07) 7px)
`

const LANE_HREF: Record<string, string> = {
  'Bible Book Studies': '/teaching/expositional',
  'Biblical Theology': '/teaching/topical',
  'Word Studies': '/teaching/topical',
}

export default async function SeriesLandingPage({ params }: { params: Params }) {
  const { slug } = await params
  const meta = getSeriesBySlug(slug)
  if (!meta) notFound()

  const allFiles = sortByDate(getAllTeaching<TeachingFrontmatter>(meta.type))

  const allSeriesSessions = allFiles
    .filter(({ frontmatter: fm }) => fm.tags?.[fm.tags.length - 1] === meta.seriesTag)
    .map(({ frontmatter: fm, slug: sessionSlug, content }) => ({
      slug: sessionSlug,
      title: fm.title,
      date: formatDate(fm.date),
      excerpt: fm.excerpt,
      readTime: readingTime(content),
      isPublished: isPublished(fm.date),
    }))
    .reverse()

  const publishedSessions = allSeriesSessions.filter((s) => s.isPublished)
  const latestPublished = publishedSessions[publishedSessions.length - 1]

  const startHref = `/teaching/${meta.type}/${meta.startHere}`
  const continueCta =
    meta.status === 'Ongoing' && latestPublished
      ? `/teaching/${meta.type}/${latestPublished.slug}`
      : startHref

  const nextSeries = TEACHING_SERIES.find((s) => s.title === meta.nextAfter)
  const relatedSeriesList = meta.relatedSeries
    .map((relSlug) => TEACHING_SERIES.find((s) => s.slug === relSlug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))

  const laneHref = LANE_HREF[meta.primaryLane] ?? '/teaching'

  return (
    <>
      {/* ── Sticky mobile CTA ─────────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-5 py-3"
        style={{ background: '#141210', borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <Link
          href={startHref}
          className="flex items-center justify-center gap-2 w-full py-3 text-[0.8rem] font-medium tracking-[0.04em] text-white"
          style={{ background: '#7A5C1E' }}
        >
          Start Session 1 <ArrowRight size={13} />
        </Link>
      </div>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div style={{ background: '#141210' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 pt-10">

          {/* Breadcrumb */}
          <div
            className="flex items-center gap-2 text-[0.7rem] font-medium tracking-[0.08em] uppercase mb-10"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            <Link href="/teaching" className="hover:text-[#CDB079] transition-colors">Teaching</Link>
            <span>/</span>
            <Link href={laneHref} className="hover:text-[#CDB079] transition-colors">{meta.primaryLane}</Link>
          </div>

          {/* Cover image — gradient bleeds into dark background below */}
          {meta.image && (
            <div className="relative overflow-hidden mb-8 -mx-6 lg:-mx-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={meta.image}
                alt=""
                className="w-full object-cover"
                style={{ aspectRatio: '3/1', display: 'block', maxHeight: '360px' }}
              />
              <div
                className="absolute inset-x-0 bottom-0 pointer-events-none"
                style={{ height: '55%', background: 'linear-gradient(to bottom, transparent, #141210)' }}
              />
            </div>
          )}

          {/* Lane eyebrow */}
          <div
            className="flex items-center gap-2 text-[0.7rem] font-medium tracking-[0.12em] uppercase mb-4"
            style={{ color: '#CDB079' }}
          >
            <span className="inline-block h-px w-[18px]" style={{ background: '#CDB079' }} />
            {meta.primaryLane}
          </div>

          {/* Title */}
          <h1
            className="uppercase leading-[0.95] mb-3"
            style={{
              fontFamily: 'var(--font-cmg), system-ui, sans-serif',
              fontSize: 'clamp(2.4rem, 4vw, 3.5rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#F9F6F0',
            }}
          >
            {meta.title}
          </h1>

          {/* Subtitle */}
          <p
            className="mb-6 leading-[1.6]"
            style={{
              fontFamily: 'var(--font-source-serif)',
              fontSize: 'clamp(1rem, 1.5vw, 1.15rem)',
              color: '#CDB079',
              fontStyle: 'italic',
            }}
          >
            {meta.subtitle}
          </p>

          {/* Pitch */}
          <p
            className="leading-[1.75] mb-8 max-w-[640px]"
            style={{
              fontFamily: 'var(--font-source-serif)',
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.62)',
            }}
          >
            {meta.whyStudy}
          </p>

          {/* Metadata chips */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <span
              className="text-[0.65rem] font-medium tracking-[0.1em] uppercase px-2.5 py-1"
              style={{
                background: meta.status === 'Ongoing' ? 'rgba(205,176,121,0.15)' : 'rgba(255,255,255,0.07)',
                color: meta.status === 'Ongoing' ? '#CDB079' : 'rgba(255,255,255,0.4)',
                border: `1px solid ${meta.status === 'Ongoing' ? 'rgba(205,176,121,0.4)' : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              {meta.status === 'Ongoing'
                ? `${meta.publishedSessions ?? publishedSessions.length} of ${meta.totalSessions} sessions released`
                : `${meta.totalSessions} sessions · Complete`}
            </span>
            <span
              className="text-[0.65rem] font-medium tracking-[0.1em] uppercase px-2.5 py-1"
              style={{
                background: 'rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {meta.difficulty}
            </span>
            {meta.testament && (
              <span
                className="text-[0.65rem] font-medium tracking-[0.1em] uppercase px-2.5 py-1"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  color: 'rgba(255,255,255,0.4)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {meta.testament}
              </span>
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 pb-12 lg:pb-16">
            <Link
              href={continueCta}
              className="inline-flex items-center gap-2 px-6 py-3 text-[0.8rem] font-medium tracking-[0.04em] text-white transition-opacity hover:opacity-85"
              style={{ background: '#7A5C1E' }}
            >
              {meta.status === 'Ongoing' && latestPublished
                ? 'Continue Latest Session'
                : 'Start Session 1'}
              <ArrowRight size={13} />
            </Link>
            <a
              href="#roadmap"
              className="text-[0.8rem] font-medium pb-px border-b transition-colors hover:text-[#CDB079] hover:border-[#CDB079]"
              style={{ color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.15)' }}
            >
              View Series Roadmap
            </a>
          </div>
        </div>
      </div>

      {/* ── Amber strip ───────────────────────────────────────────────────── */}
      <div
        className="h-[14px] w-full"
        style={{ backgroundColor: '#7A5C1E', backgroundImage: AMBER_STRIP }}
      />

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div style={{ background: '#FAFAF7' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-12 lg:py-16 pb-24 lg:pb-20">
          <div className="flex flex-col lg:flex-row lg:items-start gap-10 lg:gap-14">

            {/* ── Main ──────────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0 space-y-12">

              {/* Why this series */}
              <ScrollReveal>
              <section>
                <div
                  className="flex items-center gap-2.5 text-[0.68rem] font-medium tracking-[0.14em] uppercase mb-6"
                  style={{ color: '#7A5C1E' }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  Why this series
                  <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Best for */}
                  <div style={{ background: '#fff', border: '1px solid #E2DACE' }} className="p-5">
                    <p
                      className="text-[0.65rem] font-medium tracking-[0.1em] uppercase mb-3"
                      style={{ color: '#6E5A2E' }}
                    >
                      Best for
                    </p>
                    <ul className="space-y-2">
                      {meta.bestFor.map((item) => (
                        <li
                          key={item}
                          className="flex gap-2 text-[0.82rem] leading-snug"
                          style={{ color: '#5A544C', fontFamily: 'var(--font-source-serif)' }}
                        >
                          <span className="shrink-0" style={{ color: '#6E5A2E', marginTop: 2 }}>—</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* You'll encounter */}
                  <div style={{ background: '#fff', border: '1px solid #E2DACE' }} className="p-5">
                    <p
                      className="text-[0.65rem] font-medium tracking-[0.1em] uppercase mb-3"
                      style={{ color: '#6E5A2E' }}
                    >
                      You&apos;ll encounter
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {meta.themes.map((theme) => (
                        <span
                          key={theme}
                          className="text-[0.72rem] px-2 py-0.5"
                          style={{ background: '#F2EFE7', color: '#7A5C1E', border: '1px solid #E2DACE' }}
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* By the end */}
                  <div style={{ background: '#fff', border: '1px solid #E2DACE' }} className="p-5">
                    <p
                      className="text-[0.65rem] font-medium tracking-[0.1em] uppercase mb-3"
                      style={{ color: '#6E5A2E' }}
                    >
                      By the end
                    </p>
                    <ul className="space-y-2">
                      {meta.outcomes.map((outcome) => (
                        <li
                          key={outcome}
                          className="flex gap-2 text-[0.82rem] leading-snug"
                          style={{ color: '#5A544C', fontFamily: 'var(--font-source-serif)' }}
                        >
                          <svg
                            width="10" height="10" viewBox="0 0 24 24" fill="none"
                            stroke="#6E5A2E" strokeWidth="2.5"
                            className="shrink-0"
                            style={{ marginTop: 3 }}
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
              </ScrollReveal>

              {/* Roadmap */}
              <ScrollReveal delay={80}>
              <section id="roadmap">
                <div
                  className="flex items-center gap-2.5 text-[0.68rem] font-medium tracking-[0.12em] uppercase mb-4"
                  style={{ color: '#9A9189' }}
                >
                  Series roadmap
                  <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
                  <span>
                    {publishedSessions.length}
                    {meta.totalSessions > publishedSessions.length
                      ? ` of ${meta.totalSessions}`
                      : ''}
                    {' '}published
                  </span>
                </div>

                {/* Progress bar for ongoing series */}
                {meta.status === 'Ongoing' && (
                  <div className="mb-6">
                    <div className="h-1" style={{ background: '#E2DACE' }}>
                      <div
                        className="h-full"
                        style={{
                          width: `${Math.round((publishedSessions.length / meta.totalSessions) * 100)}%`,
                          background: '#6E5A2E',
                          transition: 'width 0.8s ease',
                        }}
                      />
                    </div>
                  </div>
                )}

                <SeriesRoadmap
                  roadmap={meta.roadmap}
                  sessions={allSeriesSessions}
                  type={meta.type}
                />
              </section>
              </ScrollReveal>

              {/* How to use */}
              {meta.howToUse.length > 0 && (
              <ScrollReveal delay={120}>
                <section>
                  <div
                    className="flex items-center gap-2.5 text-[0.68rem] font-medium tracking-[0.12em] uppercase mb-5"
                    style={{ color: '#9A9189' }}
                  >
                    How to use this series
                    <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
                  </div>
                  <div style={{ background: '#fff', border: '1px solid #E2DACE' }} className="p-6">
                    <ul className="space-y-3">
                      {meta.howToUse.map((tip, i) => (
                        <li
                          key={i}
                          className="flex gap-3 text-[0.88rem] leading-[1.65]"
                          style={{ color: '#5A544C', fontFamily: 'var(--font-source-serif)' }}
                        >
                          <span
                            className="shrink-0 text-[0.65rem] font-medium"
                            style={{ color: '#6E5A2E', minWidth: 16, marginTop: 3 }}
                          >
                            {i + 1}.
                          </span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              </ScrollReveal>
              )}
            </div>

            {/* ── Sidebar ───────────────────────────────────────────────── */}
            <div className="lg:w-[272px] shrink-0 space-y-6 lg:sticky lg:top-6">

              {/* Start CTA card */}
              <div style={{ background: '#fff', border: '1px solid #E2DACE' }} className="p-5">
                <Link
                  href={startHref}
                  className="flex items-center justify-center gap-2 w-full py-3 text-[0.8rem] font-medium tracking-[0.04em] text-white transition-opacity hover:opacity-85"
                  style={{ background: '#7A5C1E' }}
                >
                  Start Session 1 <ArrowRight size={13} />
                </Link>

                <div className="mt-4 space-y-2.5 text-[0.78rem]" style={{ color: '#9A9189' }}>
                  <div className="flex justify-between">
                    <span>Sessions</span>
                    <span style={{ color: '#5A544C' }}>
                      {meta.status === 'Ongoing'
                        ? `${meta.publishedSessions ?? publishedSessions.length} of ${meta.totalSessions}`
                        : meta.totalSessions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Difficulty</span>
                    <span style={{ color: '#5A544C' }}>{meta.difficulty}</span>
                  </div>
                  {meta.testament && (
                    <div className="flex justify-between">
                      <span>Testament</span>
                      <span style={{ color: '#5A544C' }}>{meta.testament}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span style={{ color: meta.status === 'Ongoing' ? '#6E5A2E' : '#5A544C' }}>
                      {meta.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Related series */}
              {relatedSeriesList.length > 0 && (
                <div>
                  <p
                    className="text-[0.65rem] font-medium tracking-[0.1em] uppercase mb-3"
                    style={{ color: '#9A9189' }}
                  >
                    Related series
                  </p>
                  <div className="space-y-2">
                    {relatedSeriesList.map((related) => (
                      <Link
                        key={related.slug}
                        href={`/teaching/series/${related.slug}`}
                        className="group flex items-start gap-3 p-3 transition-colors hover:bg-[#F9F6F0]"
                        style={{ background: '#fff', border: '1px solid #E2DACE', display: 'flex' }}
                      >
                        <div className="flex-1 min-w-0">
                          <p
                            className="uppercase leading-[1.15] transition-colors group-hover:text-[#7A5C1E]"
                            style={{
                              fontFamily: 'var(--font-cmg), system-ui, sans-serif',
                              fontSize: '0.95rem',
                              fontWeight: 700,
                              letterSpacing: '-0.02em',
                              color: '#1A1714',
                            }}
                          >
                            {related.title}
                          </p>
                          <p className="text-[0.72rem] mt-0.5" style={{ color: '#9A9189' }}>
                            {related.primaryLane}
                          </p>
                        </div>
                        <ArrowRight
                          size={12}
                          className="shrink-0 mt-1 transition-colors group-hover:text-[#7A5C1E]"
                          style={{ color: '#C8BFA8' }}
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* After this series */}
              {nextSeries && (
                <div>
                  <p
                    className="text-[0.65rem] font-medium tracking-[0.1em] uppercase mb-3"
                    style={{ color: '#9A9189' }}
                  >
                    After this series
                  </p>
                  <Link
                    href={`/teaching/series/${nextSeries.slug}`}
                    className="group p-4 transition-colors hover:bg-[#F9F6F0]"
                    style={{ background: '#fff', border: '1px solid #E2DACE', display: 'block' }}
                  >
                    {nextSeries.image && (
                      <div className="overflow-hidden mb-3" style={{ border: '1px solid #E2DACE' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={nextSeries.image}
                          alt=""
                          className="w-full object-cover"
                          style={{ aspectRatio: '3/1', display: 'block' }}
                        />
                      </div>
                    )}
                    <p
                      className="text-[0.68rem] font-medium tracking-[0.1em] uppercase mb-1"
                      style={{ color: '#6E5A2E' }}
                    >
                      {nextSeries.primaryLane}
                    </p>
                    <p
                      className="uppercase leading-[1.15] mb-1.5 transition-colors group-hover:text-[#7A5C1E]"
                      style={{
                        fontFamily: 'var(--font-cmg), system-ui, sans-serif',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        color: '#1A1714',
                      }}
                    >
                      {nextSeries.title}
                    </p>
                    <p
                      className="text-[0.78rem] leading-relaxed"
                      style={{ fontFamily: 'var(--font-source-serif)', color: '#9A9189' }}
                    >
                      {nextSeries.startHereNote}
                    </p>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
