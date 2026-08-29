import Link from 'next/link'
import type { Piece } from '@/lib/library/types'
import Artwork from '@/components/library/artwork'

/*
  Sermons, laid out as occasions.

  A sermon is tied to a Sunday and to a passage, and this channel has both for
  every piece: 100 percent carry scripture, and they run across six years. So
  the page is a record by year, and the date and the passage lead each row
  rather than trailing it as metadata.

  No artwork in the list. Every sermon has a cover, but 47 covers stacked down
  a page is a grid, and this is a record. The newest sermon gets the one image,
  because that is the thing a visitor is most likely here for.
*/

const HEADING = 'var(--font-cmg), system-ui, sans-serif'

const fullDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : ''

const dayAndMonth = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''

export default function SermonsChannel({ pieces }: { pieces: Piece[] }) {
  if (!pieces.length) return null
  const [latest, ...rest] = pieces

  // Grouped by year, newest first, because a preaching record reads as seasons
  // of ministry rather than as one undifferentiated list.
  const years = new Map<string, Piece[]>()
  for (const p of rest) {
    const y = (p.publishedAt ?? '').slice(0, 4) || 'Undated'
    years.set(y, [...(years.get(y) ?? []), p])
  }

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-20 lg:px-8 lg:py-24">
      <Link href={latest.href} className="group block">
        <p
          className="mb-5 text-[0.68rem] font-semibold uppercase tracking-[0.2em]"
          style={{ fontFamily: HEADING, color: 'var(--awd-gold)' }}
        >
          Most recent
        </p>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-12">
          <Artwork
            src={latest.artwork}
            title={latest.title}
            eager
            className="transition-transform duration-300 ease-out group-hover:-translate-y-1"
          />

          <div className="min-w-0 self-center">
            <p
              className="text-[0.72rem] font-semibold uppercase tracking-[0.16em]"
              style={{ fontFamily: HEADING, color: 'var(--awd-stone)' }}
            >
              {[fullDate(latest.publishedAt), latest.scripture[0]?.label].filter(Boolean).join('  ·  ')}
            </p>
            <h2
              className="mt-4 uppercase transition-colors group-hover:text-[var(--awd-gold)]"
              style={{
                fontFamily: HEADING,
                fontWeight: 700,
                fontSize: 'clamp(1.7rem, 3.2vw, 2.5rem)',
                letterSpacing: '-0.02em',
                lineHeight: 1,
                color: 'var(--awd-bone)',
              }}
            >
              {latest.title}
            </h2>
            {(latest.subtitle || latest.summary) && (
              <p
                className="mt-5 max-w-[40rem] text-[0.98rem] leading-relaxed"
                style={{ fontFamily: HEADING, fontWeight: 400, color: 'rgba(238,234,225,0.7)' }}
              >
                {latest.subtitle ?? latest.summary}
              </p>
            )}
          </div>
        </div>
      </Link>

      {[...years.entries()].map(([year, list]) => (
        <section key={year} className="mt-20 lg:mt-24">
          <div className="mb-6 flex items-baseline gap-4">
            <h2
              style={{
                fontFamily: HEADING,
                fontWeight: 700,
                fontSize: '1.7rem',
                letterSpacing: '-0.02em',
                color: 'var(--awd-bone)',
              }}
            >
              {year}
            </h2>
            <span
              className="text-[0.66rem] font-semibold uppercase tracking-[0.18em]"
              style={{ fontFamily: HEADING, color: 'var(--awd-stone)' }}
            >
              {list.length} {list.length === 1 ? 'sermon' : 'sermons'}
            </span>
            <span aria-hidden className="h-px flex-1" style={{ background: 'rgba(238,234,225,0.12)' }} />
          </div>

          <ul>
            {list.map(piece => (
              <li key={piece.id}>
                <Link
                  href={piece.href}
                  className="group grid items-baseline gap-x-6 gap-y-1 border-b py-5 lg:grid-cols-[5.5rem_minmax(0,1fr)_11rem]"
                  style={{ borderColor: 'rgba(238,234,225,0.08)' }}
                >
                  <span
                    className="text-[0.72rem] font-semibold uppercase tracking-[0.14em]"
                    style={{ fontFamily: HEADING, color: 'var(--awd-stone)' }}
                  >
                    {dayAndMonth(piece.publishedAt)}
                  </span>

                  <span
                    className="min-w-0 text-[1.02rem] transition-colors group-hover:text-[var(--awd-gold)] lg:text-[1.08rem]"
                    style={{
                      fontFamily: HEADING,
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                      color: 'var(--awd-bone)',
                    }}
                  >
                    {piece.title}
                  </span>

                  <span
                    className="text-[0.72rem] lg:text-right"
                    style={{ fontFamily: HEADING, fontWeight: 400, color: 'var(--awd-stone)' }}
                  >
                    {piece.scripture[0]?.label ?? ''}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
