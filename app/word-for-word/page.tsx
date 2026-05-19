import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getAll, sortByDate, formatDate, type ArticleFrontmatter } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Word for Word — Austin W. Duncan',
  description: 'Accessible articles answering common questions about the Christian faith.',
}

export default function WordForWordPage() {
  const articles = sortByDate(getAll<ArticleFrontmatter>('word-for-word'))

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
                Word for Word
              </h1>
            </div>
            <div className="text-right pb-0.5 shrink-0">
              <p
                className="text-[0.92rem] italic leading-relaxed mb-1"
                style={{
                  fontFamily: 'var(--font-source-serif)',
                  color: 'rgba(255,255,255,0.35)',
                  maxWidth: 320,
                }}
              >
                Clear answers to common questions about the Christian faith — written for anyone willing to think carefully.
              </p>
              <p
                className="text-[0.68rem] font-medium tracking-[0.1em] uppercase"
                style={{ color: 'rgba(255,255,255,0.18)' }}
              >
                {articles.length} articles
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

      {/* ── Article list ───────────────────────────────────────────────────── */}
      <div style={{ background: '#FAFAF7' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-12 pb-20">
          <div>
            {articles.map(({ frontmatter: fm, slug }, i) => (
              <div key={slug}>
                <Link
                  href={`/word-for-word/${slug}`}
                  className="group flex flex-col sm:flex-row gap-6 lg:gap-10 py-8 items-start"
                >
                  {/* Thumbnail */}
                  {fm.image && (
                    <div
                      className="w-full sm:w-[120px] shrink-0 overflow-hidden"
                      style={{ aspectRatio: '1/1' }}
                    >
                      <div className="relative w-full h-full overflow-hidden">
                        <Image
                          src={fm.image}
                          alt=""
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          sizes="(min-width: 640px) 120px, 100vw"
                        />
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2.5">
                      {fm.tags?.[0] && (
                        <span
                          className="text-[0.65rem] font-medium tracking-[0.14em] uppercase"
                          style={{ color: '#B8892E' }}
                        >
                          {fm.tags[0]}
                        </span>
                      )}
                      {fm.date && (
                        <>
                          {fm.tags?.[0] && (
                            <span
                              className="inline-block h-[3px] w-[3px] rounded-full"
                              style={{ background: '#C8BFA8' }}
                            />
                          )}
                          <span
                            className="text-[0.68rem]"
                            style={{ color: '#9A9189' }}
                          >
                            {formatDate(fm.date)}
                          </span>
                        </>
                      )}
                    </div>

                    <h2
                      className="leading-[1.25] tracking-tight mb-2.5 transition-colors group-hover:text-[#7A5C1E]"
                      style={{
                        fontFamily: 'var(--font-cormorant)',
                        fontSize: 'clamp(1.2rem, 1.8vw, 1.45rem)',
                        fontWeight: 500,
                        color: '#1A1714',
                      }}
                    >
                      {fm.title}
                    </h2>

                    {fm.excerpt && (
                      <p
                        className="text-[0.88rem] leading-[1.7] line-clamp-2"
                        style={{ fontFamily: 'var(--font-source-serif)', color: '#5A544C' }}
                      >
                        {fm.excerpt}
                      </p>
                    )}
                  </div>
                </Link>

                {i < articles.length - 1 && (
                  <div className="h-px w-full" style={{ background: '#E2DACE' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
