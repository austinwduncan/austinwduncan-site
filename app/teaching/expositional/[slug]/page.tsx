import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { PortableText } from '@portabletext/react'
import {
  getTeachingBySlug, getTeachingSlugs, readingTime, isPublished,
  type TeachingFrontmatter,
} from '@/lib/content'
import { getArticleBySlug, getAllSanityArticleSlugs } from '@/sanity/lib/queries'
import ArticleLayout from '@/components/article-layout'
import { mdxComponents } from '@/lib/mdx-components'
import ReadMarker from '@/components/read-marker'

export const revalidate = 60

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  const mdxSlugs = getTeachingSlugs('expositional').map((slug) => ({ slug }))
  const sanitySlugs = (await getAllSanityArticleSlugs('expositional')).map((slug) => ({ slug }))
  const mdxSet = new Set(getTeachingSlugs('expositional'))
  return [...mdxSlugs, ...sanitySlugs.filter((s) => !mdxSet.has(s.slug))]
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
    const sanity = await getArticleBySlug('expositional', slug)
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

export default async function ExpositionalArticlePage({ params }: { params: Params }) {
  const { slug } = await params

  // Try MDX first
  let mdxFile: Awaited<ReturnType<typeof getTeachingBySlug<TeachingFrontmatter>>> | null = null
  try { mdxFile = getTeachingBySlug<TeachingFrontmatter>('expositional', slug) } catch { /* not in MDX */ }

  if (mdxFile) {
    const { frontmatter: fm, content } = mdxFile
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

  // Fall back to Sanity
  const sanity = await getArticleBySlug('expositional', slug)
  if (!sanity) notFound()

  return (
    <>
      <ReadMarker slug={slug} />
      <ArticleLayout
        section="Teaching"
        sectionHref="/teaching"
        category={sanity.series ?? 'Teaching'}
        title={sanity.title}
        date={sanity.date}
        image={sanity.image ?? undefined}
        readingMinutes={0}
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
