import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

/*
  The last of the MDX readers. Everything Austin has taught now lives in the
  database (lib/sermons.ts); the only files left under content/ are the
  standing pages (about.mdx, resources.mdx) and books.json.
*/

const CONTENT_DIR = path.join(process.cwd(), 'content')

export type ContentFile<T = Record<string, unknown>> = {
  frontmatter: T
  content: string
  slug: string
}

/** Read one top-level MDX file under content/ (for example "about"). */
export function getSingleFile<T = Record<string, unknown>>(name: string): ContentFile<T> {
  const filePath = path.join(CONTENT_DIR, `${name}.mdx`)
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return { frontmatter: data as T, content, slug: name }
}
