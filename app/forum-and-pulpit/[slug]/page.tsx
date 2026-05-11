import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getBySlug, getSlugs, readingTime, type ArticleFrontmatter } from '@/lib/content'
import ArticleLayout from '@/components/article-layout'
import { mdxComponents } from '@/lib/mdx-components'

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  return getSlugs('forum-and-pulpit').map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  try {
    const { frontmatter: fm } = getBySlug<ArticleFrontmatter>('forum-and-pulpit', slug)
    return { title: fm.title, description: fm.excerpt }
  } catch {
    return {}
  }
}

export default async function ForumAndPulpitArticlePage({ params }: { params: Params }) {
  const { slug } = await params

  let file
  try {
    file = getBySlug<ArticleFrontmatter>('forum-and-pulpit', slug)
  } catch {
    notFound()
  }

  const { frontmatter: fm, content } = file
  const minutes = readingTime(content)

  return (
    <ArticleLayout
      section="Forum & Pulpit"
      sectionHref="/forum-and-pulpit"
      category={fm.category}
      title={fm.title}
      date={fm.date}
      readingMinutes={minutes}
    >
      <MDXRemote source={content} components={mdxComponents} />
    </ArticleLayout>
  )
}
