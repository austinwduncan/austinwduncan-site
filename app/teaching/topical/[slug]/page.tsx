import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getBySlug, getSlugs, readingTime, type TeachingFrontmatter } from '@/lib/content'
import ArticleLayout from '@/components/article-layout'
import { mdxComponents } from '@/lib/mdx-components'

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  return getSlugs('teaching/topical').map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  try {
    const { frontmatter: fm } = getBySlug<TeachingFrontmatter>('teaching/topical', slug)
    return { title: fm.title, description: fm.excerpt }
  } catch {
    return {}
  }
}

export default async function TopicalSeriesPage({ params }: { params: Params }) {
  const { slug } = await params

  let file
  try {
    file = getBySlug<TeachingFrontmatter>('teaching/topical', slug)
  } catch {
    notFound()
  }

  const { frontmatter: fm, content } = file
  const minutes = readingTime(content)

  return (
    <ArticleLayout
      section="Teaching"
      sectionHref="/teaching"
      category="Topical"
      title={fm.title}
      readingMinutes={minutes}
    >
      <MDXRemote source={content} components={mdxComponents} />
    </ArticleLayout>
  )
}
