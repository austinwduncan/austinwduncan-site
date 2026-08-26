'use client'

import { useEffect, useRef } from 'react'

/*
  Section-scoped background video with a film treatment.

  Notes on the choices here:

  - The blur is baked into the file by ffmpeg rather than applied in CSS. A
    large CSS blur on a full-width video element is brutal on the GPU (it
    locked the renderer while testing). Pre-blurred footage also compresses
    hard, so the loop is ~175KB against an 8MB source.

  - The film look is cheap static layers over the video: a grain plate built
    from inline SVG turbulence (no network request), a vignette, a highlight
    roll-off, and a centre scrim. Nothing animates per frame.

  - The centre scrim is what separates foreground from background. With the
    blur light enough to read the footage, a flat wash over the whole section
    would either kill the picture or leave the type floating. Instead a wide,
    shallow ellipse sits under the words: it goes nearly solid directly behind
    the type and feathers out fast, so the head above and the frame either side
    still read as picture.

  - `focusY` shifts the crop. The box is wider than the footage, so the video
    covers by width and crops vertically; a low value keeps heads in frame.

  - `fadeTo` paints a gradient on the bottom edge so the section dissolves into
    whatever colour follows it instead of ending on a hard line.

  - prefers-reduced-motion pauses playback and leaves the poster frame, since a
    perpetual loop is exactly what that setting asks us to avoid.
*/

// Inline SVG grain, kept as a data URI so it costs no request.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")"

type Props = {
  src: string
  poster?: string
  /** Vertical crop focus, 0% = top of frame. Lower keeps heads in shot. */
  focusY?: string
  /** Colour the bottom edge dissolves into, usually the next section's ground. */
  fadeTo?: string
  /** Strength of the centre scrim behind the type, 0 to 1. */
  scrim?: number
  className?: string
}

export default function VideoBackground({
  src,
  poster,
  focusY = '18%',
  fadeTo,
  scrim = 0.72,
  className = '',
}: Props) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => {
      if (query.matches) el.pause()
      else void el.play().catch(() => {})
    }
    apply()
    query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [])

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full scale-105 object-cover grayscale contrast-125 brightness-90"
        style={{ objectPosition: `50% ${focusY}` }}
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
      />

      {/* Centre scrim: local darkness under the type, edges left open. */}
      <span
        className="absolute inset-0"
        style={{
          background: `radial-gradient(74% 48% at 50% 52%, rgba(23,25,24,${scrim}) 0%, rgba(23,25,24,${scrim * 0.85}) 38%, rgba(23,25,24,${scrim * 0.4}) 66%, transparent 88%)`,
        }}
      />
      {/* Grain plate. Reads more with the lighter blur, so it sits a touch up. */}
      <span
        className="absolute inset-0 opacity-[0.28] mix-blend-overlay"
        style={{ backgroundImage: GRAIN, backgroundRepeat: 'repeat' }}
      />
      {/* Vignette, so the frame falls off at the corners the way film does. */}
      <span
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 95% at 50% 42%, transparent 45%, rgba(23,25,24,0.42) 80%, rgba(23,25,24,0.78) 100%)',
        }}
      />
      {/* Highlight roll-off: lifts the top the way print does. */}
      <span
        className="absolute inset-0 opacity-50"
        style={{ background: 'linear-gradient(180deg, rgba(238,234,225,0.06) 0%, transparent 45%)' }}
      />
      {/* Dissolve into the next section. */}
      {fadeTo && (
        <span
          className="absolute inset-x-0 bottom-0 h-1/3"
          style={{ background: `linear-gradient(180deg, transparent 0%, ${fadeTo} 92%)` }}
        />
      )}
    </div>
  )
}
