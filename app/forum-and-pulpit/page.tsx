import type { Metadata } from 'next'
import Link from 'next/link'
import { getAll, sortByDate, type ArticleFrontmatter } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Forum & Pulpit',
  description: 'Essays on the church, culture, and Christian public witness.',
}

export default function ForumAndPulpitPage() {
  const articles = sortByDate(getAll<ArticleFrontmatter>('forum-and-pulpit'))

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 lg:py-16">
      <div className="mb-12">
        <span
          className="text-[10px] font-semibold tracking-[0.16em] uppercase"
          style={{ color: '#cdb079' }}
        >
          Forum & Pulpit
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">
          Church & Culture
        </h1>
        <p className="mt-3 text-base text-zinc-500 max-w-xl">
          Essays on Christian witness in the public square, pastoral practice, and the life of the church in the world.
        </p>
      </div>

      <div className="divide-y divide-zinc-100">
        {articles.map(({ frontmatter: fm, slug }) => (
          <Link
            key={slug}
            href={`/forum-and-pulpit/${slug}`}
            className="group flex flex-col sm:flex-row sm:items-start gap-4 py-8 hover:opacity-80 transition-opacity"
          >
            <div className="sm:w-32 flex-shrink-0">
              <span className="text-[10px] font-semibold tracking-[0.14em] uppercase" style={{ color: '#cdb079' }}>
                {fm.category}
              </span>
              <p className="mt-1 text-[11px] text-zinc-400">
                {new Date(fm.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold leading-snug tracking-tight text-zinc-900 group-hover:text-zinc-500 transition-colors mb-2">
                {fm.title}
              </h2>
              <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2">{fm.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
