'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import type { SeriesMetadata } from '@/data/teaching-series'

export type SessionPreview = {
  slug: string
  title: string
  date: string
  type: 'expositional' | 'topical'
}

const LANE_COLORS: Record<string, string> = {
  'Bible Book Studies': '#7A5C1E',
  'Biblical Theology': '#5A6E4A',
  'Word Studies': '#4A5C7A',
}

export default function SeriesPanel({
  meta,
  sessions,
  defaultExpanded = false,
}: {
  meta: SeriesMetadata
  sessions: SessionPreview[]
  defaultExpanded?: boolean
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const laneColor = LANE_COLORS[meta.primaryLane] ?? '#7A5C1E'

  // Sessions in chronological order (oldest first = session 1, 2, 3…)
  const orderedSessions = [...sessions].reverse()

  return (
    <div className="border border-zinc-200 bg-white">
      {/* Cover image */}
      {meta.image && (
        <div className="overflow-hidden bg-zinc-100 aspect-[16/9]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={meta.image} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-6">
        {/* Lane + status */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-[9px] font-bold tracking-[0.18em] uppercase px-2 py-0.5 text-white"
            style={{ backgroundColor: laneColor }}
          >
            {meta.primaryLane}
          </span>
          <span
            className="text-[9px] font-bold tracking-[0.14em] uppercase px-2 py-0.5 border"
            style={{
              color: meta.status === 'Ongoing' ? '#cdb079' : '#999',
              borderColor: meta.status === 'Ongoing' ? '#cdb079' : '#d4d4d8',
            }}
          >
            {meta.status === 'Ongoing'
              ? `${meta.publishedSessions ?? '?'} of ${meta.totalSessions} released`
              : `${meta.totalSessions} sessions`}
          </span>
        </div>

        {/* Title */}
        <h2
          className="text-2xl font-bold leading-tight tracking-tight text-zinc-900 mb-2"
          style={{ fontFamily: 'var(--font-cormorant)' }}
        >
          {meta.title}
        </h2>

        {/* Excerpt */}
        <p className="text-[14px] text-zinc-500 leading-relaxed mb-4">{meta.excerpt}</p>

        {/* Why study */}
        <p className="text-[13px] text-zinc-700 leading-relaxed mb-4 border-l-2 pl-3" style={{ borderColor: '#cdb079' }}>
          {meta.whyStudy}
        </p>

        {/* Best for */}
        <div className="mb-4">
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-zinc-400 mb-2">Best For</p>
          <p className="text-[13px] text-zinc-600 leading-relaxed">{meta.bestFor}</p>
        </div>

        {/* Themes */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {meta.themes.map((theme) => (
            <span
              key={theme}
              className="text-[10px] font-semibold tracking-[0.08em] px-2 py-0.5 bg-zinc-100 text-zinc-500"
            >
              {theme}
            </span>
          ))}
        </div>

        {/* Difficulty */}
        <p className="text-[11px] text-zinc-400 mb-5">
          <span className="font-semibold text-zinc-600">{meta.difficulty}</span>
          {' '}· {meta.type === 'expositional' ? 'Expositional' : 'Topical'}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-zinc-100">
          <Link
            href={`/teaching/${meta.type}/${meta.startHere}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold tracking-[0.14em] uppercase border border-[#cdb079] text-[#cdb079] hover:bg-[#cdb079] hover:text-white transition-colors"
          >
            Start Series <ArrowRight size={10} />
          </Link>
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            {expanded ? (
              <>Hide Sessions <ChevronUp size={12} /></>
            ) : (
              <>View Sessions <ChevronDown size={12} /></>
            )}
          </button>
        </div>
      </div>

      {/* Expandable session list */}
      {expanded && orderedSessions.length > 0 && (
        <div className="border-t border-zinc-100">
          <div className="divide-y divide-zinc-100">
            {orderedSessions.map((session, i) => (
              <Link
                key={session.slug}
                href={`/teaching/${session.type}/${session.slug}`}
                className="group flex items-start gap-4 px-6 py-3.5 hover:bg-zinc-50 transition-colors"
              >
                <span
                  className="flex-shrink-0 text-[12px] font-bold w-5 text-right mt-0.5"
                  style={{ color: '#cdb079', fontFamily: 'var(--font-cormorant)' }}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold leading-snug text-zinc-800 group-hover:text-zinc-500 transition-colors line-clamp-2">
                    {session.title}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{session.date}</p>
                </div>
                <ArrowRight size={12} className="flex-shrink-0 mt-1 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
