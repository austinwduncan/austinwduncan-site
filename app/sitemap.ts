import type { MetadataRoute } from 'next'
import { getSlugs } from '@/lib/content'

const BASE = 'https://austinwduncan.com'

export default function sitemap(): MetadataRoute.Sitemap {
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
    ...getSlugs('word-for-word').map((slug) => ({
      url: `${BASE}/word-for-word/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...getSlugs('exegetica').map((slug) => ({
      url: `${BASE}/exegetica/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...getSlugs('sermons').map((slug) => ({
      url: `${BASE}/sermons/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...getSlugs('forum-and-pulpit').map((slug) => ({
      url: `${BASE}/forum-and-pulpit/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...getSlugs('teaching/expositional').map((slug) => ({
      url: `${BASE}/teaching/expositional/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...getSlugs('teaching/topical').map((slug) => ({
      url: `${BASE}/teaching/topical/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]

  return [...staticRoutes, ...dynamicRoutes]
}
