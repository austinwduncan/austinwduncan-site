import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getAllTeaching, sortByDate, isPublished, type TeachingFrontmatter } from '@/lib/content'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Topical Teaching',
  description: 'Multi-part studies on key biblical and theological topics.',
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  })
}

export default function TopicalPage() {
  const all = sortByDate(
    getAllTeaching<TeachingFrontmatter>('topical').filter((a) => isPublished(a.frontmatter.date))
  )

  // Group by series (last tag)
  const seriesMap = new Map<string, typeof all>()
  for (const item of all) {
    const series = item.frontmatter.tags?.[item.frontmatter.tags.length - 1] ?? 'Other'
    if (!seriesMap.has(series)) seriesMap.set(series, [])
    seriesMap.get(series)!.push(item)
  }

  const seriesList = [...seriesMap.entries()]

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
          Multi-part studies on key biblical and theological topics.
        </p>
      </div>

      <div className="space-y-14">
        {seriesList.map(([seriesName, items]) => (
          <div key={seriesName}>
            <div className="flex items-center gap-3 mb-6 pb-3" style={{ borderBottom: '2px solid #cdb079' }}>
              <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-zinc-900">
                {seriesName}
              </span>
              <span className="text-[11px] text-zinc-400">· {items.length} sessions</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
              {items.map(({ frontmatter: fm, slug }) => (
                <Link key={slug} href={`/teaching/topical/${slug}`} className="group border-t border-zinc-200 pt-5">
                  {fm.image && (
                    <div className="mb-4 overflow-hidden bg-zinc-100 aspect-[16/9]">
                      <Image
                        src={fm.image}
                        alt=""
                        width={400}
                        height={225}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    </div>
                  )}
                  <h3 className="text-[15px] font-semibold leading-snug text-zinc-900 group-hover:text-zinc-500 transition-colors mb-1.5">
                    {fm.title}
                  </h3>
                  <p className="text-[12px] text-zinc-400">{formatDate(fm.date)}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
