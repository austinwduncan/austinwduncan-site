import type { Metadata } from 'next'
import Link from 'next/link'
import { getAll, type TeachingFrontmatter } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Topical Teaching',
  description: 'Multi-part series on key theological and practical topics.',
}

export default function TopicalPage() {
  const series = getAll<TeachingFrontmatter>('teaching/topical')

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 lg:py-16">
      <div className="mb-12">
        <Link
          href="/teaching"
          className="text-[11px] tracking-wide uppercase text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          ← Teaching
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900">
          Topical Series
        </h1>
        <p className="mt-3 text-base text-zinc-500 max-w-xl">
          Multi-part studies on key theological topics, doctrines, and areas of Christian life.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {series.map(({ frontmatter: fm, slug }) => (
          <Link
            key={slug}
            href={`/teaching/topical/${slug}`}
            className="group border border-zinc-100 p-7 hover:border-zinc-200 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-[10px] font-semibold tracking-[0.14em] uppercase"
                style={{ color: '#cdb079' }}
              >
                Topical
              </span>
              <span className="text-[11px] text-zinc-400">
                {fm.status === 'ongoing' ? 'Ongoing' : `${fm.parts} parts`}
              </span>
            </div>
            <h2 className="text-base font-semibold leading-snug tracking-tight text-zinc-900 group-hover:text-zinc-500 transition-colors mb-2">
              {fm.title}
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed line-clamp-3">{fm.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
