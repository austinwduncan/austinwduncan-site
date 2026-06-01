import type { Metadata } from 'next'
import { getAll, sortByDate, formatDate, readingTime, type ArticleFrontmatter } from '@/lib/content'
import { getArticlesBySection } from '@/sanity/lib/queries'
import { ExegeticaBrowser, type ExegeticaItem, type ExegeticaCollection } from '@/components/exegetica-browser'
import { COLLECTION_DEFS } from '@/lib/exegetica-collections'

export const revalidate = 60

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

export default async function ExegeticaPage() {
  const raw = sortByDate(getAll<ArticleFrontmatter>('exegetica'))
  const sanityArticles = await getArticlesBySection('exegetica')
  const mdxSlugs = new Set(raw.map((a) => a.slug))

  const mdxItems: (ExegeticaItem & { _date: string })[] = raw.map(({ frontmatter: fm, content, slug }) => ({
    slug,
    title: fm.title,
    formattedDate: formatDate(fm.date),
    image: fm.image ?? '',
    abstract: extractAbstract(content),
    readingMinutes: readingTime(content),
    wordCount: content.trim().split(/\s+/).length,
    _date: fm.date,
  }))

  const sanityItems: (ExegeticaItem & { _date: string })[] = sanityArticles
    .filter((a) => !mdxSlugs.has(a.slug))
    .map((a) => ({
      slug: a.slug,
      title: a.title,
      formattedDate: formatDate(a.date),
      image: a.image ?? '',
      abstract: a.excerpt ?? '',
      readingMinutes: 0,
      wordCount: 0,
      _date: a.date,
    }))

  const allItemsWithDate = [...mdxItems, ...sanityItems].sort((a, b) =>
    b._date.localeCompare(a._date)
  )
  // Strip the _date helper before passing to the browser component
  const allItems: ExegeticaItem[] = allItemsWithDate.map(({ _date: _d, ...item }) => item)

  const slugToItem = Object.fromEntries(allItems.map((a) => [a.slug, a]))

  const collections: ExegeticaCollection[] = COLLECTION_DEFS.map((def) => ({
    id: def.id,
    title: def.title,
    subtitle: def.subtitle,
    desc: def.desc,
    items: def.slugs.map((s) => slugToItem[s]).filter(Boolean) as ExegeticaItem[],
  }))

  const avgReadMinutes = Math.round(
    allItems.reduce((sum, a) => sum + a.readingMinutes, 0) / Math.max(allItems.length, 1)
  )
  const totalWords = allItems.reduce((sum, a) => sum + a.wordCount, 0)

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
                src="/images/Logos/Exegetica%20Logo.png"
                alt="Exegetica"
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
                Close readings of biblical texts — grammar, syntax, and literary context in service of faithful interpretation.
              </p>
              <p
                className="text-[0.68rem] font-medium tracking-[0.1em] uppercase"
                style={{ color: 'rgba(255,255,255,0.18)' }}
              >
                {allItems.length} studies
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
      <ExegeticaBrowser
        collections={collections}
        allItems={allItems}
        avgReadMinutes={avgReadMinutes}
        totalWords={totalWords}
      />
    </>
  )
}
