import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { PortableText } from '@portabletext/react'
import { getBySlug, getSlugs, getAll, sortByDate, readingTime, extractToc, type ArticleFrontmatter } from '@/lib/content'
import { getArticleBySlug, getAllSanityArticleSlugs } from '@/sanity/lib/queries'
import ExegeticaArticleLayout from '@/components/exegetica-article-layout'
import { RelatedArticles } from '@/components/related-articles'
import { COLLECTION_DEFS } from '@/lib/exegetica-collections'
import { mdxComponents } from '@/lib/mdx-components'
import ReadMarker from '@/components/read-marker'

export const revalidate = 60

const BASE = 'https://austinwduncan.com'

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  const mdxSlugs = getSlugs('exegetica').map((slug) => ({ slug }))
  const sanitySlugs = (await getAllSanityArticleSlugs('exegetica')).map((slug) => ({ slug }))
  const mdxSet = new Set(getSlugs('exegetica'))
  return [...mdxSlugs, ...sanitySlugs.filter((s) => !mdxSet.has(s.slug))]
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
    const sanity = await getArticleBySlug('exegetica', slug)
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
  const shareUrl = `${BASE}/exegetica/${slug}`

  // Try MDX first
  let mdxFile: Awaited<ReturnType<typeof getBySlug<ArticleFrontmatter>>> | null = null
  try { mdxFile = getBySlug<ArticleFrontmatter>('exegetica', slug) } catch { /* not in MDX */ }

  if (mdxFile) {
    const { frontmatter: fm, content } = mdxFile

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
        <ReadMarker slug={slug} />
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

  // Fall back to Sanity
  const sanity = await getArticleBySlug('exegetica', slug)
  if (!sanity) notFound()

  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'ScholarlyArticle',
      headline: sanity.title,
      description: sanity.excerpt || undefined,
      datePublished: sanity.date,
      author: { '@id': `${BASE}/#person` },
      publisher: { '@id': `${BASE}/#person` },
      ...(sanity.image ? { image: sanity.image } : {}),
      url: shareUrl,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
        { '@type': 'ListItem', position: 2, name: 'Exegetica', item: `${BASE}/exegetica` },
        { '@type': 'ListItem', position: 3, name: sanity.title, item: shareUrl },
      ],
    },
  ]

  return (
    <>
      <ReadMarker slug={slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ExegeticaArticleLayout
        studyNum={0}
        collectionTitle="Exegetica"
        title={sanity.title}
        date={sanity.date}
        readingMinutes={0}
        wordCount={0}
        abstract={sanity.excerpt ?? ''}
        image={sanity.image ?? undefined}
        toc={[]}
        shareUrl={shareUrl}
      >
        {sanity.body && (
          <PortableText
            value={sanity.body as Parameters<typeof PortableText>[0]['value']}
            components={portableTextComponents}
          />
        )}
      </ExegeticaArticleLayout>
    </>
  )
}

const portableTextComponents: Parameters<typeof PortableText>[0]['components'] = {
  block: {
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
    normal: ({ children }) => <p>{children}</p>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    underline: ({ children }) => <span style={{ textDecoration: 'underline' }}>{children}</span>,
    link: ({ value, children }) => (
      <a href={value?.href} target={value?.blank ? '_blank' : undefined} rel={value?.blank ? 'noopener noreferrer' : undefined}>
        {children}
      </a>
    ),
  },
  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
    number: ({ children }) => <ol>{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
}
