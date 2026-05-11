import Link from 'next/link'
import { ArrowLeft, Clock } from 'lucide-react'
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
  return (
    <>
      <ReadingProgress />

      {/* Hero image — full bleed */}
      {image && (
        <div className="w-full h-[48vh] max-h-[560px] min-h-[280px] overflow-hidden bg-zinc-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Centered reading column */}
      <div className="mx-auto max-w-2xl px-6 lg:px-8">

        {/* Back nav + Print */}
        <div className="flex items-center justify-between pt-8 pb-10">
          <Link
            href={sectionHref}
            className="inline-flex items-center gap-1.5 text-[12px] tracking-[0.1em] uppercase text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <ArrowLeft size={11} />
            {section}
          </Link>
          <PrintButton />
        </div>

        {/* Article header */}
        <div className="pb-10 border-b border-zinc-100">
          {/* Gold accent bar */}
          <div className="h-[2px] w-8 mb-5" style={{ backgroundColor: '#cdb079' }} />

          {/* Category + scripture */}
          {(category || scripture) && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {category && (
                <span
                  className="text-[11px] font-semibold tracking-[0.14em] uppercase"
                  style={{ color: '#cdb079' }}
                >
                  {category}
                </span>
              )}
              {category && scripture && <span className="text-zinc-300 text-xs">·</span>}
              {scripture && (
                <span className="text-[12px] text-zinc-500 tracking-wide">{scripture}</span>
              )}
            </div>
          )}

          {/* Title */}
          <h1 className="text-[2rem] sm:text-[2.5rem] font-bold leading-[1.1] tracking-tight text-zinc-900">
            {title}
          </h1>

          {/* Date + reading time */}
          <div className="mt-5 flex flex-wrap items-center gap-3 text-[13px] text-zinc-400">
            {date && <span>{date}</span>}
            {date && <span className="text-zinc-200">·</span>}
            <span className="inline-flex items-center gap-1.5">
              <Clock size={12} />
              {readingMinutes} min read
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="pt-10 pb-16 lg:pb-20">

          {/* YouTube embed */}
          {youtube && (
            <div className="mb-10">
              <div className="aspect-video w-full bg-zinc-950">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${youtube}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={title}
                />
              </div>
            </div>
          )}

          {/* MDX content */}
          <div className="article-prose">{children}</div>

          {/* ESV passage — print only */}
          {esvText && (
            <div className="print-only mt-10 pt-10 border-t border-zinc-200">
              <p
                className="text-[10px] font-semibold tracking-[0.16em] uppercase mb-4"
                style={{ color: '#cdb079' }}
              >
                Scripture Text ({scripture})
              </p>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-700">
                {esvText}
              </pre>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
