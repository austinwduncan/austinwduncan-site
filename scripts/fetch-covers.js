#!/usr/bin/env node
// scripts/fetch-covers.js
// Verify that each coverImageUrl in data/books.json exists on disk.
// Nulls out any paths that don't have a matching file in public/.
// Usage: node scripts/fetch-covers.js

const fs = require('fs')
const path = require('path')

const BOOKS_PATH = path.join(process.cwd(), 'data/books.json')
const PUBLIC_PATH = path.join(process.cwd(), 'public')

const books = JSON.parse(fs.readFileSync(BOOKS_PATH, 'utf8'))

let present = 0
let nulled = 0

for (const book of books) {
  if (!book.coverImageUrl) continue
  const filePath = path.join(PUBLIC_PATH, book.coverImageUrl)
  if (fs.existsSync(filePath)) {
    present++
  } else {
    book.coverImageUrl = undefined
    nulled++
  }
}

fs.writeFileSync(BOOKS_PATH, JSON.stringify(books, null, 2))

console.log(`\n✓ ${present} covers verified`)
if (nulled) console.log(`  ${nulled} cover paths nulled out (file missing)`)
else console.log('  All covers present on disk')
