// One-time migration: imports all MDX articles from /content into Sanity.
// Usage: SANITY_WRITE_TOKEN=sk-... node scripts/migrate-to-sanity.mjs
//
// Get a write token from: sanity.io/manage → your project → API → Tokens → Add API token (Editor)

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'
import { createClient } from '@sanity/client'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const TOKEN = process.env.SANITY_WRITE_TOKEN

if (!PROJECT_ID) { console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID'); process.exit(1) }
if (!TOKEN) { console.error('Missing SANITY_WRITE_TOKEN — get one from sanity.io/manage → API → Tokens'); process.exit(1) }

const client = createClient({
  projectId: PROJECT_ID,
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: TOKEN,
  useCdn: false,
})

const SECTIONS = [
  { dir: 'word-for-word',   section: 'word-for-word' },
  { dir: 'exegetica',       section: 'exegetica' },
  { dir: 'sermons',         section: 'sermons' },
  { dir: 'forum-and-pulpit',section: 'forum-and-pulpit' },
  { dir: 'teaching/expositional', section: 'expositional' },
  { dir: 'teaching/topical',      section: 'topical' },
]

let created = 0, skipped = 0, errors = 0

for (const { dir, section } of SECTIONS) {
  const contentDir = path.join(ROOT, 'content', dir)
  if (!fs.existsSync(contentDir)) { console.log(`  Skipping ${dir} (not found)`); continue }

  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.mdx'))
  console.log(`\n${section}: ${files.length} files`)

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, '')
    const raw = fs.readFileSync(path.join(contentDir, file), 'utf-8')
    const { data: fm, content } = matter(raw)

    const docId = `article-${section}-${slug}`.replace(/[^a-zA-Z0-9-_]/g, '-')

    const doc = {
      _id: docId,
      _type: 'article',
      title: fm.title ?? slug,
      slug: { _type: 'slug', current: slug },
      section,
      date: fm.date ?? new Date().toISOString().slice(0, 10),
      excerpt: fm.excerpt ?? '',
      tags: fm.tags ?? [],
      category: fm.category ?? null,
      body: content.trim(),
    }

    try {
      await client.createOrReplace(doc)
      process.stdout.write('.')
      created++
    } catch (err) {
      console.error(`\n  Error on ${slug}:`, err.message)
      errors++
    }
  }
}

console.log(`\n\nDone. Created/updated: ${created}  Skipped: ${skipped}  Errors: ${errors}`)
