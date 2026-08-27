import type { CSSProperties, ReactNode } from 'react'

/*
  The single definition of how Austin's artwork is treated.

  This lived in five copies, one per surface, because the agents that built
  those surfaces were kept in separate directories so they could not collide.
  Changing the grade once meant editing it five times, which is exactly how a
  treatment drifts apart. It lives here now.

  Calibrated against the work rather than assumed. All 272 covers were measured:
  the median sits at 35 percent brightness and 133 are already darker than that.
  An earlier version cut brightness and laid a 42 percent veil over the top,
  which halved an already dark set to 18 percent and rendered the darkest covers
  as blank rectangles. "War with Iran" measured 27.7 percent at source and 13.8
  after grading, and read on the shelf as a missing image.

  So: no brightness cut, and a 20 percent veil. Grayscale, the steel tint and
  the vignette stay, because those are what make a shelf read as one set rather
  than as noise. Full colour returns on hover, so the original is still the
  reward for paying attention.

  Nothing is ever laid over the art. Austin typesets titles into his covers, so
  a chip or caption on top collides with type that is already there. Everything
  a card says belongs below the frame.
*/

/** Inline SVG grain, a data URI so it costs no request. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")"

const HEADING = 'var(--font-cmg), system-ui, sans-serif'

/** Applied to the <img>. The parent must carry `group`. */
export const ARTWORK_IMAGE_CLASS =
  'h-full w-full scale-[1.04] object-cover grayscale contrast-[0.88] ' +
  'transition-all duration-[600ms] ease-out ' +
  'group-hover:scale-[1.09] group-hover:grayscale-0 group-hover:contrast-100'

type Props = {
  src: string | null
  /** Shown as a title card when there is no artwork. */
  title: string
  /** Defaults to 16/9. Pass '1/1' or similar for a square tile. */
  aspect?: string
  className?: string
  /** Rendered above the grade, inside the frame. Use sparingly, never a label. */
  children?: ReactNode
  style?: CSSProperties
}

/*
  Thirteen pieces have no artwork. An empty frame reads as a broken image, so
  the fallback sets the title in the frame instead. That is the same thing
  Austin's real covers do, done in CSS until one exists.
*/
function TitleCard({ title }: { title: string }) {
  return (
    <span
      aria-hidden
      className="absolute inset-0 flex items-center justify-center px-4 text-center"
      style={{
        background:
          'radial-gradient(120% 120% at 30% 20%, rgba(116,135,144,0.22) 0%, transparent 60%), var(--awd-graphite)',
      }}
    >
      <span
        className="line-clamp-3"
        style={{
          fontFamily: HEADING,
          fontWeight: 700,
          fontSize: 'clamp(0.72rem, 1.5vw, 0.95rem)',
          letterSpacing: '-0.01em',
          lineHeight: 1.15,
          color: 'rgba(238,234,225,0.5)',
        }}
      >
        {title}
      </span>
    </span>
  )
}

export default function Artwork({
  src,
  title,
  aspect = '16/9',
  className = '',
  children,
  style,
}: Props) {
  return (
    <div
      className={`relative overflow-hidden rounded-[3px] ${className}`}
      style={{ aspectRatio: aspect, background: 'var(--awd-graphite)', ...style }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" className={ARTWORK_IMAGE_CLASS} />
      ) : (
        <TitleCard title={title} />
      )}

      {/* Veil. Lifts entirely on hover so the cover comes back. */}
      <span
        aria-hidden
        className="absolute inset-0 transition-opacity duration-[600ms] group-hover:opacity-0"
        style={{ background: 'rgba(44,48,47,0.20)' }}
      />
      {/* Steel tint, the thing that makes a mixed shelf read as one set. */}
      <span
        aria-hidden
        className="absolute inset-0 opacity-30 mix-blend-color transition-opacity duration-[600ms] group-hover:opacity-0"
        style={{ background: 'var(--awd-accent-2)' }}
      />
      {/* Vignette, so the frame falls off at the corners the way film does. */}
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 100% at 50% 40%, transparent 45%, rgba(23,25,24,0.5) 100%)',
        }}
      />
      <span
        aria-hidden
        className="absolute inset-0 opacity-20 mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />
      {children}
    </div>
  )
}
