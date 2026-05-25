import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getBySlug, getSlugs, getAll, sortByDate, readingTime, type SermonFrontmatter } from '@/lib/content'
import { getEsvPassage } from '@/lib/esv'
import ArticleLayout from '@/components/article-layout'
import { RelatedArticles } from '@/components/related-articles'
import { mdxComponents } from '@/lib/mdx-components'
import ReadMarker from '@/components/read-marker'

const BASE = 'https://austinwduncan.com'

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  return getSlugs('sermons').map((slug) => ({ slug }))
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

export default async function SermonPage({ params }: { params: Params }) {
  const { slug } = await params

  let file
  try {
    file = getBySlug<SermonFrontmatter>('sermons', slug)
  } catch {
    notFound()
  }

  const { frontmatter: fm, content } = file
  const esvText = fm.scripture ? await getEsvPassage(fm.scripture) : null
  const minutes = readingTime(content)
  const shareUrl = `${BASE}/sermons/${slug}`

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
      ...(fm.youtube ? { video: `https://www.youtube.com/watch?v=${fm.youtube}` } : {}),
      url: shareUrl,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
        { '@type': 'ListItem', position: 2, name: 'Sermons', item: `${BASE}/sermons` },
        { '@type': 'ListItem', position: 3, name: fm.title, item: shareUrl },
      ],
    },
  ]

  return (
    <>
      <ReadMarker slug={slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
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
