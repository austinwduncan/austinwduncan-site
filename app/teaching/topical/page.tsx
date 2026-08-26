import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllTeaching, sortByDate, isPublished, formatDate, type TeachingFrontmatter } from '@/lib/content'
import { getArticlesBySection } from '@/sanity/lib/queries'
import { TEACHING_SERIES, type TeachingLane } from '@/data/teaching-series'
import SeriesExpander from '@/components/series-expander'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Theological Studies',
  description: 'Biblical theology, word studies, and topical series.',
}

const AMBER_STRIP = `
  repeating-linear-gradient(60deg, transparent, transparent 6px, rgba(255,255,255,0.07) 6px, rgba(255,255,255,0.07) 7px),
  repeating-linear-gradient(-60deg, transparent, transparent 6px, rgba(255,255,255,0.07) 6px, rgba(255,255,255,0.07) 7px)
`

const TOPICAL_GROUPS: { lane: TeachingLane; description: string }[] = [
  {
    lane: 'Biblical Theology',
    description: 'Studies that trace a theme, covenant, or practice across the whole story of Scripture.',
  },
  {
    lane: 'Word Studies',
    description: 'What key terms actually mean in the original Greek and Hebrew — without the intimidation.',
  },
]

export default async function TopicalPage() {
  const mdxAll = sortByDate(
    getAllTeaching<TeachingFrontmatter>('topical').filter((a) => isPublished(a.frontmatter.date))
  )
  const mdxSlugs = new Set(mdxAll.map((a) => a.slug))
  const sanityArticles = await getArticlesBySection('topical')
  const sanityMapped = sanityArticles
    .filter((a) => !mdxSlugs.has(a.slug))
    .map((a) => ({
      slug: a.slug,
      content: '',
      frontmatter: {
        title: a.title,
        date: a.date,
        excerpt: a.excerpt ?? '',
        image: a.image ?? undefined,
        tags: a.tags ?? [],
        series: a.series ?? undefined,
      } as TeachingFrontmatter,
    }))
  const all = sortByDate([...mdxAll, ...sanityMapped])

  const sessionMap = new Map<string, { slug: string; title: string; date: string }[]>()
  for (const { frontmatter: fm, slug } of all) {
    const tag = fm.tags?.[fm.tags.length - 1] ?? ''
    if (!sessionMap.has(tag)) sessionMap.set(tag, [])
    sessionMap.get(tag)!.push({ slug, title: fm.title, date: formatDate(fm.date) })
  }

  const topicalMeta = TEACHING_SERIES.filter((s) => s.type === 'topical')
  const totalSessions = all.length

  return (
    <>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ background: '#141210' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 pt-14">
          <div
            className="flex items-end justify-between gap-8 pb-10 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <div>
              <Link
                href="/teaching"
                className="flex items-center gap-2 text-[0.7rem] font-medium tracking-[0.12em] uppercase mb-3 transition-colors hover:opacity-80"
                style={{ color: '#CDB079' }}
              >
                <span className="inline-block h-px w-[18px]" style={{ background: '#CDB079' }} />
                Teaching
              </Link>
              <h1
                className="uppercase leading-[0.95]"
                style={{
                  fontFamily: 'var(--font-cmg), system-ui, sans-serif',
                  fontSize: 'clamp(2.2rem, 3.5vw, 3rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#F9F6F0',
                }}
              >
                Theological Studies
              </h1>
            </div>
            <div
              className="text-[0.75rem] tracking-[0.04em] pb-0.5 shrink-0"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              {totalSessions} sessions
            </div>
          </div>

          <div className="py-7">
            <p
              className="text-[0.97rem] leading-[1.7] max-w-[580px]"
              style={{ fontFamily: 'var(--font-source-serif)', color: 'rgba(255,255,255,0.45)', fontStyle: 'italic' }}
            >
              <span style={{ fontStyle: 'normal', color: 'rgba(255,255,255,0.72)' }}>
                Multi-part series on key biblical and theological topics
              </span>
              {' '}— biblical theology, word studies, and thematic series for people who want to think carefully about Scripture.
            </p>
          </div>
        </div>
      </div>

      {/* ── Amber strip ───────────────────────────────────────────────────── */}
      <div
        className="h-[14px] w-full"
        style={{ backgroundColor: '#7A5C1E', backgroundImage: AMBER_STRIP }}
      />

      {/* ── Start Here ────────────────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E2DACE' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-10">
          <div
            className="flex items-center gap-2.5 text-[0.68rem] font-medium tracking-[0.14em] uppercase mb-5"
            style={{ color: '#7A5C1E' }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Jump to a series
            <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
          </div>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {topicalMeta.map((meta) => (
              <Link
                key={meta.seriesTag}
                href={`/teaching/topical/${meta.startHere}`}
                className="group p-4 transition-colors"
                style={{ background: '#F9F6F0', border: '1px solid #E2DACE' }}
              >
                <p
                  className="mb-1.5 leading-[1.15] transition-colors group-hover:text-[#7A5C1E]"
                  style={{ fontFamily: 'var(--font-cmg), system-ui, sans-serif', fontWeight: 700, letterSpacing: '-0.02em', color: '#1A1714', fontSize: '1.05rem' }}
                >
                  {meta.title}
                </p>
                <p
                  className="text-[0.78rem] leading-snug"
                  style={{ fontFamily: 'var(--font-source-serif)', color: '#9A9189' }}
                >
                  {meta.startHereNote}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Series ────────────────────────────────────────────────────────── */}
      <div style={{ background: '#FAFAF7' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-12 pb-20 space-y-14">
          {TOPICAL_GROUPS.map(({ lane, description }) => {
            const laneSeries = topicalMeta
              .filter((s) => s.primaryLane === lane)
              .sort((a, b) => a.priority - b.priority)
            if (laneSeries.length === 0) return null
            return (
              <div key={lane}>
                <div
                  className="flex items-center gap-2.5 text-[0.68rem] font-medium tracking-[0.12em] uppercase mb-3"
                  style={{ color: '#9A9189' }}
                >
                  {lane}
                  <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
                  <span style={{ color: '#9A9189' }}>{laneSeries.length} series</span>
                </div>
                <p
                  className="text-[0.88rem] leading-relaxed mb-8"
                  style={{ fontFamily: 'var(--font-source-serif)', color: '#9A9189', fontStyle: 'italic' }}
                >
                  {description}
                </p>
                <div className="space-y-5">
                  {laneSeries.map((meta) => {
                    const sessions = sessionMap.get(meta.seriesTag) ?? []
                    return (
                      <SeriesExpander
                        key={meta.seriesTag}
                        meta={meta}
                        sessions={[...sessions].reverse()}
                        type="topical"
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
