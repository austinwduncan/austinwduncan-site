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
  type TeachingFrontmatter,
} from '@/lib/content'

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

  const allSessions = sortByDate(
    getAllTeaching<TeachingFrontmatter>(meta.type).filter((a) => isPublished(a.frontmatter.date))
  )

  const sessions = allSessions
    .filter(({ frontmatter: fm }) => fm.tags?.[fm.tags.length - 1] === meta.seriesTag)
    .map(({ frontmatter: fm, slug: sessionSlug }) => ({
      slug: sessionSlug,
      title: fm.title,
      date: formatDate(fm.date),
    }))
    .reverse()

  const unreleased = meta.totalSessions - sessions.length
  const nextSeries = TEACHING_SERIES.find((s) => s.title === meta.nextAfter)

  const laneHref = LANE_HREF[meta.primaryLane] ?? '/teaching'

  return (
    <>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ background: '#141210' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 pt-10">

          {/* Breadcrumb */}
          <div
            className="flex items-center gap-2 text-[0.7rem] font-medium tracking-[0.08em] uppercase mb-8"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            <Link href="/teaching" className="hover:text-[#B8892E] transition-colors">Teaching</Link>
            <span>/</span>
            <Link href={laneHref} className="hover:text-[#B8892E] transition-colors">{meta.primaryLane}</Link>
          </div>

          {/* Lane eyebrow */}
          <div
            className="flex items-center gap-2 text-[0.7rem] font-medium tracking-[0.12em] uppercase mb-4"
            style={{ color: '#B8892E' }}
          >
            <span className="inline-block h-px w-[18px]" style={{ background: '#B8892E' }} />
            {meta.primaryLane}
          </div>

          {/* Title */}
          <h1
            className="leading-[1.1] tracking-tight mb-5"
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(2.4rem, 4vw, 3.5rem)',
              fontWeight: 400,
              color: '#F9F6F0',
            }}
          >
            {meta.title}
          </h1>

          {/* Meta chips */}
          <div className="flex flex-wrap items-center gap-3 mb-10">
            <span
              className="text-[0.65rem] font-medium tracking-[0.1em] uppercase px-2.5 py-1"
              style={{
                background: meta.status === 'Ongoing' ? 'rgba(184,137,46,0.15)' : 'rgba(255,255,255,0.07)',
                color: meta.status === 'Ongoing' ? '#B8892E' : 'rgba(255,255,255,0.4)',
                border: `1px solid ${meta.status === 'Ongoing' ? 'rgba(184,137,46,0.4)' : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              {meta.status === 'Ongoing'
                ? `${meta.publishedSessions ?? sessions.length} of ${meta.totalSessions} sessions released`
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
            <span
              className="text-[0.65rem] font-medium tracking-[0.1em] uppercase px-2.5 py-1"
              style={{
                background: 'rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {meta.type === 'expositional' ? 'Expositional' : 'Topical'}
            </span>
          </div>

          {/* Cover image */}
          {meta.image && (
            <div className="overflow-hidden -mx-6 lg:-mx-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={meta.image}
                alt=""
                className="w-full object-cover"
                style={{ aspectRatio: '3/1', display: 'block', maxHeight: '340px' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Amber strip ───────────────────────────────────────────────────── */}
      <div
        className="h-[14px] w-full"
        style={{ backgroundColor: '#7A5C1E', backgroundImage: AMBER_STRIP }}
      />

      {/* ── Series overview ───────────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E2DACE' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-12 lg:py-14">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

            {/* Left: description + CTA */}
            <div className="flex-1 min-w-0">
              <div
                className="flex items-center gap-2.5 text-[0.68rem] font-medium tracking-[0.14em] uppercase mb-4"
                style={{ color: '#7A5C1E' }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Why study this
              </div>
              <p
                className="text-[1rem] leading-[1.75] mb-5"
                style={{ fontFamily: 'var(--font-source-serif)', color: '#1A1714' }}
              >
                {meta.whyStudy}
              </p>
              <p
                className="text-[0.92rem] leading-[1.7] mb-8 pl-4 border-l-2 italic"
                style={{
                  fontFamily: 'var(--font-source-serif)',
                  color: '#9A9189',
                  borderColor: '#C8A96A',
                }}
              >
                {meta.bestFor}
              </p>

              <Link
                href={`/teaching/${meta.type}/${meta.startHere}`}
                className="inline-flex items-center gap-2 px-6 py-3 text-[0.8rem] font-medium tracking-[0.04em] text-white transition-opacity hover:opacity-85"
                style={{ background: '#7A5C1E' }}
              >
                Start with Session 1 <ArrowRight size={14} />
              </Link>
            </div>

            {/* Right: outcomes */}
            <div className="lg:w-80 shrink-0">
              <p
                className="text-[0.68rem] font-medium tracking-[0.1em] uppercase mb-4"
                style={{ color: '#9A9189' }}
              >
                By the end, you&apos;ll be able to
              </p>
              <div className="space-y-2.5">
                {meta.outcomes.map((outcome) => (
                  <div
                    key={outcome}
                    className="flex gap-3 p-3.5"
                    style={{ background: '#F9F6F0', border: '1px solid #E2DACE' }}
                  >
                    <svg
                      width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="#B8892E" strokeWidth="2.5"
                      className="shrink-0 mt-0.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span
                      className="text-[0.85rem] leading-snug"
                      style={{ fontFamily: 'var(--font-source-serif)', color: '#5A544C' }}
                    >
                      {outcome}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Session timeline ──────────────────────────────────────────────── */}
      <div style={{ background: '#FAFAF7' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-12">
          <div
            className="flex items-center gap-2.5 text-[0.68rem] font-medium tracking-[0.12em] uppercase mb-10"
            style={{ color: '#9A9189' }}
          >
            All Sessions
            <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
            <span>{sessions.length}{unreleased > 0 ? ` of ${meta.totalSessions}` : ''} published</span>
          </div>

          <div className="max-w-[700px]">
            <div className="relative">
              {/* Vertical line */}
              <div
                className="absolute left-[13px] top-0 bottom-0 w-px"
                style={{ background: '#E2DACE' }}
              />

              {sessions.map((session, i) => (
                <Link
                  key={session.slug}
                  href={`/teaching/${meta.type}/${session.slug}`}
                  className="group relative flex items-start gap-5 py-3.5"
                >
                  {/* Circle */}
                  <div
                    className="relative z-10 flex-shrink-0 flex items-center justify-center rounded-full transition-colors"
                    style={{
                      width: 28,
                      height: 28,
                      background: '#fff',
                      border: '2px solid #C8A96A',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      color: '#B8892E',
                    }}
                  >
                    {i + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex items-baseline justify-between gap-4 pt-0.5">
                    <h3
                      className="leading-snug transition-colors group-hover:text-[#7A5C1E]"
                      style={{
                        fontFamily: 'var(--font-cormorant)',
                        fontSize: '1.1rem',
                        fontWeight: 500,
                        color: '#1A1714',
                      }}
                    >
                      {session.title}
                    </h3>
                    <span
                      className="shrink-0 text-[0.72rem] hidden sm:block"
                      style={{ color: '#9A9189' }}
                    >
                      {session.date}
                    </span>
                  </div>

                  {/* Arrow */}
                  <ArrowRight
                    size={13}
                    className="shrink-0 mt-1 transition-colors"
                    style={{ color: '#C8BFA8' }}
                  />
                </Link>
              ))}

              {/* Unreleased placeholder */}
              {unreleased > 0 && (
                <div className="relative flex items-start gap-5 py-3.5">
                  <div
                    className="relative z-10 flex-shrink-0 flex items-center justify-center rounded-full"
                    style={{
                      width: 28,
                      height: 28,
                      background: '#F9F6F0',
                      border: '2px dashed #E2DACE',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      color: '#C8BFA8',
                    }}
                  >
                    {sessions.length + 1}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p
                      className="text-[0.9rem] italic"
                      style={{ fontFamily: 'var(--font-source-serif)', color: '#C8BFA8' }}
                    >
                      {unreleased === 1 ? '1 more session' : `${unreleased} more sessions`} coming
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── What to read next ─────────────────────────────────────────────── */}
      {nextSeries && (
        <div style={{ background: '#fff', borderTop: '1px solid #E2DACE' }}>
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-10">
            <div
              className="flex items-center gap-2.5 text-[0.68rem] font-medium tracking-[0.12em] uppercase mb-6"
              style={{ color: '#9A9189' }}
            >
              What to read next
              <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
            </div>
            <Link
              href={`/teaching/series/${nextSeries.slug}`}
              className="group flex flex-col sm:flex-row gap-5 sm:gap-8 sm:items-center"
            >
              {nextSeries.image && (
                <div
                  className="sm:w-48 shrink-0 overflow-hidden"
                  style={{ border: '1px solid #E2DACE' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={nextSeries.image}
                    alt=""
                    className="w-full object-cover"
                    style={{ aspectRatio: '3/1', display: 'block' }}
                  />
                </div>
              )}
              <div>
                <p
                  className="text-[0.7rem] font-medium tracking-[0.1em] uppercase mb-1.5"
                  style={{ color: '#B8892E' }}
                >
                  {nextSeries.primaryLane}
                </p>
                <h3
                  className="mb-1.5 transition-colors group-hover:text-[#7A5C1E]"
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: '1.4rem',
                    fontWeight: 500,
                    color: '#1A1714',
                  }}
                >
                  {nextSeries.title}
                </h3>
                <p
                  className="text-[0.85rem] leading-relaxed"
                  style={{ fontFamily: 'var(--font-source-serif)', color: '#9A9189' }}
                >
                  {nextSeries.startHereNote}
                </p>
              </div>
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
