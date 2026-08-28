'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, Flame, Map, Tags, ListChecks, BookOpen } from 'lucide-react'
import type { SeriesMetadata } from '@/data/teaching-series'

export type SessionPreview = {
  slug: string
  title: string
  date: string
  type: 'expositional' | 'topical'
}

export type SeriesWithSessions = {
  meta: SeriesMetadata
  sessions: SessionPreview[]
}

const AMBER_STRIP = `
  repeating-linear-gradient(60deg, transparent, transparent 6px, rgba(255,255,255,0.07) 6px, rgba(255,255,255,0.07) 7px),
  repeating-linear-gradient(-60deg, transparent, transparent 6px, rgba(255,255,255,0.07) 6px, rgba(255,255,255,0.07) 7px)
`

const INTENTS = [
  { id: 'see-jesus',       label: 'I want to see Jesus more clearly',                  Icon: Sparkles   },
  { id: 'faith-pressure',  label: 'I need help staying faithful under pressure',        Icon: Flame      },
  { id: 'whole-bible',     label: "I want the Bible's storyline to make sense",         Icon: Map        },
  { id: 'words',           label: 'I like word studies and translation details',        Icon: Tags       },
  { id: 'christian-life',  label: "I'm asking hard questions about Christian living",   Icon: ListChecks },
  { id: 'old-testament',   label: 'I want to understand the Old Testament',             Icon: BookOpen   },
]

export default function TeachingHub({ allSeries }: { allSeries: SeriesWithSessions[] }) {
  const [activeIntent, setActiveIntent] = useState<string | null>(null)

  const totalSessions = allSeries.reduce((sum, { sessions }) => sum + sessions.length, 0)

  const recommended = activeIntent
    ? allSeries.find(({ meta }) => meta.intents.includes(activeIntent))
    : null

  const expositional = allSeries.filter(({ meta }) => meta.type === 'expositional')
  const topical = allSeries.filter(({ meta }) => meta.type === 'topical')

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
              <div
                className="flex items-center gap-2 text-[0.7rem] font-medium tracking-[0.12em] uppercase mb-3"
                style={{ color: '#CDB079' }}
              >
                <span className="inline-block h-px w-[18px]" style={{ background: '#CDB079' }} />
                Library
              </div>
              <h1
                className="uppercase tracking-tight"
                style={{
                  fontFamily: 'var(--font-cmg), system-ui, sans-serif',
                  fontSize: 'clamp(2.2rem, 3.5vw, 3rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  lineHeight: 0.95,
                  color: '#F9F6F0',
                }}
              >
                Teaching
              </h1>
            </div>
            <div className="hidden sm:flex gap-8 pb-0.5 shrink-0">
              <Stat num={allSeries.length} label="Series" />
              <Stat num={totalSessions} label="Sessions" />
            </div>
          </div>

          <div className="py-7">
            <p
              className="text-[0.97rem] leading-[1.7] max-w-[580px]"
              style={{ fontFamily: 'var(--font-cmg), system-ui, sans-serif', color: 'rgba(255,255,255,0.45)', fontStyle: 'italic' }}
            >
              <span style={{ fontStyle: 'normal', color: 'rgba(255,255,255,0.72)' }}>
                Verse-by-verse Bible studies and theological series
              </span>
              {' '}— designed for people who want to read Scripture carefully and understand what they find.
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
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-12">
          <div
            className="flex items-center gap-2.5 text-[0.68rem] font-medium tracking-[0.14em] uppercase mb-6"
            style={{ color: '#7A5C1E' }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Not sure where to start
            <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
          </div>

          <h2
            className="mb-6 uppercase"
            style={{
              fontFamily: 'var(--font-cmg), system-ui, sans-serif',
              fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              color: '#1A1714',
            }}
          >
            What brings you here today?
          </h2>

          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {INTENTS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveIntent(activeIntent === id ? null : id)}
                className="group text-left flex items-start gap-3 p-4 transition-all"
                style={{
                  background: activeIntent === id ? '#F9F3E8' : '#F9F6F0',
                  border: `1px solid ${activeIntent === id ? '#CDB079' : '#E2DACE'}`,
                }}
              >
                <Icon
                  size={13}
                  className="mt-0.5 shrink-0"
                  style={{ color: activeIntent === id ? '#CDB079' : '#9A9189' }}
                />
                <span
                  className="text-[0.83rem] leading-snug"
                  style={{
                    fontFamily: 'var(--font-cmg), system-ui, sans-serif',
                    color: activeIntent === id ? '#7A5C1E' : '#5A544C',
                  }}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>

          {recommended && (
            <div
              className="mt-6 p-5 sm:p-7"
              style={{ background: '#F9F3E8', border: '1px solid #C8A96A' }}
            >
              <div
                className="text-[0.68rem] font-medium tracking-[0.14em] uppercase mb-4"
                style={{ color: '#6E5A2E' }}
              >
                Recommended for you
              </div>
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 sm:items-start">
                <div className="flex-1 min-w-0">
                  <h3
                    className="mb-2 uppercase"
                    style={{
                      fontFamily: 'var(--font-cmg), system-ui, sans-serif',
                      fontSize: 'clamp(1.4rem, 2vw, 1.8rem)',
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      lineHeight: 1.15,
                      color: '#1A1714',
                    }}
                  >
                    {recommended.meta.title}
                  </h3>
                  <p
                    className="text-[0.9rem] leading-[1.7] mb-5"
                    style={{ fontFamily: 'var(--font-cmg), system-ui, sans-serif', color: '#5A544C' }}
                  >
                    {recommended.meta.whyStudy}
                  </p>
                  <Link
                    href={`/teaching/${recommended.meta.type}/${recommended.meta.startHere}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-[0.76rem] font-medium tracking-[0.04em] text-white transition-opacity hover:opacity-85"
                    style={{ background: '#7A5C1E' }}
                  >
                    Start with Session 1 <ArrowRight size={12} />
                  </Link>
                </div>
                {recommended.sessions.length > 0 && (
                  <div
                    className="sm:w-56 shrink-0"
                    style={{ border: '1px solid #C8A96A', background: '#fff' }}
                  >
                    <p
                      className="px-4 pt-3 pb-2 text-[0.65rem] font-medium tracking-[0.1em] uppercase"
                      style={{ color: '#9A9189' }}
                    >
                      First sessions
                    </p>
                    {recommended.sessions.slice(0, 4).map((s, i) => (
                      <Link
                        key={s.slug}
                        href={`/teaching/${s.type}/${s.slug}`}
                        className="group flex items-center gap-3 px-4 py-2 border-t transition-colors hover:bg-[#F9F3E8]"
                        style={{ borderColor: '#E2DACE' }}
                      >
                        <span
                          className="text-[0.65rem] font-medium shrink-0 w-4 text-right"
                          style={{ color: '#6E5A2E' }}
                        >
                          {i + 1}
                        </span>
                        <span
                          className="text-[0.78rem] leading-snug flex-1 line-clamp-1 transition-colors group-hover:text-[#7A5C1E]"
                          style={{ color: '#5A544C', fontFamily: 'var(--font-cmg), system-ui, sans-serif' }}
                        >
                          {s.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Series ────────────────────────────────────────────────────────── */}
      <div style={{ background: '#FAFAF7' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-12 pb-20 space-y-14">
          {expositional.length > 0 && (
            <LaneSection
              label="Bible Book Studies"
              description="Verse-by-verse studies working through individual books and collections of the Bible — with attention to original context, argument flow, and what it means for us."
              seriesList={expositional}
              linkPath="/teaching/expositional"
            />
          )}
          {topical.length > 0 && (
            <LaneSection
              label="Theological Studies"
              description="Multi-part series tracing themes, covenants, and key words across the whole of Scripture — for people who want to think carefully."
              seriesList={topical}
              linkPath="/teaching/topical"
            />
          )}
        </div>
      </div>
    </>
  )
}

function Stat({ num, label }: { num: number; label: string }) {
  return (
    <div className="text-center">
      <span
        className="block leading-none mb-1"
        style={{ fontFamily: 'var(--font-cmg), system-ui, sans-serif', fontSize: '1.9rem', fontWeight: 700, color: '#CDB079' }}
      >
        {num}
      </span>
      <span
        className="text-[0.65rem] font-medium tracking-[0.1em] uppercase block"
        style={{ color: 'rgba(255,255,255,0.22)' }}
      >
        {label}
      </span>
    </div>
  )
}

function LaneSection({
  label,
  description,
  seriesList,
  linkPath,
}: {
  label: string
  description: string
  seriesList: SeriesWithSessions[]
  linkPath: string
}) {
  return (
    <div>
      <div
        className="flex items-center gap-2.5 text-[0.68rem] font-medium tracking-[0.12em] uppercase mb-2"
        style={{ color: '#9A9189' }}
      >
        {label}
        <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
        <Link
          href={linkPath}
          className="shrink-0 transition-colors hover:text-[#7A5C1E]"
          style={{ color: '#9A9189' }}
        >
          Browse all →
        </Link>
      </div>
      <p
        className="text-[0.88rem] leading-relaxed mb-8"
        style={{ fontFamily: 'var(--font-cmg), system-ui, sans-serif', color: '#9A9189', fontStyle: 'italic' }}
      >
        {description}
      </p>
      <div className="space-y-5">
        {seriesList.map(({ meta, sessions }) => (
          <SeriesCard key={meta.seriesTag} meta={meta} sessions={sessions} />
        ))}
      </div>
    </div>
  )
}

function SeriesCard({ meta, sessions }: { meta: SeriesMetadata; sessions: SessionPreview[] }) {
  const [open, setOpen] = useState(false)
  const visible = open ? sessions : sessions.slice(0, 4)

  return (
    <article style={{ background: '#fff', border: '1px solid #E2DACE' }}>
      {/* Banner image — full width above columns */}
      {meta.image && (
        <div className="overflow-hidden" style={{ borderBottom: '1px solid #E2DACE' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={meta.image} alt="" className="w-full object-cover" style={{ aspectRatio: '3/1', display: 'block' }} />
        </div>
      )}

      {/* Two-column body */}
      <div className="flex flex-col lg:flex-row">
        {/* Left */}
        <div
          className="flex-1 p-6 sm:p-7 border-b lg:border-b-0 lg:border-r"
          style={{ borderColor: '#E2DACE' }}
        >
          <div className="flex flex-wrap gap-2 mb-4">
            <span
              className="text-[0.65rem] font-medium tracking-[0.1em] uppercase px-2 py-0.5"
              style={{
                background: meta.status === 'Ongoing' ? '#F9F3E8' : '#F2EFE7',
                color: meta.status === 'Ongoing' ? '#6E5A2E' : '#9A9189',
                border: `1px solid ${meta.status === 'Ongoing' ? '#C8A96A' : '#E2DACE'}`,
              }}
            >
              {meta.status === 'Ongoing'
                ? `${meta.publishedSessions ?? sessions.length} of ${meta.totalSessions} released`
                : `${meta.totalSessions} sessions`}
            </span>
            <span
              className="text-[0.65rem] font-medium tracking-[0.1em] uppercase px-2 py-0.5"
              style={{ background: '#F2EFE7', color: '#9A9189', border: '1px solid #E2DACE' }}
            >
              {meta.difficulty}
            </span>
          </div>

          <h3
            className="mb-3 uppercase tracking-tight"
            style={{
              fontFamily: 'var(--font-cmg), system-ui, sans-serif',
              fontSize: 'clamp(1.4rem, 2.5vw, 1.75rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              color: '#1A1714',
            }}
          >
            {meta.title}
          </h3>

          <p
            className="text-[0.92rem] leading-[1.7] mb-4"
            style={{ fontFamily: 'var(--font-cmg), system-ui, sans-serif', color: '#5A544C' }}
          >
            {meta.whyStudy}
          </p>

          <p
            className="text-[0.85rem] leading-[1.65] mb-5 pl-3 border-l-2 italic"
            style={{ fontFamily: 'var(--font-cmg), system-ui, sans-serif', color: '#9A9189', borderColor: '#C8A96A' }}
          >
            {meta.bestFor[0]}
          </p>

          {meta.status === 'Ongoing' && (
            <ProgressBar
              released={meta.publishedSessions ?? sessions.length}
              total={meta.totalSessions}
            />
          )}

          <div className="flex flex-wrap items-center gap-4 mt-5">
            <Link
              href={`/teaching/series/${meta.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[0.76rem] font-medium tracking-[0.04em] text-white transition-opacity hover:opacity-85"
              style={{ background: '#7A5C1E' }}
            >
              Open Series <ArrowRight size={12} />
            </Link>
            <button
              onClick={() => setOpen(!open)}
              className="text-[0.76rem] font-medium pb-px border-b transition-colors hover:text-[#7A5C1E] hover:border-[#7A5C1E]"
              style={{ color: '#9A9189', borderColor: '#E2DACE' }}
            >
              {open ? 'Hide sessions' : 'Preview sessions'}
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="lg:w-[272px] shrink-0 p-6 sm:p-7">
          <p
            className="text-[0.65rem] font-medium tracking-[0.1em] uppercase mb-3"
            style={{ color: '#9A9189' }}
          >
            By the end, you&apos;ll be able to
          </p>
          <div className="space-y-2 mb-5">
            {meta.outcomes.slice(0, 3).map((outcome) => (
              <div
                key={outcome}
                className="flex gap-2.5 p-3 text-[0.8rem] leading-snug"
                style={{ background: '#F9F6F0', border: '1px solid #E2DACE', color: '#5A544C' }}
              >
                <svg
                  width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke="#CDB079" strokeWidth="2.5"
                  className="shrink-0 mt-0.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span style={{ fontFamily: 'var(--font-cmg), system-ui, sans-serif' }}>{outcome}</span>
              </div>
            ))}
          </div>

          <div style={{ border: '1px solid #E2DACE' }}>
            <p
              className="px-4 pt-3 pb-2 text-[0.65rem] font-medium tracking-[0.1em] uppercase"
              style={{ color: '#9A9189' }}
            >
              Session path
            </p>
            {visible.map((session, i) => (
              <Link
                key={session.slug}
                href={`/teaching/${session.type}/${session.slug}`}
                className="group flex items-center gap-3 px-4 py-2 border-t transition-colors hover:bg-[#F9F6F0]"
                style={{ borderColor: '#E2DACE' }}
              >
                <span
                  className="text-[0.65rem] font-medium shrink-0 w-4 text-right"
                  style={{ color: '#6E5A2E' }}
                >
                  {i + 1}
                </span>
                <span
                  className="text-[0.8rem] leading-snug flex-1 line-clamp-1 transition-colors group-hover:text-[#7A5C1E]"
                  style={{ color: '#5A544C', fontFamily: 'var(--font-cmg), system-ui, sans-serif' }}
                >
                  {session.title}
                </span>
              </Link>
            ))}
            {!open && sessions.length > 4 && (
              <button
                onClick={() => setOpen(true)}
                className="w-full px-4 py-2 text-[0.75rem] text-left border-t transition-colors hover:bg-[#F9F6F0]"
                style={{ color: '#9A9189', borderColor: '#E2DACE' }}
              >
                + {sessions.length - 4} more sessions
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

function ProgressBar({ released, total }: { released: number; total: number }) {
  const pct = Math.min(100, Math.round((released / total) * 100))
  return (
    <div className="mt-4">
      <div
        className="flex items-center justify-between text-[0.72rem] mb-1.5"
        style={{ color: '#9A9189' }}
      >
        <span>{released} of {total} sessions released</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1" style={{ background: '#E2DACE' }}>
        <div className="h-full" style={{ width: `${pct}%`, background: '#CDB079' }} />
      </div>
    </div>
  )
}
