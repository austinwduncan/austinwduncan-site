import type { MetadataRoute } from 'next'
import { SITE_URL, absolute } from '@/lib/seo'

/*
  robots.txt.

  Everything public is open. What is closed is closed because it is not a page:
  the Sanity Studio, the JSON endpoints the client calls, and a diagnostic
  route left behind during the Library rebuild. Blocking those keeps them out
  of the index without any of them becoming unreachable.

  Nothing here is a security boundary. A disallow is a request, honoured by the
  crawlers that choose to and ignored by everything else.
*/

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        // Sanity Studio, the admin surface.
        '/studio',
        '/studio/',
        // API routes. Data for the pages, never pages themselves.
        '/api/',
      ],
    },
    sitemap: absolute('/sitemap.xml'),
    host: SITE_URL,
  }
}
