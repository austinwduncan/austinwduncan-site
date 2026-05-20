import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getBySlug, getSlugs, getAll, sortByDate, readingTime, extractToc, type ArticleFrontmatter } from '@/lib/content'
import ExegeticaArticleLayout from '@/components/exegetica-article-layout'
import { RelatedArticles } from '@/components/related-articles'
import { COLLECTION_DEFS } from '@/lib/exegetica-collections'
import { mdxComponents } from '@/lib/mdx-components'

const BASE = 'https://austinwduncan.com'

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  return getSlugs('exegetica').map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  try {
    const { frontmatter: fm } = getBySlug<ArticleFrontmatter>('exegetica', slug)
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

function extractAbstract(content: string): string {
  const m = content.match(/#+\s*Abstract\s*\n+([^\n]+(?:\n(?![#\n])[^\n]+)*)/i)
  if (m) {
    const text = m[1]
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim()
    return text.length > 420 ? text.slice(0, 417) + '…' : text
  }
  const paras = content.split(/\n{2,}/).map((p) => p.trim()).filter((p) => p && !p.startsWith('#'))
  const first = (paras[0] ?? '').replace(/\*\*/g, '').replace(/\*/g, '').trim()
  return first.length > 420 ? first.slice(0, 417) + '…' : first
}

export default async function ExegeticaArticlePage({ params }: { params: Params }) {
  const { slug } = await params

  let file
  try {
    file = getBySlug<ArticleFrontmatter>('exegetica', slug)
  } catch {
    notFound()
  }

  const { frontmatter: fm, content } = file

  const allSorted = sortByDate(getAll<ArticleFrontmatter>('exegetica'))
  const studyNum = allSorted.findIndex((a) => a.slug === slug) + 1

  const collectionDef = COLLECTION_DEFS.find((c) =>
    (c.slugs as readonly string[]).includes(slug)
  )
  const collectionTitle = collectionDef?.title ?? 'Exegetica'

  const minutes = readingTime(content)
  const wordCount = content.trim().split(/\s+/).length
  const abstract = extractAbstract(content)
  const toc = extractToc(content)
  const shareUrl = `${BASE}/exegetica/${slug}`

  const related = collectionDef
    ? allSorted
        .filter((a) => a.slug !== slug && (collectionDef.slugs as readonly string[]).includes(a.slug))
        .slice(0, 3)
        .map((a) => ({
          slug: a.slug,
          title: a.frontmatter.title,
          image: a.frontmatter.image,
          formattedDate: formatDate(a.frontmatter.date),
          label: collectionTitle,
        }))
    : []

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'ScholarlyArticle',
      headline: fm.title,
      description: abstract || fm.excerpt || undefined,
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
        { '@type': 'ListItem', position: 2, name: 'Exegetica', item: `${BASE}/exegetica` },
        { '@type': 'ListItem', position: 3, name: fm.title, item: shareUrl },
      ],
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ExegeticaArticleLayout
        studyNum={studyNum}
        collectionTitle={collectionTitle}
        title={fm.title}
        date={fm.date}
        readingMinutes={minutes}
        wordCount={wordCount}
        abstract={abstract}
        image={fm.image}
        toc={toc}
        shareUrl={shareUrl}
      >
        <MDXRemote source={content} components={mdxComponents} />
      </ExegeticaArticleLayout>
      <RelatedArticles items={related} sectionHref="/exegetica" heading="More from This Collection" />
    </>
  )
}
