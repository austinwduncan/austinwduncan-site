import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen, CheckCircle2, ChevronDown } from 'lucide-react'
import { getAllTeaching, sortByDate, isPublished, formatDate, type TeachingFrontmatter } from '@/lib/content'
import { TEACHING_SERIES } from '@/data/teaching-series'
import SeriesExpander from '@/components/series-expander'

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

  const sessionMap = new Map<string, { slug: string; title: string; date: string }[]>()
  for (const { frontmatter: fm, slug } of all) {
    const tag = fm.tags?.[fm.tags.length - 1] ?? ''
    if (!sessionMap.has(tag)) sessionMap.set(tag, [])
    sessionMap.get(tag)!.push({ slug, title: fm.title, date: formatDate(fm.date) })
  }

  const expositionalMeta = TEACHING_SERIES.filter((s) => s.type === 'expositional').sort(
    (a, b) => a.priority - b.priority
  )
  const otSeries = expositionalMeta.filter((s) => OT_SERIES.includes(s.title))
  const ntSeries = expositionalMeta.filter((s) => NT_SERIES.includes(s.title))

  const groups = [
    { label: 'Old Testament', series: otSeries },
    { label: 'New Testament', series: ntSeries },
  ].filter((g) => g.series.length > 0)

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
            <BookOpen size={12} style={{ color: '#cdb079' }} />
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-zinc-400">Expositional</span>
          </div>
          <h1
            className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-white mb-4 max-w-xl"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            Bible Book Studies
          </h1>
          <p className="text-[15px] leading-relaxed text-zinc-400 max-w-xl">
            Verse-by-verse studies working through individual books and collections of the Bible —
            with attention to original context, argument flow, and what it means for us.
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
            {expositionalMeta.map((meta) => (
              <Link
                key={meta.seriesTag}
                href={`/teaching/expositional/${meta.startHere}`}
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

        {/* Series groups — light */}
        {groups.map(({ label, series }) => (
          <section key={label} className="border border-zinc-200 bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 mb-1">Shelf</p>
                <h2
                  className="text-2xl font-bold leading-tight tracking-tight text-zinc-900"
                  style={{ fontFamily: 'var(--font-cormorant)' }}
                >
                  {label}
                </h2>
              </div>
              <span className="text-[11px] text-zinc-400 border border-zinc-200 px-2.5 py-1 flex-shrink-0">
                {series.length} series
              </span>
            </div>
            <div className="space-y-5">
              {series.map((meta) => {
                const sessions = sessionMap.get(meta.seriesTag) ?? []
                const orderedSessions = [...sessions].reverse()
                return (
                  <SeriesExpander
                    key={meta.seriesTag}
                    meta={meta}
                    sessions={orderedSessions}
                    type="expositional"
                  />
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
