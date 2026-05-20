import type { MetadataRoute } from 'next'
import { getAll, getAllTeaching } from '@/lib/content'

interface HasDate { date: string }

const BASE = 'https://austinwduncan.com'

function toLastMod(dateStr?: string): Date {
  if (!dateStr) return new Date()
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

export default function sitemap(): MetadataRoute.Sitemap {
  const wfw          = getAll<HasDate>('word-for-word')
  const exegetica    = getAll<HasDate>('exegetica')
  const sermons      = getAll<HasDate>('sermons')
  const fap          = getAll<HasDate>('forum-and-pulpit')
  const expositional = getAllTeaching<HasDate>('expositional')
  const topical      = getAllTeaching<HasDate>('topical')

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                          priority: 1.0, changeFrequency: 'weekly'  },
    { url: `${BASE}/about`,               priority: 0.8, changeFrequency: 'monthly' },
    { url: `${BASE}/about/beliefs`,       priority: 0.6, changeFrequency: 'monthly' },
    { url: `${BASE}/about/values`,        priority: 0.6, changeFrequency: 'monthly' },
    { url: `${BASE}/about/faq`,           priority: 0.6, changeFrequency: 'monthly' },
    { url: `${BASE}/about/disclosure`,    priority: 0.4, changeFrequency: 'monthly' },
    { url: `${BASE}/sermons`,             priority: 0.9, changeFrequency: 'weekly'  },
    { url: `${BASE}/word-for-word`,       priority: 0.9, changeFrequency: 'weekly'  },
    { url: `${BASE}/exegetica`,           priority: 0.8, changeFrequency: 'monthly' },
    { url: `${BASE}/forum-and-pulpit`,    priority: 0.8, changeFrequency: 'weekly'  },
    { url: `${BASE}/library`,             priority: 0.7, changeFrequency: 'monthly' },
    { url: `${BASE}/teaching`,            priority: 0.7, changeFrequency: 'monthly' },
    { url: `${BASE}/resources`,           priority: 0.6, changeFrequency: 'monthly' },
  ]

  const dynamicRoutes: MetadataRoute.Sitemap = [
    ...wfw.map(({ slug, frontmatter: fm }) => ({
      url: `${BASE}/word-for-word/${slug}`,
      lastModified: toLastMod(fm.date),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...exegetica.map(({ slug, frontmatter: fm }) => ({
      url: `${BASE}/exegetica/${slug}`,
      lastModified: toLastMod(fm.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...sermons.map(({ slug, frontmatter: fm }) => ({
      url: `${BASE}/sermons/${slug}`,
      lastModified: toLastMod(fm.date),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...fap.map(({ slug, frontmatter: fm }) => ({
      url: `${BASE}/forum-and-pulpit/${slug}`,
      lastModified: toLastMod(fm.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...expositional.map(({ slug, frontmatter: fm }) => ({
      url: `${BASE}/teaching/expositional/${slug}`,
      lastModified: toLastMod(fm.date),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...topical.map(({ slug, frontmatter: fm }) => ({
      url: `${BASE}/teaching/topical/${slug}`,
      lastModified: toLastMod(fm.date),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]

  return [...staticRoutes, ...dynamicRoutes]
}
