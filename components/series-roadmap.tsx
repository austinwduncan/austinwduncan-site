'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Clock } from 'lucide-react'
import type { RoadmapPart } from '@/data/teaching-series'

export type RoadmapSession = {
  slug: string
  title: string
  date: string
  excerpt?: string
  readTime: number
  isPublished: boolean
}

export default function SeriesRoadmap({
  roadmap,
  sessions,
  type,
}: {
  roadmap: RoadmapPart[]
  sessions: RoadmapSession[]
  type: 'expositional' | 'topical'
}) {
  const [openParts, setOpenParts] = useState<Set<number>>(new Set([0]))

  const toggle = (i: number) => {
    setOpenParts((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <div className="space-y-2">
      {roadmap.map((part, partIdx) => {
        const isOpen = openParts.has(partIdx)
        const partSessions = part.sessions.map((sessionNum) => ({
          sessionNum,
          session: sessions[sessionNum - 1] ?? null,
        }))

        return (
          <div key={partIdx} style={{ border: '1px solid #E2DACE', background: '#fff' }}>
            <button
              onClick={() => toggle(partIdx)}
              className="w-full flex items-start gap-4 p-5 text-left transition-colors hover:bg-[#F9F6F0]"
            >
              <span
                className="shrink-0 text-[0.65rem] font-medium tracking-[0.1em] uppercase"
                style={{ color: '#B8892E', marginTop: 3 }}
              >
                Part {partIdx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className="leading-snug mb-1"
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    color: '#1A1714',
                  }}
                >
                  {part.title}
                </p>
                <p
                  className="text-[0.82rem] leading-[1.6]"
                  style={{ fontFamily: 'var(--font-source-serif)', color: '#9A9189' }}
                >
                  {part.description}
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-3" style={{ marginTop: 3 }}>
                <span className="text-[0.7rem]" style={{ color: '#9A9189' }}>
                  {part.sessions.length} sessions
                </span>
                <ChevronDown
                  size={14}
                  style={{
                    color: '#9A9189',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </div>
            </button>

            {isOpen && (
              <div style={{ borderTop: '1px solid #E2DACE' }}>
                {partSessions.map(({ sessionNum, session }) => {
                  if (!session || !session.isPublished) {
                    return (
                      <div
                        key={sessionNum}
                        className="flex items-start gap-4 px-5 py-3.5 border-t first:border-t-0"
                        style={{ borderColor: '#F0EDE6' }}
                      >
                        <div
                          className="shrink-0 flex items-center justify-center"
                          style={{
                            width: 24,
                            height: 24,
                            border: '2px dashed #E2DACE',
                            borderRadius: '50%',
                            fontSize: '0.6rem',
                            fontWeight: 600,
                            color: '#C8BFA8',
                            background: '#F9F6F0',
                            marginTop: 2,
                          }}
                        >
                          {sessionNum}
                        </div>
                        <p
                          className="text-[0.85rem] italic pt-0.5"
                          style={{ fontFamily: 'var(--font-source-serif)', color: '#C8BFA8' }}
                        >
                          Coming soon
                        </p>
                      </div>
                    )
                  }

                  return (
                    <Link
                      key={sessionNum}
                      href={`/teaching/${type}/${session.slug}`}
                      className="group flex items-start gap-4 px-5 py-3.5 border-t first:border-t-0 transition-colors hover:bg-[#F9F6F0]"
                      style={{ borderColor: '#F0EDE6' }}
                    >
                      <div
                        className="shrink-0 flex items-center justify-center"
                        style={{
                          width: 24,
                          height: 24,
                          border: '2px solid #C8A96A',
                          borderRadius: '50%',
                          fontSize: '0.6rem',
                          fontWeight: 600,
                          color: '#B8892E',
                          background: '#fff',
                          marginTop: 2,
                        }}
                      >
                        {sessionNum}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="leading-snug mb-0.5 transition-colors group-hover:text-[#7A5C1E]"
                          style={{
                            fontFamily: 'var(--font-cormorant)',
                            fontSize: '1rem',
                            fontWeight: 500,
                            color: '#1A1714',
                          }}
                        >
                          {session.title}
                        </p>
                        {session.excerpt && (
                          <p
                            className="text-[0.78rem] leading-[1.55] line-clamp-2"
                            style={{ fontFamily: 'var(--font-source-serif)', color: '#9A9189' }}
                          >
                            {session.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-[0.68rem]" style={{ color: '#C8BFA8' }}>
                            <Clock size={10} />
                            {session.readTime} min read
                          </span>
                          <span className="text-[0.68rem]" style={{ color: '#C8BFA8' }}>
                            {session.date}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
