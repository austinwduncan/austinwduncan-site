import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getAll, sortByDate, formatDate, readingTime, type ArticleFrontmatter } from '@/lib/content'
import { getArticlesBySection } from '@/sanity/lib/queries'
import { FPTicker, type TickerItem } from '@/components/fp-ticker'
import { FPSectionCarousel, type CarouselSection } from '@/components/fp-section-carousel'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Forum & Pulpit — Austin W. Duncan',
  description: 'Essays on the church, culture, and Christian public witness.',
}

function extractLede(content: string, excerpt: string): string {
  const src = excerpt?.trim() ?? ''
  if (src) {
    return src
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim()
  }
  const paras = content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p && !p.startsWith('#') && !p.startsWith('---'))
  const first = (paras[0] ?? '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^>\s+/, '')
    .trim()
  return first
}

const SECTIONS = [
  {
    id: 'international',
    number: 'I',
    title: 'International Affairs',
    desc: 'War, displacement, and the global witness of the Church',
    slugs: [
      'war-with-iran',
      'october-7th-and-the-war-truth-mercy-and-enemies',
      'ukraine-war-prayer-protection-refuge',
    ],
  },
  {
    id: 'politics',
    number: 'II',
    title: 'Politics & Civic Life',
    desc: "Elections, law, and the Church's role in public life",
    slugs: [
      'chamad-guarding-desire',
      'after-the-vote-unity-truth-and-prayer-for-our-leaders',
      'a-response-to-tragedy',
      'after-dobbs-life-law-and-church-care',
    ],
  },
  {
    id: 'culture',
    number: 'III',
    title: 'Church & Culture',
    desc: 'Christian witness in a shifting cultural moment',
    slugs: ['after-the-opening-supper-how-should-we-respond'],
  },
]

export default async function ForumAndPulpitPage() {
  const mdxRaw = sortByDate(getAll<ArticleFrontmatter>('forum-and-pulpit'))
  const mdxSlugs = new Set(mdxRaw.map((a) => a.slug))
  const sanityArticles = await getArticlesBySection('forum-and-pulpit')
  const sanityMapped = sanityArticles
    .filter((a) => !mdxSlugs.has(a.slug))
    .map((a) => ({
      slug: a.slug,
      content: '',
      frontmatter: {
        title: a.title,
        date: a.date,
        excerpt: a.excerpt ?? '',
        image: a.image ?? undefined,
        category: a.category ?? undefined,
      } as ArticleFrontmatter,
    }))
  const raw = sortByDate([...mdxRaw, ...sanityMapped])
  const [primary] = raw

  const bySlug = Object.fromEntries(raw.map((a) => [a.slug, a]))

  const tickerItems: TickerItem[] = raw.flatMap((a) => {
    const date = formatDate(a.frontmatter.date)
    const items: TickerItem[] = [{ title: a.frontmatter.title, date, slug: a.slug }]

    const boldMatches = [...a.content.matchAll(/\*\*([^*]{25,130})\*\*/g)]
    const boldHeadlines = boldMatches
      .map((m) => m[1].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim())
      .filter((s) =>
        s.length >= 25 &&
        /^[A-Z"]/.test(s) &&
        !/^(summary|abstract|note|read|see also|clear,|answers to|districts|if your)/i.test(s) &&
        !s.startsWith(':') &&
        !s.startsWith('-')
      )
      .slice(0, 2)

    for (const h of boldHeadlines) {
      items.push({ title: h, date, slug: a.slug })
    }

    return items
  })

  // Prepare carousel data server-side (lede extraction, reading time)
  const carouselSections: CarouselSection[] = SECTIONS.map((section) => ({
    id: section.id,
    number: section.number,
    title: section.title,
    desc: section.desc,
    articles: section.slugs
      .map((s) => bySlug[s])
      .filter(Boolean)
      .map((a) => ({
        slug: a.slug,
        title: a.frontmatter.title,
        date: formatDate(a.frontmatter.date),
        image: a.frontmatter.image,
        lede: extractLede(a.content, a.frontmatter.excerpt ?? ''),
        readMins: readingTime(a.content),
      })),
  })).filter((s) => s.articles.length > 0)

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ background: '#141210' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
          <div
            className="flex items-center justify-between gap-8 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.07)', paddingBottom: '2rem', minHeight: 100 }}
          >
            <div className="flex items-center" style={{ height: 84 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/Logos/forum-and-pulpit-logo-white.png"
                alt="Forum & Pulpit"
                style={{ height: 84, width: 'auto', display: 'block' }}
              />
            </div>
            <div className="text-right pb-0.5 shrink-0">
              <p
                className="text-[0.9rem] italic leading-relaxed mb-1 hidden sm:block"
                style={{
                  fontFamily: 'var(--font-source-serif)',
                  color: 'rgba(255,255,255,0.35)',
                  maxWidth: 300,
                }}
              >
                Christian witness in the public square — church, culture, and the moments that demand a response.
              </p>
              <p
                className="text-[0.68rem] font-medium tracking-[0.1em] uppercase"
                style={{ color: 'rgba(255,255,255,0.18)' }}
              >
                {raw.length} essays
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Amber strip ────────────────────────────────────────────────────── */}
      <div
        className="h-[14px] w-full"
        style={{
          backgroundColor: '#7A5C1E',
          backgroundImage: `
            repeating-linear-gradient(60deg, transparent, transparent 6px, rgba(255,255,255,0.07) 6px, rgba(255,255,255,0.07) 7px),
            repeating-linear-gradient(-60deg, transparent, transparent 6px, rgba(255,255,255,0.07) 6px, rgba(255,255,255,0.07) 7px)
          `,
        }}
      />

      {/* ── Breaking news ticker ───────────────────────────────────────────── */}
      <FPTicker items={tickerItems} />

      {/* ── Front Page ─────────────────────────────────────────────────────── */}
      {primary && (
        <div style={{ background: '#FAFAF7', borderBottom: '1px solid #E2DACE' }}>
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-12 lg:py-16">

            {/* Newspaper dateline */}
            <div
              className="flex items-center gap-4 mb-10 pb-4 border-b"
              style={{ borderColor: '#D8D0C4' }}
            >
              <span
                className="text-[0.55rem] font-bold tracking-[0.22em] uppercase"
                style={{ color: '#6E5A2E' }}
              >
                Front Page
              </span>
              <div className="flex-1 h-px" style={{ background: '#D8D0C4' }} />
              <span
                className="text-[0.55rem] font-medium tracking-[0.1em] uppercase"
                style={{ color: '#B0A898' }}
              >
                {raw.length} essays published
              </span>
            </div>

            {/* Primary + secondary grid */}
            <div className="grid lg:grid-cols-[1fr_300px] gap-10 lg:gap-14">

              {/* Primary article */}
              <Link href={`/forum-and-pulpit/${primary.slug}`} className="group">
                {primary.frontmatter.image && (
                  <div className="relative w-full overflow-hidden mb-6" style={{ aspectRatio: '16/9' }}>
                    <Image
                      src={primary.frontmatter.image}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      sizes="(min-width: 1024px) 58vw, 100vw"
                      priority
                    />
                  </div>
                )}
                <div
                  className="text-[0.6rem] font-medium tracking-[0.14em] uppercase mb-3"
                  style={{ color: '#6E5A2E' }}
                >
                  {formatDate(primary.frontmatter.date)}
                </div>
                <h2
                  className="uppercase leading-[0.95] mb-4 transition-colors group-hover:text-[#7A5C1E]"
                  style={{
                    fontFamily: 'var(--font-cmg), system-ui, sans-serif',
                    fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: '#1A1714',
                  }}
                >
                  {primary.frontmatter.title}
                </h2>
                {(() => {
                  const lede = extractLede(primary.content, primary.frontmatter.excerpt ?? '')
                  return lede ? (
                    <p
                      className="text-[0.92rem] leading-[1.8] mb-5"
                      style={{ fontFamily: 'var(--font-source-serif)', color: '#5A544C', maxWidth: 560 }}
                    >
                      {lede.length > 260 ? lede.slice(0, 257) + '…' : lede}
                    </p>
                  ) : null
                })()}
                <span
                  className="inline-flex items-center gap-1.5 text-[0.72rem] tracking-[0.06em] pb-px border-b transition-colors group-hover:text-[#7A5C1E] group-hover:border-[#7A5C1E]"
                  style={{ color: '#9A9189', borderColor: '#E2DACE' }}
                >
                  Read essay
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>

              {/* Secondary articles column */}
              <div className="lg:pl-10 lg:border-l space-y-0" style={{ borderColor: '#E2DACE' }}>
                {raw.slice(1, 4).map((article, i) => (
                  <div key={article.slug}>
                    {i > 0 && (
                      <div className="border-t my-6" style={{ borderColor: '#E2DACE' }} />
                    )}
                    <Link href={`/forum-and-pulpit/${article.slug}`} className="group block">
                      <div
                        className="text-[0.58rem] font-medium tracking-[0.12em] uppercase mb-2"
                        style={{ color: '#6E5A2E' }}
                      >
                        {formatDate(article.frontmatter.date)}
                      </div>
                      <h3
                        className="uppercase leading-[1.15] mb-2 transition-colors group-hover:text-[#7A5C1E]"
                        style={{
                          fontFamily: 'var(--font-cmg), system-ui, sans-serif',
                          fontSize: 'clamp(1.1rem, 1.8vw, 1.35rem)',
                          fontWeight: 700,
                          letterSpacing: '-0.02em',
                          color: '#1A1714',
                        }}
                      >
                        {article.frontmatter.title}
                      </h3>
                      {(() => {
                        const lede = extractLede(article.content, article.frontmatter.excerpt ?? '')
                        return lede ? (
                          <p
                            className="text-[0.8rem] leading-[1.65] line-clamp-3"
                            style={{ fontFamily: 'var(--font-source-serif)', color: '#7A6F65' }}
                          >
                            {lede}
                          </p>
                        ) : null
                      })()}
                    </Link>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Topographic Statement ───────────────────────────────────────────── */}
      <div style={{ position: 'relative', background: '#0D0B09', overflow: 'hidden' }}>

        {/* Topographic contour pattern */}
        <svg
          aria-hidden
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern id="fp-topo" x="0" y="0" width="340" height="260" patternUnits="userSpaceOnUse">
              <ellipse cx="170" cy="130" rx="155" ry="115" fill="none" stroke="#CDB079" strokeWidth="0.6" opacity="0.14"/>
              <ellipse cx="170" cy="130" rx="122" ry="88" fill="none" stroke="#CDB079" strokeWidth="0.5" opacity="0.11"/>
              <ellipse cx="170" cy="130" rx="90" ry="64" fill="none" stroke="#CDB079" strokeWidth="0.5" opacity="0.09"/>
              <ellipse cx="170" cy="130" rx="60" ry="42" fill="none" stroke="#CDB079" strokeWidth="0.4" opacity="0.08"/>
              <ellipse cx="170" cy="130" rx="32" ry="22" fill="none" stroke="#CDB079" strokeWidth="0.4" opacity="0.07"/>
              <ellipse cx="0" cy="0" rx="90" ry="65" fill="none" stroke="#CDB079" strokeWidth="0.5" opacity="0.10"/>
              <ellipse cx="0" cy="0" rx="58" ry="40" fill="none" stroke="#CDB079" strokeWidth="0.4" opacity="0.08"/>
              <ellipse cx="0" cy="0" rx="28" ry="18" fill="none" stroke="#CDB079" strokeWidth="0.4" opacity="0.06"/>
              <ellipse cx="340" cy="260" rx="90" ry="65" fill="none" stroke="#CDB079" strokeWidth="0.5" opacity="0.10"/>
              <ellipse cx="340" cy="260" rx="58" ry="40" fill="none" stroke="#CDB079" strokeWidth="0.4" opacity="0.08"/>
              <ellipse cx="340" cy="0" rx="75" ry="55" fill="none" stroke="#CDB079" strokeWidth="0.4" opacity="0.08"/>
              <ellipse cx="0" cy="260" rx="75" ry="55" fill="none" stroke="#CDB079" strokeWidth="0.4" opacity="0.08"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#fp-topo)"/>
        </svg>

        {/* Radial vignette */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse 90% 100% at 50% 50%, transparent 0%, rgba(13,11,9,0.65) 100%)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-[720px] px-6 lg:px-8 py-16 lg:py-20 text-center">

          {/* Section mark */}
          <div
            className="inline-flex items-center gap-3 mb-8"
          >
            <div className="h-px w-10" style={{ background: '#7A5C1E' }} />
            <span
              className="text-[0.52rem] font-bold tracking-[0.26em] uppercase"
              style={{ color: '#7A5C1E' }}
            >
              Forum &amp; Pulpit
            </span>
            <div className="h-px w-10" style={{ background: '#7A5C1E' }} />
          </div>

          {/* Display quote */}
          <p
            className="uppercase"
            style={{
              fontFamily: 'var(--font-cmg), system-ui, sans-serif',
              fontSize: 'clamp(1.7rem, 3.2vw, 2.5rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'rgba(249,246,240,0.88)',
              lineHeight: 0.95,
            }}
          >
            The church does not step back from the world — it speaks into it.
          </p>

          <p
            className="text-[0.83rem] leading-[1.85] italic mt-6"
            style={{
              fontFamily: 'var(--font-source-serif)',
              color: 'rgba(249,246,240,0.38)',
              maxWidth: 460,
              margin: '1.5rem auto 0',
            }}
          >
            Essays on international affairs, civic life, and cultural witness — from a pastor who believes the pulpit and the public square belong together.
          </p>

          {/* Topics */}
          <div className="flex flex-wrap justify-center gap-2.5 mt-9">
            {SECTIONS.map((s) => (
              <span
                key={s.id}
                className="text-[0.57rem] font-medium tracking-[0.14em] px-3 py-1.5"
                style={{ border: '1px solid rgba(205,176,121,0.22)', color: 'rgba(249,246,240,0.4)' }}
              >
                {s.title}
              </span>
            ))}
          </div>

        </div>
      </div>

      {/* ── Topic Sections (carousel) + Sidebar ────────────────────────────── */}
      <div style={{ background: '#FAFAF7' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 pt-0 pb-24">
          <div className="flex gap-10 xl:gap-14 items-start">

            {/* ── Carousel ─────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              <FPSectionCarousel sections={carouselSections} />
            </div>

            {/* ── Sidebar ──────────────────────────────────────────────── */}
            <aside className="hidden lg:block shrink-0 w-[220px] xl:w-[240px]">
              <div className="sticky top-8 space-y-8 pt-[4.5rem]">

                {/* About */}
                <div>
                  <div
                    className="text-[0.55rem] font-bold tracking-[0.18em] uppercase mb-3 pb-2 border-b"
                    style={{ color: '#6E5A2E', borderColor: '#E2DACE' }}
                  >
                    About This Column
                  </div>
                  <p
                    className="text-[0.78rem] leading-[1.7]"
                    style={{ fontFamily: 'var(--font-source-serif)', fontStyle: 'italic', color: '#7A6F65' }}
                  >
                    Forum &amp; Pulpit is a space for Christian reflection on the moments that demand a response — politics, tragedy, culture, and the life of the church in a disorienting world.
                  </p>
                </div>

                {/* Topics */}
                <div>
                  <div
                    className="text-[0.55rem] font-bold tracking-[0.18em] uppercase mb-3 pb-2 border-b"
                    style={{ color: '#6E5A2E', borderColor: '#E2DACE' }}
                  >
                    Topics
                  </div>
                  <div className="space-y-2.5">
                    {SECTIONS.map((section) => {
                      const count = section.slugs.filter(s => bySlug[s]).length
                      return (
                        <div key={section.id} className="flex items-baseline justify-between gap-3">
                          <span
                            className="text-[0.72rem] leading-snug"
                            style={{ fontFamily: 'var(--font-cmg), system-ui, sans-serif', fontWeight: 600, letterSpacing: '-0.01em', color: '#1A1714' }}
                          >
                            {section.title}
                          </span>
                          <span
                            className="shrink-0 text-[0.58rem] font-medium tracking-[0.06em]"
                            style={{ color: '#B0A898' }}
                          >
                            {count} essay{count !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* All Essays */}
                <div>
                  <div
                    className="text-[0.55rem] font-bold tracking-[0.18em] uppercase mb-3 pb-2 border-b"
                    style={{ color: '#6E5A2E', borderColor: '#E2DACE' }}
                  >
                    All Essays
                  </div>
                  <div className="space-y-3">
                    {raw.map((article) => (
                      <Link
                        key={article.slug}
                        href={`/forum-and-pulpit/${article.slug}`}
                        className="group block"
                      >
                        <div
                          className="text-[0.56rem] font-medium tracking-[0.08em] uppercase mb-0.5 transition-colors group-hover:text-[#7A5C1E]"
                          style={{ color: '#B0A898' }}
                        >
                          {formatDate(article.frontmatter.date)}
                        </div>
                        <p
                          className="text-[0.75rem] leading-snug line-clamp-2 transition-colors group-hover:text-[#7A5C1E]"
                          style={{ fontFamily: 'var(--font-cmg), system-ui, sans-serif', fontWeight: 600, letterSpacing: '-0.01em', color: '#3A3530' }}
                        >
                          {article.frontmatter.title}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>

              </div>
            </aside>

          </div>
        </div>
      </div>

      {/* ── Sticky bottom ticker ───────────────────────────────────────────── */}
      <FPTicker items={tickerItems} sticky />
    </>
  )
}
