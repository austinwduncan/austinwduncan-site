import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllTeaching, sortByDate, isPublished, formatDate, type TeachingFrontmatter } from '@/lib/content'
import { TEACHING_SERIES, type TeachingLane } from '@/data/teaching-series'
import SeriesPanel, { type SessionPreview } from '@/components/series-panel'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Theological Studies',
  description: 'Biblical theology, word studies, and topical series.',
}

const TOPICAL_LANES: { lane: TeachingLane; label: string; description: string }[] = [
  {
    lane: 'Biblical Theology',
    label: 'Biblical Theology',
    description: 'Studies that trace a theme, doctrine, or covenant across the whole story of Scripture.',
  },
  {
    lane: 'Word Studies',
    label: 'Word Studies',
    description: 'What key terms actually mean in the original Greek and Hebrew — without the intimidation.',
  },
]

export default function TopicalPage() {
  const all = sortByDate(
    getAllTeaching<TeachingFrontmatter>('topical').filter((a) => isPublished(a.frontmatter.date))
  )

  const sessionMap = new Map<string, SessionPreview[]>()
  for (const { frontmatter: fm, slug } of all) {
    const seriesTag = fm.tags?.[fm.tags.length - 1] ?? ''
    if (!sessionMap.has(seriesTag)) sessionMap.set(seriesTag, [])
    sessionMap.get(seriesTag)!.push({ slug, title: fm.title, date: formatDate(fm.date), type: 'topical' })
  }

  const topicalMeta = TEACHING_SERIES.filter((s) => s.type === 'topical')

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 lg:py-16">
      <Link
        href="/teaching"
        className="text-[11px] tracking-wide uppercase text-zinc-400 hover:text-zinc-700 transition-colors"
      >
        ← Teaching
      </Link>

      <div className="mt-5 mb-12 max-w-xl">
        <span
          className="text-[10px] font-bold tracking-[0.22em] uppercase"
          style={{ color: '#cdb079' }}
        >
          Topical
        </span>
        <h1
          className="mt-2 text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-zinc-900"
          style={{ fontFamily: 'var(--font-cormorant)' }}
        >
          Theological Studies
        </h1>
        <p className="mt-4 text-[15px] text-zinc-500 leading-relaxed">
          Multi-part series on key biblical and theological topics — biblical theology, word studies,
          and thematic studies designed for people who want to think carefully about Scripture.
        </p>
      </div>

      <div className="space-y-16">
        {TOPICAL_LANES.map(({ lane, label, description }) => {
          const laneSeries = topicalMeta.filter((s) => s.primaryLane === lane).sort((a, b) => a.priority - b.priority)
          if (laneSeries.length === 0) return null
          return (
            <div key={lane}>
              <div
                className="flex items-center gap-3 mb-3 pb-3"
                style={{ borderBottom: '2px solid #cdb079' }}
              >
                <span className="text-[12px] font-bold tracking-[0.22em] uppercase text-zinc-900">
                  {label}
                </span>
                <span className="text-[11px] text-zinc-400">— {laneSeries.length} series</span>
              </div>
              <p className="text-[13px] text-zinc-500 mb-8">{description}</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {laneSeries.map((meta) => (
                  <SeriesPanel
                    key={meta.seriesTag}
                    meta={meta}
                    sessions={sessionMap.get(meta.seriesTag) ?? []}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
