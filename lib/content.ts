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
