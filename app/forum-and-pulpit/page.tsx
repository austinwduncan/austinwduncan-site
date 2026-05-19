import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getAll, sortByDate, formatDate, readingTime, type ArticleFrontmatter } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Forum & Pulpit — Austin W. Duncan',
  description: 'Essays on the church, culture, and Christian public witness.',
}

export default function ForumAndPulpitPage() {
  const raw = sortByDate(getAll<ArticleFrontmatter>('forum-and-pulpit'))
  const [hero, ...rest] = raw

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

      {/* ── Hero essay ─────────────────────────────────────────────────────── */}
      {hero && (
        <div style={{ background: '#141210' }}>
          <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-14 lg:py-16">
            <div
              className="flex items-center gap-2.5 text-[0.63rem] font-medium tracking-[0.12em] uppercase mb-8"
              style={{ color: '#7A5C1E' }}
            >
              Most Recent
              <span className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            </div>

            <Link
              href={`/forum-and-pulpit/${hero.slug}`}
              className="group flex flex-col lg:flex-row-reverse gap-10 lg:gap-14 items-start"
            >
              {/* Image */}
              {hero.frontmatter.image && (
                <div className="w-full lg:w-[50%] shrink-0 overflow-hidden">
                  <div
                    className="relative w-full overflow-hidden"
                    style={{ aspectRatio: '16 / 10' }}
                  >
                    <Image
                      src={hero.frontmatter.image}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      priority
                    />
                    {/* Vignette */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(to bottom, transparent 60%, rgba(14,12,10,0.6) 100%)',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0 lg:pt-3">
                <div
                  className="text-[0.6rem] font-medium tracking-[0.14em] uppercase mb-4"
                  style={{ color: '#7A5C1E' }}
                >
                  {formatDate(hero.frontmatter.date)}
                </div>

                <h2
                  className="leading-[1.1] tracking-tight mb-5 transition-colors group-hover:text-[#B8892E]"
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: 'clamp(1.9rem, 3.5vw, 3rem)',
                    fontWeight: 400,
                    color: '#F9F6F0',
                  }}
                >
                  {hero.frontmatter.title}
                </h2>

                {hero.frontmatter.excerpt && (
                  <p
                    className="text-[0.92rem] leading-[1.75] mb-6 line-clamp-4"
                    style={{ fontFamily: 'var(--font-source-serif)', color: 'rgba(249,246,240,0.5)' }}
                  >
                    {hero.frontmatter.excerpt}
                  </p>
                )}

                <div className="flex items-center gap-4">
                  <span
                    className="inline-flex items-center gap-1.5 text-[0.73rem] tracking-[0.04em] pb-px border-b transition-colors group-hover:text-[#B8892E] group-hover:border-[#B8892E]"
                    style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.15)' }}
                  >
                    Read essay
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                  <span
                    className="text-[0.63rem] font-medium tracking-[0.08em] uppercase"
                    style={{ color: 'rgba(255,255,255,0.2)' }}
                  >
                    {readingTime(hero.content)} min read
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* ── Archive ────────────────────────────────────────────────────────── */}
      <div style={{ background: '#FAFAF7' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-14 pb-20">
          <div
            className="flex items-center gap-2.5 text-[0.63rem] font-medium tracking-[0.12em] uppercase mb-10"
            style={{ color: '#9A9189' }}
          >
            Archive
            <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map(({ frontmatter: fm, content, slug }) => (
              <Link
                key={slug}
                href={`/forum-and-pulpit/${slug}`}
                className="group flex flex-col"
              >
                {/* Image */}
                <div className="overflow-hidden mb-4" style={{ aspectRatio: '16 / 10' }}>
                  {fm.image ? (
                    <div className="relative w-full h-full overflow-hidden">
                      <Image
                        src={fm.image}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    </div>
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center border"
                      style={{ background: '#F0EDE6', borderColor: '#E2DACE' }}
                    >
                      <span
                        className="text-[0.6rem] font-medium tracking-[0.18em] uppercase"
                        style={{ color: '#B8892E' }}
                      >
                        Forum &amp; Pulpit
                      </span>
                    </div>
                  )}
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 mb-2.5">
                  <span
                    className="text-[0.6rem] font-medium tracking-[0.12em] uppercase"
                    style={{ color: '#B8892E' }}
                  >
                    {formatDate(fm.date)}
                  </span>
                  <span
                    className="inline-block h-[3px] w-[3px] rounded-full shrink-0"
                    style={{ background: '#C8BFA8' }}
                  />
                  <span
                    className="text-[0.6rem] font-medium tracking-[0.08em] uppercase"
                    style={{ color: '#B0A898' }}
                  >
                    {readingTime(content)} min read
                  </span>
                </div>

                {/* Title */}
                <h3
                  className="leading-[1.25] tracking-tight transition-colors group-hover:text-[#7A5C1E]"
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: 'clamp(1.1rem, 1.5vw, 1.35rem)',
                    fontWeight: 500,
                    color: '#1A1714',
                  }}
                >
                  {fm.title}
                </h3>

                {fm.excerpt && (
                  <p
                    className="mt-2 text-[0.85rem] leading-relaxed line-clamp-2"
                    style={{ fontFamily: 'var(--font-source-serif)', color: '#7A6F65' }}
                  >
                    {fm.excerpt}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
