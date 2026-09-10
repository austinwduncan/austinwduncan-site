import type { MetadataRoute } from 'next'
import { SITE_URL, absolute } from '@/lib/seo'
import { getPublishedSermons } from '@/lib/sermons'
import { getPublishedSeries } from '@/lib/series'
import { topicsFrom } from '@/lib/browse'
import { CATEGORIES, CATEGORY_ORDER, pathFor } from '@/lib/categories'

/*
  The sitemap, read from the database: the standing pages, the five category
  pages, every published piece at its canonical path, every published series,
  and the generated topic pages.

  Dates: a piece carries the day it was preached or published. A page that
  collects pieces carries the newest date of what it collects. Hand written
  pages carry no date, since an absent lastmod is read as unknown and a wrong
  one is read as fact.
*/

type Frequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>

const YEAR_MS = 365 * 24 * 60 * 60 * 1000

function toDate(iso?: string): Date | undefined {
  if (!iso) return undefined
  const d = new Date(iso + 'T12:00:00Z')
  return Number.isNaN(d.getTime()) ? undefined : d
}

function pieceFrequency(lastModified?: Date): Frequency {
  if (!lastModified) return 'yearly'
  return Date.now() - lastModified.getTime() < YEAR_MS ? 'monthly' : 'yearly'
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pieces, series] = await Promise.all([
    getPublishedSermons().catch(() => []),
    getPublishedSeries().catch(() => []),
  ])

  const latest = pieces.map(p => toDate(p.date)).filter((d): d is Date => !!d).sort((a, b) => b.getTime() - a.getTime())[0]

  const undated: { path: string; priority: number; changeFrequency: Frequency }[] = [
    { path: '/about', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/about/beliefs', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/about/values', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/about/faq', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/about/disclosure', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/resources', priority: 0.4, changeFrequency: 'monthly' },
    { path: '/reading', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/greek', priority: 0.4, changeFrequency: 'yearly' },
  ]

  const dated: { path: string; priority: number; changeFrequency: Frequency }[] = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' },
    ...CATEGORY_ORDER.map(key => ({ path: `/${CATEGORIES[key].path}`, priority: 0.8, changeFrequency: 'weekly' as Frequency })),
    { path: '/library/bible', priority: 0.5, changeFrequency: 'weekly' },
    { path: '/library/series', priority: 0.5, changeFrequency: 'weekly' },
    { path: '/library/search', priority: 0.3, changeFrequency: 'weekly' },
  ]

  const urls: MetadataRoute.Sitemap = [
    ...dated.map(hub => ({
      url: absolute(hub.path),
      ...(latest ? { lastModified: latest } : {}),
      changeFrequency: hub.changeFrequency,
      priority: hub.priority,
    })),
    ...undated.map(page => ({
      url: absolute(page.path),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
  ]

  // Pieces. Every canonical href, one per published row.
  for (const p of pieces) {
    const d = toDate(p.date)
    urls.push({
      url: absolute(pathFor(p)),
      ...(d ? { lastModified: d } : {}),
      changeFrequency: pieceFrequency(d),
      priority: 0.6,
    })
  }

  // Series. Dated by the newest piece inside, falling back to the run's end.
  for (const se of series) {
    const inside = pieces
      .filter(p => p.seriesId === se.id || p.seriesSlug === se.slug)
      .map(p => toDate(p.date))
      .filter((d): d is Date => !!d)
      .sort((a, b) => b.getTime() - a.getTime())[0]
    const d = inside ?? toDate(se.endsOn ?? se.startsOn)
    urls.push({
      url: absolute(`/series/${se.slug}`),
      ...(d ? { lastModified: d } : {}),
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  // Topics. Dated by the newest piece that carries the topic.
  for (const t of topicsFrom(pieces)) {
    const d = pieces
      .filter(p => (p.topics ?? []).some(x => x.trim().toLowerCase() === t.label.toLowerCase()))
      .map(p => toDate(p.date))
      .filter((x): x is Date => !!x)
      .sort((a, b) => b.getTime() - a.getTime())[0]
    urls.push({
      url: absolute(`/library/topics/${t.slug}`),
      ...(d ? { lastModified: d } : {}),
      changeFrequency: 'monthly',
      priority: 0.5,
    })
  }

  // A path listed twice is a crawl budget leak. The first entry wins.
  const seen = new Set<string>()
  return urls.filter(entry => {
    if (seen.has(entry.url)) return false
    seen.add(entry.url)
    return entry.url.startsWith(SITE_URL)
  })
}
