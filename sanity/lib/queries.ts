import { getClient } from './client'

export type SanityArticle = {
  _id: string
  slug: string
  title: string
  date: string
  excerpt: string
  tags: string[]
  image: string | null
  category: string | null
  series: string | null
  scripture: string | null
  section: string
  body: unknown[] | null
}

const articleFields = `
  _id,
  "slug": slug.current,
  title,
  date,
  excerpt,
  tags,
  "image": image.asset->url,
  category,
  series,
  scripture,
  section,
`

export async function getArticlesBySection(section: string): Promise<SanityArticle[]> {
  const client = getClient()
  if (!client) return []
  return client.fetch(
    `*[_type == "article" && section == $section && defined(slug.current) && date <= now()] | order(date desc) { ${articleFields} }`,
    { section },
    { next: { revalidate: 60 } }
  )
}

export async function getArticleBySlug(section: string, slug: string): Promise<SanityArticle | null> {
  const client = getClient()
  if (!client) return null
  const result = await client.fetch(
    `*[_type == "article" && section == $section && slug.current == $slug && date <= now()][0] { ${articleFields} body }`,
    { section, slug },
    { next: { revalidate: 60 } }
  )
  return result ?? null
}

export async function getAllSanityArticleSlugs(section: string): Promise<string[]> {
  const client = getClient()
  if (!client) return []
  const results = await client.fetch(
    `*[_type == "article" && section == $section && defined(slug.current)]{ "slug": slug.current }`,
    { section },
    { next: { revalidate: 60 } }
  )
  return results.map((r: { slug: string }) => r.slug)
}
