import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  getAll,
  getAllTeaching,
  sortByDate,
  isPublished,
  type SermonFrontmatter,
  type ArticleFrontmatter,
  type TeachingFrontmatter,
} from '@/lib/content'
import { getArticlesBySection } from '@/sanity/lib/queries'
import { TEACHING_SERIES } from '@/data/teaching-series'
import ScrollReveal from '@/components/scroll-reveal'
import VideoBackground from '@/components/video-background'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Austin W. Duncan',
  description:
    'Sermons, biblical teaching, scholarly articles, and cultural commentary from Austin W. Duncan.',
}

/*
  Homepage.

  TYPE RULE, not negotiable: every heading on this page is CMG Sans
  (Montserrat, via --font-cmg). No serif headings. Body copy is Source Serif.
  Use the Heading component below rather than hand-rolling a heading so this
  cannot drift again.

  PALETTE, distributed to the intended weights rather than nominally present:
    ~55% soft black #171918   hero, mosaic, index
    ~20% graphite   #2C302F   mission, recent sermons, closing
    ~10% warm bone  #EEEAE1   the Start Here funnel, a real light band
    ~8%  gold       #CDB079   headings accents, rules, the primary CTA
    ~5%  accent-2             eyebrow rules, chips, icons, hovers
    ~2%  stone      #AAA79E   metadata

  CONTRAST, measured. On soft black: gold 8.48, bone 14.72, stone 7.34,
  sage 4.89, steel 4.72. On warm bone gold is 1.73 and stone 2.00, so on the
  light band text is graphite and the accent is decorative only.

  House copy rule, same as Crosswalk: no em dashes or en dashes anywhere.
*/

const BLACK = '#171918'
const GRAPHITE = '#2C302F'
const GOLD = '#CDB079'
const BONE = '#EEEAE1'
const STONE = '#AAA79E'

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

type Piece = {
  section: string
  title: string
  href: string
  date: string
  raw: string
  image?: string
  excerpt?: string
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

/* Ruled eyebrow. The rule carries the secondary accent, the word carries gold. */
function Eyebrow({ children, on = 'dark' }: { children: React.ReactNode; on?: 'dark' | 'light' }) {
  const text = on === 'dark' ? GOLD : GRAPHITE
  return (
    <div
      className="flex items-center gap-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em]"
      style={{ color: text, fontFamily: HEADING }}
    >
      <span className="inline-block h-px w-[26px]" style={{ background: 'var(--awd-accent-2)' }} />
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

/*
  Section tile. Carries a real one-line reason to click rather than a bare
  label, because a first-time visitor has no idea what "Exegetica" is.
*/
function Tile({
  href, tag, title, blurb, image, count,
}: {
  href: string; tag: string; title: string; blurb: string; image?: string; count?: string
}) {
  return (
    <Link href={href} className="group block">
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9', background: GRAPHITE }}>
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
        {count && (
          <span
            className="absolute left-4 top-4 z-10 rounded-full border px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em] backdrop-blur-sm"
            style={{
              fontFamily: HEADING,
              borderColor: 'color-mix(in srgb, var(--awd-accent-2) 55%, transparent)',
              background: 'rgba(23,25,24,0.5)',
              color: 'var(--awd-accent-2)',
            }}
          >
            {count}
          </span>
        )}
        <CornerBracket position="tr" />
      </div>
      <p
        className="mt-5 text-[0.66rem] font-semibold uppercase tracking-[0.2em]"
        style={{ color: 'var(--awd-accent-2)', fontFamily: HEADING }}
      >
        {tag}
      </p>
      <Heading as="h3" size="sm" className="mt-2 transition-colors group-hover:text-[var(--awd-gold)]">
        {title}
      </Heading>
      <p
        className="mt-3 text-[0.95rem] leading-relaxed"
        style={{ fontFamily: 'var(--font-source-serif)', color: 'rgba(238,234,225,0.6)' }}
      >
        {blurb}
      </p>
    </Link>
  )
}

function SectionHead({
  eyebrow, title, accent, href, linkLabel, count, intro,
}: {
  eyebrow: string; title: string; accent?: string
  href?: string; linkLabel?: string; count?: number; intro?: string
}) {
  return (
    <div className="mb-14">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <ScrollReveal><Eyebrow>{eyebrow}</Eyebrow></ScrollReveal>
          <ScrollReveal delay={80}>
            <Heading className="mt-5" accent={accent}>{title}</Heading>
          </ScrollReveal>
        </div>
        {href && (
          <ScrollReveal delay={160}>
            <Link
              href={href}
              className="group inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] backdrop-blur transition-colors hover:bg-white/10"
              style={{
                fontFamily: HEADING,
                borderColor: 'color-mix(in srgb, var(--awd-accent-2) 45%, transparent)',
                background: 'rgba(238,234,225,0.04)',
                color: BONE,
              }}
            >
              {linkLabel ?? 'View all'}
              {count !== undefined && <span style={{ color: 'var(--awd-accent-2)' }}>{count}</span>}
              <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </ScrollReveal>
        )}
      </div>
      {intro && (
        <ScrollReveal delay={200}>
          <p
            className="mt-7 max-w-2xl text-[1.02rem] leading-[1.85]"
            style={{ fontFamily: 'var(--font-source-serif)', color: 'rgba(238,234,225,0.66)' }}
          >
            {intro}
          </p>
        </ScrollReveal>
      )}
    </div>
  )
}

function IndexRow({ piece, n }: { piece: Piece; n?: number }) {
  return (
    <Link
      href={piece.href}
      className="group flex gap-4 border-b py-4 transition-colors"
      style={{ borderColor: 'rgba(238,234,225,0.10)' }}
    >
      {n !== undefined && (
        <span className="w-6 shrink-0 pt-1 text-right text-[0.7rem] font-semibold tabular-nums"
          style={{ fontFamily: HEADING, color: 'var(--awd-accent-2)' }}>{n}</span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[0.98rem] leading-snug transition-colors group-hover:text-[var(--awd-gold)]"
          style={{ fontFamily: 'var(--font-source-serif)', color: BONE }}>
          {piece.title}
        </span>
        <span className="mt-1 block text-[0.72rem]" style={{ color: STONE }}>{piece.date}</span>
      </span>
    </Link>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const mdxSermons = getAll<SermonFrontmatter>('sermons').filter(a => isPublished(a.frontmatter.date))
  const mdxSermonSlugs = new Set(mdxSermons.map(s => s.slug))
  const [
    sanitySermonArticles,
    sanityWfwArticles,
    sanityExegeticaArticles,
    sanityForumArticles,
    sanityExpositionalArticles,
    sanityTopicalArticles,
  ] = await Promise.all([
    getArticlesBySection('sermons'),
    getArticlesBySection('word-for-word'),
    getArticlesBySection('exegetica'),
    getArticlesBySection('forum-and-pulpit'),
    getArticlesBySection('expositional'),
    getArticlesBySection('topical'),
  ])

  const sanitySermons = sanitySermonArticles
    .filter(a => !mdxSermonSlugs.has(a.slug))
    .map(a => ({
      slug: a.slug,
      content: '',
      frontmatter: {
        title: a.title,
        date: a.date,
        excerpt: a.excerpt ?? '',
        scripture: a.scripture ?? undefined,
        image: a.image ?? undefined,
        series: a.series ?? undefined,
      } as SermonFrontmatter,
    }))
  const allSermons = sortByDate([...mdxSermons, ...sanitySermons])

  const mdxWfw = getAll<ArticleFrontmatter>('word-for-word').filter(a => isPublished(a.frontmatter.date))
  const mdxWfwSlugs = new Set(mdxWfw.map(a => a.slug))
  const allWfw = sortByDate([
    ...mdxWfw,
    ...sanityWfwArticles
      .filter(a => !mdxWfwSlugs.has(a.slug))
      .map(a => ({
        slug: a.slug,
        content: '',
        frontmatter: { title: a.title, date: a.date, excerpt: a.excerpt ?? '', image: a.image ?? undefined } as ArticleFrontmatter,
      })),
  ])

  const mdxExegetica = getAll<ArticleFrontmatter>('exegetica').filter(a => isPublished(a.frontmatter.date))
  const mdxExegeticaSlugs = new Set(mdxExegetica.map(a => a.slug))
  const allExegetica = sortByDate([
    ...mdxExegetica,
    ...sanityExegeticaArticles
      .filter(a => !mdxExegeticaSlugs.has(a.slug))
      .map(a => ({
        slug: a.slug,
        content: '',
        frontmatter: { title: a.title, date: a.date, excerpt: a.excerpt ?? '', image: a.image ?? undefined } as ArticleFrontmatter,
      })),
  ])

  const mdxForum = getAll<ArticleFrontmatter>('forum-and-pulpit').filter(a => isPublished(a.frontmatter.date))
  const mdxForumSlugs = new Set(mdxForum.map(a => a.slug))
  const allForum = sortByDate([
    ...mdxForum,
    ...sanityForumArticles
      .filter(a => !mdxForumSlugs.has(a.slug))
      .map(a => ({
        slug: a.slug,
        content: '',
        frontmatter: { title: a.title, date: a.date, excerpt: a.excerpt ?? '', image: a.image ?? undefined } as ArticleFrontmatter,
      })),
  ])

  const mdxExpositional = getAllTeaching<TeachingFrontmatter>('expositional').filter(a => isPublished(a.frontmatter.date))
  const mdxExpositionalSlugs = new Set(mdxExpositional.map(a => a.slug))
  const mdxTopical = getAllTeaching<TeachingFrontmatter>('topical').filter(a => isPublished(a.frontmatter.date))
  const mdxTopicalSlugs = new Set(mdxTopical.map(a => a.slug))

  const allTeachingRaw = sortByDate([
    ...mdxExpositional.map(a => ({ ...a, teachingType: 'expositional' as const })),
    ...sanityExpositionalArticles
      .filter(a => !mdxExpositionalSlugs.has(a.slug))
      .map(a => ({
        slug: a.slug,
        content: '',
        frontmatter: { title: a.title, date: a.date, excerpt: a.excerpt ?? '', image: a.image ?? undefined, tags: a.tags ?? [] } as TeachingFrontmatter,
        teachingType: 'expositional' as const,
      })),
    ...mdxTopical.map(a => ({ ...a, teachingType: 'topical' as const })),
    ...sanityTopicalArticles
      .filter(a => !mdxTopicalSlugs.has(a.slug))
      .map(a => ({
        slug: a.slug,
        content: '',
        frontmatter: { title: a.title, date: a.date, excerpt: a.excerpt ?? '', image: a.image ?? undefined, tags: a.tags ?? [] } as TeachingFrontmatter,
        teachingType: 'topical' as const,
      })),
  ])

  // ── Derived ──────────────────────────────────────────────────────────────────
  const featured = allSermons[0] ?? null

  const toPiece = (
    a: { slug: string; frontmatter: { title: string; date: string; excerpt?: string; image?: string } },
    section: string, base: string
  ): Piece => ({
    section, title: a.frontmatter.title, href: `${base}/${a.slug}`,
    date: fmt(a.frontmatter.date), raw: a.frontmatter.date,
    image: a.frontmatter.image, excerpt: a.frontmatter.excerpt,
  })

  const recentSermons = allSermons.slice(1, 4).map(a => toPiece(a, 'Sermon', '/sermons'))
  const wfwIndex = allWfw.slice(0, 15).map(a => toPiece(a, 'Word for Word', '/word-for-word'))
  const topSeries = [...TEACHING_SERIES].sort((a, b) => a.priority - b.priority)

  const art = {
    sermons: allSermons[0]?.frontmatter.image,
    teaching: topSeries[0]?.image,
    wfw: allWfw[0]?.frontmatter.image,
    exegetica: allExegetica[0]?.frontmatter.image,
    forum: allForum[0]?.frontmatter.image,
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
                    {featured.frontmatter.title}
                  </Heading>
                </ScrollReveal>

                {featured.frontmatter.excerpt && (
                  <ScrollReveal delay={160}>
                    <p className="mt-6 line-clamp-3 max-w-lg text-[1.02rem] leading-relaxed"
                      style={{ fontFamily: 'var(--font-source-serif)', color: 'rgba(238,234,225,0.78)' }}>
                      {clean(featured.frontmatter.excerpt)}
                    </p>
                  </ScrollReveal>
                )}

                <ScrollReveal delay={210}>
                  <div className="mt-7 flex flex-wrap items-center gap-2">
                    {featured.frontmatter.scripture && <GlassPill>{featured.frontmatter.scripture}</GlassPill>}
                    <GlassPill>{fmt(featured.frontmatter.date)}</GlassPill>
                    <GlassPill>Full text, free</GlassPill>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={260}>
                  <div className="mt-9 flex flex-wrap gap-3">
                    <Link
                      href={`/sermons/${featured.slug}`}
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
        ── Who and where (warm bone, the 10% light band) ───────────────────────
        The practical band. A stranger's first question is "who is this person
        and is he real", so this answers it with facts rather than a pitch: the
        monogram, the role, the church, and live counts pulled from the content
        itself so they are never stale.

        Deliberately omitted: a weekly preaching/teaching rhythm. The Crosswalk
        sermon catalogue shows Austin preaching in rotation with Josh Huisman
        and Gavin Booser, so "preaching Sundays" would overstate it. Add the
        real line here once confirmed.

        On bone, gold is 1.73 and steel 3.12, so text is graphite (11.13) and
        the numerals use the darkened gold at 5.53.
      */}
      <section style={{ background: BONE }} className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-[1180px] px-6 text-center lg:px-10">
          <ScrollReveal>
            {/*
              Height is set inline rather than with a height utility: `h-11`
              resolved to 560px on this element even though the generated rule
              is identical to the nav's working `h-8`. Not fully root-caused;
              an explicit height is deterministic either way.
            */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/AWDLogoWhite.svg"
              alt=""
              aria-hidden
              className="mx-auto mb-8 w-auto"
              style={{ height: '68px', filter: 'invert(1)', opacity: 0.62 }}
            />
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <Heading size="md" color={BLACK}>Austin W. Duncan</Heading>
          </ScrollReveal>

          <ScrollReveal delay={140}>
            <p
              className="mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[0.78rem] font-semibold uppercase tracking-[0.16em]"
              style={{ fontFamily: HEADING, color: 'rgba(23,25,24,0.62)' }}
            >
              <span>Pastor and Bible teacher</span>
              <span style={{ color: 'var(--awd-accent-2)' }}>&middot;</span>
              <span>Crosswalk Church</span>
              <span style={{ color: 'var(--awd-accent-2)' }}>&middot;</span>
              <span>Brentwood, Tennessee</span>
            </p>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <dl className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-y-8 sm:grid-cols-4">
              {[
                { n: allSermons.length, label: 'Sermons' },
                { n: allTeachingRaw.length, label: 'Teaching sessions' },
                { n: allWfw.length, label: 'Questions answered' },
                { n: allExegetica.length, label: 'Papers' },
              ].map(stat => (
                <div key={stat.label} className="px-2">
                  <dt
                    className="tabular-nums leading-none"
                    style={{ fontFamily: HEADING, fontSize: '2.6rem', fontWeight: 700, color: '#6E5A2E' }}
                  >
                    {stat.n}
                  </dt>
                  <dd
                    className="mt-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em]"
                    style={{ fontFamily: HEADING, color: 'rgba(23,25,24,0.55)' }}
                  >
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </ScrollReveal>

          <ScrollReveal delay={260}>
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              <Link
                href="/about"
                className="rounded-full px-7 py-3.5 text-[0.75rem] font-semibold uppercase tracking-[0.14em] transition-transform duration-200 hover:scale-[1.03]"
                style={{ fontFamily: HEADING, background: BLACK, color: BONE }}
              >
                About me
              </Link>
              <a
                href="https://crosswalktn.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border px-7 py-3.5 text-[0.75rem] font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-white"
                style={{
                  fontFamily: HEADING,
                  borderColor: 'color-mix(in srgb, var(--awd-accent-2) 55%, transparent)',
                  color: GRAPHITE,
                }}
              >
                Crosswalk Church
                <ArrowRight size={13} className="-rotate-45 transition-transform duration-300 group-hover:translate-x-0.5" />
              </a>
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
          style={{ background: 'linear-gradient(90deg, rgba(23,25,24,0.12) 0%, rgba(23,25,24,0.3) 26%, rgba(23,25,24,0.88) 50%, #171918 66%)' }} />
        {/* mobile: no room to split, so bottom-up */}
        <span aria-hidden className="absolute inset-0 lg:hidden"
          style={{ background: 'linear-gradient(0deg,#171918 0%,rgba(23,25,24,0.9) 42%,rgba(23,25,24,0.45) 78%,rgba(23,25,24,0.25) 100%)' }} />
        <CornerBracket position="tl" tone="accent" />

        {/* A wider container than the rest of the page so the type sits further
            right, closer to the edge, away from the figure on the left. */}
        <div className="relative mx-auto max-w-[1400px] px-6 py-28 lg:px-10 lg:py-40">
          <div className="lg:ml-auto lg:max-w-xl">
            <ScrollReveal><Eyebrow>What I am after</Eyebrow></ScrollReveal>
            <ScrollReveal delay={90}>
              <Heading className="mt-6" size="lg" accent="hardest questions.">
                The Bible can handle your
              </Heading>
            </ScrollReveal>
            <ScrollReveal delay={150}>
              <p className="mt-8 max-w-lg text-[1.05rem] leading-[1.9]"
                style={{ fontFamily: 'var(--font-source-serif)', color: 'rgba(238,234,225,0.8)' }}>
                My aim is simple: help you read Scripture carefully and understand
                what you find, without pretending the hard parts are easy or the
                easy parts are hard.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={210}>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/about/beliefs"
                  className="rounded-full px-7 py-3.5 text-[0.75rem] font-semibold uppercase tracking-[0.14em] transition-transform duration-200 hover:scale-[1.03]"
                  style={{ fontFamily: HEADING, background: GOLD, color: BLACK }}
                >
                  What I believe
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── The mosaic ─────────────────────────────────────────────────────── */}
      <section style={{ background: BLACK }} className="py-28 lg:py-36">
        <div className="mx-auto max-w-[1180px] px-6 lg:px-10">
          <SectionHead
            eyebrow="No paywall, no sign-up"
            title="Every sermon, study, and article."
            accent="Free, in full."
            intro="Most of what you find online is a summary, a clip, or a teaser for something you have to buy. This is the whole thing: complete sermon texts, full teaching series you can work through start to finish, and papers with the footnotes left in."
          />
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            <ScrollReveal>
              <Tile href="/sermons" tag="Sunday preaching" title="Sermons" image={art.sermons}
                count={`${allSermons.length}`}
                blurb="What I preached at Crosswalk, written out in full so you can read it instead of hunting for a timestamp." />
            </ScrollReveal>
            <ScrollReveal delay={70}>
              <Tile href="/teaching" tag="Verse by verse" title="Teaching Series" image={art.teaching}
                count={`${TEACHING_SERIES.length}`}
                blurb="Book studies and biblical theology built to be worked through in order, from Hebrews to the Minor Prophets." />
            </ScrollReveal>
            <ScrollReveal delay={140}>
              <Tile href="/word-for-word" tag="Because truth matters" title="Word for Word" image={art.wfw}
                count={`${allWfw.length}`}
                blurb="Straight answers to the questions people actually ask, worked out from the text rather than from received opinion." />
            </ScrollReveal>
            <ScrollReveal delay={210}>
              <Tile href="/exegetica" tag="For the deep end" title="Exegetica" image={art.exegetica}
                count={`${allExegetica.length}`}
                blurb="Longer scholarly papers with the Greek and Hebrew left in, for when the short answer is not enough." />
            </ScrollReveal>
            <ScrollReveal delay={280}>
              <Tile href="/forum-and-pulpit" tag="Culture and comment" title="Forum & Pulpit" image={art.forum}
                count={`${allForum.length}`}
                blurb="What Scripture has to say about what is actually happening right now, written without flinching." />
            </ScrollReveal>
            <ScrollReveal delay={350}>
              <Tile href="/library" tag="Books worth your time" title="The Library"
                image="/book-covers/knowing-god.webp" count="793"
                blurb="Every book I recommend, sorted and rated, so you can spend your reading time on the ones that repay it." />
            </ScrollReveal>
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
        <span aria-hidden className="absolute inset-0" style={{ background: 'rgba(23,25,24,0.7)' }} />
        <span
          aria-hidden
          className="absolute inset-0"
          style={{ background: 'linear-gradient(0deg,#171918 0%,transparent 45%,transparent 55%,#171918 100%)' }}
        />
        <CornerBracket position="tl" tone="accent" />
        <CornerBracket position="br" tone="accent" />
        <div className="relative mx-auto max-w-[1180px] px-6 py-28 text-center lg:px-10 lg:py-36">
          <ScrollReveal>
            <p
              className="mx-auto max-w-2xl text-[1.35rem] leading-[1.6] sm:text-[1.6rem]"
              style={{ fontFamily: 'var(--font-source-serif)', fontStyle: 'italic', color: BONE }}
            >
              &ldquo;So faith comes from hearing, and hearing through the word of Christ.&rdquo;
            </p>
          </ScrollReveal>
          <ScrollReveal delay={90}>
            <p
              className="mt-6 text-[0.7rem] font-semibold uppercase tracking-[0.24em]"
              style={{ fontFamily: HEADING, color: 'var(--awd-accent-2)' }}
            >
              Romans 10:17
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Recent sermons (graphite) ──────────────────────────────────────── */}
      {recentSermons.length > 0 && (
        <section style={{ background: GRAPHITE }} className="py-28 lg:py-36">
          <div className="mx-auto max-w-[1180px] px-6 lg:px-10">
            <SectionHead eyebrow="Keep listening" title="More from" accent="the pulpit."
              href="/sermons" linkLabel="All sermons" count={allSermons.length} />
            <div className="grid gap-8 sm:grid-cols-3">
              {recentSermons.map((piece, i) => (
                <ScrollReveal key={piece.href} delay={i * 80}>
                  <Link href={piece.href} className="group block">
                    <div className="relative overflow-hidden" style={{ aspectRatio: '16/9', background: BLACK }}>
                      {piece.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={piece.image} alt="" loading="lazy"
                          className="h-full w-full object-cover grayscale transition-all duration-[900ms] ease-out group-hover:grayscale-0" />
                      )}
                      <CornerBracket position="tr" />
                    </div>
                    <Heading as="h3" size="sm" className="mt-5 transition-colors group-hover:text-[var(--awd-gold)]">
                      {piece.title}
                    </Heading>
                    <p className="mt-2 text-[0.72rem] uppercase tracking-[0.12em]"
                      style={{ fontFamily: HEADING, color: 'var(--awd-accent-2)' }}>
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
        <section style={{ background: BLACK }} className="py-28 lg:py-36">
          <div className="mx-auto max-w-[1180px] px-6 lg:px-10">
            <SectionHead eyebrow="Questions people actually ask" title="You have probably wondered"
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
        <span aria-hidden className="absolute inset-0" style={{ background: 'rgba(23,25,24,0.86)' }} />
        <span
          aria-hidden
          className="absolute inset-0 opacity-[0.25] mix-blend-soft-light"
          style={{ background: 'var(--awd-accent-2)' }}
        />
        <div className="relative mx-auto max-w-[1180px] px-6 py-24 lg:px-10 lg:py-32">
          <ScrollReveal>
            <div
              className="relative border p-8 backdrop-blur-md lg:p-12"
              style={{ borderColor: 'color-mix(in srgb, var(--awd-accent-2) 40%, transparent)', background: 'rgba(238,234,225,0.05)' }}
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
                    style={{ fontFamily: 'var(--font-source-serif)', color: 'rgba(238,234,225,0.68)' }}>
                    A single sermon helps. A book worked through end to end
                    changes how you read everything else.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { href: '/teaching', label: 'Browse series' },
                    { href: '/library', label: 'Library' },
                    { href: '/sermons/scripture-index', label: 'By Scripture' },
                    { href: '/about', label: 'About' },
                  ].map(l => (
                    <Link key={l.href} href={l.href}
                      className="group inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] backdrop-blur transition-colors hover:bg-white/10"
                      style={{ fontFamily: HEADING, borderColor: 'rgba(238,234,225,0.2)', color: 'rgba(238,234,225,0.85)' }}>
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
