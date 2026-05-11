#!/usr/bin/env node
// Download featured images from Squarespace WordPress export attachments
// and patch the image: field in each corresponding MDX file.

const { DOMParser } = require('@xmldom/xmldom');
const fs   = require('fs');
const path = require('path');

const XML_FILE  = path.join(process.env.HOME, 'Downloads/Squarespace-Wordpress-Export-05-11-2026.xml');
const SITE_DIR  = path.join(process.env.HOME, 'austinwduncan-site');

const SECTION_MAP = [
  { prefix: '/sermons/',         dir: 'content/sermons',          imgDir: 'sermons',         isSermon: true  },
  { prefix: '/word-for-word/',   dir: 'content/word-for-word',    imgDir: 'word-for-word',   isSermon: false },
  { prefix: '/teaching-series/', dir: 'content/teaching',         imgDir: 'teaching',        isSermon: false },
  { prefix: '/exegetica/',       dir: 'content/exegetica',        imgDir: 'exegetica',       isSermon: false },
  { prefix: '/forum-pulpit/',    dir: 'content/forum-and-pulpit', imgDir: 'forum-and-pulpit',isSermon: false },
];

// ── XML helpers ───────────────────────────────────────────────────────────────

const NS = {
  wp:      'http://wordpress.org/export/1.2/',
  content: 'http://purl.org/rss/1.0/modules/content/',
};

function getText(el, localName, ns) {
  const col = ns ? el.getElementsByTagNameNS(ns, localName) : el.getElementsByTagName(localName);
  return col && col.length > 0 ? (col[0].textContent || '').trim() : '';
}

// ── Slug derivation (mirrors migrate.js logic exactly) ───────────────────────

const SQUARESPACE_HASH_RE = /(-[a-zA-Z0-9]{5})+$/;

function titleToSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractSlug(link, prefix, title) {
  let rest = link.slice(prefix.length);
  rest = rest.replace(/\/\d{2}\/\d{2}\/\d{4}$/, '');
  rest = rest.replace(/\/\d{4}\/\d{2}\/\d{2}$/, '');
  let slug = rest.split('/').filter(Boolean)[0] || '';
  if (SQUARESPACE_HASH_RE.test(slug)) {
    slug = titleToSlug(title);
  }
  return slug;
}

// ── Image URL from inline content (fallback) ─────────────────────────────────

function firstCdnImageUrl(html) {
  const m = html.match(/<img[^>]+src="(https?:\/\/[^"]*squarespace-cdn\.com[^"]+)"/i);
  return m ? m[1] : null;
}

// ── Image download ────────────────────────────────────────────────────────────

async function downloadImage(url, destPath) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  const httpsUrl = url.replace(/^http:\/\//, 'https://');
  const resp = await fetch(httpsUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; migration-script/1.0)' },
    redirect: 'follow',
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const buf = await resp.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(buf));
}

// ── MDX frontmatter patch ─────────────────────────────────────────────────────

function patchMdxImage(mdxPath, imagePath) {
  if (!fs.existsSync(mdxPath)) return false;
  const src = fs.readFileSync(mdxPath, 'utf-8');
  // Replace image: "" or image: '' or image: (empty) inside frontmatter
  const patched = src.replace(
    /^(image:\s*)("")?('')?(\s*)$/m,
    `image: "${imagePath}"`
  );
  if (patched === src) {
    // Also try replacing a non-empty image value (idempotent re-run case)
    const rePatched = src.replace(/^(image:\s*)"[^"]*"(\s*)$/m, `image: "${imagePath}"`);
    if (rePatched !== src) {
      fs.writeFileSync(mdxPath, rePatched, 'utf-8');
      return true;
    }
    return false; // already correct or no image field
  }
  fs.writeFileSync(mdxPath, patched, 'utf-8');
  return true;
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
  console.log(`Found ${items.length} items\n`);

  // ── Pass 1: build attachment maps ─────────────────────────────────────────
  const attachmentById    = new Map(); // post_id  → image URL
  const thumbnailByPostId = new Map(); // post_id  → thumbnail attachment post_id

  for (const item of items) {
    const postType = getText(item, 'post_type', NS.wp);
    const postId   = getText(item, 'post_id',   NS.wp);

    if (postType === 'attachment') {
      const attUrl = getText(item, 'attachment_url', NS.wp);
      if (attUrl && (
        attUrl.includes('squarespace-cdn.com') ||
        /\.(jpg|jpeg|png|webp)(\?|$)/i.test(attUrl)
      )) {
        attachmentById.set(postId, attUrl);
      }
    }

    if (postType === 'post') {
      // Scan postmeta for _thumbnail_id
      const metas = Array.from(item.getElementsByTagNameNS(NS.wp, 'postmeta'));
      for (const meta of metas) {
        const key = getText(meta, 'meta_key',   NS.wp);
        const val = getText(meta, 'meta_value', NS.wp);
        if (key === '_thumbnail_id' && val) {
          thumbnailByPostId.set(postId, val);
          break;
        }
      }
    }
  }

  console.log(`Attachment map: ${attachmentById.size} image attachments`);
  console.log(`Thumbnail map:  ${thumbnailByPostId.size} posts with _thumbnail_id\n`);

  // ── Pass 2: process published posts ───────────────────────────────────────
  let downloaded   = 0;
  let alreadyHad   = 0;
  let noImage      = 0;
  let mdxPatched   = 0;

  for (const item of items) {
    const postType = getText(item, 'post_type', NS.wp);
    const status   = getText(item, 'status',    NS.wp);
    if (postType !== 'post' || status !== 'publish') continue;

    const link    = getText(item, 'link');
    const section = SECTION_MAP.find(s => link.startsWith(s.prefix));
    if (!section) continue;

    const postId = getText(item, 'post_id', NS.wp);
    const title  = getText(item, 'title');
    const slug   = extractSlug(link, section.prefix, title);
    if (!slug) continue;

    const label   = `${section.dir}/${slug}`;
    const imgFile = path.join(SITE_DIR, 'public/images', section.imgDir, `${slug}.jpg`);
    const mdxFile = path.join(SITE_DIR, section.dir, `${slug}.mdx`);
    const relPath = `/images/${section.imgDir}/${slug}.jpg`;

    // ── Resolve image URL ──────────────────────────────────────────────────
    let imageUrl = null;

    // Primary: thumbnail attachment lookup
    const thumbAttachId = thumbnailByPostId.get(postId);
    if (thumbAttachId) {
      imageUrl = attachmentById.get(thumbAttachId) || null;
    }

    // Fallback: first CDN <img> in body
    if (!imageUrl) {
      const body = getText(item, 'encoded', NS.content);
      imageUrl = firstCdnImageUrl(body);
    }

    if (!imageUrl) {
      console.log(`  [NO IMAGE]  ${label}`);
      noImage++;
      continue;
    }

    // ── Download (skip if already exists) ─────────────────────────────────
    if (fs.existsSync(imgFile)) {
      console.log(`  [SKIP]      ${label}  (already downloaded)`);
      alreadyHad++;
      // Still patch MDX if it's currently empty
      if (patchMdxImage(mdxFile, relPath)) mdxPatched++;
      continue;
    }

    try {
      process.stdout.write(`  [DOWNLOAD]  ${label}… `);
      await downloadImage(imageUrl, imgFile);
      console.log('✓');
      downloaded++;

      if (patchMdxImage(mdxFile, relPath)) {
        mdxPatched++;
      }
    } catch (e) {
      console.log(`✗  ${e.message}`);
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════');
  console.log('  IMAGE DOWNLOAD SUMMARY');
  console.log('════════════════════════════════');
  console.log(`  Downloaded:            ${downloaded}`);
  console.log(`  Already existed:       ${alreadyHad}`);
  console.log(`  MDX files patched:     ${mdxPatched}`);
  console.log(`  Posts with no image:   ${noImage}`);
  console.log('════════════════════════════════\n');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
