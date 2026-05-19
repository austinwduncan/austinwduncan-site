import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getAll, sortByDate, formatDate, readingTime, type ArticleFrontmatter } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Exegetica — Austin W. Duncan',
  description: 'Scholarly exegetical studies on key biblical texts and themes.',
}

function extractAbstract(content: string): string {
  const m = content.match(/#+\s*Abstract\s*\n+([^\n]+(?:\n(?![#\n])[^\n]+)*)/i)
  if (m) {
    const text = m[1]
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim()
    return text.length > 380 ? text.slice(0, 377) + '…' : text
  }
  const paras = content.split(/\n{2,}/).map((p) => p.trim()).filter((p) => p && !p.startsWith('#'))
  const first = (paras[0] ?? '').replace(/\*\*/g, '').replace(/\*/g, '').trim()
  return first.length > 380 ? first.slice(0, 377) + '…' : first
}

export default function ExegeticaPage() {
  const raw = sortByDate(getAll<ArticleFrontmatter>('exegetica'))
  const total = raw.length
  const [featured, ...rest] = raw

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
                Exegetica
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
                Close readings of biblical texts — grammar, syntax, and literary context in service of faithful interpretation.
              </p>
              <p
                className="text-[0.68rem] font-medium tracking-[0.1em] uppercase"
                style={{ color: 'rgba(255,255,255,0.18)' }}
              >
                {total} studies
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

      {/* ── Featured — Lead Study ───────────────────────────────────────────── */}
      {featured && (() => {
        const abstract = extractAbstract(featured.content)
        const mins = readingTime(featured.content)
        const words = featured.content.trim().split(/\s+/).length
        return (
          <div style={{ background: '#FAFAF7', borderBottom: '1px solid #E2DACE' }}>
            <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-14 lg:py-16">
              <div
                className="flex items-center gap-2.5 text-[0.63rem] font-medium tracking-[0.12em] uppercase mb-8"
                style={{ color: '#9A9189' }}
              >
                <span
                  className="inline-block font-medium"
                  style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.1rem', color: '#C9984A', fontStyle: 'italic' }}
                >
                  Study {String(total).padStart(2, '0')}
                </span>
                <span className="flex-1 h-px" style={{ background: '#E2DACE' }} />
                Latest Study
              </div>

              <Link href={`/exegetica/${featured.slug}`} className="group flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">
                {featured.frontmatter.image && (
                  <div className="w-full lg:w-[52%] shrink-0 overflow-hidden">
                    <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/10' }}>
                      <Image
                        src={featured.frontmatter.image}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        sizes="(min-width: 1024px) 52vw, 100vw"
                        priority
                      />
                    </div>
                  </div>
                )}
                <div className="flex-1 min-w-0 lg:pt-1">
                  <div
                    className="text-[0.63rem] font-medium tracking-[0.14em] uppercase mb-4"
                    style={{ color: '#B8892E' }}
                  >
                    Exegetica · {formatDate(featured.frontmatter.date)}
                  </div>
                  <h2
                    className="leading-[1.15] tracking-tight mb-4 transition-colors group-hover:text-[#7A5C1E]"
                    style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 500, color: '#1A1714' }}
                  >
                    {featured.frontmatter.title}
                  </h2>
                  {abstract && (
                    <>
                      <p
                        className="text-[0.63rem] font-medium tracking-[0.14em] uppercase mb-2"
                        style={{ color: '#9A9189' }}
                      >
                        Abstract
                      </p>
                      <p
                        className="text-[0.93rem] leading-[1.8] mb-5"
                        style={{ fontFamily: 'var(--font-source-serif)', color: '#5A544C' }}
                      >
                        {abstract}
                      </p>
                    </>
                  )}
                  <div className="flex items-center gap-5">
                    <span
                      className="inline-flex items-center gap-1.5 text-[0.73rem] tracking-[0.04em] pb-px border-b transition-colors group-hover:text-[#7A5C1E] group-hover:border-[#7A5C1E]"
                      style={{ color: '#9A9189', borderColor: '#E2DACE' }}
                    >
                      Read study
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                    <span className="text-[0.63rem] font-medium tracking-[0.08em] uppercase" style={{ color: '#C8BFA8' }}>
                      {mins} min · {words.toLocaleString()} words
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )
      })()}

      {/* ── Journal Archive ─────────────────────────────────────────────────── */}
      <div style={{ background: '#F0EDE6' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 py-14 pb-20">
          <div
            className="flex items-center gap-2.5 text-[0.63rem] font-medium tracking-[0.12em] uppercase mb-10"
            style={{ color: '#9A9189' }}
          >
            Studies Archive
            <span className="flex-1 h-px" style={{ background: '#D8D0C4' }} />
          </div>

          {/* Two-column journal entries */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10">
            {rest.map(({ frontmatter: fm, content, slug }, i) => {
              const abstract = extractAbstract(content)
              const mins = readingTime(content)
              const words = content.trim().split(/\s+/).length
              const studyNum = String(total - 1 - i).padStart(2, '0')

              return (
                <Link
                  key={slug}
                  href={`/exegetica/${slug}`}
                  className="group flex flex-col"
                  style={{ background: '#F0EDE6' }}
                >
                  {/* 16:9 image with study number badge */}
                  <div className="relative overflow-hidden mb-4" style={{ aspectRatio: '16/10' }}>
                    {fm.image ? (
                      <Image
                        src={fm.image}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        sizes="(min-width: 1024px) 50vw, 100vw"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: '#1A1714' }}
                      >
                        <span className="text-[0.6rem] font-medium tracking-[0.18em] uppercase" style={{ color: '#7A5C1E' }}>
                          Exegetica
                        </span>
                      </div>
                    )}
                    {/* Study number badge */}
                    <div
                      className="absolute top-3 left-3 px-2 py-1"
                      style={{ background: 'rgba(14,12,10,0.82)', backdropFilter: 'blur(4px)' }}
                    >
                      <span
                        className="text-[0.7rem] font-medium tracking-[0.08em]"
                        style={{ fontFamily: 'var(--font-cormorant)', color: '#C9984A', fontStyle: 'italic' }}
                      >
                        Study {studyNum}
                      </span>
                    </div>
                  </div>

                  {/* Meta + title + abstract */}
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-[0.6rem] font-medium tracking-[0.12em] uppercase" style={{ color: '#B8892E' }}>
                      {formatDate(fm.date)}
                    </span>
                    <span className="inline-block h-[3px] w-[3px] rounded-full shrink-0" style={{ background: '#C8BFA8' }} />
                    <span className="text-[0.6rem] font-medium tracking-[0.08em] uppercase" style={{ color: '#B0A898' }}>
                      {mins} min · {words.toLocaleString()} words
                    </span>
                  </div>

                  <h3
                    className="leading-[1.25] tracking-tight mb-3 transition-colors group-hover:text-[#7A5C1E]"
                    style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.15rem, 1.6vw, 1.4rem)', fontWeight: 500, color: '#1A1714' }}
                  >
                    {fm.title}
                  </h3>

                  {abstract && (
                    <p
                      className="text-[0.84rem] leading-[1.7] line-clamp-3"
                      style={{ fontFamily: 'var(--font-source-serif)', color: '#6A6058' }}
                    >
                      {abstract}
                    </p>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
