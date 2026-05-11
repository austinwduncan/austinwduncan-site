#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')

const DEFAULT_INPUT = path.join(
  os.homedir(),
  'Downloads',
  'Squarespace-Wordpress-Export-05-11-2026.xml',
)
const DEFAULT_OUTPUT = path.join(process.cwd(), 'content', 'books.json')

const CATEGORY_BUCKETS = [
  'Apologetics',
  'Archaeology & Biblical History',
  'Bible Dictionaries',
  'Bible Languages/Tools',
  'Bible Study',
  'Biblical Reference',
  'Business',
  'Christian Living',
  'Christology',
  'Church History',
  'Church Life',
  'Classics',
  'Comparative Religions',
  'Death/Dying',
  'Denominational Concerns',
  'Devotionals',
  'Discipleship',
  'Eschatology/End Times',
  'Ethics',
  'Evangelism',
  'Faith',
  'Finance',
  'God/Theology Proper',
  'Grief and Comfort',
  'Hermeneutics',
  'Leadership',
  'Love & Marriage',
  'Men',
  'Parenting',
  'Pastoral',
  'Philosophy',
  'Prayer',
  'Preaching',
  'Reference',
  'Sermons',
  'Social Issues',
  'Spiritual Warfare',
  'Theology',
  'Women',
  'World Religions',
  'Worship',
]

const CATEGORY_BY_SLUG = new Map(
  CATEGORY_BUCKETS.flatMap((label) => {
    const slug = label
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/\//g, '-')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    return [
      [slug, label],
      [slug.replace(/-/g, ''), label],
    ]
  }),
)

Object.entries({
  archeology: 'Archaeology & Biblical History',
  archaeology: 'Archaeology & Biblical History',
  'archaeology-biblical-history': 'Archaeology & Biblical History',
  'biblical-archaeology': 'Archaeology & Biblical History',
  'biblical-history': 'Archaeology & Biblical History',
  'bible-dictionary': 'Bible Dictionaries',
  'bible-dictionaries': 'Bible Dictionaries',
  'bible-languages': 'Bible Languages/Tools',
  'bible-languages-tools': 'Bible Languages/Tools',
  'bible-tools': 'Bible Languages/Tools',
  'biblical-languages': 'Bible Languages/Tools',
  'biblical-reference': 'Biblical Reference',
  'christian-life': 'Christian Living',
  'christian-living': 'Christian Living',
  'church': 'Church Life',
  'church-history': 'Church History',
  'comparative-religion': 'Comparative Religions',
  'comparative-religions': 'Comparative Religions',
  death: 'Death/Dying',
  dying: 'Death/Dying',
  'death-dying': 'Death/Dying',
  denominational: 'Denominational Concerns',
  'denominational-concerns': 'Denominational Concerns',
  'end-times': 'Eschatology/End Times',
  eschatology: 'Eschatology/End Times',
  'eschatology-end-times': 'Eschatology/End Times',
  'god': 'God/Theology Proper',
  'god-theology-proper': 'God/Theology Proper',
  'theology-proper': 'God/Theology Proper',
  grief: 'Grief and Comfort',
  'grief-comfort': 'Grief and Comfort',
  'grief-and-comfort': 'Grief and Comfort',
  marriage: 'Love & Marriage',
  'love-marriage': 'Love & Marriage',
  'love-and-marriage': 'Love & Marriage',
  men: 'Men',
  pastoral: 'Pastoral',
  preaching: 'Preaching',
  social: 'Social Issues',
  'social-issues': 'Social Issues',
  'spiritual-warfare': 'Spiritual Warfare',
  theology: 'Theology',
  women: 'Women',
  'world-religions': 'World Religions',
}).forEach(([slug, label]) => CATEGORY_BY_SLUG.set(slug, label))

function decodeEntities(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

function stripTags(value) {
  return decodeEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getFirstMatch(value, regex) {
  const match = value.match(regex)
  return match ? decodeEntities(match[1]).trim() : ''
}

function getResourceBookSlug(item) {
  const candidates = [
    getFirstMatch(item, /<link>([\s\S]*?)<\/link>/i),
    getFirstMatch(item, /<guid[^>]*>([\s\S]*?)<\/guid>/i),
    getFirstMatch(item, /<wp:post_name>([\s\S]*?)<\/wp:post_name>/i),
  ]

  for (const candidate of candidates) {
    const match = candidate.match(/\/resources\/books\/([^/?#<]+)/i)
    if (match) return match[1].toLowerCase()
  }

  return ''
}

function consolidateCategory(slug) {
  const normalized = slug
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return CATEGORY_BY_SLUG.get(normalized) ?? CATEGORY_BY_SLUG.get(normalized.replace(/-/g, '')) ?? titleCaseSlug(slug)
}

function titleCaseSlug(slug) {
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function extractContent(item) {
  const encoded = getFirstMatch(item, /<content:encoded>([\s\S]*?)<\/content:encoded>/i)
  return encoded || decodeEntities(item)
}

function findNearestCover(html, amazonIndex) {
  const start = Math.max(0, amazonIndex - 3500)
  const end = Math.min(html.length, amazonIndex + 3500)
  const window = html.slice(start, end)
  const imageRegex = /(?:src|data-src|data-image)=["']([^"']*m\.media-amazon\.com\/images\/[^"']+)["']/gi
  const looseImageRegex = /(https?:\/\/m\.media-amazon\.com\/images\/[^\s"'<>]+)/gi
  const candidates = []

  for (const regex of [imageRegex, looseImageRegex]) {
    for (const match of window.matchAll(regex)) {
      const url = decodeEntities(match[1]).replace(/[),.]+$/g, '')
      candidates.push({
        url,
        distance: Math.abs(start + match.index - amazonIndex),
      })
    }
  }

  candidates.sort((a, b) => a.distance - b.distance)
  return candidates[0]?.url ?? ''
}

function findNearestTitle(html, amazonIndex) {
  const start = Math.max(0, amazonIndex - 2500)
  const end = Math.min(html.length, amazonIndex + 2500)
  const window = html.slice(start, end)
  const titleCandidates = []
  const titleRegex = /<(h3|p)\b[^>]*>([\s\S]*?)<\/\1>/gi

  for (const match of window.matchAll(titleRegex)) {
    const text = stripTags(match[2])
    if (!text || text.length < 2) continue
    if (/amazon|buy now|purchase|affiliate|click here/i.test(text)) continue

    titleCandidates.push({
      text,
      distance: Math.abs(start + match.index - amazonIndex),
      before: start + match.index <= amazonIndex,
      tag: match[1].toLowerCase(),
    })
  }

  titleCandidates.sort((a, b) => {
    if (a.before !== b.before) return a.before ? -1 : 1
    if (a.tag !== b.tag) return a.tag === 'h3' ? -1 : 1
    return a.distance - b.distance
  })

  return titleCandidates[0]?.text ?? ''
}

function extractBooks(xml) {
  const booksByAsin = new Map()
  const categories = new Set()
  let duplicatesRemoved = 0
  const items = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? []

  for (const rawItem of items) {
    const item = decodeEntities(rawItem)
    const slug = getResourceBookSlug(item)
    if (!slug) continue

    const category = consolidateCategory(slug)
    const html = extractContent(rawItem)

    let foundBookInCategory = false
    const amazonLinkRegex = /href=["'](https?:\/\/(?:www\.)?amazon\.com\/dp\/([A-Z0-9]{10})[^"']*)["']/gi

    for (const match of html.matchAll(amazonLinkRegex)) {
      const amazonUrl = decodeEntities(match[1])
      const asin = match[2].toUpperCase()

      if (booksByAsin.has(asin)) {
        duplicatesRemoved += 1
        continue
      }

      booksByAsin.set(asin, {
        asin,
        amazonUrl,
        coverImage: findNearestCover(html, match.index),
        title: findNearestTitle(html, match.index),
        category,
      })
      foundBookInCategory = true
    }

    if (foundBookInCategory) categories.add(category)
  }

  return {
    books: Array.from(booksByAsin.values()).sort((a, b) =>
      a.category.localeCompare(b.category) || a.title.localeCompare(b.title) || a.asin.localeCompare(b.asin),
    ),
    categories: Array.from(categories).sort(),
    duplicatesRemoved,
  }
}

function main() {
  const inputPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_INPUT
  const outputPath = process.argv[3] ? path.resolve(process.argv[3]) : DEFAULT_OUTPUT

  if (!fs.existsSync(inputPath)) {
    console.error(`Export file not found: ${inputPath}`)
    process.exit(1)
  }

  const xml = fs.readFileSync(inputPath, 'utf8')
  const { books, categories, duplicatesRemoved } = extractBooks(xml)

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, `${JSON.stringify(books, null, 2)}\n`)

  console.log(`Total books extracted: ${books.length}`)
  console.log(`Categories found: ${categories.length ? categories.join(', ') : 'none'}`)
  console.log(`Duplicates removed: ${duplicatesRemoved}`)
  console.log(`Wrote ${outputPath}`)
}

main()
