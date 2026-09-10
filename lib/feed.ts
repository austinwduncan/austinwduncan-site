/*
  RSS for one category of the library. Both public feeds (/sermons/feed and
  /word-for-word/feed) render through here so the item shape, the escaping and
  the response headers stay identical.
*/
import { getPublishedByCategory, type Sermon } from "./sermons";
import { CATEGORIES, pathFor, type Category } from "./categories";

const BASE = "https://austinwduncan.com";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRssDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toUTCString();
}

function pieceImage(s: Sermon): string | undefined {
  return (
    s.heroStillUrl ??
    s.artworkUrl ??
    s.seriesArtworkUrl ??
    (s.youtubeId ? `https://i.ytimg.com/vi/${s.youtubeId}/hqdefault.jpg` : undefined)
  );
}

async function load(category: Category): Promise<Sermon[]> {
  try {
    return await getPublishedByCategory(category);
  } catch (err) {
    console.warn(`[${CATEGORIES[category].path}/feed] database read failed, serving an empty feed`, err);
    return [];
  }
}

function renderItem(s: Sermon): string {
  const url = `${BASE}${pathFor(s)}`;
  const description = s.summary || s.description || "";
  const series = s.seriesTitle ?? s.series;
  const image = pieceImage(s);
  return `
    <item>
      <title>${escapeXml(s.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      ${description ? `<description>${escapeXml(description)}</description>` : ""}
      ${s.date ? `<pubDate>${toRssDate(s.date)}</pubDate>` : ""}
      ${series ? `<category>${escapeXml(series)}</category>` : ""}
      ${s.passage ? `<category>${escapeXml(s.passage)}</category>` : ""}
      ${image ? `<enclosure url="${escapeXml(image.startsWith("http") ? image : `${BASE}${image}`)}" type="image/jpeg" length="0"/>` : ""}
      ${s.youtubeId ? `<media:content url="https://www.youtube.com/watch?v=${s.youtubeId}" medium="video"/>` : ""}
    </item>`;
}

/** Render the RSS document for one category, newest first. */
export async function renderCategoryFeed(category: Category): Promise<string> {
  const info = CATEGORIES[category];
  const pieces = (await load(category)).sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  const items = pieces.map(renderItem).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(info.label)}</title>
    <link>${BASE}/${info.path}</link>
    <description>${escapeXml(info.blurb)}</description>
    <language>en-US</language>
    <copyright>Austin W. Duncan</copyright>
    <atom:link href="${BASE}/${info.path}/feed" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;
}

/** The Response a feed route returns. Headers match the original sermons feed. */
export async function categoryFeedResponse(category: Category): Promise<Response> {
  const xml = await renderCategoryFeed(category);
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
