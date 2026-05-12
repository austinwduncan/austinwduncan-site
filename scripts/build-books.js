#!/usr/bin/env node
// scripts/build-books.js
// Parse the Recommended Books Google Sheets HTML export → content/books.json
// Usage: node scripts/build-books.js [path/to/Recommended Books.html]

const fs = require('fs')
const path = require('path')

const HTML_PATH = process.argv[2] || path.join(
  process.env.HOME,
  'Downloads/Austin W. Duncan Content Planning/Recommended Books.html'
)
const OUTPUT_PATH = path.join(process.cwd(), 'content/books.json')

if (!fs.existsSync(HTML_PATH)) {
  console.error(`Error: HTML file not found at:\n  ${HTML_PATH}`)
  console.error('\nUsage: node scripts/build-books.js [path/to/Recommended Books.html]')
  process.exit(1)
}

const AFFILIATE_ID = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_ID || ''
if (!AFFILIATE_ID) {
  console.warn('Warning: NEXT_PUBLIC_AMAZON_AFFILIATE_ID is not set — links will have no affiliate tag.')
}

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

function stripTags(str) {
  return str.replace(/<[^>]+>/g, '').trim()
}

function cellText(inner) {
  return decodeEntities(stripTags(inner))
}

// Extract all <tr>…</tr> blocks (HTML is a single line)
const trRe = /<tr[^>]*>(.*?)<\/tr>/g
const rows = []
let trMatch
while ((trMatch = trRe.exec(html)) !== null) {
  rows.push(trMatch[1])
}

const books = []
let skipped = 0

for (const row of rows) {
  // Extract <td> cells (not <th> row headers)
  const cells = []
  const tdRe = /<td[^>]*>(.*?)<\/td>/g
  let tdMatch
  while ((tdMatch = tdRe.exec(row)) !== null) {
    cells.push(cellText(tdMatch[1]))
  }

  if (cells.length < 4) continue

  const category   = cells[0]
  const subcategory = cells[1]
  const title      = cells[2]
  const author     = cells[3]

  // Skip the header row
  if (category === 'Category' && title === 'Name') continue

  // Skip blank title or author
  if (!title || !author) {
    skipped++
    continue
  }

  const searchQuery = encodeURIComponent(`${title} ${author}`).replace(/%20/g, '+')
  const amazonUrl = `https://www.amazon.com/s?k=${searchQuery}${AFFILIATE_ID ? `&tag=${AFFILIATE_ID}` : ''}`

  books.push({ title, author, category, subcategory, amazonUrl })
}

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(books, null, 2))

const categoryMap = {}
for (const b of books) {
  categoryMap[b.category] = (categoryMap[b.category] || 0) + 1
}

const categoryList = Object.entries(categoryMap).sort(([a], [b]) => a.localeCompare(b))

console.log(`\n✓ ${books.length} books written to content/books.json`)
if (skipped) console.log(`  ${skipped} rows skipped (blank title or author)`)
console.log(`\n  ${categoryList.length} categories:`)
for (const [cat, count] of categoryList) {
  console.log(`    ${cat} (${count})`)
}
if (AFFILIATE_ID) {
  console.log(`\n  Affiliate tag: ${AFFILIATE_ID}`)
} else {
  console.log('\n  Set NEXT_PUBLIC_AMAZON_AFFILIATE_ID to include your affiliate tag.')
}
