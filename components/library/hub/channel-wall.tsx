'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/*
  All five channels on one screen.

  Stacked full width bands took roughly nineteen hundred pixels to present five
  choices, so a reader had to scroll past four properties to learn the fifth
  existed. This puts them side by side at full height: every channel is visible
  at once, and the one under the cursor opens to give its sentence, its count
  and its way in.

  The ground is each channel's own artwork, blurred. It cannot be shown sharp,
  because Austin typesets titles into his covers and a raw strip of them behind
  a wordmark is type fighting type. Blurring keeps his colours, which is the
  point, and drops the words, which is the problem.

  Hover is an enhancement, never the only way through. Every panel is a link,
  keyboard focus opens a panel exactly as the pointer does, and on narrow
  screens the whole thing becomes a stack of short bands with everything
  already visible, since there is no hover on a phone.
*/

const HEADING = 'var(--font-cmg), system-ui, sans-serif'

export type WallChannel = {
  id: number
  name: string
  slug: string
  logo: string | null
  blurb: string | null
  meta: string
  href: string
  covers: string[]
}

function Ground({ covers }: { covers: string[] }) {
  if (!covers.length) return null
  return (
    <span aria-hidden className="absolute inset-0 flex overflow-hidden">
      {covers.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${src}-${i}`}
          src={src}
          alt=""
          loading="eager"
          className="h-full flex-1 object-cover"
          /*
            Pushed hard on purpose. The covers average roughly a third
            brightness, blurring averages them darker still, and any scrim on
            top took three of the five panels to flat black. Lifting brightness
            and saturation before the scrim is what lets Austin's colour survive
            the whole stack.
          */
          style={{
            minWidth: 0,
            filter: 'blur(26px) saturate(1.9) brightness(1.95)',
            transform: 'scale(1.25)',
          }}
        />
      ))}
    </span>
  )
}

function Mark({ channel, small }: { channel: WallChannel; small?: boolean }) {
  if (channel.logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={channel.logo}
        alt={channel.name}
        className="h-auto w-auto object-contain"
        style={{
          maxWidth: small ? 'min(100%, 13rem)' : 'min(100%, 22rem)',
          maxHeight: small ? '2.6rem' : '4.6rem',
        }}
      />
    )
  }
  return (
    <span
      className="block uppercase"
      style={{
        fontFamily: HEADING,
        fontWeight: 700,
        fontSize: small ? '1.15rem' : 'clamp(1.5rem, 2.4vw, 2.4rem)',
        letterSpacing: '-0.02em',
        lineHeight: 0.98,
        color: 'var(--awd-bone)',
      }}
    >
      {channel.name}
    </span>
  )
}

export default function ChannelWall({ channels }: { channels: WallChannel[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <>
      {/* Desktop: one screen, five panels, the active one opens. */}
      <div
        className="hidden lg:flex"
        /*
          Sized to what is left of the viewport under the nav and the intro
          line, so all five channels clear the fold on a laptop. Clamped so it
          never collapses on a short window or stretches absurdly on a tall one.
        */
        style={{ height: 'clamp(18rem, calc(100vh - 29rem), 34rem)' }}
        onMouseLeave={() => setOpen(null)}
      >
        {channels.map(channel => {
          const active = open === channel.id
          const dimmed = open !== null && !active
          return (
            <Link
              key={channel.id}
              href={channel.href}
              onMouseEnter={() => setOpen(channel.id)}
              onFocus={() => setOpen(channel.id)}
              className="group/panel relative block min-w-0 overflow-hidden border-l outline-none first:border-l-0"
              style={{
                flexGrow: active ? 2.35 : 1,
                flexBasis: 0,
                borderColor: 'rgba(238,234,225,0.14)',
                transition: 'flex-grow 620ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <Ground covers={channel.covers} />
              <span
                aria-hidden
                className="absolute inset-0 transition-opacity duration-500"
                style={{
                  background: active
                    ? 'linear-gradient(180deg, rgba(23,25,24,0.12) 0%, rgba(23,25,24,0.5) 50%, rgba(23,25,24,0.93) 100%)'
                    : 'linear-gradient(180deg, rgba(23,25,24,0.2) 0%, rgba(23,25,24,0.55) 45%, rgba(23,25,24,0.88) 100%)',
                  opacity: dimmed ? 1 : 1,
                }}
              />
              {dimmed && (
                <span aria-hidden className="absolute inset-0" style={{ background: 'rgba(23,25,24,0.32)' }} />
              )}

              <span className="relative flex h-full flex-col justify-end p-7">
                <Mark channel={channel} />

                <span
                  className="mt-4 block text-[0.66rem] font-semibold uppercase tracking-[0.18em]"
                  style={{ fontFamily: HEADING, color: 'var(--awd-stone)' }}
                >
                  {channel.meta}
                </span>

                {/* Revealed by the open panel. Height animates so the collapsed
                    panels stay quiet and the open one earns the space. */}
                <span
                  className="block overflow-hidden"
                  style={{
                    maxHeight: active ? '14rem' : '0rem',
                    opacity: active ? 1 : 0,
                    transition: 'max-height 620ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms ease',
                  }}
                >
                  {channel.blurb && (
                    <span
                      className="mt-5 block max-w-[26rem] text-[0.95rem] leading-relaxed"
                      style={{ fontFamily: 'var(--font-source-serif)', color: 'rgba(238,234,225,0.82)' }}
                    >
                      {channel.blurb}
                    </span>
                  )}
                  <span
                    className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[0.66rem] font-semibold uppercase tracking-[0.18em]"
                    style={{ fontFamily: HEADING, background: 'var(--awd-gold)', color: '#171918' }}
                  >
                    Open
                    <ArrowRight size={12} />
                  </span>
                </span>
              </span>
            </Link>
          )
        })}
      </div>

      {/* Narrow screens: a stack, everything already open, no hover needed. */}
      <div className="lg:hidden">
        {channels.map(channel => (
          <Link
            key={channel.id}
            href={channel.href}
            className="relative block overflow-hidden border-t"
            style={{ borderColor: 'rgba(238,234,225,0.14)' }}
          >
            <Ground covers={channel.covers} />
            <span
              aria-hidden
              className="absolute inset-0"
              style={{ background: 'linear-gradient(180deg, rgba(23,25,24,0.28) 0%, rgba(23,25,24,0.9) 100%)' }}
            />
            <span className="relative block px-6 py-10">
              <Mark channel={channel} small />
              {channel.blurb && (
                <span
                  className="mt-4 block text-[0.95rem] leading-relaxed"
                  style={{ fontFamily: 'var(--font-source-serif)', color: 'rgba(238,234,225,0.8)' }}
                >
                  {channel.blurb}
                </span>
              )}
              <span
                className="mt-4 block text-[0.64rem] font-semibold uppercase tracking-[0.18em]"
                style={{ fontFamily: HEADING, color: 'var(--awd-stone)' }}
              >
                {channel.meta}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </>
  )
}
