import Link from 'next/link'
import { GOLD, HEADING, STONE } from './kit'

/*
  The chapter grid.

  The signature element of the Scripture explorer, and the one place someone
  would be tempted to flood with gold. Gold is a rule here, never a field: each
  populated chapter carries a gold bar along its bottom edge whose length rises
  with how much teaching touches it, and the numeral itself only turns gold in
  the top band, which is rare by construction.

  Intensity is relative to the busiest chapter in the book, so Psalms, where
  most chapters are touched once by a single sweep of the whole psalter, does
  not read the same as Romans, where chapter 8 carries thirty pieces. The top
  band is withheld entirely from books whose busiest chapter is under three, so
  a thinly covered book cannot light up as though it were heavily taught.

  Scale: auto-fill, not auto-fit. Empty tracks are kept, so Jude at one chapter
  keeps a single small cell instead of stretching one number across the page,
  while Psalms at 150 wraps into rows of equal cells and never blows the
  layout sideways. The tracks use minmax so a cell can shrink; a bare 1fr means
  minmax(auto, 1fr) and pushes the page into horizontal scroll.
*/

function tierOf(count: number, max: number): number {
  if (count === 0) return 0
  if (max <= 2) return count >= 2 ? 2 : 1
  const ratio = count / max
  if (ratio <= 0.25) return 1
  if (ratio <= 0.5) return 2
  if (ratio <= 0.75) return 3
  return 4
}

const TIERS = [
  { background: 'transparent', border: 'rgba(238,234,225,0.06)', text: 'rgba(170,167,158,0.34)', bar: 0 },
  { background: 'rgba(238,234,225,0.03)', border: 'rgba(238,234,225,0.13)', text: 'rgba(238,234,225,0.76)', bar: 0.3 },
  { background: 'rgba(205,176,121,0.05)', border: 'rgba(205,176,121,0.22)', text: '#EEEAE1', bar: 0.55 },
  { background: 'rgba(205,176,121,0.08)', border: 'rgba(205,176,121,0.32)', text: '#EEEAE1', bar: 0.78 },
  { background: 'rgba(205,176,121,0.12)', border: 'rgba(205,176,121,0.46)', text: GOLD, bar: 1 },
]

function Cell({
  chapter,
  tier,
  href,
  label,
  compact,
}: {
  chapter: number
  tier: number
  href: string | null
  label: string
  compact: boolean
}) {
  const t = TIERS[tier]
  const inner = (
    <>
      <span
        style={{
          fontFamily: HEADING,
          fontWeight: 700,
          fontSize: compact ? '0.8rem' : '0.95rem',
          letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums',
          color: t.text,
        }}
      >
        {chapter}
      </span>
      {t.bar > 0 && (
        <span
          aria-hidden
          className="absolute bottom-0 left-0 h-[2px]"
          style={{ width: `${t.bar * 100}%`, background: GOLD, opacity: 0.55 + t.bar * 0.45 }}
        />
      )}
      {href && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[3px] opacity-0 transition-opacity duration-200 group-hover/cell:opacity-100"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(205,176,121,0.85)' }}
        />
      )}
    </>
  )

  const style = {
    minWidth: 0,
    aspectRatio: '1 / 1',
    background: t.background,
    borderColor: t.border,
  } as const

  if (!href) {
    return (
      <div
        title={label}
        aria-label={label}
        className="relative flex items-center justify-center overflow-hidden rounded-[3px] border"
        style={style}
      >
        {inner}
      </div>
    )
  }

  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      className="group/cell relative flex items-center justify-center overflow-hidden rounded-[3px] border"
      style={style}
    >
      {inner}
    </Link>
  )
}

export default function ChapterGrid({
  bookSlug,
  bookName,
  chapterCount,
  counts,
}: {
  bookSlug: string
  bookName: string
  chapterCount: number
  counts: number[]
}) {
  const max = counts.reduce((a, b) => Math.max(a, b), 0)
  const compact = chapterCount >= 100
  const cellMin = compact ? '2.9rem' : '3.4rem'

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gap: compact ? '0.35rem' : '0.45rem',
          gridTemplateColumns: `repeat(auto-fill, minmax(${cellMin}, 1fr))`,
        }}
      >
        {Array.from({ length: chapterCount }, (_, i) => {
          const chapter = i + 1
          const count = counts[i] ?? 0
          const noun = count === 1 ? 'piece' : 'pieces'
          return (
            <Cell
              key={chapter}
              chapter={chapter}
              tier={tierOf(count, max)}
              compact={compact}
              href={count > 0 ? `/scripture/${bookSlug}/${chapter}` : null}
              label={
                count > 0
                  ? `${bookName} ${chapter}, ${count} ${noun}`
                  : `${bookName} ${chapter}, no teaching yet`
              }
            />
          )
        })}
      </div>

      <div
        className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3"
        style={{ fontFamily: HEADING, fontSize: '0.64rem', fontWeight: 600, letterSpacing: '0.13em', color: STONE }}
      >
        <span className="flex items-center gap-2 uppercase">
          <span
            aria-hidden
            className="block h-4 w-4 rounded-[2px] border"
            style={{ borderColor: TIERS[0].border, background: TIERS[0].background }}
          />
          Nothing yet
        </span>
        <span className="flex items-center gap-2 uppercase">
          <span aria-hidden className="flex items-end gap-1">
            {[1, 2, 3, 4].map(t => (
              <span
                key={t}
                className="relative block h-4 w-4 overflow-hidden rounded-[2px] border"
                style={{ borderColor: TIERS[t].border, background: TIERS[t].background }}
              >
                <span
                  className="absolute bottom-0 left-0 h-[2px]"
                  style={{ width: `${TIERS[t].bar * 100}%`, background: GOLD, opacity: 0.55 + TIERS[t].bar * 0.45 }}
                />
              </span>
            ))}
          </span>
          More teaching
        </span>
        {max > 0 && (
          <span className="uppercase" style={{ opacity: 0.75 }}>
            {`Busiest chapter: ${max} pieces`}
          </span>
        )}
      </div>
    </div>
  )
}
