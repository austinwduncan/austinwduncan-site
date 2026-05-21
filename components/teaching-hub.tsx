'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowRight, BookOpen, CheckCircle2, ChevronDown,
  Compass, Flame, ListChecks, Map, Search, Sparkles, Tags,
} from 'lucide-react'
import { TEACHING_LANES, type SeriesMetadata, type TeachingLane } from '@/data/teaching-series'

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

// ─── Intent options ───────────────────────────────────────────────────────────

const INTENTS = [
  {
    id: 'see-jesus',
    label: 'I want to see Jesus more clearly',
    lead: 'Begin with a study that shows how all of Scripture centers on Christ.',
    Icon: Sparkles,
  },
  {
    id: 'faith-pressure',
    label: 'I need help staying faithful under pressure',
    lead: 'Begin where exile, courage, compromise, and kingdoms collide.',
    Icon: Flame,
  },
  {
    id: 'whole-bible',
    label: "I want the Bible's storyline to make sense",
    lead: 'Begin with a theme that ties the Bible together instead of leaving it in pieces.',
    Icon: Map,
  },
  {
    id: 'words',
    label: 'I like word studies and translation details',
    lead: 'Begin with a lighter series that gives you fast Bible study payoff.',
    Icon: Tags,
  },
  {
    id: 'christian-life',
    label: 'I want help with Christian life and ethics',
    lead: 'Begin with a study that connects command, worship, desire, and love of neighbor.',
    Icon: ListChecks,
  },
  {
    id: 'old-testament',
    label: 'I want the Old Testament to feel less confusing',
    lead: 'Begin with the books and themes people often skip or flatten.',
    Icon: BookOpen,
  },
]

// ─── Small shared pieces ─────────────────────────────────────────────────────

function Pill({ children, gold = false }: { children: React.ReactNode; gold?: boolean }) {
  return (
    <span
      className="text-[10px] font-bold tracking-[0.14em] uppercase px-2.5 py-1 border"
      style={
        gold
          ? { borderColor: '#cdb079', color: '#cdb079' }
          : { borderColor: '#3f3f46', color: '#a1a1aa' }
      }
    >
      {children}
    </span>
  )
}

function ProgressBar({ released, total }: { released: number; total: number }) {
  const pct = Math.min(100, Math.round((released / total) * 100))
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-2">
        <span>{released} of {total} sessions released</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-zinc-800">
        <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: '#cdb079' }} />
      </div>
    </div>
  )
}

// ─── Recommendation card ──────────────────────────────────────────────────────

function RecommendationCard({ item }: { item: SeriesWithSessions }) {
  const [sessionsOpen, setSessionsOpen] = useState(false)
  const { meta, sessions } = item
  const orderedSessions = [...sessions].reverse()
  const previewSessions = sessionsOpen ? orderedSessions : orderedSessions.slice(0, 5)

  return (
    <article className="border border-zinc-800 overflow-hidden" style={{ background: '#0c0c0e' }}>
      <div className="grid lg:grid-cols-[0.95fr_1.05fr]">

        {/* Left: identity */}
        <div
          className="p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-zinc-800"
          style={{ background: 'radial-gradient(circle at top left, #3f3f46, #18181b 55%, #09090b)' }}
        >
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-4">
            Recommended next study
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-white mb-3"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            {meta.title}
          </h2>
          <p className="text-[14px] leading-relaxed text-zinc-300 mb-6">
            {meta.whyStudy}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            <Pill gold>{meta.primaryLane}</Pill>
            <Pill>{meta.status === 'Ongoing' ? 'Releasing Now' : 'Complete'}</Pill>
            <Pill>{meta.difficulty}</Pill>
            <Pill>{meta.totalSessions} sessions</Pill>
          </div>

          {meta.status === 'Ongoing' && (
            <div className="mb-6">
              <ProgressBar released={meta.publishedSessions ?? sessions.length} total={meta.totalSessions} />
            </div>
          )}

          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3">
            <Link
              href={`/teaching/${meta.type}/${meta.startHere}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-[12px] font-bold tracking-[0.14em] uppercase bg-[#cdb079] text-zinc-950 hover:bg-[#b89a5e] transition-colors"
            >
              Start with Session 1 <ArrowRight size={12} />
            </Link>
            <button
              onClick={() => setSessionsOpen(!sessionsOpen)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-[12px] font-bold tracking-[0.14em] uppercase border border-zinc-700 text-zinc-300 hover:bg-zinc-900 transition-colors"
            >
              {sessionsOpen ? 'Hide' : 'Preview'} Sessions
              <ChevronDown size={12} className={`transition-transform duration-200 ${sessionsOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Right: why + outcomes + sessions */}
        <div className="p-6 sm:p-8">
          <div className="border border-zinc-800 p-4 mb-5" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-zinc-500 mb-2">Best for</p>
            <p className="text-[14px] leading-relaxed text-zinc-300">{meta.bestFor}</p>
          </div>

          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-zinc-500 mb-3">
            By the end, you&apos;ll be able to
          </p>
          <div className="space-y-2 mb-5">
            {meta.outcomes.map((outcome) => (
              <div key={outcome} className="flex gap-3 border border-zinc-800 p-3 text-[13px] text-zinc-300" style={{ background: 'rgba(9,9,11,0.4)' }}>
                <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#cdb079' }} />
                <span>{outcome}</span>
              </div>
            ))}
          </div>

          {/* Session list - always visible on right */}
          <div
            className="border border-zinc-800 overflow-hidden transition-all duration-300"
            style={{ maxHeight: sessionsOpen ? `${orderedSessions.length * 56}px` : '256px', background: 'rgba(0,0,0,0.25)' }}
          >
            <p className="px-4 pt-3 pb-2 text-[10px] font-bold tracking-[0.18em] uppercase text-zinc-500">
              Session path
            </p>
            {previewSessions.map((session, i) => (
              <Link
                key={session.slug}
                href={`/teaching/${session.type}/${session.slug}`}
                className="group flex items-start gap-3 px-4 py-2.5 hover:bg-zinc-800/60 transition-colors"
              >
                <span
                  className="flex-shrink-0 flex items-center justify-center w-5 h-5 text-[10px] font-bold border border-zinc-700 text-zinc-400 mt-0.5"
                  style={{ borderRadius: '50%' }}
                >
                  {i + 1}
                </span>
                <span className="text-[12px] leading-snug text-zinc-300 group-hover:text-white transition-colors line-clamp-2">
                  {session.title}
                </span>
              </Link>
            ))}
            {!sessionsOpen && orderedSessions.length > 5 && (
              <button
                onClick={() => setSessionsOpen(true)}
                className="w-full px-4 py-3 text-[11px] font-semibold text-zinc-500 hover:text-zinc-300 transition-colors border-t border-zinc-800 text-left"
              >
                + {orderedSessions.length - 5} more sessions
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

// ─── Journey section ──────────────────────────────────────────────────────────

function JourneySection({ item }: { item: SeriesWithSessions }) {
  return (
    <section className="border border-zinc-800 p-6 sm:p-8" style={{ background: '#0c0c0e' }}>
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0 p-2.5 border border-zinc-800" style={{ background: '#18181b' }}>
          <Map size={18} style={{ color: '#cdb079' }} />
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-1">The path</p>
          <h2
            className="text-2xl font-bold leading-tight tracking-tight text-white"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            Don&apos;t just browse. Move somewhere.
          </h2>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border border-zinc-800 p-4" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <p className="text-[12px] font-bold text-white mb-2">1. Start here</p>
          <p className="text-[13px] leading-relaxed text-zinc-400">
            Begin with <span className="text-zinc-200">{item.meta.title}</span> — it matches what you said you want to understand.
          </p>
        </div>
        <div className="border border-zinc-800 p-4" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <p className="text-[12px] font-bold text-white mb-2">2. Follow the sessions</p>
          <p className="text-[13px] leading-relaxed text-zinc-400">
            Each session builds on the last. The order matters — work through it in sequence.
          </p>
        </div>
        <div className="border border-zinc-800 p-4" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <p className="text-[12px] font-bold text-white mb-2">3. Go next</p>
          <p className="text-[13px] leading-relaxed text-zinc-400">
            After this, continue into{' '}
            <span className="text-zinc-200">{item.meta.nextAfter}</span> or browse the full shelf below.
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── Shelf card (compact) ─────────────────────────────────────────────────────

function ShelfCard({ meta }: { meta: SeriesMetadata }) {
  return (
    <Link
      href={`/teaching/${meta.type}/${meta.startHere}`}
      className="group flex flex-col border border-zinc-800 p-4 hover:border-zinc-600 transition-colors min-w-[82%] sm:min-w-0"
      style={{ background: '#0c0c0e' }}
    >
      {meta.image && (
        <div className="overflow-hidden bg-zinc-900 aspect-[16/9] mb-3 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={meta.image} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[9px] font-bold tracking-[0.14em] uppercase text-zinc-500">{meta.primaryLane}</span>
        <ArrowRight size={12} className="text-zinc-700 group-hover:text-zinc-400 transition-colors flex-shrink-0" />
      </div>
      <h3
        className="text-[16px] font-bold leading-tight tracking-tight text-white mb-2 flex-1"
        style={{ fontFamily: 'var(--font-cormorant)' }}
      >
        {meta.title}
      </h3>
      <p className="text-[12px] leading-relaxed text-zinc-500 line-clamp-2 mb-3">{meta.excerpt}</p>
      <div className="flex items-center justify-between text-[11px] text-zinc-600 mt-auto">
        <span>{meta.totalSessions} sessions</span>
        <span
          className="font-semibold"
          style={{ color: meta.status === 'Ongoing' ? '#cdb079' : '#71717a' }}
        >
          {meta.status}
        </span>
      </div>
    </Link>
  )
}

// ─── Keep exploring (shelf + search) ─────────────────────────────────────────

function KeepExploring({ allSeries }: { allSeries: SeriesWithSessions[] }) {
  const [query, setQuery] = useState('')

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allSeries
    return allSeries.filter(({ meta }) =>
      [meta.title, meta.primaryLane, meta.excerpt, meta.bestFor, ...meta.themes].join(' ').toLowerCase().includes(q)
    )
  }, [query, allSeries])

  return (
    <section className="border border-zinc-800 p-6 sm:p-8" style={{ background: '#0c0c0e' }}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-6">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-1">Keep exploring</p>
          <h2
            className="text-2xl font-bold leading-tight tracking-tight text-white"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            If that isn&apos;t the one, try these.
          </h2>
        </div>
        <div className="flex items-center gap-3 border border-zinc-800 px-4 py-2.5 lg:w-72" style={{ background: 'rgba(0,0,0,0.35)' }}>
          <Search size={14} className="text-zinc-600 flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search series…"
            className="w-full bg-transparent text-[13px] text-white outline-none placeholder:text-zinc-600"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-[13px] text-zinc-500">No series match &ldquo;{query}&rdquo;.</p>
      ) : (
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))' }}
        >
          {visible.map(({ meta }) => (
            <ShelfCard key={meta.seriesTag} meta={meta} />
          ))}
        </div>
      )}
    </section>
  )
}

// ─── Lane section ─────────────────────────────────────────────────────────────

function LaneSection({ lane, allSeries }: { lane: TeachingLane; allSeries: SeriesWithSessions[] }) {
  const laneSeries = allSeries.filter(({ meta }) => meta.primaryLane === lane)
  if (laneSeries.length === 0) return null

  const laneDesc: Record<TeachingLane, string> = {
    'Bible Book Studies': 'Verse-by-verse studies working through books of the Bible — Old Testament and New.',
    'Biblical Theology': 'Studies that trace a theme, covenant, or practice across the whole story of Scripture.',
    'Word Studies': 'Focused studies on the meaning of key biblical terms in the original languages.',
  }

  return (
    <section className="border border-zinc-800 p-6 sm:p-8" style={{ background: '#0c0c0e' }}>
      <div className="flex items-center justify-between gap-4 mb-2">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-1">Shelf</p>
          <h2
            className="text-2xl font-bold leading-tight tracking-tight text-white"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            {lane}
          </h2>
        </div>
        <span className="text-[11px] text-zinc-600 border border-zinc-800 px-2.5 py-1 flex-shrink-0">
          {laneSeries.length} series
        </span>
      </div>
      <p className="text-[13px] text-zinc-500 mb-6">{laneDesc[lane]}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {laneSeries.map(({ meta }) => (
          <ShelfCard key={meta.seriesTag} meta={meta} />
        ))}
      </div>
    </section>
  )
}

// ─── Main hub ─────────────────────────────────────────────────────────────────

export default function TeachingHub({ allSeries }: { allSeries: SeriesWithSessions[] }) {
  const [selectedIntent, setSelectedIntent] = useState('see-jesus')

  const recommended = useMemo(
    () => allSeries.find(({ meta }) => meta.intents.includes(selectedIntent)) ?? allSeries[0],
    [selectedIntent, allSeries]
  )

  const activeIntent = INTENTS.find((i) => i.id === selectedIntent) ?? INTENTS[0]

  return (
    <div className="bg-zinc-950 text-white pb-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-5 pt-6">

        {/* ── Hero + intent chooser ─────────────────────────────────────────── */}
        <section className="border border-zinc-800 overflow-hidden" style={{ background: '#09090b' }}>
          <div className="relative p-6 sm:p-8 lg:p-10">
            {/* Decorative glows */}
            <div
              className="absolute right-0 top-0 w-64 h-64 pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(205,176,121,0.07) 0%, transparent 70%)' }}
            />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 border border-zinc-800 px-3 py-1.5 mb-5" style={{ background: 'rgba(0,0,0,0.4)' }}>
                  <Compass size={12} style={{ color: '#cdb079' }} />
                  <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-zinc-400">
                    Guided teaching library
                  </span>
                </div>
                <h1
                  className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.05] tracking-tight text-white max-w-xl"
                  style={{ fontFamily: 'var(--font-cormorant)' }}
                >
                  Find the study you should start next.
                </h1>
                <p className="mt-4 text-[15px] leading-relaxed text-zinc-400 max-w-lg">
                  Choose what you&apos;re trying to understand, then move from a recommended series into
                  the rest of the teaching library.
                </p>
              </div>

              {/* Active intent preview card */}
              <div className="border border-zinc-800 p-5" style={{ background: 'rgba(0,0,0,0.45)' }}>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-2">
                  Your path begins with
                </p>
                <h3
                  className="text-xl font-bold text-white mb-2 leading-tight"
                  style={{ fontFamily: 'var(--font-cormorant)' }}
                >
                  {recommended?.meta.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-zinc-400 mb-4">{activeIntent.lead}</p>
                <div className="flex items-center gap-2 text-[11px] text-zinc-600">
                  <span className="w-2 h-2 rounded-full" style={{ background: '#cdb079' }} />
                  <span>Pick a need</span>
                  <span className="flex-1 border-t border-zinc-800" />
                  <span>Get a series</span>
                  <span className="flex-1 border-t border-zinc-800" />
                  <span>Keep going</span>
                </div>
              </div>
            </div>
          </div>

          {/* Intent grid */}
          <div className="border-t border-zinc-800 p-4" style={{ background: 'rgba(0,0,0,0.35)' }}>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {INTENTS.map(({ id, label, Icon }) => {
                const isActive = selectedIntent === id
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedIntent(id)}
                    className="group flex items-center gap-3 border p-3 text-left text-[13px] transition-colors"
                    style={{
                      background: isActive ? 'rgba(205,176,121,0.12)' : 'rgba(9,9,11,0.8)',
                      borderColor: isActive ? '#cdb079' : '#27272a',
                      color: isActive ? '#fff' : '#a1a1aa',
                    }}
                  >
                    <span
                      className="flex-shrink-0 p-2 transition-colors"
                      style={{ background: isActive ? 'rgba(205,176,121,0.2)' : '#18181b' }}
                    >
                      <Icon size={14} style={{ color: isActive ? '#cdb079' : '#71717a' }} />
                    </span>
                    <span className="font-semibold leading-snug">{label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Recommendation card (key resets session state on intent change) ── */}
        {recommended && (
          <div key={recommended.meta.seriesTag}>
            <RecommendationCard item={recommended} />
          </div>
        )}

        {/* ── Journey ──────────────────────────────────────────────────────── */}
        {recommended && <JourneySection item={recommended} />}

        {/* ── Keep exploring ───────────────────────────────────────────────── */}
        <KeepExploring allSeries={allSeries} />

        {/* ── Lane shelves ─────────────────────────────────────────────────── */}
        {TEACHING_LANES.map((lane) => (
          <LaneSection key={lane} lane={lane} allSeries={allSeries} />
        ))}

      </div>
    </div>
  )
}
