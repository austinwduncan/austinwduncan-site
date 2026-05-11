import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getBySlug, getSlugs, readingTime, type ArticleFrontmatter } from '@/lib/content'
import ArticleLayout from '@/components/article-layout'
import { mdxComponents } from '@/lib/mdx-components'

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  return getSlugs('word-for-word').map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  try {
    const { frontmatter: fm } = getBySlug<ArticleFrontmatter>('word-for-word', slug)
    return { title: fm.title, description: fm.excerpt }
  } catch {
    return {}
  }
}

export default async function WordForWordArticlePage({ params }: { params: Params }) {
  const { slug } = await params

  let file
  try {
    file = getBySlug<ArticleFrontmatter>('word-for-word', slug)
  } catch {
    notFound()
  }

  const { frontmatter: fm, content } = file
  const minutes = readingTime(content)

  return (
    <ArticleLayout
      section="Word for Word"
      sectionHref="/word-for-word"
      category={fm.category}
      title={fm.title}
      date={fm.date}
      readingMinutes={minutes}
    >
      <MDXRemote source={content} components={mdxComponents} />
    </ArticleLayout>
  )
}
