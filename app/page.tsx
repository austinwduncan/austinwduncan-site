import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getPublishedSermons, type Sermon } from '@/lib/sermons'
import { getPublishedSeries, type Series } from '@/lib/series'
import { pathFor } from '@/lib/categories'
import ScrollReveal from '@/components/scroll-reveal'
import VideoBackground from '@/components/video-background'
import FramedImage from '@/components/sermons/FramedImage'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Austin W. Duncan',
  description:
    'Sermons, biblical teaching, scholarly articles, and cultural commentary from Austin W. Duncan.',
}

/*
  Homepage.

  TYPE RULE: every heading on this page is Bebas Neue (--font-bebas), caps
  only, single weight 400, the same display face as the Crosswalk site. Body
  copy, eyebrows, pills and buttons are CMG Sans (Montserrat, --font-cmg).
  Use the Heading component below rather than hand-rolling a heading so this
  cannot drift.

  PALETTE, the Crosswalk palette:
    ink           #1C2427   hero, the list, breather
    primary       #3D484C   photo band grounds
    primary deep  #262D31   Word for Word index, card fallbacks
    soft blue     #7B9BB5   heading accents, the primary CTA
    soft blue lt  #9DB4C8   small accent text and rules on dark
    accent        #4F6B84   small accent text and rules on white
    white         #FFFFFF   mission band, recent sermons

  CONTRAST. On ink: soft blue 5.4, soft blue light 7.4, white 15.9. On
  primary deep: soft blue 4.8, soft blue light 6.5. On white: soft blue is
  2.9 and never text there; small accent text is #4F6B84 (5.6) and body is
  ink. Soft blue light on primary #3D484C is 4.4, so no small text sits
  directly on primary.

  House copy rule, same as Crosswalk: no em dashes or en dashes anywhere.
*/

const BLACK = '#1C2427'
const GRAPHITE = '#3D484C'
const DEEP = '#262D31'
const GOLD = '#7B9BB5'
const SOFT = '#9DB4C8'
const ACCENT = '#4F6B84'
const BONE = '#FFFFFF'

/* The one place each typeface is named. */
const DISPLAY = 'var(--font-bebas), var(--font-cmg), sans-serif'
const SANS = 'var(--font-cmg), system-ui, sans-serif'

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

type Piece = {
  section: string
  title: string
  href: string
  date: string
  raw: string
  image?: string
  excerpt?: string
  frame?: { fx?: number; fy?: number; tx?: number; ty?: number; zoom?: number }
}

/*
  Every heading goes through here. Bebas Neue, uppercase, weight 400, open
  tracking. Bebas is far narrower than Montserrat, so the sizes run large.
  `accent` marks the clause that carries the soft blue; on white pass
  `accentColor` so the clause stays readable.
*/
function Heading({
  as: Tag = 'h2',
  children,
  accent,
  size = 'md',
  color = BONE,
  accentColor = GOLD,
  className = '',
}: {
  as?: 'h1' | 'h2' | 'h3'
  children: React.ReactNode
  accent?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  accentColor?: string
  className?: string
}) {
  const sizes = {
    sm: 'clamp(1.35rem, 1.8vw, 1.6rem)',
    md: 'clamp(2rem, 3.2vw, 2.75rem)',
    lg: 'clamp(2.25rem, 3.8vw, 3.25rem)',
    xl: 'clamp(2.6rem, 4.6vw, 4rem)',
  }
  return (
    <Tag
      className={`uppercase text-balance ${className}`}
      style={{
        fontFamily: DISPLAY,
        fontSize: sizes[size],
        fontWeight: 400,
        lineHeight: size === 'sm' ? 1 : 0.92,
        letterSpacing: '0.015em',
        color,
      }}
    >
      {children}
      {accent && (
        <>
          {' '}
          <span style={{ color: accentColor }}>{accent}</span>
        </>
      )}
    </Tag>
  )
}

/* Ruled eyebrow, the Crosswalk pattern: a short rule, then a wide tracked label. */
function Eyebrow({ children, on = 'dark' }: { children: React.ReactNode; on?: 'dark' | 'light' }) {
  const tone = on === 'dark' ? SOFT : ACCENT
  return (
    <div
      className="flex items-center gap-3 text-[0.78rem] font-semibold uppercase tracking-[0.28em]"
      style={{ color: tone, fontFamily: SANS }}
    >
      <span className="inline-block h-px w-8" style={{ background: tone }} />
      {children}
    </div>
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
    gold: 'rgba(123,155,181,0.5)',
    bone: 'rgba(255,255,255,0.28)',
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
        fontFamily: SANS,
        borderColor: 'rgba(255,255,255,0.18)',
        background: 'rgba(28,36,39,0.45)',
        color: 'rgba(255,255,255,0.82)',
      }}
    >
      {children}
    </span>
  )
}

/* The live count beside an entry name: a Bebas numeral and a plain noun. */
function Count({ n, noun }: { n: number; noun: string }) {
  return (
    <span className="flex shrink-0 items-baseline gap-2">
      <span style={{ fontFamily: DISPLAY, fontSize: '1.7rem', lineHeight: 1, letterSpacing: '0.02em', color: SOFT }}>
        {n}
      </span>
      <span
        className="text-[0.7rem] font-semibold uppercase tracking-[0.2em]"
        style={{ fontFamily: SANS, color: 'rgba(255,255,255,0.7)' }}
      >
        {noun}
      </span>
    </span>
  )
}

/*
  One entry in the list of what is here: artwork, the name, a plain line
  saying what it is, and its live count.
*/
function Tile({
  href, title, blurb, image, count, noun,
}: {
  href: string; title: string; blurb: string; image?: string; count: number; noun: string
}) {
  return (
    <Link href={href} className="group block">
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9', background: DEEP }}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            loading="lazy"
            className="h-full w-full scale-[1.03] object-cover grayscale transition-all duration-[900ms] ease-out group-hover:scale-100 group-hover:grayscale-0"
          />
        ) : (
          <span aria-hidden className="section-pattern absolute inset-0" />
        )}
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <Heading as="h3" size="sm">{title}</Heading>
        <Count n={count} noun={noun} />
      </div>
      <p
        className="mt-2.5 text-[0.95rem] leading-relaxed"
        style={{ fontFamily: SANS, color: 'rgba(255,255,255,0.72)' }}
      >
        {blurb}
      </p>
    </Link>
  )
}

function SectionHead({
  eyebrow, title, accent, href, linkLabel, count, on = 'dark',
}: {
  eyebrow?: string; title: string; accent?: string
  href?: string; linkLabel?: string; count?: number; on?: 'dark' | 'light'
}) {
  const light = on === 'light'
  return (
    <div className="mb-14 lg:mb-16">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          {eyebrow && <ScrollReveal><Eyebrow on={on}>{eyebrow}</Eyebrow></ScrollReveal>}
          <ScrollReveal delay={80}>
            <Heading
              className={eyebrow ? 'mt-5' : ''}
              accent={accent}
              color={light ? BLACK : BONE}
              accentColor={light ? ACCENT : GOLD}
            >
              {title}
            </Heading>
          </ScrollReveal>
        </div>
        {href && (
          <ScrollReveal delay={160}>
            <Link
              href={href}
              className={`group inline-flex shrink-0 items-center gap-2 rounded-full border px-6 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] transition-colors ${light ? 'hover:bg-black/5' : 'hover:bg-white/10'}`}
              style={{
                fontFamily: SANS,
                borderColor: light ? 'rgba(28,36,39,0.25)' : 'rgba(255,255,255,0.3)',
                color: light ? BLACK : BONE,
              }}
            >
              {linkLabel ?? 'View all'}
              {count !== undefined && <span style={{ color: light ? ACCENT : SOFT }}>{count}</span>}
              <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </ScrollReveal>
        )}
      </div>
    </div>
  )
}

function IndexRow({ piece, n }: { piece: Piece; n?: number }) {
  return (
    <Link
      href={piece.href}
      className="group flex gap-4 border-b py-4 transition-colors"
      style={{ borderColor: 'rgba(255,255,255,0.12)' }}
    >
      {n !== undefined && (
        <span
          className="w-7 shrink-0 text-right tabular-nums"
          style={{ fontFamily: DISPLAY, fontSize: '1.35rem', lineHeight: 1.15, letterSpacing: '0.02em', color: SOFT }}
        >
          {n}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[0.98rem] leading-snug text-white transition-colors group-hover:text-[var(--awd-stone)]"
          style={{ fontFamily: SANS }}>
          {piece.title}
        </span>
        <span className="mt-1 block text-[0.72rem]" style={{ color: SOFT }}>{piece.date}</span>
      </span>
    </Link>
  )
}


// ─── Page ─────────────────────────────────────────────────────────────────────

/*
  Every piece now lives in one table read through lib/sermons, with exactly
  one category (sermon, teaching, episode, paper, commentary). The old MDX and
  Sanity readers are gone; a database failure renders the page with empty
  lists rather than crashing it.
*/
async function loadLibrary(): Promise<{ pieces: Sermon[]; series: Series[] }> {
  try {
    const [pieces, series] = await Promise.all([getPublishedSermons(), getPublishedSeries()])
    return { pieces, series }
  } catch (err) {
    console.warn('[home] database read failed, rendering an empty library', err)
    return { pieces: [], series: [] }
  }
}

/* The old frontmatter.image, resolved from what a piece carries now. */
function imageFor(p: Sermon): string | undefined {
  return (
    p.heroStillUrl ??
    p.artworkUrl ??
    p.seriesArtworkUrl ??
    undefined
  )
}

/*
  Austin's personal pastoral mission statement, shown on the white band
  under the hero. His words, verbatim. Edit here and nowhere else.
*/
const MISSION =
  'My mission as a pastor is to faithfully preach the Word, shepherd people well, make disciples who make disciples, and develop leaders who can carry the mission of Jesus into the church, their homes, their communities, and wherever God sends them.'

export default async function HomePage() {
  const { pieces, series } = await loadLibrary()

  // getPublishedSermons returns newest first, so each list is already sorted.
  const allSermons = pieces.filter(p => p.category === 'sermon')
  const allTeaching = pieces.filter(p => p.category === 'teaching')
  const allWfw = pieces.filter(p => p.category === 'episode')
  const allExegetica = pieces.filter(p => p.category === 'paper')
  const allForum = pieces.filter(p => p.category === 'commentary')

  // The teaching series: published series that hold at least one teaching
  // session. If none are linked yet, every published series counts.
  const linkedSeries = series.filter(s => allTeaching.some(t => t.seriesSlug === s.slug))
  const teachingSeries = linkedSeries.length > 0 ? linkedSeries : series

  // ── Derived ──────────────────────────────────────────────────────────────────
  const featured = allSermons[0] ?? null
  const featuredExcerpt = featured ? featured.summary || featured.description : undefined

  const toPiece = (a: Sermon, section: string): Piece => ({
    section, title: a.title, href: pathFor(a),
    date: a.date ? fmt(a.date) : '', raw: a.date ?? '',
    image: imageFor(a), excerpt: a.summary || a.description,
    // a still chosen in the builder carries its framing with it
    frame: a.heroStillUrl
      ? { fx: a.heroFocalX, fy: a.heroFocalY, tx: a.heroTargetX, ty: a.heroTargetY, zoom: a.heroZoom }
      : undefined,
  })

  const recentSermons = allSermons.slice(1, 4).map(a => toPiece(a, 'Sermon'))
  const wfwIndex = allWfw.slice(0, 15).map(a => toPiece(a, 'Word for Word'))

  const art = {
    teaching: teachingSeries.find(s => s.artworkUrl)?.artworkUrl ?? (allTeaching[0] ? imageFor(allTeaching[0]) : undefined),
    // the newest piece that actually has a picture, so a tile is never blank
    wfw: allWfw.map(imageFor).find(Boolean),
    exegetica: allExegetica.map(imageFor).find(Boolean),
    forum: allForum.map(imageFor).find(Boolean),
  }

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
          <div className="relative flex min-h-[82svh] items-end pt-32 lg:min-h-[90svh] lg:pt-36">
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
                style={{ background: 'radial-gradient(130% 105% at 62% 38%, transparent 42%, rgba(28,36,39,0.55) 100%)' }}
              />
            </div>

            {/* desktop: hard left-to-black behind the words */}
            <span aria-hidden className="absolute inset-0 hidden lg:block"
              style={{ background: 'linear-gradient(90deg,#1C2427 0%,#1C2427 22%,rgba(28,36,39,.8) 40%,rgba(28,36,39,.22) 64%,transparent 84%)' }} />
            <span aria-hidden className="absolute inset-0 hidden lg:block"
              style={{ background: 'linear-gradient(0deg,#1C2427 0%,transparent 38%)' }} />
            {/* mobile: bottom-up */}
            <span aria-hidden className="absolute inset-0 lg:hidden"
              style={{ background: 'linear-gradient(0deg,#1C2427 0%,#1C2427 22%,rgba(28,36,39,.74) 52%,rgba(28,36,39,.18) 82%,transparent 100%)' }} />

            <CornerBracket position="tl" tone="bone" />
            <CornerBracket position="bl" tone="bone" />

            <div className="relative mx-auto w-full max-w-[1180px] px-6 pb-16 lg:px-10 lg:pb-24">
              <div className="max-w-2xl">
                <ScrollReveal>
                  <span
                    className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.22em] backdrop-blur"
                    style={{
                      fontFamily: SANS,
                      borderColor: 'rgba(157,180,200,0.5)',
                      background: 'rgba(157,180,200,0.16)',
                      color: SOFT,
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: SOFT }} />
                    Newest sermon
                  </span>
                </ScrollReveal>

                <ScrollReveal delay={110}>
                  <Heading as="h1" size="xl" className="mt-6">
                    {featured.title}
                  </Heading>
                </ScrollReveal>

                {featuredExcerpt && (
                  <ScrollReveal delay={160}>
                    <p className="mt-6 line-clamp-3 max-w-lg text-[1.02rem] leading-relaxed"
                      style={{ fontFamily: SANS, color: 'rgba(255,255,255,0.78)' }}>
                      {clean(featuredExcerpt)}
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
                      className="group/cta inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-[0.78rem] font-semibold uppercase tracking-[0.16em] transition-transform duration-200 hover:scale-[1.03]"
                      style={{ fontFamily: SANS, background: GOLD, color: BLACK }}
                    >
                      Read it now
                      <ArrowRight size={14} className="transition-transform duration-200 group-hover/cta:translate-x-0.5" />
                    </Link>
                    <Link
                      href="/sermons"
                      className="inline-flex items-center gap-2 rounded-full border px-8 py-3.5 text-[0.78rem] font-semibold uppercase tracking-[0.16em] backdrop-blur transition-colors hover:bg-white/10"
                      style={{
                        fontFamily: SANS,
                        borderColor: 'rgba(255,255,255,0.28)',
                        background: 'rgba(28,36,39,0.3)',
                        color: BONE,
                      }}
                    >
                      {allSermons.length} more sermons
                    </Link>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>
      )}

      {/*
        ── Who and where (white band) ──────────────────────────────────────────
        The mission statement, verbatim, then who and where in one line.

        Deliberately omitted: a weekly preaching/teaching rhythm. The Crosswalk
        sermon catalogue shows Austin preaching in rotation with Josh Huisman
        and Gavin Booser, so "preaching Sundays" would overstate it. Add the
        real line here once confirmed.

        On white, soft blue is 2.9 and is never text. The small label, the
        rule and the separators are #4F6B84 (5.6) and the statement is ink.
      */}
      <section style={{ background: BONE }} className="relative py-28 lg:py-40">
        <div className="mx-auto max-w-[1180px] px-6 text-center lg:px-10">
          <ScrollReveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/AWDLogoWhite.svg"
              alt=""
              aria-hidden
              className="mx-auto mb-10 w-auto"
              style={{ height: '68px', filter: 'invert(1)', opacity: 0.62 }}
            />
          </ScrollReveal>

          <ScrollReveal delay={70}>
            <p
              className="text-[0.78rem] font-semibold uppercase tracking-[0.28em]"
              style={{ fontFamily: SANS, color: ACCENT }}
            >
              My mission
            </p>
          </ScrollReveal>

          {/*
            The statement is set as reading text, not a heading: Montserrat at
            weight 600, sentence case. A 40 word sentence in Bebas caps turns
            into a wall, so the Heading component is not used here.
          */}
          <ScrollReveal delay={130}>
            <blockquote
              className="mx-auto mt-7 max-w-4xl text-balance"
              style={{
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 'clamp(1.35rem, 2.2vw, 2.1rem)',
                lineHeight: 1.3,
                letterSpacing: '0',
                color: BLACK,
              }}
            >
              {MISSION}
            </blockquote>
          </ScrollReveal>

          <ScrollReveal delay={190}>
            <span aria-hidden className="mx-auto mt-10 block h-px w-16" style={{ background: ACCENT }} />
          </ScrollReveal>

          <ScrollReveal delay={230}>
            <p
              className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[0.78rem] font-semibold uppercase tracking-[0.16em]"
              style={{ fontFamily: SANS, color: 'rgba(28,36,39,0.76)' }}
            >
              <span style={{ color: BLACK }}>Austin W. Duncan</span>
              <span aria-hidden style={{ color: ACCENT }}>&middot;</span>
              <span>Pastor and Bible teacher</span>
              <span aria-hidden style={{ color: ACCENT }}>&middot;</span>
              <span>Crosswalk Church, Brentwood, Tennessee</span>
            </p>
          </ScrollReveal>

          <ScrollReveal delay={280}>
            <div className="mt-11 flex flex-wrap justify-center gap-3">
              <Link
                href="/about"
                className="rounded-full px-8 py-3.5 text-[0.78rem] font-semibold uppercase tracking-[0.16em] transition-transform duration-200 hover:scale-[1.03]"
                style={{ fontFamily: SANS, background: BLACK, color: BONE }}
              >
                About me
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/*
        ── What I am after (preaching loop, film treatment) ────────────────────
        Mirrors the hero: there the words sit left and the picture right, so
        here it flips. A right-to-black gradient seats the type on the right
        while the footage stays open on the left, which also solves the
        collision that came from centring words over a centred figure.

        The component's centre scrim is switched off (scrim={0}) because this
        directional gradient does the separating instead.
      */}
      <section className="relative overflow-hidden" style={{ background: GRAPHITE }}>
        <VideoBackground
          src="/video/preaching-loop.mp4"
          poster="/video/preaching-loop-poster.jpg"
          focusY="50%"
          fadeTo={BLACK}
          scrim={0}
        />
        {/* desktop: fades out of the footage on the left, into black on the right */}
        {/* The pad seam in the source sits at 67% of frame width; the gradient
            is fully solid by 66%, so it never shows. */}
        <span aria-hidden className="absolute inset-0 hidden lg:block"
          style={{ background: 'linear-gradient(90deg, rgba(28,36,39,0.12) 0%, rgba(28,36,39,0.3) 26%, rgba(28,36,39,0.88) 50%, #1C2427 66%)' }} />
        {/* mobile: no room to split, so bottom-up */}
        <span aria-hidden className="absolute inset-0 lg:hidden"
          style={{ background: 'linear-gradient(0deg,#1C2427 0%,rgba(28,36,39,0.9) 42%,rgba(28,36,39,0.45) 78%,rgba(28,36,39,0.25) 100%)' }} />
        <CornerBracket position="tl" tone="accent" />

        {/* A wider container than the rest of the page so the type sits further
            right, closer to the edge, away from the figure on the left. */}
        <div className="relative mx-auto max-w-[1400px] px-6 py-32 lg:px-10 lg:py-44">
          <div className="lg:ml-auto lg:max-w-xl">
            <ScrollReveal><Eyebrow>What I am after</Eyebrow></ScrollReveal>
            <ScrollReveal delay={90}>
              <Heading className="mt-5" size="lg" accent="hardest questions.">
                The Bible can handle your
              </Heading>
            </ScrollReveal>
            <ScrollReveal delay={150}>
              <p className="mt-8 max-w-lg text-[1.05rem] leading-[1.9]"
                style={{ fontFamily: SANS, color: 'rgba(255,255,255,0.8)' }}>
                My aim is simple: help you read Scripture carefully and understand
                what you find, without pretending the hard parts are easy or the
                easy parts are hard.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={210}>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/about/beliefs"
                  className="rounded-full px-8 py-3.5 text-[0.78rem] font-semibold uppercase tracking-[0.16em] transition-transform duration-200 hover:scale-[1.03]"
                  style={{ fontFamily: SANS, background: GOLD, color: BLACK }}
                >
                  What I believe
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/*
        ── What is here ────────────────────────────────────────────────────────
        A plain list of the five collections with their live counts. Sermons
        leads, with the preaching loop from the band above as its ground.

        The loop is 1280x486 and only its left 67% is footage (the rest is
        padding), so the lead tile stays near square and the crop is pinned
        to the left so the padding never shows. Under prefers-reduced-motion
        the video is hidden and the poster frame beneath it stands in.
      */}
      <section style={{ background: BLACK }} className="py-28 lg:py-36">
        <div className="mx-auto max-w-[1180px] px-6 lg:px-10">
          <SectionHead title="Start anywhere" />
          <div className="grid gap-x-8 gap-y-12 lg:grid-cols-2">
            <ScrollReveal className="h-full">
              <Link
                href="/sermons"
                className="group relative flex aspect-[4/5] h-full w-full flex-col justify-end overflow-hidden sm:aspect-[4/3] lg:aspect-auto lg:min-h-[34rem]"
                style={{ background: DEEP }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/video/preaching-loop-poster.jpg"
                  alt=""
                  aria-hidden
                  className="absolute inset-0 h-full w-full object-cover grayscale contrast-125 brightness-90"
                  style={{ objectPosition: '24% 50%' }}
                />
                <video
                  aria-hidden
                  tabIndex={-1}
                  className="absolute inset-0 h-full w-full object-cover grayscale contrast-125 brightness-90 motion-reduce:hidden"
                  style={{ objectPosition: '24% 50%' }}
                  src="/video/preaching-loop.mp4"
                  poster="/video/preaching-loop-poster.jpg"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  disablePictureInPicture
                  disableRemotePlayback
                />
                <span
                  aria-hidden
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(0deg,#1C2427 0%,rgba(28,36,39,0.82) 30%,rgba(28,36,39,0.2) 62%,transparent 100%)' }}
                />
                <CornerBracket position="tr" tone="bone" />
                <div className="relative p-7 lg:p-10">
                  <div className="flex items-end justify-between gap-4">
                    <Heading as="h3" size="lg">Sermons</Heading>
                    <Count n={allSermons.length} noun="sermons" />
                  </div>
                  <p
                    className="mt-3 max-w-md text-[1rem] leading-relaxed"
                    style={{ fontFamily: SANS, color: 'rgba(255,255,255,0.82)' }}
                  >
                    What I preached at Crosswalk, written out in full.
                  </p>
                </div>
              </Link>
            </ScrollReveal>
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2">
              <ScrollReveal delay={70}>
                <Tile href="/series" title="Teaching Series" image={art.teaching}
                  count={teachingSeries.length} noun="series"
                  blurb="Book studies and biblical theology, worked through in order." />
              </ScrollReveal>
              <ScrollReveal delay={140}>
                <Tile href="/word-for-word" title="Word for Word" image={art.wfw}
                  count={allWfw.length} noun="episodes"
                  blurb="Answers to questions people ask, worked out from the text." />
              </ScrollReveal>
              <ScrollReveal delay={210}>
                <Tile href="/forum-and-pulpit" title="Forum & Pulpit" image={art.forum}
                  count={allForum.length} noun="articles"
                  blurb="What Scripture has to say about what is happening now." />
              </ScrollReveal>
              <ScrollReveal delay={280}>
                <Tile href="/exegetica" title="Exegetica" image={art.exegetica}
                  count={allExegetica.length} noun="papers"
                  blurb="Longer papers with the Greek and Hebrew left in." />
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/*
        ── Photographic breather ───────────────────────────────────────────────
        A full-bleed band between two dense sections. Crosswalk uses imagery
        this way to let the page breathe; the only text is a single line, so
        the photograph carries it.
      */}
      <section className="relative overflow-hidden" style={{ background: BLACK }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/home/hand-raised.jpg"
          alt=""
          aria-hidden
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: '50% 38%' }}
        />
        <span aria-hidden className="absolute inset-0" style={{ background: 'rgba(28,36,39,0.7)' }} />
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ background: 'linear-gradient(0deg,#1C2427 0%,transparent 45%,transparent 55%,#1C2427 100%)' }}
        />
        <CornerBracket position="tl" tone="accent" />
        <CornerBracket position="br" tone="accent" />
        <div className="relative mx-auto max-w-[1180px] px-6 py-32 text-center lg:px-10 lg:py-44">
          <ScrollReveal>
            <p
              className="mx-auto max-w-2xl text-[1.35rem] leading-[1.6] sm:text-[1.6rem]"
              style={{ fontFamily: SANS, fontStyle: 'italic', color: BONE }}
            >
              &ldquo;So faith comes from hearing, and hearing through the word of Christ.&rdquo;
            </p>
          </ScrollReveal>
          <ScrollReveal delay={90}>
            <p
              className="mt-7 text-[0.78rem] font-semibold uppercase tracking-[0.28em]"
              style={{ fontFamily: SANS, color: SOFT }}
            >
              Romans 10:17
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Recent sermons (white band) ────────────────────────────────────── */}
      {recentSermons.length > 0 && (
        <section style={{ background: BONE }} className="py-28 lg:py-40">
          <div className="mx-auto max-w-[1180px] px-6 lg:px-10">
            <SectionHead on="light" eyebrow="Recent sermons" title="More from" accent="the pulpit."
              href="/sermons" linkLabel="All sermons" count={allSermons.length} />
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-3">
              {recentSermons.map((piece, i) => (
                <ScrollReveal key={piece.href} delay={i * 80}>
                  <Link href={piece.href} className="group block">
                    <div className="relative overflow-hidden" style={{ aspectRatio: '16/9', background: DEEP }}>
                      {piece.image && piece.frame ? (
                        <FramedImage
                          src={piece.image}
                          focalX={piece.frame.fx}
                          focalY={piece.frame.fy}
                          targetX={piece.frame.tx}
                          targetY={piece.frame.ty}
                          zoom={piece.frame.zoom}
                          className="absolute inset-0 grayscale transition-all duration-[900ms] ease-out group-hover:grayscale-0"
                        />
                      ) : piece.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={piece.image} alt="" loading="lazy"
                          className="h-full w-full object-cover grayscale transition-all duration-[900ms] ease-out group-hover:grayscale-0" />
                      ) : (
                        // No artwork: the title stands in, white Bebas on primary deep.
                        <span
                          aria-hidden
                          className="absolute inset-0 flex items-center justify-center p-6 text-center uppercase text-balance"
                          style={{
                            fontFamily: DISPLAY,
                            fontWeight: 400,
                            fontSize: 'clamp(1.5rem, 2.4vw, 2.1rem)',
                            lineHeight: 0.95,
                            letterSpacing: '0.02em',
                            color: BONE,
                          }}
                        >
                          <span className="line-clamp-4">{piece.title}</span>
                        </span>
                      )}
                    </div>
                    <Heading as="h3" size="sm" color={BLACK} className="mt-5">
                      {piece.title}
                    </Heading>
                    <p className="mt-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em]"
                      style={{ fontFamily: SANS, color: ACCENT }}>
                      {piece.date}
                    </p>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Word for Word index ────────────────────────────────────────────── */}
      {wfwIndex.length > 0 && (
        <section style={{ background: DEEP }} className="py-28 lg:py-36">
          <div className="mx-auto max-w-[1180px] px-6 lg:px-10">
            <SectionHead eyebrow="Word for Word" title="You have probably wondered"
              accent="some of these." href="/word-for-word" linkLabel="All questions" count={allWfw.length} />
            <div className="grid gap-x-14 md:grid-cols-2 lg:grid-cols-3">
              {wfwIndex.map((piece, i) => (
                <ScrollReveal key={piece.href} delay={(i % 3) * 60}>
                  <IndexRow piece={piece} n={i + 1} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Closing ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: GRAPHITE }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/home/congregation-praying.jpg"
          alt="The congregation at Crosswalk Church with hands raised"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: '50% 40%' }}
        />
        <span aria-hidden className="absolute inset-0" style={{ background: 'rgba(28,36,39,0.86)' }} />
        <span
          aria-hidden
          className="absolute inset-0 opacity-[0.25] mix-blend-soft-light"
          style={{ background: 'var(--awd-accent-2)' }}
        />
        <div className="relative mx-auto max-w-[1180px] px-6 py-32 lg:px-10 lg:py-44">
          <ScrollReveal>
            <div
              className="relative border p-8 backdrop-blur-md lg:p-12"
              style={{ borderColor: 'color-mix(in srgb, var(--awd-accent-2) 40%, transparent)', background: 'rgba(255,255,255,0.05)' }}
            >
              <CornerBracket position="tl" tone="accent" />
              <CornerBracket position="br" tone="accent" />
              <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-xl">
                  <Eyebrow>If you only do one thing</Eyebrow>
                  <Heading className="mt-5" accent="straight through.">
                    Pick a series and read it
                  </Heading>
                  <p className="mt-6 text-[1.02rem] leading-[1.85]"
                    style={{ fontFamily: SANS, color: 'rgba(255,255,255,0.8)' }}>
                    A single sermon helps. A book worked through end to end
                    changes how you read everything else.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { href: '/series', label: 'Browse series' },
                    { href: '/browse', label: 'Browse everything' },
                    { href: '/library', label: 'Books' },
                    { href: '/library/bible', label: 'By Scripture' },
                    { href: '/about', label: 'About' },
                  ].map(l => (
                    <Link key={l.href} href={l.href}
                      className="group inline-flex items-center gap-1.5 rounded-full border px-5 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] backdrop-blur transition-colors hover:bg-white/10"
                      style={{ fontFamily: SANS, borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.9)' }}>
                      {l.label}
                      <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}
