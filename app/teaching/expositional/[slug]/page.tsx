import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import {
  getTeachingBySlug, getTeachingSlugs, readingTime, isPublished,
  type TeachingFrontmatter,
} from '@/lib/content'
import ArticleLayout from '@/components/article-layout'
import { mdxComponents } from '@/lib/mdx-components'
import ReadMarker from '@/components/read-marker'

export const revalidate = 1800

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  return getTeachingSlugs('expositional').map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  try {
    const { frontmatter: fm } = getTeachingBySlug<TeachingFrontmatter>('expositional', slug)
    return {
      title: fm.title,
      description: fm.excerpt || undefined,
      openGraph: {
        title: fm.title,
        description: fm.excerpt || undefined,
        type: 'article',
        publishedTime: fm.date,
        authors: ['Austin W. Duncan'],
        ...(fm.image ? { images: [{ url: fm.image, width: 1280, height: 720, alt: fm.title }] } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title: fm.title,
        description: fm.excerpt || undefined,
        ...(fm.image ? { images: [fm.image] } : {}),
      },
    }
  } catch {
    return {}
  }
}

export default async function ExpositionalArticlePage({ params }: { params: Params }) {
  const { slug } = await params

  let file
  try {
    file = getTeachingBySlug<TeachingFrontmatter>('expositional', slug)
  } catch {
    notFound()
  }

  const { frontmatter: fm, content } = file

  if (!isPublished(fm.date)) notFound()

  const series = fm.tags?.[fm.tags.length - 1] ?? 'Teaching'
  const minutes = readingTime(content)

  return (
    <>
      <ReadMarker slug={slug} />
      <ArticleLayout
        section="Teaching"
        sectionHref="/teaching"
        category={series}
        title={fm.title}
        date={fm.date}
        image={fm.image}
        readingMinutes={minutes}
      >
        <MDXRemote source={content} components={mdxComponents} />
      </ArticleLayout>
    </>
  )
}
