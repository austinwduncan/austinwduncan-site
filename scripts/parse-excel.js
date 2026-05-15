#!/usr/bin/env node
// scripts/parse-excel.js
// Parse data/Recommended Books.html → data/books.json
// Usage: node scripts/parse-excel.js

const fs = require('fs')
const path = require('path')

const HTML_PATH = path.join(process.cwd(), 'data/Recommended Books.html')
const OUTPUT_PATH = path.join(process.cwd(), 'data/books.json')

const html = fs.readFileSync(HTML_PATH, 'utf8')

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}

function cellText(inner) {
  return decodeEntities(inner.replace(/<[^>]+>/g, '').trim())
}

function splitTags(str) {
  if (!str) return []
  return str.split(',').map((s) => s.trim()).filter(Boolean)
}

// Extract all <tr> blocks
const trRe = /<tr[^>]*>(.*?)<\/tr>/gs
const rows = []
let m
while ((m = trRe.exec(html)) !== null) {
  rows.push(m[1])
}

const books = []
let skipped = 0

for (const row of rows) {
  // Skip rows that have only th cells (header) or freezebar cells
  if (row.includes('freezebar-cell')) continue

  const cells = []
  const tdRe = /<td[^>]*>(.*?)<\/td>/gs
  let td
  while ((td = tdRe.exec(row)) !== null) {
    cells.push(cellText(td[1]))
  }

  // Must have at least 28 columns; skip header row
  if (cells.length < 26) continue
  if (cells[2] === 'Title') continue

  const title = cells[2]
  const author = cells[3]

  if (!title || !author) {
    skipped++
    continue
  }

  const amazonUrl = cells[25]

  books.push({
    id: cells[0] ? Number(cells[0]) : undefined,
    slug: cells[1] || undefined,
    title,
    author,
    additionalAuthors: cells[4] || undefined,
    category: cells[6],
    subcategory: cells[7] || undefined,
    topicTags: splitTags(cells[8]),
    audienceTags: splitTags(cells[9]),
    useCaseTags: splitTags(cells[10]),
    readingLevel: cells[11] || undefined,
    recommendationLevel: cells[12] || undefined,
    featured: cells[15] === 'Yes',
    priority: cells[16] || undefined,
    shortRecommendation: cells[18] || undefined,
    publicCaution: cells[19] || undefined,
    internalNotes: cells[20] || undefined,
    coverImageUrl: cells[22] || undefined,
    isbn13: cells[23] || undefined,
    amazonUrl: amazonUrl || undefined,
    publisher: cells[26] || undefined,
    publicationYear: cells[27] ? Number(cells[27]) : undefined,
  })
}

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(books, null, 2))

const categories = {}
for (const b of books) {
  categories[b.category] = (categories[b.category] || 0) + 1
}

console.log(`\n✓ ${books.length} books written to data/books.json`)
if (skipped) console.log(`  ${skipped} rows skipped (blank title or author)`)
console.log(`\n  ${Object.keys(categories).length} categories:`)
for (const [cat, count] of Object.entries(categories).sort()) {
  console.log(`    ${cat} (${count})`)
}
