import type { Metadata } from 'next'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getSingleFile } from '@/lib/content'
import { mdxComponents } from '@/lib/mdx-components'

export const metadata: Metadata = {
  title: 'About',
  description: 'Pastor, teacher, and student of Holy Scripture.',
}

export default function AboutPage() {
  const { content } = getSingleFile('about')

  return (
    <div className="mx-auto max-w-3xl px-6 lg:px-8 py-14 lg:py-16">
      <div className="mb-10">
        <span
          className="text-[10px] font-semibold tracking-[0.16em] uppercase"
          style={{ color: '#cdb079' }}
        >
          About
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">
          Austin W. Duncan
        </h1>
      </div>

      <div className="article-prose">
        <MDXRemote source={content} components={mdxComponents} />
      </div>
    </div>
  )
}
