import Link from 'next/link'
import Image from 'next/image'
import ReadingProgress from '@/components/reading-progress'
import PrintButton from '@/components/print-button'
import { ExegeticaTOC } from '@/components/exegetica-toc'
import { formatReadingTime, type TocItem } from '@/lib/content'

interface Props {
  studyNum: number
  collectionTitle: string
  title: string
  date?: string
  readingMinutes: number
  wordCount: number
  abstract?: string
  image?: string
  toc?: TocItem[]
  children: React.ReactNode
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  })
}

export default function ExegeticaArticleLayout({
  studyNum,
  collectionTitle,
  title,
  date,
  readingMinutes,
  wordCount,
  abstract,
  image,
  toc,
  children,
}: Props) {
  const hasToc = toc && toc.length > 0
  const formattedDate = formatDate(date)

  return (
    <>
      <ReadingProgress />

      {/* ── Article header ─────────────────────────────────────────────────── */}
      <div style={{ background: '#FAFAF7', borderBottom: '1px solid #E2DACE' }}>
        <div className="mx-auto max-w-[820px] px-6 pt-10 pb-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-7" aria-label="Breadcrumb">
            <Link
              href="/exegetica"
              className="text-[0.58rem] font-black tracking-[0.14em] uppercase transition-colors hover:text-[#7A5C1E]"
              style={{ color: '#B8892E' }}
            >
              Exegetica
            </Link>
            <svg width="5" height="8" viewBox="0 0 5 8" fill="none" aria-hidden>
              <path d="M1 1l3 3-3 3" stroke="#C8BFA8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[0.58rem] font-medium tracking-[0.1em] uppercase" style={{ color: '#9A9189' }}>
              {collectionTitle}
            </span>
          </nav>

          {/* Study number */}
          <div className="flex items-center gap-4 mb-5">
            <span
              style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.05rem', fontStyle: 'italic', color: '#C9984A' }}
            >
              Study {String(studyNum).padStart(2, '0')}
            </span>
            <div className="flex-1 h-px" style={{ background: '#E2DACE' }} />
          </div>

          {/* Title */}
          <h1
            className="leading-[1.08] tracking-tight mb-7"
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(2rem, 4vw, 2.9rem)',
              fontWeight: 500,
              color: '#1A1714',
            }}
          >
            {title}
          </h1>

          {/* Metadata + print */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              {formattedDate && (
                <span className="text-[0.6rem] font-medium tracking-[0.1em] uppercase" style={{ color: '#9A9189' }}>
                  {formattedDate}
                </span>
              )}
              {formattedDate && (
                <span className="inline-block w-px h-3 shrink-0" style={{ background: '#D8D0C4' }} />
              )}
              <span className="text-[0.6rem] font-medium tracking-[0.1em] uppercase" style={{ color: '#9A9189' }}>
                {formatReadingTime(readingMinutes)}
              </span>
              <span className="inline-block w-px h-3 shrink-0" style={{ background: '#D8D0C4' }} />
              <span className="text-[0.6rem] font-medium tracking-[0.1em] uppercase" style={{ color: '#9A9189' }}>
                {wordCount.toLocaleString()} words
              </span>
            </div>
            <PrintButton />
          </div>
        </div>
      </div>

      {/* Thin amber gradient divider */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, #7A5C1E 0%, #B8892E 50%, #7A5C1E 100%)' }} />

      {/* ── Hero image ─────────────────────────────────────────────────────── */}
      {image && (
        <div style={{ background: '#F0EDE6' }}>
          <div className="mx-auto max-w-[820px] px-6 py-8">
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <Image
                src={image}
                alt=""
                fill
                className="object-cover"
                sizes="(min-width: 820px) 820px, 100vw"
                priority
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Body: abstract + content + TOC ─────────────────────────────────── */}
      <div style={{ background: '#FAFAF7' }}>
        <div
          className="mx-auto flex items-start gap-12"
          style={{ maxWidth: hasToc ? 1040 : 820, padding: '0 1.5rem' }}
        >
          <div className="flex-1 min-w-0" style={{ maxWidth: 720 }}>

            {/* Abstract panel */}
            {abstract && (
              <div
                className="mt-9 mb-9 p-6"
                style={{ background: '#F0EDE6', borderLeft: '3px solid #B8892E' }}
              >
                <div
                  className="text-[0.52rem] font-black tracking-[0.22em] uppercase mb-3"
                  style={{ color: '#B8892E' }}
                >
                  Abstract
                </div>
                <p
                  className="text-[0.93rem] leading-[1.9]"
                  style={{ fontFamily: 'var(--font-source-serif)', color: '#5A544C', fontStyle: 'italic' }}
                >
                  {abstract}
                </p>
              </div>
            )}

            {/* MDX content */}
            <div className="article-prose pb-8 pt-2">{children}</div>

            {/* Citation block */}
            <div className="mt-10 pt-8 border-t pb-20" style={{ borderColor: '#E2DACE' }}>
              <div
                className="text-[0.52rem] font-black tracking-[0.22em] uppercase mb-4"
                style={{ color: '#9A9189' }}
              >
                Cite this study
              </div>
              <div
                className="p-4 font-mono text-[0.72rem] leading-[1.8]"
                style={{ background: '#F0EDE6', color: '#5A544C', borderLeft: '2px solid #D8D0C4' }}
              >
                Duncan, Austin W. &ldquo;{title}.&rdquo; <em>Exegetica</em>
                {formattedDate ? `. ${formattedDate}.` : '.'}
              </div>
            </div>
          </div>

          {/* TOC sidebar */}
          {hasToc && <ExegeticaTOC items={toc} />}
        </div>
      </div>
    </>
  )
}
