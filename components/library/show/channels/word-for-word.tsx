'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Piece, Season } from '@/lib/library/types'
import Artwork from '@/components/library/artwork'

/*
  Word for Word, laid out as questions.

  Every title in this channel is a question. Not most of them, all 71. That is
  the strongest signal any of these five properties gives about how it should
  be read, so the question is the whole row, set at a size you read rather than
  scan, and everything else sits under it in small type.

  Every episode shows its cover. An earlier version left them out on the theory
  that a title card beside a title sets the same words twice, which was a
  designer's objection rather than a reader's: a page of questions with nothing
  to look at is a wall of text.

  Subjects filter in place rather than navigating, because a reader scanning
  for a question they have is browsing, not committing.

  Episode numbers are printed exactly as given. They run 1 to 71 across the
  whole show, so a subject's episodes are deliberately non contiguous.
*/

const HEADING = 'var(--font-cmg), system-ui, sans-serif'

export default function WordForWordChannel({
  seasons,
  loose,
}: {
  seasons: Season[]
  loose: Piece[]
}) {
  const [subject, setSubject] = useState<string | null>(null)

  const all: Piece[] = [...seasons.flatMap(s => s.episodes), ...loose]
  const active = subject ? (seasons.find(s => s.slug === subject)?.episodes ?? []) : all
  const shown = [...active].sort((a, b) => (b.episode ?? 0) - (a.episode ?? 0))

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-16 lg:px-8 lg:py-20">
      {seasons.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {[{ slug: null, name: 'All questions', n: all.length }, ...seasons.map(s => ({
            slug: s.slug as string | null,
            name: s.name,
            n: s.episodes.length,
          }))].map(item => {
            const on = subject === item.slug
            return (
              <button
                key={item.slug ?? 'all'}
                type="button"
                onClick={() => setSubject(item.slug)}
                className="rounded-full border px-4 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.14em] transition-colors"
                style={{
                  fontFamily: HEADING,
                  borderColor: on ? 'var(--awd-gold)' : 'rgba(238,234,225,0.16)',
                  color: on ? 'var(--awd-gold)' : 'rgba(238,234,225,0.7)',
                  background: on ? 'rgba(205,176,121,0.1)' : 'transparent',
                }}
              >
                {item.name}
                <span style={{ marginLeft: '0.5rem', opacity: 0.6 }}>{item.n}</span>
              </button>
            )
          })}
        </div>
      )}

      <ul className="mt-12">
        {shown.map(piece => (
          <li key={piece.id}>
            <Link
              href={piece.href}
              className="group grid gap-x-8 gap-y-5 border-b py-8 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] lg:py-9"
              style={{ borderColor: 'rgba(238,234,225,0.09)' }}
            >
              <Artwork
                src={piece.artwork}
                title={piece.title}
                className="transition-transform duration-300 ease-out group-hover:-translate-y-1"
              />

              <div className="min-w-0">
              <div className="flex items-baseline gap-5">
                {piece.episode != null && (
                  <span
                    className="shrink-0 tabular-nums"
                    style={{
                      fontFamily: HEADING,
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      letterSpacing: '0.04em',
                      color: 'var(--awd-gold)',
                    }}
                  >
                    {String(piece.episode).padStart(2, '0')}
                  </span>
                )}

                <h2
                  className="min-w-0 transition-colors group-hover:text-[var(--awd-gold)]"
                  style={{
                    fontFamily: HEADING,
                    fontWeight: 600,
                    fontSize: 'clamp(1.2rem, 2.3vw, 1.75rem)',
                    letterSpacing: '-0.015em',
                    lineHeight: 1.2,
                    color: 'var(--awd-bone)',
                  }}
                >
                  {piece.title}
                </h2>
              </div>

              {(piece.subtitle || piece.summary) && (
                <p
                  className="mt-4 text-[0.95rem] leading-relaxed lg:pl-[3.1rem]"
                  style={{ fontFamily: HEADING, fontWeight: 400, color: 'rgba(238,234,225,0.66)' }}
                >
                  {piece.subtitle ?? piece.summary}
                </p>
              )}

              <p
                className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.16em] lg:pl-[3.1rem]"
                style={{ fontFamily: HEADING, color: 'var(--awd-stone)' }}
              >
                {[
                  piece.series?.name,
                  piece.scripture[0]?.label,
                  piece.readingMinutes ? `${piece.readingMinutes} min` : null,
                ]
                  .filter(Boolean)
                  .join('  ·  ')}
              </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
