import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ScrollReveal from '@/components/scroll-reveal'
import Row from '@/components/watch/Row'
import SermonCard from '@/components/watch/SermonCard'
import SeriesCard from '@/components/watch/SeriesCard'
import Billboard from '@/components/catalog/Billboard'
import CategoryCards from '@/components/catalog/CategoryCards'
import ScriptureCoverage from '@/components/catalog/ScriptureCoverage'
import TopicChips from '@/components/catalog/TopicChips'
import { toCardPiece, display, kicker } from '@/components/catalog/card'
import { getPublishedSermons, type Sermon } from '@/lib/sermons'
import { getPublishedSeries } from '@/lib/series'
import { activeSeries, coverageFrom, sermonsInSeries, topicsFrom } from '@/lib/browse'
import { CATEGORY_KEYS, pathFor, type Category } from '@/lib/categories'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Austin W. Duncan',
  description:
    'Sermons, biblical teaching, scholarly articles, and cultural commentary from Austin W. Duncan.',
}

/*
  Homepage: the animated full-bleed hero, then the library.

  TYPE RULE, not negotiable: every heading on this page is CMG Sans
  (Montserrat, via --font-cmg). No serif headings. Use the Heading component
  below in the hero rather than hand-rolling a heading so this cannot drift.

  Everything below the hero is the library body: the latest piece, the five
  category doors, what was added recently, the series, the topics and the
  Scripture coverage. All of it reads from lib/sermons, lib/series and
  lib/browse; nothing here touches MDX.

  House copy rule, same as Crosswalk: no em dashes or en dashes anywhere.
*/

const BLACK = '#171918'
const GOLD = '#CDB079'
const BONE = '#EEEAE1'

/* The one place the heading typeface is named. */
const HEADING = 'var(--font-cmg), system-ui, sans-serif'

function fmt(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  })
}

function clean(text?: string): string {
  if (!text) return ''
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\\([_*[\]])/g, '$1')
    .trim()
}

/*
  Every heading goes through here. CMG Sans, uppercase, tight. `accent` marks
  the clause that carries the gold, so the emphasis is colour rather than a
  change of typeface.
*/
function Heading({
  as: Tag = 'h2',
  children,
  accent,
  size = 'md',
  color = BONE,
  className = '',
}: {
  as?: 'h1' | 'h2' | 'h3'
  children: React.ReactNode
  accent?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  className?: string
}) {
  const sizes = {
    sm: 'clamp(1.15rem, 1.7vw, 1.5rem)',
    md: 'clamp(1.9rem, 3.4vw, 3rem)',
    lg: 'clamp(2.2rem, 4.2vw, 3.6rem)',
    xl: 'clamp(2.1rem, 4.4vw, 3.9rem)',
  }
  return (
    <Tag
      className={`uppercase text-balance ${className}`}
      style={{
        fontFamily: HEADING,
        fontSize: sizes[size],
        fontWeight: 700,
        lineHeight: size === 'sm' ? 1.15 : 0.95,
        letterSpacing: '-0.02em',
        color,
      }}
    >
      {children}
      {accent && (
        <>
          {' '}
          <span style={{ color: GOLD }}>{accent}</span>
        </>
      )}
    </Tag>
  )
}

function CornerBracket({
  position,
  tone = 'gold',
}: {
  position: 'tl' | 'tr' | 'bl' | 'br'
  tone?: 'gold' | 'bone' | 'accent'
}) {
  const edges: Record<string, string> = {
    tl: 'left-4 top-4 border-l border-t sm:left-6 sm:top-6',
    tr: 'right-4 top-4 border-r border-t sm:right-6 sm:top-6',
    bl: 'left-4 bottom-4 border-l border-b sm:left-6 sm:bottom-6',
    br: 'right-4 bottom-4 border-r border-b sm:right-6 sm:bottom-6',
  }
  const colors = {
    gold: 'rgba(205,176,121,0.5)',
    bone: 'rgba(238,234,225,0.28)',
    accent: 'var(--awd-accent-2)',
  }
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute z-20 h-8 w-8 sm:h-12 sm:w-12 ${edges[position]}`}
      style={{ borderColor: colors[tone] }}
    />
  )
}

function GlassPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] backdrop-blur"
      style={{
        fontFamily: HEADING,
        borderColor: 'rgba(238,234,225,0.18)',
        background: 'rgba(23,25,24,0.45)',
        color: 'rgba(238,234,225,0.82)',
      }}
    >
      {children}
    </span>
  )
}


async function loadLibrary(): Promise<{ pieces: Sermon[]; series: Awaited<ReturnType<typeof getPublishedSeries>> }> {
  try {
    const [pieces, series] = await Promise.all([getPublishedSermons(), getPublishedSeries()])
    return { pieces, series }
  } catch (err) {
    console.warn('[home] database read failed, rendering an empty library', err)
    return { pieces: [], series: [] }
  }
}

export default async function HomePage() {
  const { pieces, series } = await loadLibrary()

  const sermons = pieces.filter(p => p.category === 'sermon')
  const featured = sermons[0] ?? null
  const sermonCount = sermons.length

  // The billboard shows the newest piece in the library that is not already
  // the hero, so the two never repeat each other.
  const latest = pieces.find(p => p.slug !== featured?.slug) ?? null
  const recent = pieces.filter(p => p.slug !== featured?.slug && p.slug !== latest?.slug).slice(0, 12)

  const counts = Object.fromEntries(CATEGORY_KEYS.map(k => [k, 0])) as Record<Category, number>
  for (const p of pieces) counts[p.category] = (counts[p.category] ?? 0) + 1

  const rowSeries = activeSeries(series, pieces).slice(0, 16)
  const topics = topicsFrom(pieces).slice(0, 18)
  const coverage = coverageFrom(pieces)

  return (
    <>
      {/*
        ── Featured sermon hero ────────────────────────────────────────────────
        Now a true full-bleed, the way the Crosswalk Messages header works: a
        real photograph (no baked-in type, unlike the sermon artwork) pushed
        right, a hard left-to-black gradient seating the words on solid ground
        on desktop, and a bottom-up gradient doing the same job on mobile.
      */}
      {featured && (
        // -mt-[60px] slides the hero up under the sticky header so the photo
        // runs to the very top while the header is transparent. The pt below
        // already clears the 60px bar.
        <section className="relative -mt-[60px] overflow-hidden" style={{ background: BLACK }}>
          <div className="relative flex min-h-[78svh] items-end pt-32 lg:min-h-[86svh] lg:pt-36">
            <div className="absolute inset-0 overflow-hidden lg:left-[26%]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/home/austin-preaching.jpg"
                alt="Austin preaching at Crosswalk Church"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: '46% 16%' }}
              />
              {/* A wash of the secondary accent so the room sits in the palette. */}
              <span
                aria-hidden
                className="absolute inset-0 opacity-[0.14] mix-blend-soft-light"
                style={{ background: 'var(--awd-accent-2)' }}
              />
              <span
                aria-hidden
                className="absolute inset-0"
                style={{ background: 'radial-gradient(130% 105% at 62% 38%, transparent 42%, rgba(23,25,24,0.55) 100%)' }}
              />
            </div>

            {/* desktop: hard left-to-black behind the words */}
            <span aria-hidden className="absolute inset-0 hidden lg:block"
              style={{ background: 'linear-gradient(90deg,#171918 0%,#171918 22%,rgba(23,25,24,.8) 40%,rgba(23,25,24,.22) 64%,transparent 84%)' }} />
            <span aria-hidden className="absolute inset-0 hidden lg:block"
              style={{ background: 'linear-gradient(0deg,#171918 0%,transparent 38%)' }} />
            {/* mobile: bottom-up */}
            <span aria-hidden className="absolute inset-0 lg:hidden"
              style={{ background: 'linear-gradient(0deg,#171918 0%,#171918 22%,rgba(23,25,24,.74) 52%,rgba(23,25,24,.18) 82%,transparent 100%)' }} />

            <CornerBracket position="tl" tone="bone" />
            <CornerBracket position="bl" tone="bone" />

            <div className="relative mx-auto w-full max-w-[1180px] px-6 pb-16 lg:px-10 lg:pb-24">
              <div className="max-w-2xl">
                <ScrollReveal>
                  <span
                    className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] backdrop-blur"
                    style={{
                      fontFamily: HEADING,
                      borderColor: 'color-mix(in srgb, var(--awd-accent-2) 50%, transparent)',
                      background: 'color-mix(in srgb, var(--awd-accent-2) 16%, transparent)',
                      color: 'var(--awd-accent-2)',
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--awd-accent-2)' }} />
                    Newest sermon
                  </span>
                </ScrollReveal>

                <ScrollReveal delay={110}>
                  <Heading as="h1" size="xl" className="mt-5">
                    {featured.title}
                  </Heading>
                </ScrollReveal>

                {featured.summary && (
                  <ScrollReveal delay={160}>
                    <p className="mt-6 line-clamp-3 max-w-lg text-[1.02rem] leading-relaxed"
                      style={{ fontFamily: 'var(--font-cmg), system-ui, sans-serif', color: 'rgba(238,234,225,0.78)' }}>
                      {clean(featured.summary)}
                    </p>
                  </ScrollReveal>
                )}

                <ScrollReveal delay={210}>
                  <div className="mt-7 flex flex-wrap items-center gap-2">
                    {featured.passage && <GlassPill>{featured.passage}</GlassPill>}
                    {featured.date && <GlassPill>{fmt(featured.date)}</GlassPill>}
                    <GlassPill>Full text, free</GlassPill>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={260}>
                  <div className="mt-9 flex flex-wrap gap-3">
                    <Link
                      href={pathFor(featured)}
                      className="group/cta inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[0.75rem] font-semibold uppercase tracking-[0.14em] transition-transform duration-200 hover:scale-[1.03]"
                      style={{ fontFamily: HEADING, background: GOLD, color: BLACK }}
                    >
                      Read it now
                      <ArrowRight size={14} className="transition-transform duration-200 group-hover/cta:translate-x-0.5" />
                    </Link>
                    <Link
                      href="/sermons"
                      className="inline-flex items-center gap-2 rounded-full border px-7 py-3.5 text-[0.75rem] font-semibold uppercase tracking-[0.14em] backdrop-blur transition-colors hover:bg-white/10"
                      style={{
                        fontFamily: HEADING,
                        borderColor: 'rgba(238,234,225,0.28)',
                        background: 'rgba(23,25,24,0.3)',
                        color: BONE,
                      }}
                    >
                      {sermonCount} more sermons
                    </Link>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>
      )}


      {/* ── The library ──────────────────────────────────────────────────── */}
      <div className="bg-[#0a0e10]">
        {latest && <Billboard piece={latest} />}

        <div className="pb-16 pt-12">
          <CategoryCards counts={counts} />

          {recent.length > 0 && (
            <div className="mt-14">
              <Row title="Recently added">
                {recent.map(p => (
                  <SermonCard key={p.slug} sermon={toCardPiece(p)} className="w-64 shrink-0 snap-start sm:w-72" />
                ))}
              </Row>
            </div>
          )}

          {rowSeries.length > 0 && (
            <div className="mt-14">
              <Row title="Series" href="/library/series" seeAll="See all series">
                {rowSeries.map((se, i) => {
                  const inSeries = sermonsInSeries(pieces, se)
                  return (
                    <SeriesCard
                      key={se.id}
                      series={se}
                      count={inSeries.length}
                      href={inSeries.length === 1 ? pathFor(inSeries[0]) : undefined}
                      badge={i === 0 ? 'Latest' : undefined}
                      className="w-64 shrink-0 snap-start sm:w-72"
                    />
                  )
                })}
              </Row>
            </div>
          )}

          <section className="mt-14 px-6 lg:px-10">
            <p className={kicker}>By topic</p>
            <h2 className={`${display} mt-2 text-2xl uppercase tracking-wide text-white sm:text-3xl`}>Find what you need</h2>
            <form action="/library/search" method="get" className="mt-6 flex max-w-2xl items-center gap-2 rounded-2xl bg-white px-4 py-2 text-ink">
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-current text-ink/50" strokeWidth="1.8" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" /></svg>
              <input
                name="q"
                placeholder="Search a topic, Scripture, series, or title"
                aria-label="Search the library"
                className="min-w-0 flex-1 bg-transparent py-2 text-[1rem] outline-none placeholder:text-ink/45"
              />
              <button type="submit" className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white">Search</button>
            </form>
            <TopicChips topics={topics} className="mt-5" />
          </section>

          <ScriptureCoverage coverage={coverage} className="mt-14" />
        </div>
      </div>
    </>
  )
}
