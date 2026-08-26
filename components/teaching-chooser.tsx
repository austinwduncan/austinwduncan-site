'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, X } from 'lucide-react'
import type { SeriesMetadata } from '@/data/teaching-series'
import type { SessionPreview } from '@/components/series-panel'

type ChoiceOption = {
  label: string
  description: string
  filterFn: (s: SeriesMetadata) => boolean
}

const CHOICES: ChoiceOption[] = [
  {
    label: 'A book of the Bible',
    description: 'Verse-by-verse studies through a specific book',
    filterFn: (s) => s.primaryLane === 'Bible Book Studies',
  },
  {
    label: 'A major biblical theme',
    description: 'Studies that trace a theme across the whole Bible',
    filterFn: (s) => s.primaryLane === 'Biblical Theology',
  },
  {
    label: 'Biblical words & language',
    description: 'What key terms actually mean in the original languages',
    filterFn: (s) => s.primaryLane === 'Word Studies',
  },
  {
    label: 'Old Testament background',
    description: 'Series rooted in the history and literature of the OT',
    filterFn: (s) => s.filterTags.includes('Old Testament'),
  },
  {
    label: 'New Testament',
    description: 'Studies from the Gospels, Epistles, and beyond',
    filterFn: (s) => s.filterTags.includes('New Testament'),
  },
  {
    label: 'Something beginner-friendly',
    description: 'Accessible entry points for newer readers',
    filterFn: (s) => s.difficulty === 'Beginner',
  },
]

type SeriesWithSessions = {
  meta: SeriesMetadata
  sessions: SessionPreview[]
}

export default function TeachingChooser({ allSeries }: { allSeries: SeriesWithSessions[] }) {
  const [activeChoice, setActiveChoice] = useState<string | null>(null)

  const filtered = activeChoice
    ? allSeries.filter(({ meta }) => {
        const choice = CHOICES.find((c) => c.label === activeChoice)
        return choice ? choice.filterFn(meta) : true
      })
    : allSeries

  return (
    <div>
      {/* Prompt */}
      <p
        className="text-2xl uppercase leading-[0.95] text-zinc-900 mb-6"
        style={{ fontFamily: 'var(--font-cmg), system-ui, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}
      >
        What are you trying to study?
      </p>

      {/* Options */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CHOICES.map((choice) => {
          const isActive = activeChoice === choice.label
          return (
            <button
              key={choice.label}
              onClick={() => setActiveChoice(isActive ? null : choice.label)}
              className="text-[12px] font-semibold tracking-[0.08em] px-4 py-2 border transition-colors"
              style={{
                backgroundColor: isActive ? '#cdb079' : 'transparent',
                borderColor: isActive ? '#cdb079' : '#d4d4d8',
                color: isActive ? '#fff' : '#71717a',
              }}
            >
              {choice.label}
            </button>
          )
        })}
        {activeChoice && (
          <button
            onClick={() => setActiveChoice(null)}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase px-3 py-2 text-zinc-400 hover:text-zinc-700 transition-colors border border-zinc-200"
          >
            <X size={10} /> Clear
          </button>
        )}
      </div>

      {/* Active filter description */}
      {activeChoice && (
        <p className="text-[13px] text-zinc-500 mb-6">
          {CHOICES.find((c) => c.label === activeChoice)?.description}
          {' '}— showing {filtered.length} series
        </p>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="text-[14px] text-zinc-400">No series match this filter yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(({ meta }) => (
            <div key={meta.seriesTag} className="border border-zinc-200 bg-white flex flex-col overflow-hidden">
              {meta.image && (
                <div className="overflow-hidden bg-zinc-100 aspect-[16/9] flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={meta.image} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {meta.status === 'Ongoing' && (
                    <span
                      className="text-[9px] font-bold tracking-[0.16em] uppercase px-1.5 py-0.5 text-white"
                      style={{ backgroundColor: '#cdb079' }}
                    >
                      Ongoing
                    </span>
                  )}
                  <span className="text-[11px] text-zinc-400">{meta.totalSessions} sessions</span>
                </div>
                <h3
                  className="text-[18px] leading-[1.15] text-zinc-900 mb-1.5"
                  style={{ fontFamily: 'var(--font-cmg), system-ui, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' }}
                >
                  {meta.title}
                </h3>
                <p className="text-[12px] text-zinc-500 leading-relaxed mb-4 flex-1">{meta.excerpt}</p>
                <Link
                  href={`/teaching/${meta.type}/${meta.startHere}`}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] uppercase transition-opacity hover:opacity-70"
                  style={{ color: '#6E5A2E' }}
                >
                  Start Series <ArrowRight size={10} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
