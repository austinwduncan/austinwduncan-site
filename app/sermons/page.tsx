import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getAll, sortByDate, type SermonFrontmatter } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Sermons',
  description: 'Weekly expository messages from Sunday worship.',
}

export default function SermonsPage() {
  const sermons = sortByDate(getAll<SermonFrontmatter>('sermons'))

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14 lg:py-16">
      <div className="mb-12">
        <span
          className="text-[10px] font-semibold tracking-[0.16em] uppercase"
          style={{ color: '#cdb079' }}
        >
          Sermons
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900">
          Sunday Messages
        </h1>
        <p className="mt-3 text-base text-zinc-500 max-w-xl">
          Weekly expository messages preached to the congregation — working verse by verse through books of the Bible.
        </p>
      </div>

      <div className="divide-y divide-zinc-100">
        {sermons.map(({ frontmatter: fm, slug }) => (
          <article key={slug} className="group py-7 first:pt-0">
            <Link href={`/sermons/${slug}`} className="block">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className="text-[10px] font-semibold tracking-[0.14em] uppercase"
                      style={{ color: '#cdb079' }}
                    >
                      {fm.series ?? 'Sermon'}
                    </span>
                    {fm.scripture && (
                      <>
                        <span className="text-zinc-300 text-xs">·</span>
                        <span className="text-[11px] text-zinc-400">{fm.scripture}</span>
                      </>
                    )}
                  </div>
                  <h2 className="text-lg font-semibold leading-snug tracking-tight text-zinc-900 group-hover:text-zinc-500 transition-colors mb-2">
                    {fm.title}
                  </h2>
                  <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2">{fm.excerpt}</p>
                </div>
                <div className="sm:text-right shrink-0">
                  <p className="text-[12px] text-zinc-400 mb-2">{fm.date}</p>
                  {fm.duration && (
                    <p className="text-[11px] text-zinc-400">{fm.duration}</p>
                  )}
                  <ArrowRight
                    size={14}
                    className="mt-2 ml-auto text-zinc-300 group-hover:text-gold transition-colors hidden sm:block"
                  />
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
