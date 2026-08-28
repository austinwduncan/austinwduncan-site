'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { SeriesMetadata } from '@/data/teaching-series'

type SessionItem = { slug: string; title: string; date: string }

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
          <ProgressBar released={meta.publishedSessions ?? sessions.length} total={meta.totalSessions} />
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
              href={`/teaching/${type}/${session.slug}`}
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
