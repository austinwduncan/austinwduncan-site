import { getAll, sortByDate, type SermonFrontmatter } from '@/lib/content'

const BASE = 'https://austinwduncan.com'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function toRssDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toUTCString()
}

export async function GET() {
  const sermons = sortByDate(getAll<SermonFrontmatter>('sermons'))

  const items = sermons
    .map(({ frontmatter: fm, slug }) => `
    <item>
      <title>${escapeXml(fm.title)}</title>
      <link>${BASE}/sermons/${slug}</link>
      <guid isPermaLink="true">${BASE}/sermons/${slug}</guid>
      ${fm.excerpt ? `<description>${escapeXml(fm.excerpt)}</description>` : ''}
      <pubDate>${toRssDate(fm.date)}</pubDate>
      ${fm.series ? `<category>${escapeXml(fm.series)}</category>` : ''}
      ${fm.scripture ? `<category>${escapeXml(fm.scripture)}</category>` : ''}
      ${fm.image ? `<enclosure url="${BASE}${fm.image}" type="image/jpeg" length="0"/>` : ''}
      ${fm.youtube ? `<media:content url="https://www.youtube.com/watch?v=${fm.youtube}" medium="video"/>` : ''}
    </item>`)
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Sermons | Austin W. Duncan</title>
    <link>${BASE}/sermons</link>
    <description>Expository sermons preached verse by verse through books of the Bible.</description>
    <language>en-US</language>
    <copyright>Austin W. Duncan</copyright>
    <atom:link href="${BASE}/sermons/feed" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
