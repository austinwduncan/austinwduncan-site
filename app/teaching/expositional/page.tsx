import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllTeaching, sortByDate, isPublished, formatDate, type TeachingFrontmatter } from '@/lib/content'
import { TEACHING_SERIES } from '@/data/teaching-series'
import SeriesPanel, { type SessionPreview } from '@/components/series-panel'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Bible Book Studies',
  description: 'Verse-by-verse studies working through books of the Bible.',
}

const OT_SERIES = ['The Book of Daniel', 'The Minor Prophets']
const NT_SERIES = ['The Book of Hebrews']

export default function ExpositionalPage() {
  const all = sortByDate(
    getAllTeaching<TeachingFrontmatter>('expositional').filter((a) => isPublished(a.frontmatter.date))
  )

  const sessionMap = new Map<string, SessionPreview[]>()
  for (const { frontmatter: fm, slug } of all) {
    const seriesTag = fm.tags?.[fm.tags.length - 1] ?? ''
    if (!sessionMap.has(seriesTag)) sessionMap.set(seriesTag, [])
    sessionMap.get(seriesTag)!.push({ slug, title: fm.title, date: formatDate(fm.date), type: 'expositional' })
  }

  const expositionalMeta = TEACHING_SERIES.filter((s) => s.type === 'expositional').sort(
    (a, b) => a.priority - b.priority
  )
  const otSeries = expositionalMeta.filter((s) => OT_SERIES.includes(s.title))
  const ntSeries = expositionalMeta.filter((s) => NT_SERIES.includes(s.title))

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
          Expositional
        </span>
        <h1
          className="mt-2 text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-zinc-900"
          style={{ fontFamily: 'var(--font-cormorant)' }}
        >
          Bible Book Studies
        </h1>
        <p className="mt-4 text-[15px] text-zinc-500 leading-relaxed">
          Verse-by-verse studies working through individual books and collections of the Bible — with
          attention to original context, argument flow, and what it means for us.
        </p>
      </div>

      {/* Recommended starting points */}
      <div className="mb-14">
        <div
          className="flex items-center gap-3 mb-6 pb-3"
          style={{ borderBottom: '2px solid #cdb079' }}
        >
          <span className="text-[12px] font-bold tracking-[0.22em] uppercase text-zinc-900">
            Recommended Starting Points
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {expositionalMeta.map((meta) => (
            <div key={meta.seriesTag} className="border-l-2 pl-4" style={{ borderColor: '#cdb079' }}>
              <h3
                className="text-[18px] font-bold leading-tight tracking-tight text-zinc-900 mb-1"
                style={{ fontFamily: 'var(--font-cormorant)' }}
              >
                {meta.title}
              </h3>
              <p className="text-[13px] text-zinc-500 leading-relaxed mb-3">{meta.startHereNote}</p>
              <Link
                href={`/teaching/expositional/${meta.startHere}`}
                className="text-[11px] font-bold tracking-[0.12em] uppercase transition-opacity hover:opacity-70"
                style={{ color: '#cdb079' }}
              >
                Begin →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Browse by Testament */}
      <div className="space-y-14">
        {otSeries.length > 0 && (
          <div>
            <div
              className="flex items-center gap-3 mb-3 pb-3"
              style={{ borderBottom: '2px solid #cdb079' }}
            >
              <span className="text-[12px] font-bold tracking-[0.22em] uppercase text-zinc-900">
                Old Testament
              </span>
              <span className="text-[11px] text-zinc-400">— {otSeries.length} series</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {otSeries.map((meta) => (
                <SeriesPanel
                  key={meta.seriesTag}
                  meta={meta}
                  sessions={sessionMap.get(meta.seriesTag) ?? []}
                />
              ))}
            </div>
          </div>
        )}

        {ntSeries.length > 0 && (
          <div>
            <div
              className="flex items-center gap-3 mb-3 pb-3"
              style={{ borderBottom: '2px solid #cdb079' }}
            >
              <span className="text-[12px] font-bold tracking-[0.22em] uppercase text-zinc-900">
                New Testament
              </span>
              <span className="text-[11px] text-zinc-400">— {ntSeries.length} series</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {ntSeries.map((meta) => (
                <SeriesPanel
                  key={meta.seriesTag}
                  meta={meta}
                  sessions={sessionMap.get(meta.seriesTag) ?? []}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
