import { getAll, sortByDate, type ArticleFrontmatter } from '@/lib/content'

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
  const articles = sortByDate(getAll<ArticleFrontmatter>('word-for-word'))

  const items = articles
    .map(({ frontmatter: fm, slug }) => `
    <item>
      <title>${escapeXml(fm.title)}</title>
      <link>${BASE}/word-for-word/${slug}</link>
      <guid isPermaLink="true">${BASE}/word-for-word/${slug}</guid>
      ${fm.excerpt ? `<description>${escapeXml(fm.excerpt)}</description>` : ''}
      <pubDate>${toRssDate(fm.date)}</pubDate>
      ${fm.tags?.[0] ? `<category>${escapeXml(fm.tags[0])}</category>` : ''}
      ${fm.image ? `<enclosure url="${BASE}${fm.image}" type="image/jpeg" length="0"/>` : ''}
    </item>`)
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Word for Word | Austin W. Duncan</title>
    <link>${BASE}/word-for-word</link>
    <description>Accessible articles answering common questions about the Christian faith.</description>
    <language>en-US</language>
    <copyright>Austin W. Duncan</copyright>
    <atom:link href="${BASE}/word-for-word/feed" rel="self" type="application/rss+xml"/>
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
