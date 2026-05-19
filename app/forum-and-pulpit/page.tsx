import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getAll, sortByDate, formatDate, readingTime, type ArticleFrontmatter } from '@/lib/content'
import { FPTicker, type TickerItem } from '@/components/fp-ticker'

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

export default function ForumAndPulpitPage() {
  const raw = sortByDate(getAll<ArticleFrontmatter>('forum-and-pulpit'))
  const [primary, second, third] = raw

  const bySlug = Object.fromEntries(raw.map((a) => [a.slug, a]))

  const tickerItems: TickerItem[] = raw.flatMap((a) => {
    const date = formatDate(a.frontmatter.date)
    const items: TickerItem[] = [{ title: a.frontmatter.title, date, slug: a.slug }]

    // Pull bold statements from content as extra headlines
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

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ background: '#141210' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 pt-14">
          <div
            className="flex items-end justify-between gap-8 pb-10 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <div>
              <div
                className="flex items-center gap-2 text-[0.7rem] font-medium tracking-[0.12em] uppercase mb-3"
                style={{ color: '#B8892E' }}
              >
                <span className="inline-block h-px w-[18px]" style={{ background: '#B8892E' }} />
                Writing
              </div>
              <h1
                className="leading-[1.1] tracking-tight"
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: 'clamp(2.2rem, 3.5vw, 3rem)',
                  fontWeight: 400,
                  color: '#F9F6F0',
                }}
              >
                Forum &amp; Pulpit
              </h1>
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
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-12 lg:py-14">

            {/* Dateline */}
            <div
              className="flex items-center gap-4 pb-4 mb-8 border-b text-[0.6rem] font-medium tracking-[0.14em] uppercase"
              style={{ borderColor: '#E2DACE', color: '#9A9189' }}
            >
              <span style={{ color: '#7A5C1E' }}>Forum &amp; Pulpit</span>
              <span>·</span>
              <span>Christian Public Witness</span>
              <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
              <span>{formatDate(primary.frontmatter.date)}</span>
            </div>

            {/* Two-column newspaper */}
            <div className="flex flex-col lg:flex-row gap-0">

              {/* Primary (left 58%) */}
              <div
                className="flex-1 min-w-0 lg:pr-8 lg:border-r"
                style={{ borderColor: '#E2DACE' }}
              >
                <Link href={`/forum-and-pulpit/${primary.slug}`} className="group block">
                  {primary.frontmatter.image && (
                    <div className="overflow-hidden mb-5" style={{ aspectRatio: '16/10' }}>
                      <div className="relative w-full h-full overflow-hidden">
                        <Image
                          src={primary.frontmatter.image}
                          alt=""
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          sizes="(min-width: 1024px) 58vw, 100vw"
                          priority
                        />
                      </div>
                    </div>
                  )}
                  <div
                    className="text-[0.58rem] font-medium tracking-[0.14em] uppercase mb-3"
                    style={{ color: '#7A5C1E' }}
                  >
                    {formatDate(primary.frontmatter.date)} · {readingTime(primary.content)} min read
                  </div>
                  <h2
                    className="leading-[1.1] tracking-tight mb-5 transition-colors group-hover:text-[#7A5C1E]"
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: 'clamp(1.8rem, 3.2vw, 2.8rem)',
                      fontWeight: 400,
                      color: '#1A1714',
                    }}
                  >
                    {primary.frontmatter.title}
                  </h2>
                  {(() => {
                    const lede = extractLede(primary.content, primary.frontmatter.excerpt ?? '')
                    return lede ? (
                      <p
                        className="text-[0.93rem] leading-[1.8] mb-5"
                        style={{ fontFamily: 'var(--font-source-serif)', color: '#5A544C' }}
                      >
                        {lede}
                      </p>
                    ) : null
                  })()}
                  <span
                    className="inline-flex items-center gap-1.5 text-[0.68rem] tracking-[0.06em] uppercase font-medium transition-colors group-hover:text-[#7A5C1E]"
                    style={{ color: '#B8892E' }}
                  >
                    Read essay
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              </div>

              {/* Secondary stories (right 42%) */}
              <div className="lg:w-[38%] shrink-0 lg:pl-8 mt-8 lg:mt-0 space-y-0">
                {[second, third].filter(Boolean).map((story, i) => story && (
                  <div key={story.slug}>
                    <Link href={`/forum-and-pulpit/${story.slug}`} className="group flex flex-col sm:flex-row lg:flex-col gap-4 py-6">
                      {story.frontmatter.image && (
                        <div className="w-full sm:w-[160px] lg:w-full shrink-0 overflow-hidden" style={{ aspectRatio: '16/10' }}>
                          <div className="relative w-full h-full overflow-hidden">
                            <Image
                              src={story.frontmatter.image}
                              alt=""
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                              sizes="(min-width: 1024px) 38vw, (min-width: 640px) 160px, 100vw"
                              priority
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-[0.58rem] font-medium tracking-[0.12em] uppercase mb-2"
                          style={{ color: '#7A5C1E' }}
                        >
                          {formatDate(story.frontmatter.date)}
                        </div>
                        <h3
                          className="leading-[1.2] tracking-tight mb-2 transition-colors group-hover:text-[#7A5C1E]"
                          style={{
                            fontFamily: 'var(--font-cormorant)',
                            fontSize: 'clamp(1.1rem, 1.6vw, 1.35rem)',
                            fontWeight: 400,
                            color: '#1A1714',
                          }}
                        >
                          {story.frontmatter.title}
                        </h3>
                        {(() => {
                          const lede = extractLede(story.content, story.frontmatter.excerpt ?? '')
                          return lede ? (
                            <p
                              className="text-[0.82rem] leading-relaxed line-clamp-3"
                              style={{ fontFamily: 'var(--font-source-serif)', color: '#7A6F65' }}
                            >
                              {lede}
                            </p>
                          ) : null
                        })()}
                      </div>
                    </Link>
                    {i === 0 && (
                      <div className="h-px" style={{ background: '#E2DACE' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Sticky bottom ticker (fixed, appears on scroll) ───────────────── */}
      <FPTicker items={tickerItems} sticky />

      {/* ── Topic Sections ─────────────────────────────────────────────────── */}
      <div style={{ background: '#FAFAF7' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 pt-14 pb-24">
          <div className="flex gap-10 xl:gap-14 items-start">

            {/* ── Main content ─────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
          {SECTIONS.map((section, si) => {
            const articles = section.slugs
              .map((s) => bySlug[s])
              .filter(Boolean)
            if (!articles.length) return null

            const [lead, ...rest] = articles

            return (
              <div key={section.id} className={si > 0 ? 'mt-16 pt-14 border-t' : ''} style={{ borderColor: '#E2DACE' }}>

                {/* Section header */}
                <div className="flex items-center gap-5 mb-10">
                  <span
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: '0.8rem',
                      fontStyle: 'italic',
                      color: '#C9984A',
                      fontWeight: 500,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {section.number}
                  </span>
                  <div className="h-px flex-none w-6" style={{ background: '#B8892E' }} />
                  <h2
                    className="shrink-0 tracking-tight"
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: 'clamp(1.4rem, 2vw, 1.75rem)',
                      fontWeight: 500,
                      color: '#1A1714',
                    }}
                  >
                    {section.title}
                  </h2>
                  <div className="flex-1 h-px" style={{ background: '#E2DACE' }} />
                  <p
                    className="shrink-0 text-[0.62rem] font-medium tracking-[0.1em] uppercase hidden sm:block"
                    style={{ color: '#B0A898' }}
                  >
                    {section.desc}
                  </p>
                </div>

                {/* Lead article */}
                <div
                  className="flex flex-col lg:flex-row gap-0 pb-10 mb-10 border-b"
                  style={{ borderColor: '#E2DACE' }}
                >
                  {lead.frontmatter.image && (
                    <Link
                      href={`/forum-and-pulpit/${lead.slug}`}
                      className="group w-full lg:w-[50%] shrink-0 overflow-hidden mb-6 lg:mb-0 lg:mr-8"
                    >
                      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/10' }}>
                        <Image
                          src={lead.frontmatter.image}
                          alt=""
                          fill
                          className="object-cover transition-transform duration-600 group-hover:scale-[1.03]"
                          sizes="(min-width: 1024px) 50vw, 100vw"
                        />
                      </div>
                    </Link>
                  )}
                  <div className={lead.frontmatter.image ? 'flex-1 min-w-0' : 'w-full'}>
                    <div
                      className="text-[0.58rem] font-semibold tracking-[0.16em] uppercase mb-3"
                      style={{ color: '#7A5C1E' }}
                    >
                      {section.title.toUpperCase()} · {formatDate(lead.frontmatter.date)}
                    </div>
                    <Link href={`/forum-and-pulpit/${lead.slug}`} className="group block">
                      <h3
                        className="leading-[1.15] tracking-tight mb-4 transition-colors group-hover:text-[#7A5C1E]"
                        style={{
                          fontFamily: 'var(--font-cormorant)',
                          fontSize: lead.frontmatter.image
                            ? 'clamp(1.35rem, 2.2vw, 1.9rem)'
                            : 'clamp(1.7rem, 2.8vw, 2.4rem)',
                          fontWeight: 500,
                          color: '#1A1714',
                        }}
                      >
                        {lead.frontmatter.title}
                      </h3>
                    </Link>
                    {(() => {
                      const lede = extractLede(lead.content, lead.frontmatter.excerpt ?? '')
                      return lede ? (
                        <p
                          className="text-[0.92rem] leading-[1.85] mb-5"
                          style={{ fontFamily: 'var(--font-source-serif)', color: '#5A544C' }}
                        >
                          {lede.slice(0, 480)}{lede.length > 480 ? '…' : ''}
                        </p>
                      ) : null
                    })()}
                    <div className="flex items-center gap-5">
                      <Link
                        href={`/forum-and-pulpit/${lead.slug}`}
                        className="inline-flex items-center gap-1.5 text-[0.68rem] tracking-[0.06em] uppercase font-medium transition-colors hover:text-[#7A5C1E]"
                        style={{ color: '#B8892E' }}
                      >
                        Read essay
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </Link>
                      <span className="text-[0.6rem] font-medium tracking-[0.08em] uppercase" style={{ color: '#C8BFA8' }}>
                        {readingTime(lead.content)} min read
                      </span>
                    </div>
                  </div>
                </div>

                {/* Remaining articles in section */}
                {rest.length > 0 && (
                  <div className={`grid gap-8 ${rest.length === 1 ? 'lg:grid-cols-1' : rest.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
                    {rest.map((article) => {
                      const lede = extractLede(article.content, article.frontmatter.excerpt ?? '')
                      return (
                        <Link
                          key={article.slug}
                          href={`/forum-and-pulpit/${article.slug}`}
                          className="group flex flex-col"
                        >
                          {article.frontmatter.image ? (
                            <div className="overflow-hidden mb-4" style={{ aspectRatio: '16/10' }}>
                              <div className="relative w-full h-full overflow-hidden">
                                <Image
                                  src={article.frontmatter.image}
                                  alt=""
                                  fill
                                  className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                                />
                              </div>
                            </div>
                          ) : (
                            <div
                              className="overflow-hidden mb-4 flex items-center justify-center"
                              style={{ aspectRatio: '16/10', background: '#1A1714' }}
                            >
                              <span className="text-[0.58rem] font-medium tracking-[0.18em] uppercase" style={{ color: '#7A5C1E' }}>
                                Forum &amp; Pulpit
                              </span>
                            </div>
                          )}
                          <div className="text-[0.58rem] font-medium tracking-[0.12em] uppercase mb-2" style={{ color: '#B8892E' }}>
                            {formatDate(article.frontmatter.date)}
                          </div>
                          <h4
                            className="leading-[1.25] tracking-tight mb-3 transition-colors group-hover:text-[#7A5C1E]"
                            style={{
                              fontFamily: 'var(--font-cormorant)',
                              fontSize: 'clamp(1.1rem, 1.5vw, 1.3rem)',
                              fontWeight: 500,
                              color: '#1A1714',
                            }}
                          >
                            {article.frontmatter.title}
                          </h4>
                          {lede && (
                            <p
                              className="text-[0.85rem] leading-[1.75] line-clamp-4"
                              style={{ fontFamily: 'var(--font-source-serif)', color: '#7A6F65' }}
                            >
                              {lede}
                            </p>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
            </div>{/* end main content */}

            {/* ── Sidebar ──────────────────────────────────────────────── */}
            <aside className="hidden lg:block shrink-0 w-[220px] xl:w-[240px]">
              <div className="sticky top-8 space-y-8">

                {/* About */}
                <div>
                  <div
                    className="text-[0.55rem] font-bold tracking-[0.18em] uppercase mb-3 pb-2 border-b"
                    style={{ color: '#B8892E', borderColor: '#E2DACE' }}
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
                    style={{ color: '#B8892E', borderColor: '#E2DACE' }}
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
                            style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, color: '#1A1714' }}
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
                    style={{ color: '#B8892E', borderColor: '#E2DACE' }}
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
                          style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 500, color: '#3A3530' }}
                        >
                          {article.frontmatter.title}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>

              </div>
            </aside>

          </div>{/* end flex */}
        </div>
      </div>
    </>
  )
}
