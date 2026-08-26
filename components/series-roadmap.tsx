'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Clock } from 'lucide-react'
import type { RoadmapPart } from '@/data/teaching-series'
import { useReadArticles } from '@/hooks/use-read-articles'

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
  const read = useReadArticles()

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
        const publishedCount = partSessions.filter(({ session }) => session?.isPublished).length
        const readCount = partSessions.filter(({ session }) => session?.isPublished && read.has(session.slug)).length
        const total = part.sessions.length
        const nonePublished = publishedCount === 0
        const allRead = publishedCount > 0 && readCount === publishedCount

        return (
          <div key={partIdx} style={{ border: '1px solid #E2DACE', background: '#fff' }}>

            {/* Part header */}
            <button
              onClick={() => toggle(partIdx)}
              className="w-full flex items-start gap-4 p-5 text-left transition-colors duration-150"
              style={{ background: isOpen ? '#F9F6F0' : 'transparent' }}
            >
              <span
                className="shrink-0 text-[0.62rem] font-medium tracking-[0.1em] uppercase"
                style={{
                  color: allRead ? '#7A5C1E' : nonePublished ? '#C8BFA8' : '#6E5A2E',
                  marginTop: 3,
                }}
              >
                Part {partIdx + 1}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p
                    className="uppercase"
                    style={{
                      fontFamily: 'var(--font-cmg), system-ui, sans-serif',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      lineHeight: 1.15,
                      color: nonePublished ? '#9A9189' : '#1A1714',
                    }}
                  >
                    {part.title}
                  </p>
                  {allRead && (
                    <svg
                      width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="#7A5C1E" strokeWidth="2.5"
                      className="shrink-0"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <p
                  className="text-[0.82rem] leading-[1.6]"
                  style={{ fontFamily: 'var(--font-source-serif)', color: '#9A9189' }}
                >
                  {part.description}
                </p>

                {/* Personal reading progress bar */}
                {readCount > 0 && !allRead && (
                  <div className="mt-2.5 flex items-center gap-2.5">
                    <div className="flex-1 h-[3px]" style={{ background: '#E2DACE' }}>
                      <div
                        className="h-full"
                        style={{
                          width: `${(readCount / publishedCount) * 100}%`,
                          background: '#CDB079',
                          transition: 'width 0.6s ease',
                        }}
                      />
                    </div>
                    <span className="text-[0.62rem] shrink-0" style={{ color: '#9A9189' }}>
                      {readCount}/{publishedCount} read
                    </span>
                  </div>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-2.5" style={{ marginTop: 3 }}>
                <span
                  className="text-[0.67rem]"
                  style={{ color: allRead ? '#7A5C1E' : nonePublished ? '#C8BFA8' : '#9A9189' }}
                >
                  {nonePublished ? '' : allRead ? `${readCount} read` : readCount > 0 ? `${readCount}/${publishedCount}` : `${publishedCount} available`}
                </span>
                <ChevronDown
                  size={14}
                  className="shrink-0"
                  style={{
                    color: '#9A9189',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease',
                  }}
                />
              </div>
            </button>

            {/* Accordion panel — CSS grid trick, no JS height measurement needed */}
            <div
              style={{
                display: 'grid',
                gridTemplateRows: isOpen ? '1fr' : '0fr',
                transition: 'grid-template-rows 280ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <div style={{ overflow: 'hidden' }}>
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

                    const isRead = read.has(session.slug)

                    return (
                      <Link
                        key={sessionNum}
                        href={`/teaching/${type}/${session.slug}`}
                        className="group relative flex items-start gap-4 px-5 py-3.5 border-t first:border-t-0 transition-colors duration-150 hover:bg-[#F9F6F0]"
                        style={{ borderColor: '#F0EDE6' }}
                      >
                        {/* Left accent bar */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-[3px] transition-opacity duration-150 opacity-0 group-hover:opacity-100"
                          style={{ background: '#CDB079' }}
                        />

                        {/* Session number circle — filled amber if read */}
                        <div
                          className="shrink-0 flex items-center justify-center"
                          style={{
                            width: 24,
                            height: 24,
                            border: isRead ? 'none' : '2px solid #C8A96A',
                            borderRadius: '50%',
                            fontSize: '0.6rem',
                            fontWeight: 600,
                            color: isRead ? '#fff' : '#6E5A2E',
                            background: isRead ? '#CDB079' : '#fff',
                            marginTop: 2,
                          }}
                        >
                          {isRead ? (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            sessionNum
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p
                            className="leading-snug mb-0.5 transition-colors duration-150 group-hover:text-[#7A5C1E]"
                            style={{
                              fontFamily: 'var(--font-source-serif), Georgia, serif',
                              fontSize: '1rem',
                              fontWeight: 500,
                              color: isRead ? '#9A9189' : '#1A1714',
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
                            <span
                              className="flex items-center gap-1 text-[0.68rem]"
                              style={{ color: '#C8BFA8' }}
                            >
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
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
