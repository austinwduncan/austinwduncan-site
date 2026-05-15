import Link from 'next/link'
import { ArrowLeft, Clock, Play } from 'lucide-react'
import ReadingProgress from '@/components/reading-progress'
import PrintButton from '@/components/print-button'

interface Props {
  section: string
  sectionHref: string
  category?: string
  title: string
  date?: string
  scripture?: string
  image?: string
  youtube?: string
  esvText?: string | null
  readingMinutes: number
  children: React.ReactNode
}

const DECO_PATTERN =
  "data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='%23cdb079' stroke-width='0.9'/%3E%3Cpath d='M30 13L47 30L30 47L13 30Z' fill='none' stroke='%23cdb079' stroke-width='0.5'/%3E%3Ccircle cx='30' cy='0' r='1.8' fill='%23cdb079'/%3E%3Ccircle cx='60' cy='30' r='1.8' fill='%23cdb079'/%3E%3Ccircle cx='30' cy='60' r='1.8' fill='%23cdb079'/%3E%3Ccircle cx='0' cy='30' r='1.8' fill='%23cdb079'/%3E%3Ccircle cx='0' cy='0' r='1.2' fill='%23cdb079'/%3E%3Ccircle cx='60' cy='0' r='1.2' fill='%23cdb079'/%3E%3Ccircle cx='60' cy='60' r='1.2' fill='%23cdb079'/%3E%3Ccircle cx='0' cy='60' r='1.2' fill='%23cdb079'/%3E%3Ccircle cx='30' cy='30' r='1.2' fill='%23cdb079'/%3E%3C/svg%3E"

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export default function ArticleLayout({
  section,
  sectionHref,
  category,
  title,
  date,
  scripture,
  youtube,
  esvText,
  readingMinutes,
  children,
}: Props) {
  const formattedDate = formatDate(date)

  return (
    <>
      <ReadingProgress />

      {/* ── Hero — typographic, no image ──────────────────────────────────── */}
      <section className="relative overflow-hidden bg-zinc-950 pb-12 pt-14 text-white">
        {/* Art-deco pattern */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url("${DECO_PATTERN}")`,
            backgroundSize: '60px 60px',
            opacity: 0.14,
          }}
        />
        {/* Radial gold glow — lower-left */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 15% 80%, rgba(205,176,121,0.09) 0%, transparent 55%)',
          }}
        />

        <div className="relative mx-auto max-w-[720px] px-6">
          {/* Series / category label */}
          {category && (
            <p
              className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: '#cdb079' }}
            >
              <span
                className="inline-block h-px w-5"
                style={{ backgroundColor: '#cdb079' }}
              />
              {category}
            </p>
          )}

          {/* Title */}
          <h1
            className="max-w-[600px] leading-[1.08] tracking-tight text-white"
            style={{
              fontFamily: 'var(--font-cormorant), Georgia, serif',
              fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
              fontWeight: 500,
            }}
          >
            {title}
          </h1>

          {/* Meta row */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5 text-[12px] text-white/50">
            {formattedDate && <span>{formattedDate}</span>}
            {formattedDate && scripture && (
              <span className="h-[3px] w-[3px] rounded-full bg-white/25" />
            )}
            {scripture && <span>{scripture}</span>}
            {(formattedDate || scripture) && (
              <span className="h-[3px] w-[3px] rounded-full bg-white/25" />
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock size={11} />
              {readingMinutes} min read
            </span>
          </div>
        </div>
      </section>

      {/* Textured amber strip */}
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

      {/* ── Article column ────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[720px] px-6" style={{ backgroundColor: '#FAFAF7' }}>

        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-6 pt-7">
          <Link
            href={sectionHref}
            className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.1em] text-zinc-400 transition-colors hover:text-zinc-700"
          >
            <ArrowLeft size={11} />
            {section}
          </Link>
          <PrintButton />
        </div>

        {/* MDX content */}
        <div className="article-prose pb-8 pt-10">{children}</div>

        {/* Video — after content */}
        {youtube && (
          <div className="mb-10 overflow-hidden rounded-sm border border-zinc-200">
            <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-3">
              <Play size={13} style={{ color: '#cdb079' }} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                Watch the Message
              </span>
            </div>
            <div className="aspect-video w-full bg-zinc-950">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtube}`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={title}
              />
            </div>
          </div>
        )}

        {/* ESV passage — print only */}
        {esvText && (
          <div className="print-only mt-10 border-t border-zinc-200 pt-10">
            <p
              className="mb-4 text-[10px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: '#cdb079' }}
            >
              Scripture Text ({scripture})
            </p>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-700">
              {esvText}
            </pre>
          </div>
        )}

        <div className="pb-16 lg:pb-20" />
      </div>
    </>
  )
}
