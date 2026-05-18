#!/usr/bin/env node

/**
 * Fetch book covers by scraping publisher websites and Goodreads.
 * Extracts og:image from SSR HTML — no API keys needed.
 *
 * Input:  data/cover-retry-report.json  (reads the "failed" list)
 * Output: public/book-covers/[slug].webp
 *         data/cover-scrape-report.json
 */

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const RETRY_REPORT = path.join(ROOT, "data", "cover-retry-report.json");
const INPUT_FILE = path.join(ROOT, "data", "books-cover-input.json");
const OUTPUT_DIR = path.join(ROOT, "public", "book-covers");
const REPORT_FILE = path.join(ROOT, "data", "cover-scrape-report.json");

const WIDTH = 400;
const HEIGHT = 600;
const DELAY_MS = 600;

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function cleanIsbn(value) {
  return String(value || "").replace(/[^0-9Xx]/g, "").toUpperCase();
}

function extractAsinFromAmazonUrl(url) {
  const text = String(url || "");
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /[?&]asin=([A-Z0-9]{10})/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1]) return m[1].toUpperCase();
  }
  return "";
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function fetchHtml(url) {
  try {
    const res = await fetch(url, { headers: HEADERS, redirect: "follow" });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("html") && !ct.includes("text")) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function fetchBuffer(url) {
  try {
    const res = await fetch(url, { headers: HEADERS, redirect: "follow" });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") || "";
    if (!ct.startsWith("image/")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.length >= 1000 ? buf : null;
  } catch {
    return null;
  }
}

function extractOgImage(html) {
  if (!html) return null;
  // Both attribute orderings
  const m =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  const url = m?.[1];
  if (!url) return null;
  // Skip generic/placeholder images
  const skip = [
    "goodreads_icon", "default", "nocover", "no_cover", "placeholder",
    "og-default", "logo", "icon", "sprite",
  ];
  if (skip.some((s) => url.toLowerCase().includes(s))) return null;
  return url.startsWith("//") ? "https:" + url : url;
}

// Checks if the image looks like an actual book cover (not a tiny icon/logo)
async function validateCoverImage(url) {
  const buf = await fetchBuffer(url);
  if (!buf) return null;
  try {
    const meta = await sharp(buf).metadata();
    // Must be at least 100px wide and taller-than-wide (portrait) or square-ish
    if (meta.width < 100 || meta.height < 80) return null;
    return buf;
  } catch {
    return null;
  }
}

async function tryUrl(pageUrl, sourceLabel) {
  const html = await fetchHtml(pageUrl);
  const imageUrl = extractOgImage(html);
  if (!imageUrl) return null;
  const buffer = await validateCoverImage(imageUrl);
  if (!buffer) return null;
  return { source: sourceLabel, sourceUrl: imageUrl, buffer };
}

// ── Publisher configs ────────────────────────────────────────────────────

const PUBLISHER_STRATEGIES = [
  // ISBN prefix → search URL template
  {
    prefixes: ["9781433"],
    name: "crossway",
    url: (isbn) => `https://www.crossway.org/search/?q=${isbn}`,
  },
  {
    prefixes: ["9780310", "9780718"],
    name: "zondervan",
    url: (isbn) => `https://www.zondervan.com/search?q=${isbn}`,
  },
  {
    prefixes: ["9781629", "9781493", "9781683"],
    name: "lexham",
    url: (isbn) => `https://lexhampress.com/search?q=${isbn}`,
  },
  {
    prefixes: ["9781496"],
    name: "tyndale",
    url: (isbn) => `https://www.tyndale.com/search?q=${isbn}`,
  },
  {
    prefixes: ["9780830"],
    name: "ivp",
    url: (isbn) => `https://www.ivpress.com/search?q=${isbn}`,
  },
  {
    prefixes: ["9780736"],
    name: "harvest-house",
    url: (isbn) => `https://www.harvesthousepublishers.com/search?q=${isbn}`,
  },
  {
    prefixes: ["9781087"],
    name: "bhpublishing",
    url: (isbn) => `https://www.bhpublishinggroup.com/browse/default.aspx?SearchString=${isbn}`,
  },
  {
    prefixes: ["9780764"],
    name: "bethany-house",
    url: (isbn) => `https://www.bethanyhouse.com/search?q=${isbn}`,
  },
  {
    prefixes: ["9781601", "9781642"],
    name: "reformation-heritage",
    url: (isbn) => `https://www.heritagebooks.org/search?q=${isbn}`,
  },
  {
    prefixes: ["9781784", "9781912", "9781913"],
    name: "10ofthose",
    url: (isbn) => `https://www.10ofthose.com/uk/products/search?q=${isbn}`,
  },
  {
    prefixes: ["9781666"],
    name: "wipf-and-stock",
    url: (isbn) => `https://wipfandstock.com/search?q=${isbn}`,
  },
];

function publisherUrlsForBook(book) {
  const isbn13 = cleanIsbn(book.isbn13);
  const prefix = isbn13.slice(0, 7);

  const strategy = PUBLISHER_STRATEGIES.find((s) => s.prefixes.includes(prefix));
  if (!strategy) return [];

  const urls = [];
  if (isbn13) urls.push({ url: strategy.url(isbn13), source: `${strategy.name}-isbn13` });

  const isbn10 = cleanIsbn(book.isbn10);
  const asin = cleanIsbn(book.amazonAsin) || extractAsinFromAmazonUrl(book.amazonAssociatesReferralLink);
  const altId = (isbn10 || asin);
  if (altId && altId !== isbn13) {
    urls.push({ url: strategy.url(altId), source: `${strategy.name}-alt` });
  }

  return urls;
}

// ── Main finder ───────────────────────────────────────────────────────────

async function findCover(book) {
  const isbn13 = cleanIsbn(book.isbn13);
  const isbn10 = cleanIsbn(book.isbn10);
  const asin =
    cleanIsbn(book.amazonAsin) ||
    extractAsinFromAmazonUrl(book.amazonAssociatesReferralLink);

  // 1. Goodreads — SSR, covers nearly everything, og:image → Amazon CDN
  for (const id of [isbn13, asin, isbn10].filter(Boolean)) {
    const result = await tryUrl(
      `https://www.goodreads.com/book/isbn/${encodeURIComponent(id)}`,
      `goodreads-${id === isbn13 ? "isbn13" : id === asin ? "asin" : "isbn10"}`
    );
    if (result) return result;
    await sleep(200);
  }

  // 2. Publisher-specific search pages
  for (const { url, source } of publisherUrlsForBook(book)) {
    const result = await tryUrl(url, source);
    if (result) return result;
    await sleep(200);
  }

  // 3. Barnes & Noble
  for (const id of [isbn13, asin, isbn10].filter(Boolean)) {
    const result = await tryUrl(
      `https://www.barnesandnoble.com/w/?ean=${encodeURIComponent(id)}`,
      `bn-${id === isbn13 ? "isbn13" : id === asin ? "asin" : "isbn10"}`
    );
    if (result) return result;
    await sleep(200);
  }

  // 4. Christianbook.com — covers many niche Christian publishers
  if (isbn13) {
    const result = await tryUrl(
      `https://www.christianbook.com/apps/product?isbn=${encodeURIComponent(isbn13)}`,
      "christianbook-isbn13"
    );
    if (result) return result;
    await sleep(200);
  }

  return null;
}

async function optimizeAndSave(buffer, outputPath) {
  await sharp(buffer)
    .resize({
      width: WIDTH,
      height: HEIGHT,
      fit: "contain",
      background: { r: 245, g: 245, b: 245, alpha: 1 },
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toFile(outputPath);
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Load the failed books from the retry report, cross-referenced with full input data
  const retryReport = JSON.parse(await fs.readFile(RETRY_REPORT, "utf8"));
  const allInput = JSON.parse(await fs.readFile(INPUT_FILE, "utf8"));
  const failedSlugs = new Set(retryReport.failed.map((f) => f.slug));

  // Deduplicate by slug — if slug appears multiple times, take the first occurrence
  const seen = new Set();
  const books = allInput.filter((b) => {
    if (!failedSlugs.has(b.slug) || seen.has(b.slug)) return false;
    seen.add(b.slug);
    return true;
  });

  console.log(`Attempting ${books.length} books...\n`);

  const report = {
    startedAt: new Date().toISOString(),
    total: books.length,
    saved: [],
    skippedExisting: [],
    failed: [],
  };

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const outputPath = path.join(OUTPUT_DIR, `${book.slug}.webp`);
    const publicPath = `/book-covers/${book.slug}.webp`;

    process.stdout.write(`[${i + 1}/${books.length}] ${book.title}... `);

    if (await exists(outputPath)) {
      console.log("already exists");
      report.skippedExisting.push({ slug: book.slug, title: book.title, coverImageLocation: publicPath });
      continue;
    }

    try {
      const cover = await findCover(book);

      if (!cover) {
        console.log("failed");
        report.failed.push({
          slug: book.slug,
          title: book.title,
          author: book.author,
          isbn13: book.isbn13,
          isbn10: book.isbn10,
          amazonAsin: book.amazonAsin,
          reason: "No cover found from Goodreads, publisher sites, B&N, or Christianbook",
        });
        await sleep(DELAY_MS);
        continue;
      }

      await optimizeAndSave(cover.buffer, outputPath);
      console.log(`saved from ${cover.source}`);

      report.saved.push({
        slug: book.slug,
        title: book.title,
        coverImageLocation: publicPath,
        source: cover.source,
        sourceUrl: cover.sourceUrl,
      });
    } catch (error) {
      console.log("error");
      report.failed.push({
        slug: book.slug,
        title: book.title,
        author: book.author,
        isbn13: book.isbn13,
        isbn10: book.isbn10,
        amazonAsin: book.amazonAsin,
        reason: error instanceof Error ? error.message : String(error),
      });
    }

    await sleep(DELAY_MS);
  }

  report.finishedAt = new Date().toISOString();
  await fs.writeFile(REPORT_FILE, JSON.stringify(report, null, 2), "utf8");

  console.log("");
  console.log("Done.");
  console.log(`Saved:            ${report.saved.length}`);
  console.log(`Skipped existing: ${report.skippedExisting.length}`);
  console.log(`Failed:           ${report.failed.length}`);
  console.log(`Report:           ${REPORT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
