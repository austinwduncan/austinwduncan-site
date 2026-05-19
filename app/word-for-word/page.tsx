import type { Metadata } from 'next'
import Image from 'next/image'
import { getAll, sortByDate, formatDate, type ArticleFrontmatter } from '@/lib/content'
import { WFWBrowser } from '@/components/wfw-browser'

export const metadata: Metadata = {
  title: 'Word for Word — Austin W. Duncan',
  description: 'Accessible articles answering common questions about the Christian faith.',
}

export default function WordForWordPage() {
  const raw = sortByDate(getAll<ArticleFrontmatter>('word-for-word'))

  const articles = raw.map(({ frontmatter: fm, slug }) => ({
    slug,
    title: fm.title,
    formattedDate: formatDate(fm.date),
    image: fm.image ?? '',
    tags: fm.tags ?? [],
    excerpt: fm.excerpt ?? '',
  }))

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
                src="/images/Logos/word-for-word-logo.webp"
                alt="Word for Word"
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
                Clear answers to common questions about the Christian faith.
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

      {/* ── Interactive browser (client) ───────────────────────────────────── */}
      <WFWBrowser articles={articles} />
    </>
  )
}
