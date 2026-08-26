import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import type { Season } from '@/lib/library/types'
import { HEADING } from './meta'

/*
  Season selection, with no client state at all.

  The selected season lives in the URL as ?season=<slug>, so every season is a
  linkable, shareable, crawlable page and the server can render the right list
  on the first pass. Nothing here hydrates.

  Few seasons render as a row. Many render as a disclosure, which is a real
  dropdown built from <details> and <summary>, so the open and close behaviour
  is the browser's and works without JavaScript.

  Season names are shown as Austin writes them. They are never uppercased and
  never numbered: "Daniel" and "Minor Prophets", not "Season 3".
*/

const MANY = 6

function hrefFor(showSlug: string, seasonSlug: string) {
  return `/library/${showSlug}?season=${encodeURIComponent(seasonSlug)}`
}

function Pill({
  href, name, count, active,
}: { href: string; name: string; count: number; active: boolean }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? 'true' : undefined}
      className="shrink-0 rounded-full border px-4 py-2 text-[0.82rem] transition-colors duration-200"
      style={{
        fontFamily: HEADING,
        fontWeight: 600,
        letterSpacing: '-0.01em',
        borderColor: active ? 'var(--awd-gold)' : 'rgba(238,234,225,0.16)',
        background: active ? 'rgba(205,176,121,0.12)' : 'transparent',
        color: active ? 'var(--awd-gold)' : 'rgba(238,234,225,0.72)',
      }}
    >
      {name}
      <span className="ml-2 text-[0.72rem]" style={{ color: 'rgba(238,234,225,0.38)' }}>
        {count}
      </span>
    </Link>
  )
}

export default function SeasonNav({
  showSlug,
  seasons,
  activeSlug,
}: {
  showSlug: string
  seasons: Season[]
  activeSlug: string
}) {
  if (seasons.length < 2) return null
  const active = seasons.find(s => s.slug === activeSlug) ?? seasons[0]

  return (
    <div className="mb-12">
      <p
        className="mb-4 text-[0.62rem] font-semibold uppercase tracking-[0.2em]"
        style={{ fontFamily: HEADING, color: 'rgba(238,234,225,0.45)' }}
      >
        Seasons
      </p>

      {seasons.length > MANY ? (
        <details className="group/menu relative w-full max-w-[26rem]">
          <summary
            className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-[3px] border px-5 py-3.5 text-[0.95rem] [&::-webkit-details-marker]:hidden"
            style={{
              fontFamily: HEADING,
              fontWeight: 600,
              letterSpacing: '-0.01em',
              borderColor: 'rgba(238,234,225,0.18)',
              background: 'rgba(44,48,47,0.55)',
              color: 'var(--awd-bone)',
            }}
          >
            <span className="min-w-0 truncate">{active.name}</span>
            <span className="flex shrink-0 items-center gap-3">
              <span className="text-[0.72rem]" style={{ color: 'rgba(238,234,225,0.4)' }}>
                {active.episodes.length}
              </span>
              <ChevronDown
                size={16}
                className="transition-transform duration-200 group-open/menu:rotate-180"
                style={{ color: 'var(--awd-gold)' }}
              />
            </span>
          </summary>

          <div
            className="absolute left-0 right-0 top-full z-30 mt-2 max-h-[22rem] overflow-y-auto rounded-[3px] border py-1 backdrop-blur-md"
            style={{
              borderColor: 'rgba(238,234,225,0.14)',
              background: 'rgba(23,25,24,0.96)',
              boxShadow: '0 26px 60px rgba(0,0,0,0.6)',
            }}
          >
            {seasons.map(s => {
              const isActive = s.slug === active.slug
              return (
                <Link
                  key={s.slug}
                  href={hrefFor(showSlug, s.slug)}
                  scroll={false}
                  aria-current={isActive ? 'true' : undefined}
                  className="flex items-center justify-between gap-4 px-5 py-3 text-[0.9rem] transition-colors hover:bg-[rgba(238,234,225,0.06)]"
                  style={{
                    fontFamily: HEADING,
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                    color: isActive ? 'var(--awd-gold)' : 'rgba(238,234,225,0.78)',
                  }}
                >
                  <span className="min-w-0 truncate">{s.name}</span>
                  <span className="shrink-0 text-[0.72rem]" style={{ color: 'rgba(238,234,225,0.38)' }}>
                    {s.episodes.length}
                  </span>
                </Link>
              )
            })}
          </div>
        </details>
      ) : (
        <div className="shelf-scroller -mx-6 flex gap-2.5 overflow-x-auto px-6 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
          {seasons.map(s => (
            <Pill
              key={s.slug}
              href={hrefFor(showSlug, s.slug)}
              name={s.name}
              count={s.episodes.length}
              active={s.slug === active.slug}
            />
          ))}
        </div>
      )}
    </div>
  )
}
