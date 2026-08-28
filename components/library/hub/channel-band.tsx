import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Show } from '@/lib/library/types'

/*
  One channel, presented as a way in rather than as a row of cards.

  The Library home's only job is getting a reader to the right property. It used
  to answer that with shelves, which meant a visitor had to recognise a piece
  before they could recognise a channel. Now each channel takes a full band: its
  own mark at display scale, the sentence that says what it is, what it holds,
  and one way in.

  The band's ground is built from that channel's own artwork, laid in a strip
  behind the copy and taken down far enough to read behind type. Austin chose
  those colours, so a channel is coloured by its own work rather than by an
  accent invented for it. Where a channel has no artwork the band falls back to
  graphite and loses nothing but the texture.
*/

const HEADING = 'var(--font-cmg), system-ui, sans-serif'

export default function ChannelBand({
  show,
  href,
  action,
  meta,
  covers,
}: {
  show: Show
  href: string
  action: string
  meta: string
  /** A few covers from this channel, used as the band's ground. */
  covers: string[]
}) {
  return (
    <Link
      href={href}
      className="group/band relative block overflow-hidden border-t"
      style={{ borderColor: 'rgba(238,234,225,0.12)' }}
    >
      /*
        Ground: the channel's own covers, blurred into colour.

        They cannot be shown sharp. Austin typesets titles into his artwork, so
        a raw strip of covers behind a wordmark is type fighting type: the first
        attempt put THE LAW and SURRECTION straight through IN THE TEXT. Blur
        removes the words and keeps the thing that matters, which is that the
        band is coloured by the channel's own work rather than by an accent
        invented for it.

        Scaled past the edges so the blur has material to sample and does not
        fade out at the seams.
      */
      {covers.length > 0 && (
        <span aria-hidden className="absolute inset-0 flex">
          {covers.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${src}-${i}`}
              src={src}
              alt=""
              loading="lazy"
              className="h-full flex-1 object-cover transition-transform duration-[900ms] ease-out group-hover/band:scale-[1.16]"
              style={{ minWidth: 0, filter: 'blur(26px) saturate(1.15)', transform: 'scale(1.12)' }}
            />
          ))}
        </span>
      )}

      {/* Scrim. Heavier on the left, where the mark and the sentence sit. */}
      <span
        aria-hidden
        className="absolute inset-0 transition-opacity duration-500 group-hover/band:opacity-90"
        style={{
          background:
            /*
              Heavy where the mark and the sentence sit, then opening up fast so
              the channel's own covers actually read on the right. The first
              version held 0.97 to 0.6 across the whole width, which made every
              band a flat dark rectangle and hid the artwork the band exists to
              show.
            */
            'linear-gradient(90deg, rgba(23,25,24,0.94) 0%, rgba(23,25,24,0.88) 34%, rgba(23,25,24,0.66) 66%, rgba(23,25,24,0.52) 100%)',
        }}
      />

      <div className="relative px-6 py-16 lg:px-10 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-8">
          <div className="min-w-0 max-w-[44rem]">
            {show.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={show.logo}
                alt={show.name}
                className="h-auto w-auto object-contain"
                style={{ maxWidth: 'min(100%, 30rem)', maxHeight: 'clamp(3.2rem, 6.4vw, 6.2rem)' }}
              />
            ) : (
              <h2
                className="uppercase"
                style={{
                  fontFamily: HEADING,
                  fontWeight: 700,
                  fontSize: 'clamp(2rem, 4.6vw, 3.6rem)',
                  letterSpacing: '-0.02em',
                  lineHeight: 0.95,
                  color: 'var(--awd-bone)',
                }}
              >
                {show.name}
              </h2>
            )}

            {show.blurb && (
              <p
                className="mt-7 max-w-[42rem] text-[1.05rem] leading-relaxed lg:text-[1.1rem]"
                style={{ fontFamily: 'var(--font-cmg), system-ui, sans-serif', color: 'rgba(238,234,225,0.8)' }}
              >
                {show.blurb}
              </p>
            )}

            <p
              className="mt-6 text-[0.72rem] font-semibold uppercase tracking-[0.18em]"
              style={{ fontFamily: HEADING, color: 'var(--awd-stone)' }}
            >
              {meta}
            </p>
          </div>

          <span
            className="inline-flex shrink-0 items-center gap-2 rounded-full px-6 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] transition-transform duration-200 group-hover/band:translate-x-1"
            style={{ fontFamily: HEADING, background: 'var(--awd-gold)', color: '#171918' }}
          >
            {action}
            <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  )
}
