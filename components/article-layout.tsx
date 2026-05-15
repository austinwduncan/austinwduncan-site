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

function HeroMeta({
  category,
  title,
  formattedDate,
  scripture,
  readingMinutes,
}: {
  category?: string
  title: string
  formattedDate: string
  scripture?: string
  readingMinutes: number
}) {
  return (
    <>
      {category && (
        <p
          className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: '#cdb079' }}
        >
          {category}
        </p>
      )}
      <h1 className="max-w-[600px] text-[1.9rem] font-bold leading-[1.1] tracking-tight text-white sm:text-[2.5rem]">
        {title}
      </h1>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-white/55">
        {formattedDate && <span>{formattedDate}</span>}
        {formattedDate && scripture && <span className="text-white/25">·</span>}
        {scripture && <span>{scripture}</span>}
        {(formattedDate || scripture) && <span className="text-white/25">·</span>}
        <span className="inline-flex items-center gap-1.5">
          <Clock size={12} />
          {readingMinutes} min read
        </span>
      </div>
    </>
  )
}

export default function ArticleLayout({
  section,
  sectionHref,
  category,
  title,
  date,
  scripture,
  image,
  youtube,
  esvText,
  readingMinutes,
  children,
}: Props) {
  const formattedDate = formatDate(date)

  return (
    <>
      <ReadingProgress />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      {image ? (
        <div className="relative h-[380px] overflow-hidden bg-zinc-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="h-full w-full object-cover opacity-45" />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(20,18,16,0.1) 0%, rgba(20,18,16,0.3) 40%, rgba(20,18,16,0.88) 100%)',
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-8">
            <HeroMeta
              category={category}
              title={title}
              formattedDate={formattedDate}
              scripture={scripture}
              readingMinutes={readingMinutes}
            />
          </div>
        </div>
      ) : (
        <div className="bg-zinc-950 py-14 text-white">
          <div className="mx-auto max-w-[720px] px-6">
            <HeroMeta
              category={category}
              title={title}
              formattedDate={formattedDate}
              scripture={scripture}
              readingMinutes={readingMinutes}
            />
          </div>
        </div>
      )}

      {/* Textured amber strip */}
      <div
        className="relative h-[14px] w-full"
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

        {/* ── Video — after content ────────────────────────────────────────── */}
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
