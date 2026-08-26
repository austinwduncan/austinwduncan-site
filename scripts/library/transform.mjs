/*
  MDX -> Library records.

  This is the half of the migration that can be proven without a database.
  It reads every MDX file, normalises it into the shape the Postgres schema
  expects, and reports what it could NOT work out, so the gaps are visible
  before anything is written anywhere.

  The two hard jobs:

  1. Scripture strings become structured references. `scripture: "Mark 2:1-12"`
     has to become book/chapter/verse plus the integer bounds the schema uses
     for range queries. Dashes in the source are a mix of hyphen, en dash and
     em dash.

  2. The `tags` soup gets split. One array currently holds four different
     dimensions at once: a Bible book ("Mark"), a series ("The Book of
     Hebrews"), a collection ("Historical Jesus and Christology") and a topic
     ("Basic Christian Thought and Spiritual Growth"). Each tag is routed by
     matching against known books and known series; whatever is left is a
     topic candidate for review rather than an assumption.
*/

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import matter from 'gray-matter'

const ROOT = process.cwd()
const CONTENT = join(ROOT, 'content')

// ── Bible books, mirroring 0002_bible_books.sql ─────────────────────────────
const BOOKS = [
  ['Genesis',50],['Exodus',40],['Leviticus',27],['Numbers',36],['Deuteronomy',34],
  ['Joshua',24],['Judges',21],['Ruth',4],['1 Samuel',31],['2 Samuel',24],
  ['1 Kings',22],['2 Kings',25],['1 Chronicles',29],['2 Chronicles',36],['Ezra',10],
  ['Nehemiah',13],['Esther',10],['Job',42],['Psalms',150],['Proverbs',31],
  ['Ecclesiastes',12],['Song of Solomon',8],['Isaiah',66],['Jeremiah',52],
  ['Lamentations',5],['Ezekiel',48],['Daniel',12],['Hosea',14],['Joel',3],['Amos',9],
  ['Obadiah',1],['Jonah',4],['Micah',7],['Nahum',3],['Habakkuk',3],['Zephaniah',3],
  ['Haggai',2],['Zechariah',14],['Malachi',4],
  ['Matthew',28],['Mark',16],['Luke',24],['John',21],['Acts',28],['Romans',16],
  ['1 Corinthians',16],['2 Corinthians',13],['Galatians',6],['Ephesians',6],
  ['Philippians',4],['Colossians',4],['1 Thessalonians',5],['2 Thessalonians',3],
  ['1 Timothy',6],['2 Timothy',4],['Titus',3],['Philemon',1],['Hebrews',13],
  ['James',5],['1 Peter',5],['2 Peter',3],['1 John',5],['2 John',1],['3 John',1],
  ['Jude',1],['Revelation',22],
].map(([name, chapters], i) => ({
  name, chapters, position: i + 1, slug: name.toLowerCase().replaceAll(' ', '-'),
}))

// Common ways Austin's files might name a book.
const ALIASES = {
  'song of songs': 'Song of Solomon', canticles: 'Song of Solomon',
  psalm: 'Psalms', ps: 'Psalms', phil: 'Philippians', philem: 'Philemon',
  rev: 'Revelation', matt: 'Matthew', rom: 'Romans', cor: 'Corinthians',
  '1 cor': '1 Corinthians', '2 cor': '2 Corinthians', '1 thess': '1 Thessalonians',
  '2 thess': '2 Thessalonians', '1 tim': '1 Timothy', '2 tim': '2 Timothy',
  heb: 'Hebrews', jas: 'James', gal: 'Galatians', eph: 'Ephesians', col: 'Colossians',
}

const bookByName = new Map(BOOKS.map(b => [b.name.toLowerCase(), b]))
function findBook(raw) {
  const k = raw.trim().toLowerCase().replace(/\.$/, '')
  return bookByName.get(k) ?? bookByName.get((ALIASES[k] ?? '').toLowerCase()) ?? null
}

const ref = (pos, ch, v) => pos * 1_000_000 + ch * 1_000 + v

/*
  Parse one scripture string into structured references.
  Handles: "Mark 2:1-12", "Isaiah 6:8–13", "Romans 8", "John 3:16",
  "Luke 15:11-32; John 3", "1 Corinthians 15:1–11".
*/
export function parseScripture(input) {
  if (!input) return { refs: [], unparsed: [] }
  const refs = []
  const unparsed = []
  // Real values in the files include parenthetical lists
  // ("Multiple texts (Daniel, Matthew, Revelation)") and slash-separated pairs
  // ("Genesis 22 / Luke 10:27"), so strip the wrapper prose and split on
  // semicolon, comma or slash.
  const normalised = String(input)
    .replace(/^[^(]*\(/, '')   // drop a leading "Multiple texts ("
    .replace(/\)\s*$/, '')     // and its closing paren
  const chunks = normalised.split(/\s*[;/]\s*|,\s*(?=[0-9]?\s*[A-Za-z])/)

  for (const chunk of chunks) {
    const cleaned = chunk.replace(/[–—]/g, '-').trim()
    if (!cleaned) continue
    // book | chapter[:verse] [- chapter[:verse]]
    const m = cleaned.match(
      /^((?:[123]\s+)?[A-Za-z][A-Za-z\s]*?)\s+(\d+)(?::(\d+))?(?:\s*-\s*(?:(\d+):)?(\d+))?$/
    )
    if (!m) {
      // A bare book name with no chapter ("Daniel") is a whole-book reference.
      const bare = findBook(cleaned)
      if (bare) {
        refs.push({
          book: bare.name, book_slug: bare.slug,
          chapter_start: 1, verse_start: null,
          chapter_end: bare.chapters, verse_end: null,
          start_ref: ref(bare.position, 1, 1),
          end_ref: ref(bare.position, bare.chapters, 999),
          whole_book: true,
        })
        continue
      }
      unparsed.push(chunk.trim())
      continue
    }
    const [, bookRaw, c1, v1, c2, v2] = m
    const book = findBook(bookRaw)
    if (!book) { unparsed.push(chunk.trim()); continue }

    const chapterStart = Number(c1)
    const verseStart = v1 ? Number(v1) : null
    // "2:1-12" -> same chapter. "2:1-3:5" -> cross chapter.
    const chapterEnd = c2 ? Number(c2) : chapterStart
    const verseEnd = v2 ? Number(v2) : (v1 ? Number(v1) : null)

    refs.push({
      book: book.name,
      book_slug: book.slug,
      chapter_start: chapterStart,
      verse_start: verseStart,
      chapter_end: chapterEnd,
      verse_end: verseEnd,
      // A whole chapter spans verse 1 to a high sentinel, so a chapter-level
      // reference still overlaps any verse range inside it.
      start_ref: ref(book.position, chapterStart, verseStart ?? 1),
      end_ref: ref(book.position, chapterEnd, verseEnd ?? 999),
    })
  }
  return { refs, unparsed }
}

// ── Directory -> collection + format ────────────────────────────────────────
const ROUTES = [
  { dir: 'sermons',                collection: 'sermons',          format: 'sermon',  base: '/sermons' },
  { dir: 'word-for-word',          collection: 'word-for-word',    format: 'article', base: '/word-for-word' },
  { dir: 'exegetica',              collection: 'exegetica',        format: 'paper',   base: '/exegetica' },
  { dir: 'forum-and-pulpit',       collection: 'forum-and-pulpit', format: 'article', base: '/forum-and-pulpit' },
  { dir: 'teaching/expositional',  collection: 'in-the-text',      format: 'study',   base: '/teaching/expositional', approach: 'expositional' },
  { dir: 'teaching/topical',       collection: 'in-the-text',      format: 'study',   base: '/teaching/topical',      approach: 'topical' },
]

function walk(dir, out = []) {
  let entries
  try { entries = readdirSync(dir) } catch { return out }
  for (const e of entries) {
    const p = join(dir, e)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (e.endsWith('.mdx') || e.endsWith('.md')) out.push(p)
  }
  return out
}

// Known series names, so a series tag is not mistaken for a topic.
function loadSeriesNames() {
  try {
    const src = readFileSync(join(ROOT, 'data', 'teaching-series.ts'), 'utf8')
    const names = new Set()
    for (const m of src.matchAll(/seriesTag:\s*'([^']+)'/g)) names.add(m[1])
    for (const m of src.matchAll(/title:\s*'([^']+)'/g)) names.add(m[1])
    return names
  } catch { return new Set() }
}


/*
  Flatten MDX to plain text for the enrichment pass and for search. Claude
  cannot tag a piece well from a title alone, and `content.body_text` was left
  empty by the first import, which would have made the whole enrichment run
  guess from headlines.
*/
function toPlainText(mdx) {
  return mdx
    .replace(/```[\s\S]*?```/g, ' ')          // fenced code
    .replace(/<[^>]+>/g, ' ')                  // JSX / html
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')     // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')   // links keep their text
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')        // heading marks
    .replace(/[*_`>]/g, ' ')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const WORDS_PER_MINUTE = 225

export function transform() {
  const seriesNames = loadSeriesNames()
  const records = []
  const report = {
    files: 0, withScripture: 0, scriptureRefs: 0, unparsedScripture: [],
    tagsRouted: { book: 0, series: 0, topic: 0 }, topicCandidates: new Map(),
    missingExcerpt: 0, missingImage: 0, byCollection: {},
  }

  for (const route of ROUTES) {
    for (const file of walk(join(CONTENT, route.dir))) {
      const raw = readFileSync(file, 'utf8')
      const { data, content } = matter(raw)
      const slug = file.split('/').pop().replace(/\.mdx?$/, '')
      report.files++
      report.byCollection[route.collection] = (report.byCollection[route.collection] ?? 0) + 1

      const { refs, unparsed } = parseScripture(data.scripture)
      if (refs.length) report.withScripture++
      report.scriptureRefs += refs.length
      for (const u of unparsed) report.unparsedScripture.push({ slug, value: u })

      // Split the tags soup by matching against what we know.
      const books = [], seriesTags = [], topics = []
      for (const tag of (data.tags ?? [])) {
        if (findBook(tag)) { books.push(tag); report.tagsRouted.book++ }
        else if (seriesNames.has(tag)) { seriesTags.push(tag); report.tagsRouted.series++ }
        else {
          topics.push(tag); report.tagsRouted.topic++
          report.topicCandidates.set(tag, (report.topicCandidates.get(tag) ?? 0) + 1)
        }
      }

      // A book-only tag with no scripture field is still a real reference.
      for (const b of books) {
        const book = findBook(b)
        if (book && !refs.some(r => r.book === book.name)) {
          refs.push({
            book: book.name, book_slug: book.slug,
            chapter_start: 1, verse_start: null,
            chapter_end: book.chapters, verse_end: null,
            start_ref: ref(book.position, 1, 1),
            end_ref: ref(book.position, book.chapters, 999),
            whole_book: true,
          })
        }
      }

      if (!data.excerpt) report.missingExcerpt++
      if (!data.image) report.missingImage++

      const bodyText = toPlainText(content)
      const words = bodyText.split(/\s+/).filter(Boolean).length

      records.push({
        slug,
        title: data.title ?? slug,
        summary: data.excerpt || null,
        collection: route.collection,
        format: route.format,
        approaches: route.approach ? [route.approach] : [],
        series_tags: seriesTags,
        topic_candidates: topics,
        scripture: refs,
        media: data.youtube
          ? [{ kind: 'video', provider: 'youtube', external_id: data.youtube,
               url: `https://www.youtube.com/watch?v=${data.youtube}` }]
          : [],
        featured_image: data.image || null,
        published_at: data.date ?? null,
        status: 'published',
        body_text: bodyText,
        reading_minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
        word_count: words,
        // Preserves the live URL so content_slug_history can be populated and
        // nothing 404s after the move.
        legacy_source: 'mdx',
        legacy_id: relative(ROOT, file),
        legacy_path: `${route.base}/${slug}`,
      })
    }
  }
  return { records, report }
}

// ── CLI ─────────────────────────────────────────────────────────────────────
const { records, report } = transform()
mkdirSync(join(ROOT, '.library'), { recursive: true })
writeFileSync(join(ROOT, '.library', 'records.json'), JSON.stringify(records, null, 2))

const topTopics = [...report.topicCandidates.entries()].sort((a, b) => b[1] - a[1])

console.log('\n  FILES                ', report.files)
console.log('  by collection        ', JSON.stringify(report.byCollection))
console.log('\n  SCRIPTURE')
console.log('    files with refs    ', report.withScripture, `/ ${report.files}`)
console.log('    references parsed  ', report.scriptureRefs)
console.log('    unparsed strings   ', report.unparsedScripture.length)
for (const u of report.unparsedScripture.slice(0, 8)) console.log('      !', u.value, `(${u.slug})`)
console.log('\n  TAGS ROUTED')
console.log('    -> bible book      ', report.tagsRouted.book)
console.log('    -> series          ', report.tagsRouted.series)
console.log('    -> topic candidate ', report.tagsRouted.topic, `(${topTopics.length} distinct)`)
for (const [t, n] of topTopics.slice(0, 12)) console.log(`      ${String(n).padStart(3)}  ${t}`)
console.log('\n  GAPS')
console.log('    missing summary    ', report.missingExcerpt)
console.log('    missing image      ', report.missingImage)
console.log('\n  wrote .library/records.json\n')
