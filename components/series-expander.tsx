'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react'
import type { SeriesMetadata } from '@/data/teaching-series'

type SessionItem = { slug: string; title: string; date: string }

function ProgressBar({ released, total }: { released: number; total: number }) {
  const pct = Math.min(100, Math.round((released / total) * 100))
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1.5">
        <span>{released} of {total} sessions released</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1 bg-zinc-200">
        <div className="h-full" style={{ width: `${pct}%`, backgroundColor: '#cdb079' }} />
      </div>
    </div>
  )
}

export default function SeriesExpander({
  meta,
  sessions,
  type,
}: {
  meta: SeriesMetadata
  sessions: SessionItem[]
  type: 'expositional' | 'topical'
}) {
  const [open, setOpen] = useState(false)
  const visible = open ? sessions : sessions.slice(0, 4)

  return (
    <article className="border border-zinc-200 bg-white overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">

        {/* Left */}
        <div className="p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-zinc-200">
          <div className="flex flex-wrap gap-2 mb-4">
            <span
              className="text-[9px] font-bold tracking-[0.14em] uppercase px-2 py-1 border"
              style={{ borderColor: meta.status === 'Ongoing' ? '#cdb079' : '#d4d4d8', color: meta.status === 'Ongoing' ? '#cdb079' : '#a1a1aa' }}
            >
              {meta.status === 'Ongoing' ? `${meta.publishedSessions ?? sessions.length} of ${meta.totalSessions} released` : `${meta.totalSessions} sessions · Complete`}
            </span>
            <span className="text-[9px] font-bold tracking-[0.14em] uppercase px-2 py-1 border border-zinc-200 text-zinc-400">
              {meta.difficulty}
            </span>
          </div>

          <h3
            className="text-2xl font-bold leading-tight tracking-tight text-zinc-900 mb-3"
            style={{ fontFamily: 'var(--font-cormorant)' }}
          >
            {meta.title}
          </h3>
          <p className="text-[13px] leading-relaxed text-zinc-500 mb-4">{meta.whyStudy}</p>

          <div className="border border-zinc-200 bg-zinc-50 p-3 mb-4 text-[13px] leading-relaxed text-zinc-600">
            {meta.bestFor}
          </div>

          {meta.status === 'Ongoing' && (
            <div className="mb-4">
              <ProgressBar released={meta.publishedSessions ?? sessions.length} total={meta.totalSessions} />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/teaching/${type}/${meta.startHere}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] font-bold tracking-[0.14em] uppercase bg-[#cdb079] text-zinc-950 hover:bg-[#b89a5e] transition-colors"
            >
              Start Series <ArrowRight size={10} />
            </Link>
            <button
              onClick={() => setOpen(!open)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] font-bold tracking-[0.14em] uppercase border border-zinc-300 text-zinc-500 hover:bg-zinc-50 hover:border-zinc-400 transition-colors"
            >
              {open ? 'Hide' : 'View'} Sessions
              <ChevronDown size={11} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="p-5 sm:p-6">
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-zinc-400 mb-3">
            By the end, you&apos;ll be able to
          </p>
          <div className="space-y-2 mb-5">
            {meta.outcomes.map((outcome) => (
              <div key={outcome} className="flex gap-2.5 border border-zinc-200 bg-zinc-50 p-3 text-[12px] text-zinc-600">
                <CheckCircle2 size={12} className="flex-shrink-0 mt-0.5" style={{ color: '#cdb079' }} />
                <span>{outcome}</span>
              </div>
            ))}
          </div>

          <div className="border border-zinc-200">
            <p className="px-4 pt-3 pb-2 text-[10px] font-bold tracking-[0.18em] uppercase text-zinc-400">
              Session path
            </p>
            {visible.map((session, i) => (
              <Link
                key={session.slug}
                href={`/teaching/${type}/${session.slug}`}
                className="group flex items-start gap-3 px-4 py-2.5 border-t border-zinc-100 hover:bg-zinc-50 transition-colors"
              >
                <span
                  className="flex-shrink-0 flex items-center justify-center w-5 h-5 text-[9px] font-bold border border-zinc-300 text-zinc-400 mt-0.5"
                  style={{ borderRadius: '50%' }}
                >
                  {i + 1}
                </span>
                <span className="text-[12px] leading-snug text-zinc-600 group-hover:text-zinc-900 transition-colors flex-1 line-clamp-2">
                  {session.title}
                </span>
              </Link>
            ))}
            {!open && sessions.length > 4 && (
              <button
                onClick={() => setOpen(true)}
                className="w-full px-4 py-2.5 text-[11px] font-semibold text-zinc-400 hover:text-zinc-700 transition-colors border-t border-zinc-100 text-left"
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
