import type { Metadata } from 'next'
import Link from 'next/link'
import { LibraryBig } from 'lucide-react'
import { getAllTeaching, sortByDate, isPublished, formatDate, type TeachingFrontmatter } from '@/lib/content'
import { TEACHING_SERIES, type TeachingLane } from '@/data/teaching-series'
import SeriesExpander from '@/components/series-expander'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Theological Studies',
  description: 'Biblical theology, word studies, and topical series.',
}

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

export default function TopicalPage() {
  const all = sortByDate(
    getAllTeaching<TeachingFrontmatter>('topical').filter((a) => isPublished(a.frontmatter.date))
  )

  const sessionMap = new Map<string, { slug: string; title: string; date: string }[]>()
  for (const { frontmatter: fm, slug } of all) {
    const tag = fm.tags?.[fm.tags.length - 1] ?? ''
    if (!sessionMap.has(tag)) sessionMap.set(tag, [])
    sessionMap.get(tag)!.push({ slug, title: fm.title, date: formatDate(fm.date) })
  }

  const topicalMeta = TEACHING_SERIES.filter((s) => s.type === 'topical')

  return (
    <div className="pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-6 space-y-5">

        {/* Header — stays dark */}
        <section
          className="border border-zinc-800 p-6 sm:p-8"
          style={{ background: 'radial-gradient(circle at top left, #3f3f46, #09090b 55%)' }}
        >
          <Link href="/teaching" className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase text-zinc-500 hover:text-zinc-300 transition-colors mb-6">
            ← Teaching
          </Link>
          <div className="inline-flex items-center gap-2 border border-zinc-800 px-3 py-1.5 mb-5" style={{ background: 'rgba(0,0,0,0.4)' }}>
            <LibraryBig size={12} style={{ color: '#cdb079' }} />
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-zinc-400">Topical</span>
          </div>
          <h1
            className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-white mb-4 max-w-xl"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            Theological Studies
          </h1>
          <p className="text-[15px] leading-relaxed text-zinc-400 max-w-xl">
            Multi-part series on key biblical and theological topics — biblical theology, word studies,
            and thematic studies designed for people who want to think carefully about Scripture.
          </p>
        </section>

        {/* Choose by what you need — light */}
        <section className="border border-zinc-200 bg-white p-6 sm:p-8">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 mb-2">Start here</p>
          <h2
            className="text-2xl font-bold leading-tight tracking-tight text-zinc-900 mb-5"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            Choose by what you need.
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {topicalMeta.map((meta) => (
              <Link
                key={meta.seriesTag}
                href={`/teaching/topical/${meta.startHere}`}
                className="group border border-zinc-200 bg-zinc-50 p-4 hover:border-zinc-300 transition-colors"
              >
                <p className="text-[14px] font-bold text-zinc-900 mb-2 group-hover:text-[#7A5C1E] transition-colors" style={{ fontFamily: 'var(--font-cormorant)' }}>
                  {meta.title}
                </p>
                <p className="text-[12px] leading-relaxed text-zinc-500">{meta.startHereNote}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Groups — light */}
        {TOPICAL_GROUPS.map(({ lane, description }) => {
          const laneSeries = topicalMeta.filter((s) => s.primaryLane === lane).sort((a, b) => a.priority - b.priority)
          if (laneSeries.length === 0) return null
          return (
            <section key={lane} className="border border-zinc-200 bg-white p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 mb-1">Shelf</p>
                  <h2
                    className="text-2xl font-bold leading-tight tracking-tight text-zinc-900"
                    style={{ fontFamily: 'var(--font-cormorant)' }}
                  >
                    {lane}
                  </h2>
                </div>
                <span className="text-[11px] text-zinc-400 border border-zinc-200 px-2.5 py-1 flex-shrink-0">
                  {laneSeries.length} series
                </span>
              </div>
              <p className="text-[13px] text-zinc-500 mb-6">{description}</p>
              <div className="space-y-5">
                {laneSeries.map((meta) => {
                  const sessions = sessionMap.get(meta.seriesTag) ?? []
                  const orderedSessions = [...sessions].reverse()
                  return (
                    <SeriesExpander
                      key={meta.seriesTag}
                      meta={meta}
                      sessions={orderedSessions}
                      type="topical"
                    />
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
