// Converts existing Sanity article bodies from markdown strings → Portable Text blocks.
// Run after deploying the schema change.
// Usage: SANITY_WRITE_TOKEN=sk-... node scripts/migrate-body-to-portabletext.mjs

import { createClient } from '@sanity/client'
import { htmlToBlocks } from '@sanity/block-tools'
import { Schema } from '@sanity/schema'
import { marked } from 'marked'
import { JSDOM } from 'jsdom'

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

// Build a minimal Sanity schema so block-tools knows what marks/styles to use
const compiledSchema = Schema.compile({
  name: 'migration',
  types: [
    {
      name: 'article',
      type: 'object',
      fields: [{
        name: 'body',
        type: 'array',
        of: [
          {
            type: 'block',
            styles: [
              { title: 'Normal', value: 'normal' },
              { title: 'H2', value: 'h2' },
              { title: 'H3', value: 'h3' },
              { title: 'H4', value: 'h4' },
              { title: 'Quote', value: 'blockquote' },
            ],
            marks: {
              decorators: [
                { title: 'Bold', value: 'strong' },
                { title: 'Italic', value: 'em' },
                { title: 'Underline', value: 'underline' },
              ],
              annotations: [
                { name: 'link', type: 'object', fields: [{ name: 'href', type: 'url' }] },
              ],
            },
          },
        ],
      }],
    },
  ],
})

const blockContentType = compiledSchema
  .get('article')
  .fields.find(f => f.name === 'body').type

function markdownToPortableText(markdown) {
  if (!markdown || typeof markdown !== 'string') return []
  const html = marked(markdown)
  return htmlToBlocks(html, blockContentType, {
    parseHtml: (html) => new JSDOM(html).window.document,
  })
}

// Fetch all articles that still have body as a string (pre-migration)
const articles = await client.fetch(
  `*[_type == "article" && defined(body) && (body[0]._type == null || body == null)] { _id, title, body }`
)

// Also fetch articles where body is just a raw string
const allArticles = await client.fetch(`*[_type == "article"] { _id, title, body }`)
const needsMigration = allArticles.filter(a => typeof a.body === 'string')

console.log(`Found ${needsMigration.length} articles with markdown body to convert`)

let done = 0, errors = 0

for (const article of needsMigration) {
  try {
    const blocks = markdownToPortableText(article.body)
    await client.patch(article._id).set({ body: blocks }).commit()
    process.stdout.write('.')
    done++
  } catch (err) {
    console.error(`\nError on ${article._id} (${article.title}):`, err.message)
    errors++
  }
}

console.log(`\n\nDone. Converted: ${done}  Errors: ${errors}`)
