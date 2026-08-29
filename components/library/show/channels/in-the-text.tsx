import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Piece, Season } from '@/lib/library/types'
import Artwork from '@/components/library/artwork'

/*
  In the Text, laid out as studies you follow in order.

  This is the one channel where sequence is the point. A study through Daniel
  is meant to be taken from chapter one forward, so the sessions are numbered
  down the page and the passage sits beside each one.

  The numbering is positional, generated from the order of the list, and that
  is deliberate: unlike Word for Word, nothing here carries a production number
  in its artwork, so counting the sessions is honest rather than inventing an
  identifier that would contradict a cover.

  Ordering is oldest first within a study, because the first session is where
  someone should start, and by date because none of these carry positions.
*/

const HEADING = 'var(--font-cmg), system-ui, sans-serif'

const oldestFirst = (a: Piece, b: Piece) =>
  (a.publishedAt ?? '').localeCompare(b.publishedAt ?? '')

export default function InTheTextChannel({
  showSlug,
  seasons,
  active,
}: {
  showSlug: string
  seasons: Season[]
  active: Season | null
}) {
  const sessions = active ? [...active.episodes].sort(oldestFirst) : []

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-16 lg:px-8 lg:py-20">
      {/* Every study, as the way in. Picking one is the first decision. */}
      <div
        className="grid gap-5"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 15rem), 1fr))' }}
      >
        {seasons.map(season => {
          const on = active?.id === season.id
          return (
            <Link
              key={season.id}
              href={`/library/${showSlug}?season=${season.slug}`}
              scroll={false}
              className="group block"
            >
              <Artwork
                src={season.artwork}
                title={season.name}
                className="transition-transform duration-300 ease-out group-hover:-translate-y-1"
                style={{ outline: on ? '1px solid var(--awd-gold)' : undefined, outlineOffset: '2px' }}
              />
              <h2
                className="mt-3.5 uppercase transition-colors group-hover:text-[var(--awd-gold)]"
                style={{
                  fontFamily: HEADING,
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                  color: on ? 'var(--awd-gold)' : 'var(--awd-bone)',
                }}
              >
                {season.name}
              </h2>
              <p
                className="mt-1.5 text-[0.7rem]"
                style={{ fontFamily: HEADING, fontWeight: 400, color: 'var(--awd-stone)' }}
              >
                {season.episodes.length} {season.episodes.length === 1 ? 'session' : 'sessions'}
              </p>
            </Link>
          )
        })}
      </div>

      {active && sessions.length > 0 && (
        <section className="mt-20 lg:mt-24">
          <div className="mb-8 flex flex-wrap items-baseline gap-x-5 gap-y-2">
            <h2
              className="uppercase"
              style={{
                fontFamily: HEADING,
                fontWeight: 700,
                fontSize: 'clamp(1.5rem, 2.8vw, 2.1rem)',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                color: 'var(--awd-bone)',
              }}
            >
              {active.name}
            </h2>
            <span
              className="text-[0.68rem] font-semibold uppercase tracking-[0.18em]"
              style={{ fontFamily: HEADING, color: 'var(--awd-stone)' }}
            >
              {sessions.length} sessions, in order
            </span>
          </div>

          <ol>
            {sessions.map((piece, i) => (
              <li key={piece.id}>
                <Link
                  href={piece.href}
                  className="group grid items-baseline gap-x-6 gap-y-2 border-b py-6 lg:grid-cols-[3rem_minmax(0,1fr)_10rem]"
                  style={{ borderColor: 'rgba(238,234,225,0.09)' }}
                >
                  <span
                    className="tabular-nums"
                    style={{
                      fontFamily: HEADING,
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      color: 'var(--awd-gold)',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <span className="min-w-0">
                    <span
                      className="block text-[1.05rem] transition-colors group-hover:text-[var(--awd-gold)] lg:text-[1.15rem]"
                      style={{
                        fontFamily: HEADING,
                        fontWeight: 600,
                        letterSpacing: '-0.012em',
                        lineHeight: 1.25,
                        color: 'var(--awd-bone)',
                      }}
                    >
                      {piece.title}
                    </span>
                    {(piece.subtitle || piece.summary) && (
                      <span
                        className="mt-2.5 block max-w-[46rem] text-[0.92rem] leading-relaxed"
                        style={{ fontFamily: HEADING, fontWeight: 400, color: 'rgba(238,234,225,0.62)' }}
                      >
                        {piece.subtitle ?? piece.summary}
                      </span>
                    )}
                  </span>

                  <span
                    className="text-[0.72rem] lg:text-right"
                    style={{ fontFamily: HEADING, fontWeight: 400, color: 'var(--awd-stone)' }}
                  >
                    {[piece.scripture[0]?.label, piece.readingMinutes ? `${piece.readingMinutes} min` : null]
                      .filter(Boolean)
                      .join('  ·  ')}
                  </span>
                </Link>
              </li>
            ))}
          </ol>

          <Link
            href={sessions[0].href}
            className="group/start mt-10 inline-flex items-center gap-2 rounded-full px-6 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em]"
            style={{ fontFamily: HEADING, background: 'var(--awd-gold)', color: '#171918' }}
          >
            Start at session one
            <ArrowRight size={13} className="transition-transform duration-200 group-hover/start:translate-x-0.5" />
          </Link>
        </section>
      )}
    </div>
  )
}
