#!/usr/bin/env node

/**
 * Retry cover downloads for books that failed in the original run.
 *
 * Adds two sources not in download-book-covers.mjs:
 *   - Open Library search API  (finds a cover_i even when direct ISBN lookup fails)
 *   - bookcover.longitood.com  (free aggregator: Syndetics, Google Books, etc.)
 *
 * Input:  data/books-cover-retry.json
 * Output: public/book-covers/[slug].webp
 *         data/cover-retry-report.json
 */

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const INPUT_FILE = path.join(ROOT, "data", "books-cover-retry.json");
const OUTPUT_DIR = path.join(ROOT, "public", "book-covers");
const REPORT_FILE = path.join(ROOT, "data", "cover-retry-report.json");

const WIDTH = 400;
const HEIGHT = 600;
const DELAY_MS = 350;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanIsbn(value) {
  return String(value || "").replace(/[^0-9Xx]/g, "").toUpperCase();
}

function extractAsinFromAmazonUrl(url) {
  const text = String(url || "");
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /\/product\/([A-Z0-9]{10})/i,
    /\/ASIN\/([A-Z0-9]{10})/i,
    /[?&]asin=([A-Z0-9]{10})/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].toUpperCase();
  }
  return "";
}

function getLookupIds(book) {
  const isbn13 = cleanIsbn(book.isbn13);
  const isbn10 = cleanIsbn(book.isbn10);
  const amazonAsin =
    cleanIsbn(book.amazonAsin) ||
    extractAsinFromAmazonUrl(book.amazonAssociatesReferralLink);

  const ids = [];
  if (isbn13) ids.push({ value: isbn13, label: "isbn13" });
  if (amazonAsin && amazonAsin !== isbn10) {
    ids.push({ value: amazonAsin, label: "amazon-asin" });
  }
  if (isbn10) ids.push({ value: isbn10, label: "isbn10" });

  const seen = new Set();
  return ids.filter((id) => {
    if (!id.value || seen.has(id.value)) return false;
    seen.add(id.value);
    return true;
  });
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "AustinWDuncanBookLibrary/1.0" },
  });
  if (!res.ok) return null;
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) return null;
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 1000) return null;
  return buffer;
}

// ── Original strategies (kept for completeness on a clean retry) ──────────

async function tryOpenLibraryByIsbn(isbn, label) {
  const clean = cleanIsbn(isbn);
  if (!clean) return null;
  for (const size of ["L", "M"]) {
    const url = `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(clean)}-${size}.jpg?default=false`;
    const buffer = await fetchBuffer(url);
    if (buffer) {
      return { source: `open-library-${label}-${size.toLowerCase()}`, sourceUrl: url, buffer };
    }
  }
  return null;
}

async function googleBooksSearch(query) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`;
  const res = await fetch(url, { headers: { "User-Agent": "AustinWDuncanBookLibrary/1.0" } });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data.items) ? data.items : [];
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function itemLooksRelevant(item, book) {
  const volume = item?.volumeInfo || {};
  const fullGoogleTitle = `${normalizeText(volume.title)} ${normalizeText(volume.subtitle)}`.trim();
  const bookTitle = normalizeText(book.title);
  const bookAuthor = normalizeText(book.author);
  const googleAuthors = normalizeText((volume.authors || []).join(" "));

  if (book.__currentLookupMode === "isbn") return true;
  if (!bookTitle || !fullGoogleTitle) return true;

  const titleMatch =
    fullGoogleTitle.includes(bookTitle) ||
    bookTitle.includes(fullGoogleTitle) ||
    bookTitle.split(" ").slice(0, 4).every((w) => fullGoogleTitle.includes(w));

  const authorMatch =
    !bookAuthor ||
    !googleAuthors ||
    bookAuthor.split(" ").some((w) => w.length > 3 && googleAuthors.includes(w));

  return titleMatch && authorMatch;
}

function bestGoogleImageLink(item) {
  const links = item?.volumeInfo?.imageLinks || {};
  const preferred =
    links.extraLarge || links.large || links.medium ||
    links.small || links.thumbnail || links.smallThumbnail;
  if (!preferred) return null;
  let url = preferred.replace(/^http:/, "https:").replace(/zoom=\d/, "zoom=1");
  if (!url.includes("&fife=")) url += url.includes("?") ? "&fife=w800-h1200" : "?fife=w800-h1200";
  return url;
}

async function tryGoogleBooksByQuery(query, sourceLabel, book, lookupMode = "title") {
  book.__currentLookupMode = lookupMode;
  const items = await googleBooksSearch(query);
  for (const item of items) {
    if (!itemLooksRelevant(item, book)) continue;
    const imageUrl = bestGoogleImageLink(item);
    if (!imageUrl) continue;
    const buffer = await fetchBuffer(imageUrl);
    if (!buffer) continue;
    delete book.__currentLookupMode;
    return {
      source: sourceLabel,
      sourceUrl: imageUrl,
      googleTitle: item?.volumeInfo?.title || "",
      googleAuthors: item?.volumeInfo?.authors || [],
      buffer,
    };
  }
  delete book.__currentLookupMode;
  return null;
}

// ── New strategies ────────────────────────────────────────────────────────

async function tryOpenLibrarySearch(isbn, label) {
  const clean = cleanIsbn(isbn);
  if (!clean) return null;

  const searchUrl = `https://openlibrary.org/search.json?isbn=${encodeURIComponent(clean)}&fields=cover_i,key&limit=1`;
  let data;
  try {
    const res = await fetch(searchUrl, {
      headers: { "User-Agent": "AustinWDuncanBookLibrary/1.0" },
    });
    if (!res.ok) return null;
    data = await res.json();
  } catch {
    return null;
  }

  const coverId = data?.docs?.[0]?.cover_i;
  if (!coverId) return null;

  for (const size of ["L", "M"]) {
    const url = `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg?default=false`;
    const buffer = await fetchBuffer(url);
    if (buffer) {
      return { source: `open-library-search-${label}-${size.toLowerCase()}`, sourceUrl: url, buffer };
    }
  }

  return null;
}

async function tryLongitood(isbn, label) {
  const clean = cleanIsbn(isbn);
  if (!clean) return null;

  const url = `https://bookcover.longitood.com/bookcover/${encodeURIComponent(clean)}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "AustinWDuncanBookLibrary/1.0" },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 1000) return null;
    return { source: `longitood-${label}`, sourceUrl: url, buffer };
  } catch {
    return null;
  }
}

// ── Main finder ───────────────────────────────────────────────────────────

async function findCover(book) {
  const ids = getLookupIds(book);

  // 1. Open Library direct (original)
  for (const id of ids) {
    const result = await tryOpenLibraryByIsbn(id.value, id.label);
    if (result) return result;
  }

  // 2. Open Library search API → cover_i (new)
  for (const id of ids) {
    const result = await tryOpenLibrarySearch(id.value, id.label);
    if (result) return result;
  }

  // 3. Google Books by ISBN (original)
  for (const id of ids) {
    const result =
      (await tryGoogleBooksByQuery(`isbn:${id.value}`, `google-books-${id.label}`, book, "isbn")) ||
      (await tryGoogleBooksByQuery(`ISBN ${id.value}`, `google-books-${id.label}-alt`, book, "isbn"));
    if (result) return result;
  }

  // 4. bookcover.longitood.com (new)
  for (const id of ids) {
    const result = await tryLongitood(id.value, id.label);
    if (result) return result;
  }

  // 5. Google Books title/author (original)
  const titleAuthor = [book.title, book.author].filter(Boolean).join(" ");
  if (titleAuthor) {
    const result =
      (await tryGoogleBooksByQuery(`intitle:${book.title} inauthor:${book.author}`, "google-books-title-author-strict", book, "title")) ||
      (await tryGoogleBooksByQuery(titleAuthor, "google-books-title-author", book, "title"));
    if (result) return result;
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

  const raw = await fs.readFile(INPUT_FILE, "utf8");
  const books = JSON.parse(raw);

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
          amazonAsin: book.amazonAsin || extractAsinFromAmazonUrl(book.amazonAssociatesReferralLink),
          reason: "No cover found from any source",
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
        googleTitle: cover.googleTitle || "",
        googleAuthors: cover.googleAuthors || [],
      });
    } catch (error) {
      console.log("error");
      report.failed.push({
        slug: book.slug,
        title: book.title,
        author: book.author,
        isbn13: book.isbn13,
        isbn10: book.isbn10,
        amazonAsin: book.amazonAsin || extractAsinFromAmazonUrl(book.amazonAssociatesReferralLink),
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
