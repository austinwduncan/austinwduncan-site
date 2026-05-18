#!/usr/bin/env node

/**
 * Download and optimize book cover images.
 *
 * Usage:
 *   npm install sharp
 *   node scripts/download-book-covers.mjs
 *
 * Expected input:
 *   data/books-cover-input.json
 *
 * Output:
 *   public/book-covers/[slug].webp
 *   data/cover-download-report.json
 *
 * Notes:
 *   This script does NOT scrape Amazon images.
 *   Amazon URLs are used only to extract ASINs/ISBN-10s for better lookup matching.
 */

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const INPUT_FILE = path.join(ROOT, "data", "books-cover-input.json");
const OUTPUT_DIR = path.join(ROOT, "public", "book-covers");
const REPORT_FILE = path.join(ROOT, "data", "cover-download-report.json");

const WIDTH = 400;
const HEIGHT = 600;
const DELAY_MS = 275;

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
    /[?&]asin=([A-Z0-9]{10})/i
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

  // Priority 1: ISBN-13
  if (isbn13) ids.push({ value: isbn13, label: "isbn13" });

  // Priority 2: Amazon ASIN, often the real ISBN-10 from the exact Amazon product page
  if (amazonAsin && amazonAsin !== isbn10) {
    ids.push({ value: amazonAsin, label: "amazon-asin" });
  }

  // Priority 3: Sheet ISBN-10
  if (isbn10) ids.push({ value: isbn10, label: "isbn10" });

  // Deduplicate
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
    headers: {
      "User-Agent": "AustinWDuncanBookLibrary/1.0"
    }
  });

  if (!res.ok) return null;

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) return null;

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.length < 1000) return null;

  return buffer;
}

async function tryOpenLibraryByIsbn(isbn, label) {
  const clean = cleanIsbn(isbn);
  if (!clean) return null;

  // Try large first, then medium. Sometimes one exists while the other doesn't.
  const sizes = ["L", "M"];

  for (const size of sizes) {
    const url = `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(clean)}-${size}.jpg?default=false`;
    const buffer = await fetchBuffer(url);

    if (buffer) {
      return {
        source: `open-library-${label}-${size.toLowerCase()}`,
        sourceUrl: url,
        buffer
      };
    }
  }

  return null;
}

async function googleBooksSearch(query) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "AustinWDuncanBookLibrary/1.0"
    }
  });

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
  const title = normalizeText(volume.title);
  const subtitle = normalizeText(volume.subtitle);
  const fullGoogleTitle = `${title} ${subtitle}`.trim();
  const bookTitle = normalizeText(book.title);
  const bookAuthor = normalizeText(book.author);
  const googleAuthors = normalizeText((volume.authors || []).join(" "));

  // ISBN searches can trust the API more.
  if (book.__currentLookupMode === "isbn") return true;

  if (!bookTitle || !fullGoogleTitle) return true;

  const titleMatch =
    fullGoogleTitle.includes(bookTitle) ||
    bookTitle.includes(fullGoogleTitle) ||
    bookTitle.split(" ").slice(0, 4).every((word) => fullGoogleTitle.includes(word));

  const authorMatch =
    !bookAuthor ||
    !googleAuthors ||
    bookAuthor.split(" ").some((word) => word.length > 3 && googleAuthors.includes(word));

  return titleMatch && authorMatch;
}

function bestGoogleImageLink(item) {
  const links = item?.volumeInfo?.imageLinks || {};
  const preferred =
    links.extraLarge ||
    links.large ||
    links.medium ||
    links.small ||
    links.thumbnail ||
    links.smallThumbnail;

  if (!preferred) return null;

  let url = preferred.replace(/^http:/, "https:");

  // Often gets a cleaner image from Google Books thumbnails.
  url = url.replace(/zoom=\d/, "zoom=1");

  // Ask for a larger thumbnail when Google allows it.
  if (!url.includes("&fife=")) {
    url += url.includes("?") ? "&fife=w800-h1200" : "?fife=w800-h1200";
  }

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
      buffer
    };
  }

  delete book.__currentLookupMode;
  return null;
}

async function findCover(book) {
  const lookupIds = getLookupIds(book);

  // Round 1: Open Library by ISBN-13 first, then Amazon ASIN, then ISBN-10
  for (const id of lookupIds) {
    const result = await tryOpenLibraryByIsbn(id.value, id.label);
    if (result) return result;
  }

  // Round 2: Google Books by exact identifiers
  for (const id of lookupIds) {
    const result =
      await tryGoogleBooksByQuery(`isbn:${id.value}`, `google-books-${id.label}`, book, "isbn") ||
      await tryGoogleBooksByQuery(`ISBN ${id.value}`, `google-books-${id.label}-alt`, book, "isbn");

    if (result) return result;
  }

  // Round 3: Google Books title/author fallback
  const titleAuthor = [book.title, book.author].filter(Boolean).join(" ");
  if (titleAuthor) {
    const result =
      await tryGoogleBooksByQuery(`intitle:${book.title} inauthor:${book.author}`, "google-books-title-author-strict", book, "title") ||
      await tryGoogleBooksByQuery(titleAuthor, "google-books-title-author", book, "title");

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
      withoutEnlargement: true
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
    failed: []
  };

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const outputPath = path.join(OUTPUT_DIR, `${book.slug}.webp`);
    const publicPath = `/book-covers/${book.slug}.webp`;

    process.stdout.write(`[${i + 1}/${books.length}] ${book.title}... `);

    if (await exists(outputPath)) {
      console.log("already exists");
      report.skippedExisting.push({
        slug: book.slug,
        title: book.title,
        coverImageLocation: publicPath
      });
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
          amazonAssociatesReferralLink: book.amazonAssociatesReferralLink,
          reason: "No cover found from Open Library or Google Books"
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
        googleAuthors: cover.googleAuthors || []
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
        amazonAssociatesReferralLink: book.amazonAssociatesReferralLink,
        reason: error instanceof Error ? error.message : String(error)
      });
    }

    await sleep(DELAY_MS);
  }

  report.finishedAt = new Date().toISOString();

  await fs.writeFile(REPORT_FILE, JSON.stringify(report, null, 2), "utf8");

  console.log("");
  console.log(`Done.`);
  console.log(`Saved: ${report.saved.length}`);
  console.log(`Skipped existing: ${report.skippedExisting.length}`);
  console.log(`Failed: ${report.failed.length}`);
  console.log(`Report: ${REPORT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
