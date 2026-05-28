// Migrates teaching/expositional and teaching/topical articles to Sanity.
// Articles live in series subdirectories — the subfolder name becomes the `series` field.
// After running this, run migrate-body-to-portabletext.mjs to convert the markdown bodies.
//
// Usage: SANITY_WRITE_TOKEN=sk-... node scripts/migrate-teaching-series.mjs

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
if (!TOKEN) { console.error('Missing SANITY_WRITE_TOKEN'); process.exit(1) }

const client = createClient({
  projectId: PROJECT_ID,
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: TOKEN,
  useCdn: false,
})

const TEACHING_SECTIONS = [
  { dir: 'teaching/expositional', section: 'expositional' },
  { dir: 'teaching/topical',      section: 'topical' },
]

let created = 0, errors = 0

for (const { dir, section } of TEACHING_SECTIONS) {
  const sectionDir = path.join(ROOT, 'content', dir)
  const seriesDirs = fs.readdirSync(sectionDir).filter(
    (name) => fs.statSync(path.join(sectionDir, name)).isDirectory()
  )

  console.log(`\n${section}: ${seriesDirs.length} series`)

  for (const seriesName of seriesDirs) {
    const seriesDir = path.join(sectionDir, seriesName)
    const files = fs.readdirSync(seriesDir).filter((f) => f.endsWith('.mdx'))
    console.log(`  "${seriesName}": ${files.length} articles`)

    for (const file of files) {
      const slug = file.replace(/\.mdx$/, '')
      const raw = fs.readFileSync(path.join(seriesDir, file), 'utf-8')
      const { data: fm, content } = matter(raw)

      const docId = `article-${section}-${slug}`.replace(/[^a-zA-Z0-9-_]/g, '-')

      const doc = {
        _id: docId,
        _type: 'article',
        title: fm.title ?? slug,
        slug: { _type: 'slug', current: slug },
        section,
        series: seriesName,
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
}

console.log(`\n\nDone. Created/updated: ${created}  Errors: ${errors}`)
console.log('\nNext: run migrate-body-to-portabletext.mjs to convert markdown → Portable Text')
