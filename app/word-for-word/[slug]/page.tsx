import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { PortableText } from '@portabletext/react'
import { getBySlug, getSlugs, getAll, sortByDate, readingTime, type ArticleFrontmatter } from '@/lib/content'
import { getArticleBySlug, getAllSanityArticleSlugs } from '@/sanity/lib/queries'
import ArticleLayout from '@/components/article-layout'
import { RelatedArticles } from '@/components/related-articles'
import { mdxComponents } from '@/lib/mdx-components'
import ReadMarker from '@/components/read-marker'

export const revalidate = 60

const BASE = 'https://austinwduncan.com'

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  const mdxSlugs = getSlugs('word-for-word').map((slug) => ({ slug }))
  const sanitySlugs = (await getAllSanityArticleSlugs('word-for-word')).map((slug) => ({ slug }))
  // Deduplicate: MDX takes priority
  const mdxSet = new Set(getSlugs('word-for-word'))
  return [...mdxSlugs, ...sanitySlugs.filter((s) => !mdxSet.has(s.slug))]
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
    const sanity = await getArticleBySlug('word-for-word', slug)
    if (!sanity) return {}
    return {
      title: sanity.title,
      description: sanity.excerpt || undefined,
      openGraph: {
        title: sanity.title,
        description: sanity.excerpt || undefined,
        type: 'article',
        publishedTime: sanity.date,
        authors: ['Austin W. Duncan'],
        ...(sanity.image ? { images: [{ url: sanity.image, width: 1280, height: 720, alt: sanity.title }] } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title: sanity.title,
        description: sanity.excerpt || undefined,
        ...(sanity.image ? { images: [sanity.image] } : {}),
      },
    }
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
  const shareUrl = `${BASE}/word-for-word/${slug}`

  // Try MDX first, fall back to Sanity
  let mdxFile: Awaited<ReturnType<typeof getBySlug<ArticleFrontmatter>>> | null = null
  try { mdxFile = getBySlug<ArticleFrontmatter>('word-for-word', slug) } catch { /* not in MDX */ }

  if (mdxFile) {
    const { frontmatter: fm, content } = mdxFile
    const minutes = readingTime(content)
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

    return (
      <>
        <ReadMarker slug={slug} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema(fm, shareUrl)) }} />
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

  // Fall back to Sanity
  const sanity = await getArticleBySlug('word-for-word', slug)
  if (!sanity) notFound()

  return (
    <>
      <ReadMarker slug={slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema({
        title: sanity.title, excerpt: sanity.excerpt, date: sanity.date, image: sanity.image ?? undefined,
      }, shareUrl)) }} />
      <ArticleLayout
        section="Word for Word"
        sectionHref="/word-for-word"
        category={sanity.category ?? undefined}
        title={sanity.title}
        date={sanity.date}
        image={sanity.image ?? undefined}
        readingMinutes={0}
        shareUrl={shareUrl}
      >
        <PortableText value={sanity.body as Parameters<typeof PortableText>[0]['value']} />
      </ArticleLayout>
    </>
  )
}

function articleSchema(
  fm: { title: string; excerpt?: string; date: string; image?: string },
  url: string,
) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: fm.title,
      description: fm.excerpt || undefined,
      datePublished: fm.date,
      author: { '@id': `${BASE}/#person` },
      publisher: { '@id': `${BASE}/#person` },
      ...(fm.image ? { image: `${BASE}${fm.image}` } : {}),
      url,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
        { '@type': 'ListItem', position: 2, name: 'Word for Word', item: `${BASE}/word-for-word` },
        { '@type': 'ListItem', position: 3, name: fm.title, item: url },
      ],
    },
  ]
}
