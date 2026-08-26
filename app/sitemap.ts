import type { MetadataRoute } from 'next'
import { SITE_URL, absolute, getSitemapData, routeExists, type UrlEntry } from '@/lib/seo'

/*
  The sitemap.

  One rule governs everything here: an entry is only written for a route that
  can be proven to exist. Every generated family is gated on its page file
  being on disk, because the site is being rebuilt by several hands at once and
  a sitemap that advertises a route nobody built is worse than one that is a
  little short.

  Dates come from published_at, the day a piece went out. updated_at is the
  pipeline load timestamp, identical across the whole table, so it would tell
  Google that all 213 pieces changed on the same afternoon. A page that
  collects pieces, a show or a book or a topic, carries the newest date of what
  it collects, which is the honest answer to when it last changed.

  Priority is a hint about relative importance within one site, nothing more.
  The Library hub sits above the shows, the shows above the individual pieces,
  and the generated index pages below them, since a chapter page exists to be
  walked into rather than landed on.
*/

/*
  Deliberately not revalidated.

  With no request-time input this is prerendered once per build and served as a
  static file, which is what makes routeExists() trustworthy: it runs where the
  app/ source tree is on disk. Adding a revalidate window would move some runs
  to a server that may only have the compiled output, where every existence
  check would fail and whole families of real URLs would quietly drop out. The
  cost is that the sitemap refreshes on deploy rather than on the hour.
*/

type Frequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>

const YEAR_MS = 365 * 24 * 60 * 60 * 1000

/*
  A piece is finished writing. What changes is whether it is still near the top
  of the site, so anything from the last year is worth a monthly look and
  everything older is not.
*/
function pieceFrequency(lastModified: Date): Frequency {
  return Date.now() - lastModified.getTime() < YEAR_MS ? 'monthly' : 'yearly'
}

function entries(
  list: UrlEntry[],
  priority: number,
  changeFrequency: Frequency,
): MetadataRoute.Sitemap {
  return list.map(item => ({
    url: absolute(item.path),
    lastModified: item.lastModified,
    changeFrequency,
    priority,
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getSitemapData()
  const { latest } = data

  /*
    Hubs and standing pages.

    The pages under /about, /resources and /greek are hand written and carry no
    date the database knows about, so they are listed without a lastModified
    rather than with a guess. An absent lastmod is read as unknown. A wrong one
    is read as fact.
  */
  const undated: { path: string; priority: number; changeFrequency: Frequency }[] = [
    { path: '/about', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/about/beliefs', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/about/values', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/about/faq', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/about/disclosure', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/resources', priority: 0.4, changeFrequency: 'monthly' },
    { path: '/greek', priority: 0.4, changeFrequency: 'yearly' },
    // The recommended reading list. Books, not teaching, and the only date it
    // has is whenever Austin last added a title, which nothing records.
    { path: '/reading', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/reading/browse', priority: 0.5, changeFrequency: 'monthly' },
  ]

  /*
    Dated hubs. Each one lists teaching, so the newest piece in the library is
    the last time any of them said something new.

    /library and /sermons and the rest all survive from the old architecture on
    purpose. None of these paths moved in the rebuild.
  */
  const datedHubs: { path: string; priority: number; changeFrequency: Frequency }[] = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/library', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/library/browse', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/browse', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/sermons', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/word-for-word', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/exegetica', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/forum-and-pulpit', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/teaching', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/teaching/expositional', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/teaching/topical', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/sermons/scripture-index', priority: 0.5, changeFrequency: 'weekly' },
  ]

  // The Scripture and topic indexes are new. They go in when they are built.
  if (routeExists('scripture/page.tsx')) {
    datedHubs.push({ path: '/scripture', priority: 0.8, changeFrequency: 'weekly' })
  }
  if (routeExists('topics/page.tsx')) {
    datedHubs.push({ path: '/topics', priority: 0.8, changeFrequency: 'weekly' })
  }

  const urls: MetadataRoute.Sitemap = [
    ...datedHubs
      .filter(hub => hub.path === '/' || routeExists(`${hub.path.slice(1)}/page.tsx`))
      .map(hub => ({
        url: absolute(hub.path),
        lastModified: latest,
        changeFrequency: hub.changeFrequency,
        priority: hub.priority,
      })),
    ...undated
      .filter(page => routeExists(`${page.path.slice(1)}/page.tsx`))
      .map(page => ({
        url: absolute(page.path),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      })),
  ]

  /*
    Shows.

    Seasons are deliberately absent. A season is a ?season= view of the show
    page and that page declares the show itself as its canonical URL, so
    listing the season URLs would ask Google to index pages that point away
    from themselves.
  */
  if (routeExists('library/[show]/page.tsx')) {
    urls.push(...entries(data.shows, 0.8, 'weekly'))
  }

  // Pieces. Every canonical href the data layer produces, on its own route.
  urls.push(
    ...data.pieces.map(piece => ({
      url: absolute(piece.path),
      lastModified: piece.lastModified,
      changeFrequency: pieceFrequency(piece.lastModified),
      priority: 0.6,
    })),
  )

  if (routeExists('scripture/[book]/page.tsx')) {
    urls.push(...entries(data.books, 0.5, 'monthly'))
  }
  if (routeExists('scripture/[book]/[chapter]/page.tsx')) {
    urls.push(...entries(data.chapters, 0.4, 'monthly'))
  }
  if (routeExists('topics/[slug]/page.tsx')) {
    urls.push(...entries(data.topics, 0.5, 'monthly'))
  }

  // A path listed twice is a crawl budget leak and an outright error if the two
  // entries disagree. The first entry wins, which is the more important one.
  const seen = new Set<string>()
  return urls.filter(entry => {
    if (seen.has(entry.url)) return false
    seen.add(entry.url)
    return entry.url.startsWith(SITE_URL)
  })
}
