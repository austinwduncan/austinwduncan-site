import type { Show } from '@/lib/library/types'

/*
  The one thing every channel page shares.

  Each property below this line is laid out differently, because each is a
  different kind of work. What they have in common is that they announce
  themselves with their own mark and one sentence, exactly as they do on the
  Library wall, so arriving here feels like walking through the door you picked
  rather than landing somewhere unrelated.
*/

const HEADING = 'var(--font-cmg), system-ui, sans-serif'

export default function Masthead({
  show,
  meta,
  children,
}: {
  show: Show
  /** A short line of scale, phrased in the channel's own terms. */
  meta: string
  /** Controls belonging to this channel, for example a study or subject picker. */
  children?: React.ReactNode
}) {
  return (
    <header className="border-b" style={{ borderColor: 'rgba(238,234,225,0.12)' }}>
      <div className="mx-auto max-w-[1180px] px-6 pb-14 pt-[7.5rem] lg:px-8 lg:pb-16 lg:pt-[8rem]">
        {show.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={show.logo}
            alt={show.name}
            className="h-auto w-auto object-contain"
            style={{ maxWidth: 'min(100%, 26rem)', maxHeight: 'clamp(2.8rem, 5.4vw, 5rem)' }}
          />
        ) : (
          <h1
            className="uppercase"
            style={{
              fontFamily: HEADING,
              fontWeight: 700,
              fontSize: 'clamp(2rem, 4.6vw, 3.4rem)',
              letterSpacing: '-0.025em',
              lineHeight: 0.95,
              color: 'var(--awd-bone)',
            }}
          >
            {show.name}
          </h1>
        )}

        {show.blurb && (
          <p
            className="mt-7 max-w-[44rem] text-[1rem] leading-relaxed lg:text-[1.06rem]"
            style={{ fontFamily: HEADING, fontWeight: 400, color: 'rgba(238,234,225,0.72)' }}
          >
            {show.blurb}
          </p>
        )}

        <p
          className="mt-6 text-[0.7rem] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: HEADING, color: 'var(--awd-stone)' }}
        >
          {meta}
        </p>

        {children && <div className="mt-9">{children}</div>}
      </div>
    </header>
  )
}
