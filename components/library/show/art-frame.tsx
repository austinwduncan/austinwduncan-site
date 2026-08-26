/*
  One graded artwork frame, the treatment every piece of art on the site runs
  through.

  Austin's artwork spans an enormous tonal range, from a nearly white Hebrews
  cover to a nearly black Daniel one, and much of it has type baked into the
  image. So two rules hold here: every frame gets the same grade so a page of
  them reads as one set, and nothing is ever overlaid on the art itself. Labels
  live below the frame, where they cannot collide with typography inside the
  picture.

  This mirrors components/browse/channel-card.tsx deliberately. It is a server
  component because the whole effect is CSS hover on an ancestor marked
  `group`, so no client runtime is needed.
*/

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")"

export default function ArtFrame({
  src,
  ratio = '16/9',
  rounded = '3px',
  className = '',
  eager = false,
}: {
  src?: string | null
  ratio?: string
  rounded?: string
  className?: string
  eager?: boolean
}) {
  return (
    <div
      className={`relative overflow-hidden transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_22px_50px_rgba(0,0,0,0.55)] ${className}`}
      style={{ aspectRatio: ratio, borderRadius: rounded, background: 'var(--awd-graphite)' }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          loading={eager ? 'eager' : 'lazy'}
          className="h-full w-full scale-[1.04] object-cover grayscale contrast-[0.88] brightness-[0.86] transition-all duration-[600ms] ease-out group-hover:scale-[1.09] group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100"
        />
      ) : (
        <span aria-hidden className="section-pattern absolute inset-0" />
      )}

      {/* Grade layers, all lifting together on hover. */}
      <span
        aria-hidden
        className="absolute inset-0 transition-opacity duration-[600ms] group-hover:opacity-0"
        style={{ background: 'rgba(44,48,47,0.42)' }}
      />
      <span
        aria-hidden
        className="absolute inset-0 opacity-30 mix-blend-color transition-opacity duration-[600ms] group-hover:opacity-0"
        style={{ background: 'var(--awd-accent-2)' }}
      />
      <span
        aria-hidden
        className="absolute inset-0"
        style={{ background: 'radial-gradient(120% 100% at 50% 40%, transparent 45%, rgba(23,25,24,0.5) 100%)' }}
      />
      <span
        aria-hidden
        className="absolute inset-0 opacity-20 mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />
    </div>
  )
}
