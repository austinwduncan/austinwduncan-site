#!/usr/bin/env node
// Squarespace WordPress export → MDX migration script

const { DOMParser } = require('@xmldom/xmldom');
const { NodeHtmlMarkdown } = require('node-html-markdown');
const fs = require('fs');
const path = require('path');

const XML_FILE = path.join(process.env.HOME, 'Downloads/Squarespace-Wordpress-Export-05-11-2026.xml');
const SITE_DIR = path.join(process.env.HOME, 'austinwduncan-site');

const SECTION_MAP = [
  { prefix: '/sermons/',        dir: 'content/sermons',         isSermon: true  },
  { prefix: '/word-for-word/', dir: 'content/word-for-word',  isSermon: false },
  { prefix: '/teaching-series/', dir: 'content/teaching',     isSermon: false },
  { prefix: '/exegetica/',      dir: 'content/exegetica',      isSermon: false },
  { prefix: '/forum-pulpit/',   dir: 'content/forum-and-pulpit', isSermon: false },
];

// ── XML helpers ───────────────────────────────────────────────────────────────

const NS = {
  wp:      'http://wordpress.org/export/1.2/',
  content: 'http://purl.org/rss/1.0/modules/content/',
  excerpt: 'http://wordpress.org/export/1.2/excerpt/',
};

function getText(el, localName, ns) {
  const col = ns
    ? el.getElementsByTagNameNS(ns, localName)
    : el.getElementsByTagName(localName);
  if (!col || col.length === 0) return '';
  return col[0].textContent || '';
}

// ── Content extraction ────────────────────────────────────────────────────────

function titleToSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Squarespace appends random 5-char alphanumeric suffixes to resolve slug
// collisions in nested pages, producing noise like -d8hre, -wjzsz, -ajyaz.
const SQUARESPACE_HASH_RE = /(-[a-zA-Z0-9]{5})+$/;

function extractSlug(link, prefix, title) {
  let rest = link.slice(prefix.length);
  // Strip trailing Squarespace date segments: /MM/DD/YYYY or /YYYY/MM/DD
  rest = rest.replace(/\/\d{2}\/\d{2}\/\d{4}$/, '');
  rest = rest.replace(/\/\d{4}\/\d{2}\/\d{2}$/, '');
  // Take only the first path segment (handles nested paths)
  let slug = rest.split('/').filter(Boolean)[0] || '';
  // If Squarespace appended random hash suffixes, derive slug from title instead
  if (SQUARESPACE_HASH_RE.test(slug)) {
    slug = titleToSlug(title);
  }
  return slug;
}

function extractYouTubeId(html) {
  const m = html.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : '';
}

function extractAudioUrl(html) {
  const m = html.match(/sqs-audio-embed[^>]+data-url="([^"]+)"/);
  return m ? m[1] : '';
}

function extractImageUrls(html) {
  const urls = [];
  // Match <img src="...squarespace-cdn...">
  const re = /<img[^>]+src="(https?:\/\/[^"]*squarespace-cdn\.com[^"]+)"/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    urls.push(m[1]);
  }
  return urls;
}

function stripCdata(text) {
  return text.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
}

function cleanHtml(raw) {
  let h = stripCdata(raw);

  // Remove iframes (YouTube embeds handled via frontmatter)
  h = h.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');

  // Remove sqs-audio-embed blocks entirely
  h = h.replace(/<div[^>]*sqs-audio-embed[^>]*>[\s\S]*?<\/div>/gi, '');

  // Unwrap sticky-video-wrapper / sqs-html-content divs, keeping inner HTML
  h = h.replace(/<div[^>]*(?:sticky-video-wrapper|sqs-html-content)[^>]*>([\s\S]*?)<\/div>/gi, '$1');

  // Strip Squarespace block scaffolding (sections, fluid-engine, fe-block, etc.)
  h = h.replace(/<(?:section|article)[^>]*>/gi, '');
  h = h.replace(/<\/(?:section|article)>/gi, '');

  // Strip style and class attributes
  h = h.replace(/ style="[^"]*"/gi, '');
  h = h.replace(/ class="[^"]*"/gi, '');

  // Strip data-* attributes
  h = h.replace(/ data-[a-z][a-z0-9-]*="[^"]*"/gi, '');

  // Strip target="_blank" etc.
  h = h.replace(/ target="[^"]*"/gi, '');
  h = h.replace(/ rel="[^"]*"/gi, '');

  return h.trim();
}

// ── Image download ────────────────────────────────────────────────────────────

async function downloadImage(url, destPath) {
  // Strip query string for download but use original URL to fetch
  const dir = path.dirname(destPath);
  fs.mkdirSync(dir, { recursive: true });
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; migration-script/1.0)' },
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${url}`);
  const buf = await resp.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(buf));
}

// ── MDX helpers ───────────────────────────────────────────────────────────────

function yamlStr(s) {
  // Escape for YAML double-quoted string
  return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"';
}

function buildFrontmatter(fields, isSermon) {
  const lines = ['---'];
  lines.push(`title: ${yamlStr(fields.title)}`);
  lines.push(`date: ${yamlStr(fields.date)}`);
  lines.push(`excerpt: ${yamlStr(fields.excerpt)}`);
  lines.push(`tags: [${fields.tags.map(t => yamlStr(t)).join(', ')}]`);
  if (isSermon) {
    lines.push(`youtube: ${yamlStr(fields.youtube)}`);
  }
  lines.push(`image: ${yamlStr(fields.image)}`);
  lines.push('---');
  return lines.join('\n');
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Reading XML…');
  const xmlContent = fs.readFileSync(XML_FILE, 'utf-8');

  console.log('Parsing XML…');
  const parser = new DOMParser({
    onError: (level, msg) => { if (level === 'fatalError') throw new Error(msg); },
  });
  const doc = parser.parseFromString(xmlContent, 'text/xml');

  const items = Array.from(doc.getElementsByTagName('item'));
  console.log(`Found ${items.length} items total\n`);

  const nhm = new NodeHtmlMarkdown(
    { useInlineLinks: true, bulletMarker: '-' },
    {},
    {}
  );

  const stats = {
    created: Object.fromEntries(SECTION_MAP.map(s => [s.dir, 0])),
    skipped: 0,
    imagesDownloaded: 0,
    imagesSkipped: 0,
    imagesFailed: 0,
  };

  for (const item of items) {
    // ── Filter: must be published post or page ─────────────────────────────
    const postType = getText(item, 'post_type', NS.wp);
    const status   = getText(item, 'status',    NS.wp);
    if (!['post', 'page'].includes(postType) || status !== 'publish') continue;

    const link = getText(item, 'link');
    const section = SECTION_MAP.find(s => link.startsWith(s.prefix));
    if (!section) continue;

    // ── Extract fields first (slug derivation needs title) ────────────────
    const title      = getText(item, 'title');
    const postDate   = getText(item, 'post_date', NS.wp);
    const date       = postDate ? postDate.split(' ')[0] : '';
    const contentRaw = getText(item, 'encoded', NS.content);
    const excerptRaw = getText(item, 'encoded', NS.excerpt);
    const catEls     = Array.from(item.getElementsByTagName('category'));
    const tags       = [...new Set(catEls.map(el => (el.textContent || '').trim()).filter(Boolean))];
    const youtubeId  = extractYouTubeId(contentRaw);
    const imageUrls  = extractImageUrls(contentRaw);

    const slug = extractSlug(link, section.prefix, title);
    if (!slug) continue;

    // ── Skip if MDX already exists ─────────────────────────────────────────
    const outDir  = path.join(SITE_DIR, section.dir);
    const mdxPath = path.join(outDir, `${slug}.mdx`);
    if (fs.existsSync(mdxPath)) {
      stats.skipped++;
      continue;
    }

    // ── Download first image ───────────────────────────────────────────────
    let imagePath = '';
    if (imageUrls.length > 0) {
      const sectionName = section.dir.replace('content/', '');
      const imgDir      = path.join(SITE_DIR, 'public/images', sectionName);
      const imgFile     = path.join(imgDir, `${slug}.jpg`);
      const imgRelPath  = `/images/${sectionName}/${slug}.jpg`;

      if (fs.existsSync(imgFile)) {
        imagePath = imgRelPath;
        stats.imagesSkipped++;
      } else {
        try {
          process.stdout.write(`  Downloading image for ${slug}… `);
          await downloadImage(imageUrls[0], imgFile);
          imagePath = imgRelPath;
          stats.imagesDownloaded++;
          console.log('✓');
        } catch (e) {
          console.log(`✗ (${e.message})`);
          stats.imagesFailed++;
        }
      }
    }

    // ── Convert excerpt HTML → plain text ─────────────────────────────────
    const excerptMd = excerptRaw
      ? nhm.translate(cleanHtml(excerptRaw)).replace(/\n+/g, ' ').trim()
      : '';

    // ── Convert body HTML → Markdown ───────────────────────────────────────
    const bodyMd = nhm.translate(cleanHtml(contentRaw));

    // ── Write MDX ─────────────────────────────────────────────────────────
    const fm = buildFrontmatter(
      { title, date, excerpt: excerptMd, tags, youtube: youtubeId, image: imagePath },
      section.isSermon
    );

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(mdxPath, `${fm}\n\n${bodyMd}\n`, 'utf-8');

    stats.created[section.dir]++;
    console.log(`Created: ${section.dir}/${slug}.mdx`);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════');
  console.log('  MIGRATION SUMMARY');
  console.log('════════════════════════════════');
  let totalCreated = 0;
  for (const [dir, count] of Object.entries(stats.created)) {
    const label = dir.padEnd(32);
    console.log(`  ${label}  ${count} created`);
    totalCreated += count;
  }
  console.log('────────────────────────────────');
  console.log(`  Total MDX files created:        ${totalCreated}`);
  console.log(`  Already existed (skipped):       ${stats.skipped}`);
  console.log(`  Images downloaded:               ${stats.imagesDownloaded}`);
  console.log(`  Images already cached (skipped): ${stats.imagesSkipped}`);
  console.log(`  Image download failures:         ${stats.imagesFailed}`);
  console.log('════════════════════════════════\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
