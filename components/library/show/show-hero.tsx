import Link from 'next/link'
import type { Show } from '@/lib/library/types'
import ArtFrame from './art-frame'
import { HEADING, BODY, formatDate } from './meta'

/*
  The show billboard.

  Streaming apps open a show with one large frame of its own art. Austin has
  cover art for some collections and not others, so the fallback composes a
  backdrop out of the artwork of the pieces themselves: a graded, low opacity
  band of covers behind the type. It reads as the show rather than as a missing
  image, and it costs nothing when the art is there anyway.

  Nothing is set on top of the art. The heading sits in its own column and the
  backdrop is pushed under a scrim, because Austin's covers frequently carry
  their own typography.
*/

export default function ShowHero({ show }: { show: Show }) {
  const backdrop = [
    ...show.seasons.flatMap(s => s.episodes),
    ...show.loose,
  ]
    .map(p => p.artwork)
    .filter((a): a is string => Boolean(a))
    .slice(0, 8)

  const latest = [...show.seasons.flatMap(s => s.episodes), ...show.loose]
    .map(p => p.publishedAt)
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1)

  const stats = [
    `${show.count} ${show.count === 1 ? 'piece' : 'pieces'}`,
    show.seasons.length ? `${show.seasons.length} seasons` : null,
    latest ? `Latest ${formatDate(latest)}` : null,
  ].filter(Boolean)

  return (
    <section className="relative overflow-hidden" style={{ background: 'var(--awd-black)' }}>
      {/* Composed backdrop. Graded hard, then buried under a scrim. */}
      {backdrop.length > 0 && (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="flex h-full w-full">
            {backdrop.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${src}-${i}`}
                src={src}
                alt=""
                className="h-full w-0 flex-1 object-cover grayscale contrast-[0.6] brightness-[0.45]"
              />
            ))}
          </div>
          <span
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(23,25,24,0.99) 46%, rgba(23,25,24,0.9) 72%, rgba(23,25,24,0.96) 100%)',
            }}
          />
          <span
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(23,25,24,0.9) 0%, rgba(23,25,24,0.55) 45%, rgba(23,25,24,1) 100%)',
            }}
          />
        </div>
      )}

      <div className="relative mx-auto max-w-[1180px] px-6 py-24 lg:px-8 lg:py-32">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-[42rem]">
            <div
              className="mb-5 flex items-center gap-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em]"
              style={{ fontFamily: HEADING, color: 'var(--awd-gold)' }}
            >
              <Link
                href="/library"
                className="transition-colors hover:text-[var(--awd-bone)]"
                style={{ color: 'rgba(238,234,225,0.45)' }}
              >
                The Library
              </Link>
              <span style={{ color: 'rgba(238,234,225,0.22)' }}>/</span>
              <span className="inline-block h-px w-[18px]" style={{ background: 'var(--awd-gold)' }} />
              Show
            </div>

            <h1
              style={{
                fontFamily: HEADING,
                fontSize: 'clamp(2.6rem, 6vw, 4.6rem)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                lineHeight: 0.95,
                color: 'var(--awd-bone)',
              }}
            >
              {show.name}
            </h1>

            {show.tagline && (
              <p
                className="mt-6 text-[1.15rem] leading-relaxed"
                style={{ fontFamily: BODY, color: 'rgba(238,234,225,0.82)' }}
              >
                {show.tagline}
              </p>
            )}

            {show.description && show.description !== show.tagline && (
              <p
                className="mt-4 text-[1rem] leading-relaxed"
                style={{ fontFamily: BODY, color: 'rgba(238,234,225,0.6)' }}
              >
                {show.description}
              </p>
            )}

            <div
              className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em]"
              style={{ fontFamily: HEADING, color: 'var(--awd-accent-2)' }}
            >
              {stats.map((s, i) => (
                <span key={s} className="flex items-center gap-3">
                  {i > 0 && (
                    <span aria-hidden style={{ color: 'rgba(238,234,225,0.22)' }}>
                      /
                    </span>
                  )}
                  {s}
                </span>
              ))}
            </div>
          </div>

          {show.artwork && (
            <div className="group w-full shrink-0 lg:w-[24rem]">
              <ArtFrame src={show.artwork} ratio="16/9" eager />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
