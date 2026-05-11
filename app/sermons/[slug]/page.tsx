import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getBySlug, getSlugs, readingTime, type SermonFrontmatter } from '@/lib/content'
import { getEsvPassage } from '@/lib/esv'
import ArticleLayout from '@/components/article-layout'
import { mdxComponents } from '@/lib/mdx-components'

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  return getSlugs('sermons').map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  try {
    const { frontmatter: fm } = getBySlug<SermonFrontmatter>('sermons', slug)
    return { title: fm.title, description: fm.excerpt }
  } catch {
    return {}
  }
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

  return (
    <ArticleLayout
      section="Sermons"
      sectionHref="/sermons"
      category={fm.series ?? 'Sermon'}
      title={fm.title}
      date={fm.date}
      scripture={fm.scripture}
      youtube={fm.youtube}
      esvText={esvText}
      readingMinutes={minutes}
    >
      <MDXRemote source={content} components={mdxComponents} />
    </ArticleLayout>
  )
}
