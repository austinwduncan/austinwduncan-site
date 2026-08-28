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
  /** A short muted loop for this channel's ground, in place of a cover. */
  video?: string | null
}

function Ground({ covers, video, active }: { covers: string[]; video?: string | null; active?: boolean }) {
  /*
    A channel with its own footage uses it. Word for Word has a thirteen second
    bumper Austin cut for the property, which says what the show is far better
    than a still of one episode's cover can.

    Encoded locally rather than embedded from YouTube: a muted loop under a
    megabyte, no iframe, no third party script, and no player chrome sitting on
    top of the artwork.
  */
  if (video) {
    return (
      <span aria-hidden className="absolute inset-0 overflow-hidden">
        <video
          className="h-full w-full object-cover"
          /*
            Slides right while the panel is open, so the subject clears the fade
            and the wordmark sitting over the left of the frame.

            Done with a transform rather than object-position. Both express the
            same idea, but object-position animates on the main thread and moves
            in visible steps, while a transform is composited and actually
            glides. The video is scaled slightly first so there is material to
            slide into instead of an edge appearing.
          */
          style={{
            transform: active ? 'scale(1.28) translateX(11%)' : 'scale(1.28) translateX(0%)',
            transition: 'transform 720ms cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform',
          }}
          src={video}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          tabIndex={-1}
        />
      </span>
    )
  }

  if (!covers.length) return null
  /*
    Sharp, at Austin's request. One cover per panel rather than a tiled strip,
    because four landscape covers squeezed into a tall panel crops each one to
    its centre, which is exactly where he typesets the title.
  */
  return (
    <span aria-hidden className="absolute inset-0 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={covers[0]}
        alt=""
        loading="eager"
        className="h-full w-full object-cover"
        style={{
          objectPosition: '50% 34%',
          transform: active ? 'scale(1.28) translateX(11%)' : 'scale(1.28) translateX(0%)',
          transition: 'transform 720ms cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform',
        }}
      />
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
              <Ground covers={channel.covers} video={channel.video} active={active} />
              <span
                aria-hidden
                className="absolute inset-0 transition-opacity duration-500"
                style={{
                  background: active
                    ? 'linear-gradient(180deg, rgba(23,25,24,0.18) 0%, rgba(23,25,24,0.55) 46%, rgba(23,25,24,0.97) 82%, rgba(23,25,24,0.99) 100%)'
                    : 'linear-gradient(180deg, rgba(23,25,24,0.26) 0%, rgba(23,25,24,0.6) 44%, rgba(23,25,24,0.95) 80%, rgba(23,25,24,0.98) 100%)',
                  opacity: dimmed ? 1 : 1,
                }}
              />
              {/*
                Black falling off to the right, so the mark, the sentence and
                the count sit on ground rather than on footage. Only while the
                panel is open, since a collapsed panel has nothing under it that
                needs protecting.
              */}
              <span
                aria-hidden
                className="absolute inset-0 transition-opacity duration-500"
                style={{
                  opacity: active ? 1 : 0,
                  background:
                    'linear-gradient(90deg, rgba(23,25,24,0.96) 0%, rgba(23,25,24,0.88) 26%, rgba(23,25,24,0.55) 52%, rgba(23,25,24,0.12) 78%, transparent 100%)',
                }}
              />

              {dimmed && (
                <span aria-hidden className="absolute inset-0" style={{ background: 'rgba(23,25,24,0.32)' }} />
              )}

              {/*
                A ground for the copy itself, rising from the foot of the panel.
                The panel gradient and the left fade both sit behind the whole
                frame; this one is sized to the stack, so the mark, the count,
                the sentence and the button read as one block on solid footing
                rather than four things floating over footage.
              */}
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 transition-all duration-[620ms]"
                style={{
                  height: active ? '78%' : '52%',
                  background:
                    'linear-gradient(180deg, transparent 0%, rgba(23,25,24,0.55) 34%, rgba(23,25,24,0.9) 66%, rgba(23,25,24,0.98) 100%)',
                }}
              />

              <span className="relative flex h-full flex-col justify-end p-8 lg:p-9">
                <Mark channel={channel} />

                <span
                  className="mt-5 block text-[0.66rem] font-semibold uppercase tracking-[0.18em]"
                  style={{ fontFamily: HEADING, color: 'var(--awd-stone)' }}
                >
                  {channel.meta}
                </span>

                {/* Revealed by the open panel. Height animates so the collapsed
                    panels stay quiet and the open one earns the space. */}
                <span
                  className="block overflow-hidden"
                  style={{
                    maxHeight: active ? '18rem' : '0rem',
                    opacity: active ? 1 : 0,
                    transition: 'max-height 620ms cubic-bezier(0.16, 1, 0.3, 1), opacity 400ms ease',
                  }}
                >
                  {channel.blurb && (
                    <span
                      className="mt-7 block max-w-[26rem] border-t pt-6 text-[0.95rem] leading-relaxed"
                      style={{ fontFamily: 'var(--font-source-serif)', color: 'rgba(238,234,225,0.82)', borderColor: 'rgba(238,234,225,0.18)' }}
                    >
                      {channel.blurb}
                    </span>
                  )}
                  <span
                    className="mt-7 inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em]"
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
            <Ground covers={channel.covers} video={channel.video} />
            <span
              aria-hidden
              className="absolute inset-0"
              style={{ background: 'linear-gradient(180deg, rgba(23,25,24,0.32) 0%, rgba(23,25,24,0.96) 100%)' }}
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
