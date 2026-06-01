import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { PortableText } from '@portabletext/react'
import { getBySlug, getSlugs, getAll, sortByDate, readingTime, type SermonFrontmatter } from '@/lib/content'
import { getEsvPassage } from '@/lib/esv'
import { getArticleBySlug, getAllSanityArticleSlugs } from '@/sanity/lib/queries'
import ArticleLayout from '@/components/article-layout'
import { RelatedArticles } from '@/components/related-articles'
import { mdxComponents } from '@/lib/mdx-components'
import ReadMarker from '@/components/read-marker'

export const revalidate = 60

const BASE = 'https://austinwduncan.com'

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  const mdxSlugs = getSlugs('sermons').map((slug) => ({ slug }))
  const sanitySlugs = (await getAllSanityArticleSlugs('sermons')).map((slug) => ({ slug }))
  const mdxSet = new Set(getSlugs('sermons'))
  return [...mdxSlugs, ...sanitySlugs.filter((s) => !mdxSet.has(s.slug))]
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  try {
    const { frontmatter: fm } = getBySlug<SermonFrontmatter>('sermons', slug)
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
    const sanity = await getArticleBySlug('sermons', slug)
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

export default async function SermonPage({ params }: { params: Params }) {
  const { slug } = await params
  const shareUrl = `${BASE}/sermons/${slug}`

  // Try MDX first
  let mdxFile: Awaited<ReturnType<typeof getBySlug<SermonFrontmatter>>> | null = null
  try { mdxFile = getBySlug<SermonFrontmatter>('sermons', slug) } catch { /* not in MDX */ }

  if (mdxFile) {
    const { frontmatter: fm, content } = mdxFile
    const esvText = fm.scripture ? await getEsvPassage(fm.scripture) : null
    const minutes = readingTime(content)

    const related = sortByDate(getAll<SermonFrontmatter>('sermons'))
      .filter((a) => a.slug !== slug && !!fm.series && a.frontmatter.series === fm.series)
      .slice(0, 3)
      .map((a) => ({
        slug: a.slug,
        title: a.frontmatter.title,
        image: a.frontmatter.image,
        formattedDate: formatDate(a.frontmatter.date),
        label: a.frontmatter.series,
      }))

    return (
      <>
        <ReadMarker slug={slug} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sermonSchema(fm, shareUrl)) }} />
        <ArticleLayout
          section="Sermons"
          sectionHref="/sermons"
          category={fm.series ?? 'Sermon'}
          title={fm.title}
          date={fm.date}
          scripture={fm.scripture}
          image={fm.image}
          youtube={fm.youtube}
          esvText={esvText}
          readingMinutes={minutes}
          shareUrl={shareUrl}
        >
          <MDXRemote source={content} components={mdxComponents} />
        </ArticleLayout>
        <RelatedArticles items={related} sectionHref="/sermons" heading="More from This Series" />
      </>
    )
  }

  // Fall back to Sanity
  const sanity = await getArticleBySlug('sermons', slug)
  if (!sanity) notFound()

  const esvText = sanity.scripture ? await getEsvPassage(sanity.scripture) : null

  return (
    <>
      <ReadMarker slug={slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sermonSchema({
        title: sanity.title, excerpt: sanity.excerpt, date: sanity.date,
        image: sanity.image ?? undefined,
      }, shareUrl)) }} />
      <ArticleLayout
        section="Sermons"
        sectionHref="/sermons"
        category={sanity.series ?? 'Sermon'}
        title={sanity.title}
        date={sanity.date}
        scripture={sanity.scripture ?? undefined}
        image={sanity.image ?? undefined}
        esvText={esvText}
        readingMinutes={0}
        shareUrl={shareUrl}
      >
        {sanity.body && (
          <PortableText
            value={sanity.body as Parameters<typeof PortableText>[0]['value']}
            components={portableTextComponents}
          />
        )}
      </ArticleLayout>
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

function sermonSchema(
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
      ...(fm.image ? { image: fm.image.startsWith('http') ? fm.image : `${BASE}${fm.image}` } : {}),
      url,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
        { '@type': 'ListItem', position: 2, name: 'Sermons', item: `${BASE}/sermons` },
        { '@type': 'ListItem', position: 3, name: fm.title, item: url },
      ],
    },
  ]
}
