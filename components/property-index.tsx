import SharedArtwork from '@/components/library/artwork'
import Link from 'next/link'
import ScrollReveal from '@/components/scroll-reveal'
import type { Piece } from '@/lib/library/types'

/*
  Grade calibrated against the artwork, not assumed.

  The original treatment assumed Austin's covers ran near white to near black
  and needed flattening. Measuring all 272 of them says otherwise: the median
  sits at 35 percent brightness and 133 are already below that. The old grade
  then halved it to 18 percent, which pushed the darkest covers to near black.
  "War with Iran" read as an empty card on the shelf.

  So the brightness cut is gone and the graphite veil drops from 42 to 20
  percent. Grayscale, the steel tint and the vignette stay, which is what keeps
  a shelf reading as one set. Full colour still returns on hover.
*/
/*
  Shared furniture for the three legacy property indexes: Word for Word,
  Exegetica, and Forum & Pulpit.

  These routes used to be a WordPress magazine clone (ticker, popular posts
  sidebar, corner category badges, mosaic grids). That brief is retired. What
  is left is a show page in the current design system: a hero, an honest set of
  controls, and one clear listing that hands off to the Library for the full
  show experience.

  Everything here renders on the server. The only motion is CSS on hover plus
  the shared scroll reveal, so no page needs client state to browse.
*/

export const HEADING = 'var(--font-cmg), system-ui, sans-serif'
export const SERIF = 'var(--font-source-serif), Georgia, serif'

const BLACK = '#171918'
const GRAPHITE = '#2C302F'
const BONE = '#EEEAE1'
const GOLD = '#CDB079'
const STONE = '#AAA79E'
const HAIRLINE = 'rgba(238,234,225,0.12)'

/*
  The same grain the browse cards use. Artwork here spans near white to near
  black, so every image runs one grade and lifts it on hover.
*/
// ─── Text helpers ────────────────────────────────────────────────────────────

/** Strips the markdown that survives in summaries pulled from MDX bodies. */
function clean(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\\([_*[\]])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

/*
  Card copy. Subtitle is the intended line, but the backfill that writes it is
  still running, so summary is the fallback and an empty string is a normal
  outcome rather than a bug. Truncation never assumes either field exists.
*/
export function blurbFor(piece: Piece, max = 150): string {
  const raw = clean(piece.subtitle ?? piece.summary ?? '')
  if (!raw) return ''
  if (raw.length <= max) return raw
  const cut = raw.slice(0, max)
  const space = cut.lastIndexOf(' ')
  return `${(space > 60 ? cut.slice(0, space) : cut).trimEnd()}…`
}

export function formatDate(iso: string | null): string {
  if (!iso) return ''
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return ''
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  })
}

/** "Episode 51", never "S3E4". The number is global and is never re derived. */
export function episodeLabel(piece: Piece): string {
  return piece.episode ? `Episode ${piece.episode}` : ''
}

function metaLine(parts: (string | null | undefined)[]): string {
  return parts.filter(Boolean).join(' · ')
}

// ─── Artwork ─────────────────────────────────────────────────────────────────

/* Thin wrapper over the shared grade, adding this surface's hover lift. */
function Artwork({ src, title }: { src: string | null; title: string }) {
  return (
    <SharedArtwork
      src={src}
      title={title}
      className="transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:shadow-[0_22px_50px_rgba(0,0,0,0.55)] group-focus-visible:-translate-y-1.5"
    />
  )
}

// ─── Hero ────────────────────────────────────────────────────────────────────

export function PropertyHero({
  eyebrow,
  name,
  tagline,
  description,
  meta,
  libraryHref,
  libraryLabel,
}: {
  eyebrow: string
  name: string
  tagline: string
  description?: string | null
  meta: string
  libraryHref: string
  libraryLabel: string
}) {
  return (
    <section className="relative -mt-[60px] overflow-hidden" style={{ background: BLACK }}>
      <div className="mx-auto max-w-[1180px] px-6 pb-16 pt-32 lg:px-8 lg:pb-20 lg:pt-40">
        <ScrollReveal>
          <div className="flex items-center gap-3">
            <span aria-hidden className="h-px w-10" style={{ background: GOLD }} />
            <span
              className="text-[0.7rem] font-semibold uppercase tracking-[0.24em]"
              style={{ fontFamily: HEADING, color: GOLD }}
            >
              {eyebrow}
            </span>
          </div>

          <h1
            className="mt-6 uppercase"
            style={{
              fontFamily: HEADING,
              fontSize: 'clamp(2.6rem, 6.4vw, 4.8rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 0.95,
              color: BONE,
              maxWidth: '16ch',
            }}
          >
            {name}
          </h1>

          <p
            className="mt-6 text-[1.05rem] leading-[1.75]"
            style={{ fontFamily: SERIF, color: 'rgba(238,234,225,0.78)', maxWidth: '52ch' }}
          >
            {tagline}
          </p>

          {description && (
            <p
              className="mt-4 text-[0.95rem] leading-[1.8]"
              style={{ fontFamily: SERIF, color: STONE, maxWidth: '58ch' }}
            >
              {description}
            </p>
          )}

          <div
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t pt-6"
            style={{ borderColor: HAIRLINE }}
          >
            <p className="text-[0.85rem]" style={{ fontFamily: SERIF, color: STONE }}>
              {meta}
            </p>
            <Link
              href={libraryHref}
              className="text-[0.85rem] underline underline-offset-4 transition-colors hover:opacity-80"
              style={{ fontFamily: SERIF, color: GOLD, textDecorationColor: 'rgba(205,176,121,0.45)' }}
            >
              {libraryLabel}
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

// ─── Controls ────────────────────────────────────────────────────────────────

export type FilterOption = { slug: string; label: string; count: number }

/*
  Real filtering, as links rather than sidebar furniture. The selection lives
  in the query string, so a filtered view is shareable and the page stays a
  server component with no client state at all.
*/
export function FilterLinks({
  options,
  active,
  basePath,
  allLabel,
  paramName = 'season',
  legend,
}: {
  options: FilterOption[]
  active: string | null
  basePath: string
  allLabel: string
  paramName?: string
  legend: string
}) {
  if (!options.length) return null

  const chip = (href: string, label: string, count: number, isActive: boolean) => (
    <Link
      key={href}
      href={href}
      aria-current={isActive ? 'true' : undefined}
      className="inline-flex items-baseline gap-2 rounded-full border px-4 py-2 text-[0.8rem] transition-colors"
      style={{
        fontFamily: HEADING,
        fontWeight: 600,
        letterSpacing: '-0.01em',
        borderColor: isActive ? GOLD : HAIRLINE,
        background: isActive ? GOLD : 'transparent',
        color: isActive ? BLACK : BONE,
      }}
    >
      {label}
      <span
        className="text-[0.72rem]"
        style={{ color: isActive ? 'rgba(23,25,24,0.6)' : STONE, fontWeight: 500 }}
      >
        {count}
      </span>
    </Link>
  )

  const total = options.reduce((sum, o) => sum + o.count, 0)

  return (
    <nav aria-label={legend} className="flex flex-wrap gap-2.5">
      {chip(basePath, allLabel, total, !active)}
      {options.map(o =>
        chip(`${basePath}?${paramName}=${o.slug}`, o.label, o.count, active === o.slug),
      )}
    </nav>
  )
}

// ─── Section heading ─────────────────────────────────────────────────────────

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-[0.78rem] font-bold uppercase tracking-[0.2em]"
      style={{ fontFamily: HEADING, color: GOLD }}
    >
      {children}
    </h2>
  )
}

// ─── Listings ────────────────────────────────────────────────────────────────

/** Grid tile. Used where a property has enough pieces to need a grid. */
export function PieceCard({
  piece,
  kicker,
  priority = false,
}: {
  piece: Piece
  kicker?: string | null
  priority?: boolean
}) {
  const meta = metaLine([episodeLabel(piece), formatDate(piece.publishedAt)])

  return (
    <Link href={piece.href} className="group block outline-none">
      <Artwork src={piece.artwork} title={piece.title} />

      {kicker && (
        <p
          className="mt-4 text-[0.72rem] font-semibold"
          style={{ fontFamily: HEADING, letterSpacing: '0.02em', color: 'var(--awd-accent-2)' }}
        >
          {kicker}
        </p>
      )}

      <h3
        className="mt-1.5 text-[1.02rem] transition-colors group-hover:text-[var(--awd-gold)]"
        style={{ fontFamily: HEADING, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.28, color: BONE }}
      >
        {piece.title}
      </h3>

      {meta && (
        <p className="mt-2 text-[0.76rem]" style={{ fontFamily: SERIF, color: STONE }}>
          {meta}
        </p>
      )}
    </Link>
  )
}

export function PieceGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="grid gap-x-6 gap-y-11"
      // A bare 1fr means minmax(auto, 1fr), which lets a long title push the
      // track wider than the viewport. minmax with min() keeps every column
      // shrinkable and the page free of sideways scroll.
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 268px), 1fr))' }}
    >
      {children}
    </div>
  )
}

/** Wide row. Used where a property has few enough pieces to give each room. */
export function PieceRow({ piece, priority = false }: { piece: Piece; priority?: boolean }) {
  const blurb = blurbFor(piece, 220)
  const meta = metaLine([
    episodeLabel(piece),
    formatDate(piece.publishedAt),
    piece.readingMinutes ? `${piece.readingMinutes} min read` : null,
  ])

  return (
    <Link href={piece.href} className="group flex flex-col gap-6 outline-none md:flex-row md:gap-9">
      <div className="w-full shrink-0 md:w-[300px] lg:w-[360px]">
        <Artwork src={piece.artwork} title={piece.title} />
      </div>

      <div className="min-w-0 flex-1 md:pt-1">
        <h3
          className="text-[1.35rem] transition-colors group-hover:text-[var(--awd-gold)] lg:text-[1.55rem]"
          style={{ fontFamily: HEADING, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, color: BONE }}
        >
          {piece.title}
        </h3>

        {blurb && (
          <p
            className="mt-3 text-[0.95rem] leading-[1.8]"
            style={{ fontFamily: SERIF, color: 'rgba(238,234,225,0.72)', maxWidth: '62ch' }}
          >
            {blurb}
          </p>
        )}

        {meta && (
          <p className="mt-4 text-[0.78rem]" style={{ fontFamily: SERIF, color: STONE }}>
            {meta}
          </p>
        )}
      </div>
    </Link>
  )
}

/** Shown when a filter matches nothing, so the page never renders a void. */
export function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-[0.95rem]" style={{ fontFamily: SERIF, color: STONE }}>
      {message}
    </p>
  )
}

export { BLACK, BONE, GOLD, STONE, HAIRLINE }
