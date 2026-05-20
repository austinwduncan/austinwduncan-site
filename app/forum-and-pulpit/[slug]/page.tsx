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

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: fm.title,
    description: fm.excerpt || undefined,
    datePublished: fm.date,
    author: { '@id': 'https://austinwduncan.com/#person' },
    publisher: { '@id': 'https://austinwduncan.com/#person' },
    ...(fm.image ? { image: `https://austinwduncan.com${fm.image}` } : {}),
    url: `https://austinwduncan.com/forum-and-pulpit/${slug}`,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ArticleLayout
        section="Forum & Pulpit"
        sectionHref="/forum-and-pulpit"
        category={fm.category}
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
