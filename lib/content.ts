import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CONTENT_DIR = path.join(process.cwd(), 'content')

// ─── Frontmatter types ────────────────────────────────────────────────────────

export type SermonFrontmatter = {
  title: string
  date: string
  excerpt: string
  tags?: string[]
  youtube?: string
  image?: string
  scripture?: string
  series?: string
  podcast?: string
  duration?: string
  featured?: boolean
}

// Canonical Bible book list for filtering tags
export const BIBLE_BOOKS = new Set([
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
  '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther',
  'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
  'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
  'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum',
  'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts',
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
  '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
  'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
  'Jude', 'Revelation',
])

export function bibleBooksFromTags(tags?: string[]): string[] {
  return (tags ?? []).filter((t) => BIBLE_BOOKS.has(t))
}

export function primaryBookFromTags(tags?: string[]): string {
  return bibleBooksFromTags(tags)[0] ?? 'Sermon'
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
  })
}

export type TeachingFrontmatter = {
  title: string
  type: 'expositional' | 'topical'
  excerpt: string
  parts?: number
  status?: 'ongoing' | 'complete'
  books?: string
}

export type ArticleFrontmatter = {
  title: string
  date: string
  excerpt: string
  tags?: string[]
  image?: string
  category?: string
  scripture?: string
}

// ─── Utilities ───────────────────────────────────────────────────────────────

export type ContentFile<T = Record<string, unknown>> = {
  frontmatter: T
  content: string
  slug: string
}

export function getSlugs(section: string): string[] {
  const dir = path.join(CONTENT_DIR, section)
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
}

export function getBySlug<T = Record<string, unknown>>(
  section: string,
  slug: string
): ContentFile<T> {
  const filePath = path.join(CONTENT_DIR, section, `${slug}.mdx`)
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return { frontmatter: data as T, content, slug }
}

export function getAll<T = Record<string, unknown>>(section: string): ContentFile<T>[] {
  return getSlugs(section).map((slug) => getBySlug<T>(section, slug))
}

export function getSingleFile<T = Record<string, unknown>>(name: string): ContentFile<T> {
  const filePath = path.join(CONTENT_DIR, `${name}.mdx`)
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return { frontmatter: data as T, content, slug: name }
}

export function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export function sortByDate<T extends { frontmatter: { date?: string } }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => {
    const da = a.frontmatter.date ?? ''
    const db = b.frontmatter.date ?? ''
    return db.localeCompare(da)
  })
}
