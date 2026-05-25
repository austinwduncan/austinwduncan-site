import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getBySlug, getSlugs, getAll, sortByDate, readingTime, type ArticleFrontmatter } from '@/lib/content'
import ArticleLayout from '@/components/article-layout'
import { RelatedArticles } from '@/components/related-articles'
import { mdxComponents } from '@/lib/mdx-components'
import ReadMarker from '@/components/read-marker'

const BASE = 'https://austinwduncan.com'

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  return getSlugs('word-for-word').map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  try {
    const { frontmatter: fm } = getBySlug<ArticleFrontmatter>('word-for-word', slug)
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

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  })
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
  const shareUrl = `${BASE}/word-for-word/${slug}`

  const tag = fm.tags?.[0]
  const related = sortByDate(getAll<ArticleFrontmatter>('word-for-word'))
    .filter((a) => a.slug !== slug && !!tag && a.frontmatter.tags?.[0] === tag)
    .slice(0, 3)
    .map((a) => ({
      slug: a.slug,
      title: a.frontmatter.title,
      image: a.frontmatter.image,
      formattedDate: formatDate(a.frontmatter.date),
      label: a.frontmatter.tags?.[0],
    }))

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: fm.title,
      description: fm.excerpt || undefined,
      datePublished: fm.date,
      author: { '@id': `${BASE}/#person` },
      publisher: { '@id': `${BASE}/#person` },
      ...(fm.image ? { image: `${BASE}${fm.image}` } : {}),
      url: shareUrl,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
        { '@type': 'ListItem', position: 2, name: 'Word for Word', item: `${BASE}/word-for-word` },
        { '@type': 'ListItem', position: 3, name: fm.title, item: shareUrl },
      ],
    },
  ]

  return (
    <>
      <ReadMarker slug={slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ArticleLayout
        section="Word for Word"
        sectionHref="/word-for-word"
        category={fm.category}
        title={fm.title}
        date={fm.date}
        image={fm.image}
        readingMinutes={minutes}
        shareUrl={shareUrl}
      >
        <MDXRemote source={content} components={mdxComponents} />
      </ArticleLayout>
      <RelatedArticles items={related} sectionHref="/word-for-word" />
    </>
  )
}
