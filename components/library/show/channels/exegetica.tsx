import Link from 'next/link'
import type { Piece } from '@/lib/library/types'

/*
  Exegetica, laid out as a journal.

  These are papers, not posts. The median runs 51 minutes and the longest is
  149, which is the defining fact about this channel and the one a reader most
  needs before committing. So length is stated plainly on every entry, next to
  the passage and the subject rather than buried under a title.

  Text forward by design. Only two thirds of these carry artwork, and a grid
  half full of covers and half full of title cards reads as a fault rather than
  as a choice. Every paper gets the same treatment instead: a number, a title,
  its abstract, and what it costs to read.

  Numbered in reverse, newest first, the way an issue run is numbered.
*/

const HEADING = 'var(--font-cmg), system-ui, sans-serif'

const year = (iso: string | null) => (iso ? new Date(iso).getFullYear() : '')

function readingLabel(minutes: number | null): string | null {
  if (!minutes) return null
  if (minutes < 60) return `${minutes} min read`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h} hr ${m} min read` : `${h} hr read`
}

export default function ExegeticaChannel({ pieces }: { pieces: Piece[] }) {
  const papers = [...pieces].sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))

  return (
    <div className="mx-auto max-w-[62rem] px-6 py-16 lg:px-8 lg:py-20">
      <ol>
        {papers.map((paper, i) => (
          <li key={paper.id}>
            <Link
              href={paper.href}
              className="group block border-b py-10 lg:py-12"
              style={{ borderColor: 'rgba(238,234,225,0.1)' }}
            >
              <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
                <span
                  className="tabular-nums"
                  style={{
                    fontFamily: HEADING,
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    letterSpacing: '0.06em',
                    color: 'var(--awd-gold)',
                  }}
                >
                  {String(papers.length - i).padStart(2, '0')}
                </span>
                <span
                  className="text-[0.68rem] font-semibold uppercase tracking-[0.18em]"
                  style={{ fontFamily: HEADING, color: 'var(--awd-stone)' }}
                >
                  {[
                    year(paper.publishedAt),
                    paper.scripture[0]?.label,
                    readingLabel(paper.readingMinutes),
                  ]
                    .filter(Boolean)
                    .join('  ·  ')}
                </span>
              </div>

              <h2
                className="mt-5 transition-colors group-hover:text-[var(--awd-gold)]"
                style={{
                  fontFamily: HEADING,
                  fontWeight: 600,
                  fontSize: 'clamp(1.3rem, 2.4vw, 1.85rem)',
                  letterSpacing: '-0.015em',
                  lineHeight: 1.22,
                  color: 'var(--awd-bone)',
                }}
              >
                {paper.title}
              </h2>

              {(paper.summary || paper.subtitle) && (
                <p
                  className="mt-5 max-w-[52rem] text-[0.97rem] leading-[1.72]"
                  style={{ fontFamily: HEADING, fontWeight: 400, color: 'rgba(238,234,225,0.68)' }}
                >
                  {paper.summary ?? paper.subtitle}
                </p>
              )}

              {paper.topics.length > 0 && (
                <p
                  className="mt-5 text-[0.68rem] font-semibold uppercase tracking-[0.14em]"
                  style={{ fontFamily: HEADING, color: 'rgba(238,234,225,0.42)' }}
                >
                  {paper.topics.slice(0, 4).map(t => t.name).join('  ·  ')}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}
