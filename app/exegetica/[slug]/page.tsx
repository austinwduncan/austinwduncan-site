import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getBySlug, getSlugs, getAll, sortByDate, readingTime, extractToc, type ArticleFrontmatter } from '@/lib/content'
import ExegeticaArticleLayout from '@/components/exegetica-article-layout'
import { COLLECTION_DEFS } from '@/lib/exegetica-collections'
import { mdxComponents } from '@/lib/mdx-components'

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

  // Compute 1-based study number from date-sorted list
  const allSorted = sortByDate(getAll<ArticleFrontmatter>('exegetica'))
  const studyNum = allSorted.findIndex((a) => a.slug === slug) + 1

  // Find which collection this study belongs to
  const collectionDef = COLLECTION_DEFS.find((c) =>
    (c.slugs as readonly string[]).includes(slug)
  )
  const collectionTitle = collectionDef?.title ?? 'Exegetica'

  const minutes = readingTime(content)
  const wordCount = content.trim().split(/\s+/).length
  const abstract = extractAbstract(content)
  const toc = extractToc(content)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: fm.title,
    description: abstract || fm.excerpt || undefined,
    datePublished: fm.date,
    author: { '@id': 'https://austinwduncan.com/#person' },
    publisher: { '@id': 'https://austinwduncan.com/#person' },
    ...(fm.image ? { image: `https://austinwduncan.com${fm.image}` } : {}),
    url: `https://austinwduncan.com/exegetica/${slug}`,
  }

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
      >
        <MDXRemote source={content} components={mdxComponents} />
      </ExegeticaArticleLayout>
    </>
  )
}
