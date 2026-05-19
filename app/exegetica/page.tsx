import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getAll, sortByDate, formatDate, readingTime, formatReadingTime, type ArticleFrontmatter } from '@/lib/content'

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
    return text.length > 420 ? text.slice(0, 417) + '…' : text
  }
  const paras = content.split(/\n{2,}/).map((p) => p.trim()).filter((p) => p && !p.startsWith('#'))
  const first = (paras[0] ?? '').replace(/\*\*/g, '').replace(/\*/g, '').trim()
  return first.length > 420 ? first.slice(0, 417) + '…' : first
}

const COLLECTIONS = [
  {
    id: 'hermeneutics',
    title: 'Hermeneutics & Method',
    subtitle: 'Reading Scripture faithfully across the canon',
    slugs: [
      'allegory-versus-typology-the-use-and-misuse-of-scripture-in-patristic-exegesis',
      'canonical-criticism',
      'how-the-new-testament-interprets-the-old-testament',
    ],
  },
  {
    id: 'pauline',
    title: 'Pauline Theology',
    subtitle: 'Law, covenant, and the apostle to the Gentiles',
    slugs: [
      'intertextual-echoes-in-pauls-letters-methodology-and-theological-significance',
      'justification-and-covenant-membership-reevaluating-the-new-perspective-on-paul',
      'the-role-of-the-law-in-pauline-theology',
    ],
  },
  {
    id: 'biblical-theology',
    title: 'Biblical & Covenant Theology',
    subtitle: 'The grand arc of redemptive history',
    slugs: [
      'israel-the-church-and-eschatology-an-examination-of-covenant-continuity-and-discontinuity',
      'the-kingdom-of-god-in-biblical-theology',
      'the-temple-motif-from-genesis-to-revelation-sacred-space-divine-presence-and-eschatological-hope',
      'eschatological-ethics-how-the-biblical-vision-of-the-future-shapes-present-christian-practice',
    ],
  },
  {
    id: 'christology',
    title: 'Christology & Second Temple',
    subtitle: 'Christ in the Hebrew Bible and early Jewish thought',
    slugs: [
      'angelomorphic-christology-early-jewish-backgrounds-and-new-testament-implications',
      'the-divine-council-motif-in-the-hebrew-bible-and-its-influence-on-new-testament-christology',
      'the-son-of-man-in-daniel-7',
      'the-servant-songs-of-isaiah-typology-prophecy-and-christological-fulfillment',
    ],
  },
  {
    id: 'apocalyptic',
    title: 'Apocalyptic Literature',
    subtitle: 'Visions, symbols, and the unveiling of divine purpose',
    slugs: [
      'apocalyptic-imagery-in-ezekiel-and-revelation-shared-symbolism-and-divergent-meanings',
    ],
  },
]

export default function ExegeticaPage() {
  const raw = sortByDate(getAll<ArticleFrontmatter>('exegetica'))
  const total = raw.length
  const [featured] = raw

  const bySlug = Object.fromEntries(raw.map((a) => [a.slug, a]))

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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/Logos/Exegetica%20Logo.png"
                alt="Exegetica"
                style={{ height: 68, width: 'auto', display: 'block' }}
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

      {/* ── Latest Study ────────────────────────────────────────────────────── */}
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
                  className="font-medium"
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
                      {formatReadingTime(mins)} · {words.toLocaleString()} words
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )
      })()}

      {/* ── Collections ─────────────────────────────────────────────────────── */}
      <div style={{ background: '#F0EDE6' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 pt-14 pb-20">

          {COLLECTIONS.map((col, ci) => {
            const articles = col.slugs.map((s) => bySlug[s]).filter(Boolean)
            if (!articles.length) return null

            return (
              <div key={col.id} className={ci > 0 ? 'mt-16 pt-14 border-t' : ''} style={{ borderColor: '#D8D0C4' }}>

                {/* Collection header */}
                <div className="flex items-end gap-4 mb-10">
                  <div>
                    <div
                      className="text-[0.58rem] font-medium tracking-[0.16em] uppercase mb-1.5"
                      style={{ color: '#B8892E' }}
                    >
                      Collection
                    </div>
                    <h2
                      className="leading-tight tracking-tight"
                      style={{
                        fontFamily: 'var(--font-cormorant)',
                        fontSize: 'clamp(1.3rem, 2vw, 1.65rem)',
                        fontWeight: 500,
                        color: '#1A1714',
                      }}
                    >
                      {col.title}
                    </h2>
                  </div>
                  <div className="flex-1 h-px mb-1" style={{ background: '#D8D0C4' }} />
                  <p
                    className="shrink-0 text-[0.63rem] font-medium tracking-[0.08em] italic mb-1 hidden sm:block"
                    style={{ fontFamily: 'var(--font-source-serif)', color: '#9A9189' }}
                  >
                    {col.subtitle}
                  </p>
                </div>

                {/* Article cards with hover abstract overlay */}
                <div className={`grid gap-8 ${articles.length === 1 ? 'lg:grid-cols-1' : articles.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
                  {articles.map(({ frontmatter: fm, content, slug }, i) => {
                    const abstract = extractAbstract(content)
                    const mins = readingTime(content)
                    const studyNum = String(raw.findIndex((a) => a.slug === slug) + 1).padStart(2, '0')

                    return (
                      <Link
                        key={slug}
                        href={`/exegetica/${slug}`}
                        className="group flex flex-col"
                      >
                        {/* 16:10 image with hover abstract overlay */}
                        <div className="relative overflow-hidden mb-4" style={{ aspectRatio: '16/10' }}>
                          {fm.image ? (
                            <Image
                              src={fm.image}
                              alt=""
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
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

                          {/* Abstract hover overlay */}
                          {abstract && (
                            <div
                              className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              style={{
                                background: 'linear-gradient(to top, rgba(14,12,10,0.97) 0%, rgba(14,12,10,0.9) 55%, rgba(14,12,10,0.55) 100%)',
                              }}
                            >
                              <div
                                className="text-[0.55rem] font-medium tracking-[0.14em] uppercase mb-2"
                                style={{ color: '#B8892E' }}
                              >
                                Abstract
                              </div>
                              <p
                                className="text-[0.76rem] leading-[1.65] line-clamp-5"
                                style={{
                                  fontFamily: 'var(--font-source-serif)',
                                  fontStyle: 'italic',
                                  color: 'rgba(249,246,240,0.72)',
                                }}
                              >
                                {abstract}
                              </p>
                              <span
                                className="inline-flex items-center gap-1 mt-3 text-[0.58rem] font-medium tracking-[0.1em] uppercase"
                                style={{ color: '#C9984A' }}
                              >
                                Read study
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Meta + title */}
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className="text-[0.6rem] font-medium tracking-[0.12em] uppercase" style={{ color: '#B8892E' }}>
                            {formatDate(fm.date)}
                          </span>
                          <span className="inline-block h-[3px] w-[3px] rounded-full shrink-0" style={{ background: '#C8BFA8' }} />
                          <span className="text-[0.6rem] font-medium tracking-[0.08em] uppercase" style={{ color: '#B0A898' }}>
                            {formatReadingTime(mins)}
                          </span>
                        </div>

                        <h3
                          className="leading-[1.25] tracking-tight transition-colors group-hover:text-[#7A5C1E]"
                          style={{
                            fontFamily: 'var(--font-cormorant)',
                            fontSize: 'clamp(1.05rem, 1.5vw, 1.3rem)',
                            fontWeight: 500,
                            color: '#1A1714',
                          }}
                        >
                          {fm.title}
                        </h3>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
