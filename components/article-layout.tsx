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
        <div className="w-full h-[45vh] max-h-[520px] min-h-[260px] overflow-hidden bg-zinc-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-zinc-100 py-8">
          <div className="flex items-center justify-between mb-8">
            <Link
              href={sectionHref}
              className="inline-flex items-center gap-1.5 text-[12px] tracking-wide uppercase text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              <ArrowLeft size={12} />
              {section}
            </Link>
            <PrintButton />
          </div>

          <div className="max-w-[68ch]">
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
                {category && scripture && (
                  <span className="text-zinc-300 text-xs">·</span>
                )}
                {scripture && (
                  <span className="text-[12px] text-zinc-500 tracking-wide">{scripture}</span>
                )}
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-zinc-900 mb-5">
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-[12px] text-zinc-400">
              {date && <span>{date}</span>}
              {date && <span className="text-zinc-200">·</span>}
              <span className="inline-flex items-center gap-1">
                <Clock size={11} />
                {readingMinutes} min read
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="py-12 lg:py-16">
          {/* YouTube embed */}
          {youtube && (
            <div className="max-w-[68ch] mb-12">
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
