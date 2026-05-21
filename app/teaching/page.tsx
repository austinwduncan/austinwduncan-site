import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getAllTeaching, sortByDate, isPublished, formatDate, type TeachingFrontmatter } from '@/lib/content'
import { TEACHING_SERIES, TEACHING_LANES, getSeriesByLane, getOngoingSeries } from '@/data/teaching-series'
import SeriesPanel, { type SessionPreview } from '@/components/series-panel'
import TeachingChooser from '@/components/teaching-chooser'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Teaching Series',
  description:
    'Bible studies, theological series, and word studies designed to help Christians read Scripture carefully and follow its logic.',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildSessionMap(): Map<string, SessionPreview[]> {
  const map = new Map<string, SessionPreview[]>()

  for (const type of ['expositional', 'topical'] as const) {
    const all = sortByDate(
      getAllTeaching<TeachingFrontmatter>(type).filter((a) => isPublished(a.frontmatter.date))
    )
    for (const { frontmatter: fm, slug } of all) {
      const seriesTag = fm.tags?.[fm.tags.length - 1] ?? ''
      if (!map.has(seriesTag)) map.set(seriesTag, [])
      map.get(seriesTag)!.push({
        slug,
        title: fm.title,
        date: formatDate(fm.date),
        type,
      })
    }
  }

  return map
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TeachingPage() {
  const sessionMap = buildSessionMap()

  // Build the full series+sessions list for the chooser
  const allSeriesWithSessions = TEACHING_SERIES.map((meta) => ({
    meta,
    sessions: sessionMap.get(meta.seriesTag) ?? [],
  }))

  // Ongoing series for "Currently Releasing" block
  const ongoingSeries = getOngoingSeries()
  const ongoingWithSessions = ongoingSeries.map((meta) => ({
    meta,
    sessions: sessionMap.get(meta.seriesTag) ?? [],
  }))

  // Start Here recommendations
  const startHereRecs = [
    {
      meta: TEACHING_SERIES.find((s) => s.seriesTag === 'The Book of Hebrews')!,
      note: 'Start here for a Christ-centered New Testament study.',
    },
    {
      meta: TEACHING_SERIES.find((s) => s.seriesTag === 'The Book of Daniel')!,
      note: 'Start here for faithfulness, exile, kingdoms, and courage.',
    },
    {
      meta: TEACHING_SERIES.find((s) => s.seriesTag === 'The Covenant')!,
      note: "Start here if you want the Bible's storyline to make more sense.",
    },
    {
      meta: TEACHING_SERIES.find((s) => s.seriesTag === 'Words That Change Everything')!,
      note: "Start here if you like language, translation, and 'wait — that's what that means?' moments.",
    },
  ].filter((r) => r.meta)

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 lg:py-16">
          <span
            className="text-[10px] font-bold tracking-[0.22em] uppercase"
            style={{ color: '#cdb079' }}
          >
            Teaching
          </span>
          <h1
            className="mt-3 text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-zinc-900 max-w-2xl"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            Teaching Series
          </h1>
          <p className="mt-4 text-[15px] text-zinc-500 leading-relaxed max-w-xl">
            Bible studies, theological series, and word studies designed to help Christians read
            Scripture carefully and follow its logic.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#chooser"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[12px] font-bold tracking-[0.14em] uppercase border border-[#cdb079] text-[#cdb079] hover:bg-[#cdb079] hover:text-white transition-colors"
            >
              Help Me Choose <ArrowRight size={12} />
            </a>
            <a
              href="#lanes"
              className="text-[12px] font-semibold tracking-[0.1em] uppercase text-zinc-400 hover:text-zinc-700 transition-colors flex items-center"
            >
              Browse All Series
            </a>
          </div>
        </div>
      </section>

      {/* ── Currently Releasing ──────────────────────────────────────────────── */}
      {ongoingWithSessions.length > 0 && (
        <section className="border-b border-zinc-100 bg-zinc-50 py-10 lg:py-12">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div
              className="flex items-center gap-3 mb-8 pb-3"
              style={{ borderBottom: '2px solid #cdb079' }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#cdb079] animate-pulse" />
              <span className="text-[12px] font-bold tracking-[0.22em] uppercase text-zinc-900">
                Currently Releasing
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {ongoingWithSessions.map(({ meta, sessions }) => {
                const latestSession = sessions[0] // already sorted newest first
                const progressPct = meta.totalSessions
                  ? Math.round(((meta.publishedSessions ?? sessions.length) / meta.totalSessions) * 100)
                  : 0
                return (
                  <div key={meta.seriesTag} className="border border-zinc-200 bg-white p-6">
                    <div className="flex items-start gap-5">
                      {meta.image && (
                        <div className="flex-shrink-0 overflow-hidden bg-zinc-100 aspect-[16/9]" style={{ width: 120 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={meta.image} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-xl font-bold leading-tight tracking-tight text-zinc-900 mb-1"
                          style={{ fontFamily: 'var(--font-cormorant)' }}
                        >
                          {meta.title}
                        </h3>
                        <p className="text-[12px] text-zinc-400 mb-3">
                          {meta.publishedSessions ?? sessions.length} of {meta.totalSessions} sessions released
                        </p>
                        {/* Progress bar */}
                        <div className="h-0.5 bg-zinc-100 mb-4">
                          <div
                            className="h-full"
                            style={{ width: `${progressPct}%`, backgroundColor: '#cdb079' }}
                          />
                        </div>
                      </div>
                    </div>
                    {latestSession && (
                      <div className="mt-4 pt-4 border-t border-zinc-100">
                        <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-zinc-400 mb-1.5">
                          Latest Session
                        </p>
                        <Link
                          href={`/teaching/${meta.type}/${latestSession.slug}`}
                          className="group flex items-start gap-2"
                        >
                          <p className="text-[14px] font-semibold leading-snug text-zinc-800 group-hover:text-zinc-500 transition-colors flex-1">
                            {latestSession.title}
                          </p>
                          <ArrowRight size={12} className="flex-shrink-0 mt-0.5 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                        </Link>
                        <p className="text-[11px] text-zinc-400 mt-1">{latestSession.date}</p>
                      </div>
                    )}
                    <div className="mt-4 pt-4 border-t border-zinc-100">
                      <Link
                        href={`/teaching/${meta.type}/${meta.startHere}`}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] uppercase transition-opacity hover:opacity-70"
                        style={{ color: '#cdb079' }}
                      >
                        Start from Session 1 <ArrowRight size={10} />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Help Me Choose ───────────────────────────────────────────────────── */}
      <section id="chooser" className="border-b border-zinc-100 py-12 lg:py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div
            className="flex items-center gap-3 mb-8 pb-3"
            style={{ borderBottom: '2px solid #cdb079' }}
          >
            <span className="text-[12px] font-bold tracking-[0.22em] uppercase text-zinc-900">
              Help Me Choose
            </span>
          </div>
          <TeachingChooser allSeries={allSeriesWithSessions} />
        </div>
      </section>

      {/* ── Start Here ───────────────────────────────────────────────────────── */}
      <section className="border-b border-zinc-100 bg-zinc-50 py-12 lg:py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div
            className="flex items-center gap-3 mb-8 pb-3"
            style={{ borderBottom: '2px solid #cdb079' }}
          >
            <span className="text-[12px] font-bold tracking-[0.22em] uppercase text-zinc-900">
              Not Sure Where to Begin?
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {startHereRecs.map(({ meta, note }) => (
              <div key={meta.seriesTag} className="border-t-2 pt-4" style={{ borderColor: '#cdb079' }}>
                <h3
                  className="text-[18px] font-bold leading-tight tracking-tight text-zinc-900 mb-2"
                  style={{ fontFamily: 'var(--font-cormorant)' }}
                >
                  {meta.title}
                </h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed mb-4">{note}</p>
                <Link
                  href={`/teaching/${meta.type}/${meta.startHere}`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] uppercase transition-opacity hover:opacity-70"
                  style={{ color: '#cdb079' }}
                >
                  Begin <ArrowRight size={10} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Teaching Lanes ───────────────────────────────────────────────────── */}
      <section id="lanes" className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="space-y-16">
            {TEACHING_LANES.map((lane) => {
              const laneSeries = getSeriesByLane(lane)
              if (laneSeries.length === 0) return null
              return (
                <div key={lane}>
                  <div
                    className="flex items-center gap-3 mb-3 pb-3"
                    style={{ borderBottom: '2px solid #cdb079' }}
                  >
                    <span className="text-[12px] font-bold tracking-[0.22em] uppercase text-zinc-900">
                      {lane}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      — {laneSeries.length} series
                    </span>
                  </div>
                  <p className="text-[13px] text-zinc-500 mb-8">
                    {lane === 'Bible Book Studies' &&
                      'Verse-by-verse studies working through books of the Bible — Old Testament and New.'}
                    {lane === 'Biblical Theology' &&
                      'Studies that trace a theme, doctrine, or practice across the whole story of Scripture.'}
                    {lane === 'Word Studies' &&
                      'Focused studies on the meaning of key biblical terms in the original languages.'}
                  </p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
      </section>
    </>
  )
}
