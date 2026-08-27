import type { CSSProperties, ReactNode } from 'react'

/*
  The single definition of how artwork is presented.

  There used to be a grade here: grayscale, a steel tint, a graphite veil and a
  vignette, applied so a shelf of mixed covers would read as one set. Austin
  chose the colours in this artwork deliberately and does not want them
  overpainted, so the treatment is gone. The art shows as made.

  What remains is the frame, the fallback, and a hover lift the caller supplies.

  Nothing is ever laid over the art. Titles are typeset into the covers
  themselves, so a chip or caption on top collides with type already there.
  Everything a card says belongs below the frame.
*/

const HEADING = 'var(--font-cmg), system-ui, sans-serif'

/** Applied to the <img>. The parent must carry `group`. */
export const ARTWORK_IMAGE_CLASS =
  'h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.04]'

type Props = {
  src: string | null
  /** Shown as a title card when there is no artwork. */
  title: string
  /** Defaults to 16/9. Pass '1/1' or similar for a square tile. */
  aspect?: string
  className?: string
  /** Rendered inside the frame. Use sparingly, never a label over the art. */
  children?: ReactNode
  style?: CSSProperties
  eager?: boolean
}

/*
  Thirteen pieces have no artwork. An empty frame reads as a broken image, so
  the fallback sets the title in the frame instead, which is what Austin's real
  covers do anyway.
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
        style={{
          fontFamily: HEADING,
          fontWeight: 700,
          fontSize: 'clamp(0.72rem, 1.5vw, 0.95rem)',
          letterSpacing: '-0.01em',
          lineHeight: 1.15,
          color: 'rgba(238,234,225,0.55)',
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
  eager = false,
}: Props) {
  return (
    <div
      className={`relative overflow-hidden rounded-[3px] ${className}`}
      style={{ aspectRatio: aspect, background: 'var(--awd-graphite)', ...style }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          loading={eager ? 'eager' : 'lazy'}
          className={ARTWORK_IMAGE_CLASS}
        />
      ) : (
        <TitleCard title={title} />
      )}
      {children}
    </div>
  )
}
