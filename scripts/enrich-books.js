#!/usr/bin/env node
// scripts/enrich-books.js
// Looks up ISBNs via Open Library and adds coverUrl to content/books.json.
// Runs incrementally — re-running only processes books that still lack coverUrl.
// Usage: node scripts/enrich-books.js

const fs = require('fs')
const path = require('path')

const BOOKS_PATH = path.join(process.cwd(), 'content/books.json')
const DELAY_MS = 300

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isbn13to10(isbn13) {
  const digits = isbn13.replace(/[^0-9]/g, '')
  if (digits.length !== 13) return null
  const core = digits.slice(3, 12)
  let sum = 0
  for (let i = 0; i < 9; i++) sum += (10 - i) * parseInt(core[i])
  const check = (11 - (sum % 11)) % 11
  return core + (check === 10 ? 'X' : String(check))
}

async function lookupIsbn(title, author) {
  const q = encodeURIComponent(`${title} ${author}`)
  const url = `https://openlibrary.org/search.json?q=${q}&limit=3&fields=isbn`
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(9000) })
    if (!res.ok) return null
    const data = await res.json()

    for (const doc of data.docs || []) {
      const isbns = doc.isbn || []
      // Prefer a 10-digit ISBN (= ASIN)
      const isbn10 = isbns.find((i) => /^[0-9]{10}$/.test(i))
      if (isbn10) return { isbn10, coverUrl: `https://images-na.ssl-images-amazon.com/images/P/${isbn10}.01._SX300_.jpg` }

      // Fall back: derive ISBN-10 from ISBN-13
      const isbn13 = isbns.find((i) => /^[0-9]{13}$/.test(i))
      if (isbn13) {
        const derived = isbn13to10(isbn13)
        if (derived) return { isbn10: derived, coverUrl: `https://images-na.ssl-images-amazon.com/images/P/${derived}.01._SX300_.jpg` }
        // Use Open Library cover if we can't get an ASIN
        return { isbn10: null, coverUrl: `https://covers.openlibrary.org/b/isbn/${isbn13}-M.jpg` }
      }
    }
    return null
  } catch {
    return null
  }
}

async function main() {
  const books = JSON.parse(fs.readFileSync(BOOKS_PATH, 'utf8'))
  const todo = books.filter((b) => !b.coverUrl)
  console.log(`\n${books.length} books total — ${todo.length} still need covers\n`)
  if (todo.length === 0) { console.log('All done.'); return }

  let found = 0, missing = 0

  for (let i = 0; i < books.length; i++) {
    const book = books[i]
    if (book.coverUrl) continue

    const n = found + missing + 1
    process.stdout.write(`[${n}/${todo.length}] ${book.title.slice(0, 48).padEnd(48)} `)

    const result = await lookupIsbn(book.title, book.author)
    if (result) {
      if (result.isbn10) book.asin = result.isbn10
      book.coverUrl = result.coverUrl
      found++
      process.stdout.write(`✓ ${result.isbn10 || 'OL'}\n`)
    } else {
      missing++
      process.stdout.write(`✗\n`)
    }

    // Save every 20 books so progress isn't lost on error
    if ((found + missing) % 20 === 0) fs.writeFileSync(BOOKS_PATH, JSON.stringify(books, null, 2))
    await sleep(DELAY_MS)
  }

  fs.writeFileSync(BOOKS_PATH, JSON.stringify(books, null, 2))
  console.log(`\nDone — ✓ ${found} covers found, ✗ ${missing} not found`)
  console.log(`Run 'npm run build' to deploy cover images.`)
}

main().catch(console.error)
