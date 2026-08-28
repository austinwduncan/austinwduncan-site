import Link from 'next/link'
import type { Piece } from '@/lib/library/types'

/*
  Shared surface kit for the Scripture explorer and the topic pages.

  One file names the typeface and the palette so neither can drift, the same
  discipline app/page.tsx uses. Headings are CMG Sans, always. Body copy is
  Source Serif. Uppercase is reserved for static section labels, book names and
  chapter numbers: an article title is never uppercased, because Austin writes
  long questions and uppercase truncates them.

  House rule: no em dashes or en dashes anywhere, comments included.
*/

export const BLACK = '#171918'
export const GRAPHITE = '#2C302F'
export const GOLD = '#CDB079'
export const BONE = '#EEEAE1'
export const STONE = '#AAA79E'
export const STEEL = '#748790'
/* Gold measures 1.73 on warm bone, so light surfaces use this instead. */
export const GOLD_ON_LIGHT = '#6E5A2E'

export const HEADING = 'var(--font-cmg), system-ui, sans-serif'
export const SERIF = 'var(--font-cmg), system-ui, sans-serif'

const HEADING_SIZES = {
  xs: 'clamp(0.95rem, 1.1vw, 1.05rem)',
  sm: 'clamp(1.15rem, 1.7vw, 1.45rem)',
  md: 'clamp(1.7rem, 3vw, 2.5rem)',
  lg: 'clamp(2.1rem, 4.2vw, 3.4rem)',
  xl: 'clamp(2.6rem, 6.6vw, 5.4rem)',
}

export function Heading({
  as: Tag = 'h2',
  children,
  size = 'md',
  color = BONE,
  uppercase = false,
  className = '',
  title,
}: {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'div'
  children: React.ReactNode
  size?: keyof typeof HEADING_SIZES
  color?: string
  /** Only for static labels, book names and numerals. Never for a piece title. */
  uppercase?: boolean
  className?: string
  title?: string
}) {
  const display = size === 'lg' || size === 'xl'
  return (
    <Tag
      title={title}
      className={`text-balance ${uppercase ? 'uppercase' : ''} ${className}`}
      style={{
        fontFamily: HEADING,
        fontSize: HEADING_SIZES[size],
        fontWeight: 700,
        lineHeight: display ? 0.95 : 1.15,
        letterSpacing: '-0.02em',
        color,
      }}
    >
      {children}
    </Tag>
  )
}

/** The ruled eyebrow, carried over from the Crosswalk visual language. */
export function Eyebrow({
  children,
  color = STEEL,
  className = '',
}: {
  children: React.ReactNode
  color?: string
  className?: string
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span aria-hidden className="block h-px w-8" style={{ background: color, opacity: 0.7 }} />
      <span
        className="uppercase"
        style={{
          fontFamily: HEADING,
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.16em',
          color,
        }}
      >
        {children}
      </span>
    </div>
  )
}

export function Lede({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={`max-w-[62ch] ${className}`}
      style={{
        fontFamily: SERIF,
        fontSize: 'clamp(1.02rem, 1.35vw, 1.2rem)',
        lineHeight: 1.72,
        color: 'rgba(238,234,225,0.74)',
      }}
    >
      {children}
    </p>
  )
}

/** A stat pair: the numeral in gold, the label in stone. */
export function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="min-w-0">
      <div
        style={{
          fontFamily: HEADING,
          fontSize: 'clamp(1.5rem, 2.6vw, 2.1rem)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          color: GOLD,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
      <div
        className="mt-2 uppercase"
        style={{ fontFamily: HEADING, fontSize: '0.66rem', fontWeight: 600, letterSpacing: '0.15em', color: STONE }}
      >
        {label}
      </div>
    </div>
  )
}

/** A small scripture or taxonomy chip. Gold only when it is the reason for the match. */
export function Chip({
  children,
  tone = 'quiet',
}: {
  children: React.ReactNode
  tone?: 'quiet' | 'gold' | 'steel'
}) {
  const tones = {
    quiet: { color: 'rgba(238,234,225,0.62)', border: 'rgba(238,234,225,0.14)', background: 'transparent' },
    gold: { color: GOLD, border: 'rgba(205,176,121,0.42)', background: 'rgba(205,176,121,0.07)' },
    steel: { color: STEEL, border: 'rgba(116,135,144,0.36)', background: 'transparent' },
  }[tone]
  return (
    <span
      className="inline-block whitespace-nowrap rounded-[2px] border px-2 py-[3px]"
      style={{
        fontFamily: HEADING,
        fontSize: '0.68rem',
        fontWeight: 600,
        letterSpacing: '0.06em',
        fontVariantNumeric: 'tabular-nums',
        ...tones,
      }}
    >
      {children}
    </span>
  )
}

export function formatDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

/*
  One piece, as a ruled row.

  A row rather than a card on purpose: a topic can hold one piece or a hundred
  and twelve, and a row list reads correctly at both ends where a card grid
  leaves a single lonely tile floating in white space.
*/
export function PieceRow({
  piece,
  reasons = [],
  dense = false,
}: {
  piece: Piece
  /** The reference labels that caused this piece to match, shown in gold. */
  reasons?: string[]
  dense?: boolean
}) {
  const date = formatDate(piece.publishedAt)
  const meta = [
    piece.collection?.name,
    piece.format?.name,
    date,
    piece.readingMinutes ? `${piece.readingMinutes} min read` : null,
  ].filter(Boolean) as string[]

  return (
    <Link
      href={piece.href}
      className="group block border-t transition-colors"
      style={{ borderColor: 'rgba(238,234,225,0.09)' }}
    >
      <div className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-10 ${dense ? 'py-6' : 'py-8'}`}>
        <div className="min-w-0 flex-1">
          {/* The colour lives on the wrapper so the hover can win. An inline
              style on the heading itself would outrank any hover class. */}
          <span className="block text-bone transition-colors group-hover:text-gold">
            <Heading as="h3" size={dense ? 'xs' : 'sm'} color="currentColor">
              {piece.title}
            </Heading>
          </span>

          {piece.summary && !dense && (
            <p
              className="mt-3 line-clamp-2 max-w-[70ch]"
              style={{ fontFamily: SERIF, fontSize: '0.98rem', lineHeight: 1.68, color: 'rgba(238,234,225,0.6)' }}
            >
              {piece.summary}
            </p>
          )}

          {meta.length > 0 && (
            <div
              className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1"
              style={{ fontFamily: HEADING, fontSize: '0.66rem', fontWeight: 600, letterSpacing: '0.12em', color: STONE }}
            >
              {meta.map((m, i) => (
                <span key={m} className="uppercase">
                  {i > 0 && <span aria-hidden style={{ opacity: 0.45, marginRight: '0.75rem' }}>/</span>}
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>

        {reasons.length > 0 && (
          <div className="flex min-w-0 flex-wrap gap-1.5 sm:max-w-[16rem] sm:justify-end">
            {reasons.slice(0, 4).map(label => (
              <Chip key={label} tone="gold">{label}</Chip>
            ))}
            {reasons.length > 4 && <Chip>{`+${reasons.length - 4}`}</Chip>}
          </div>
        )}
      </div>
    </Link>
  )
}

export function PieceList({
  pieces,
  reasonsFor,
  dense = false,
}: {
  pieces: Piece[]
  reasonsFor?: (p: Piece) => string[]
  dense?: boolean
}) {
  return (
    <div
      className="border-b"
      style={{ borderColor: 'rgba(238,234,225,0.09)' }}
    >
      {pieces.map(p => (
        <PieceRow key={p.id} piece={p} reasons={reasonsFor?.(p) ?? []} dense={dense} />
      ))}
    </div>
  )
}

/** Honest empty state. Nothing here is broken, there simply is no teaching yet. */
export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div
      className="rounded-[3px] border px-7 py-12 text-center"
      style={{ borderColor: 'rgba(238,234,225,0.12)', background: 'rgba(238,234,225,0.02)' }}
    >
      <Heading as="h3" size="sm" uppercase color={STONE}>{title}</Heading>
      <p
        className="mx-auto mt-3 max-w-[46ch]"
        style={{ fontFamily: SERIF, fontSize: '0.98rem', lineHeight: 1.7, color: 'rgba(238,234,225,0.5)' }}
      >
        {body}
      </p>
    </div>
  )
}

/** Page shell. Every Scripture and topic route sits on the soft black surface. */
export function Page({ children }: { children: React.ReactNode }) {
  return <div style={{ background: BLACK }}>{children}</div>
}

export function Section({
  children,
  tight = false,
  className = '',
}: {
  children: React.ReactNode
  tight?: boolean
  className?: string
}) {
  return (
    <section className={`mx-auto max-w-[1180px] px-6 lg:px-8 ${tight ? 'py-16 lg:py-20' : 'py-24 lg:py-32'} ${className}`}>
      {children}
    </section>
  )
}
