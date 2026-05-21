import type { Metadata } from 'next'
import { getAllTeaching, sortByDate, isPublished, formatDate, type TeachingFrontmatter } from '@/lib/content'
import { TEACHING_SERIES } from '@/data/teaching-series'
import TeachingHub, { type SeriesWithSessions, type SessionPreview } from '@/components/teaching-hub'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Teaching Series',
  description:
    'Bible studies, theological series, and word studies designed to help Christians read Scripture carefully and follow its logic.',
}

export default function TeachingPage() {
  // Build session map
  const sessionMap = new Map<string, SessionPreview[]>()
  for (const type of ['expositional', 'topical'] as const) {
    const all = sortByDate(
      getAllTeaching<TeachingFrontmatter>(type).filter((a) => isPublished(a.frontmatter.date))
    )
    for (const { frontmatter: fm, slug } of all) {
      const seriesTag = fm.tags?.[fm.tags.length - 1] ?? ''
      if (!sessionMap.has(seriesTag)) sessionMap.set(seriesTag, [])
      sessionMap.get(seriesTag)!.push({
        slug,
        title: fm.title,
        date: formatDate(fm.date),
        type,
      })
    }
  }

  const allSeries: SeriesWithSessions[] = TEACHING_SERIES.map((meta) => ({
    meta,
    sessions: sessionMap.get(meta.seriesTag) ?? [],
  }))

  return <TeachingHub allSeries={allSeries} />
}
