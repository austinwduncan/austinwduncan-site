'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export type SeriesItem = {
  name: string
  image?: string
  count: number
  slug: string
  type: 'expositional' | 'topical'
  excerpt?: string
}

export default function TeachingSeriesPicker({ series }: { series: SeriesItem[] }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const active = series[activeIdx]

  if (!active) return null

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-0">
      {/* Left: featured series display */}
      <div className="lg:pr-10 lg:border-r lg:border-zinc-200">
        {active.image && (
          <div className="mb-6 overflow-hidden bg-zinc-100 aspect-[16/9] max-h-[300px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.image}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-[10px] font-bold tracking-[0.18em] uppercase px-2 py-0.5"
            style={{ backgroundColor: '#cdb079', color: '#fff' }}
          >
            {active.type === 'expositional' ? 'Expositional' : 'Topical'}
          </span>
          <span className="text-[12px] text-zinc-400">{active.count} session{active.count !== 1 ? 's' : ''}</span>
        </div>
        <h2
          className="text-2xl lg:text-[2rem] font-bold leading-tight tracking-tight text-zinc-900 mb-3"
          style={{ fontFamily: 'var(--font-cormorant)' }}
        >
          {active.name}
        </h2>
        {active.excerpt && (
          <p className="text-[14px] text-zinc-500 leading-relaxed line-clamp-3 mb-5">
            {active.excerpt}
          </p>
        )}
        <Link
          href={`/teaching/${active.type}/${active.slug}`}
          className="inline-flex items-center gap-1.5 text-[12px] font-bold tracking-[0.12em] uppercase transition-opacity hover:opacity-70"
          style={{ color: '#cdb079' }}
        >
          Begin Series <ArrowRight size={11} />
        </Link>
      </div>

      {/* Right: scrollable series list */}
      <div className="lg:pl-8 mt-8 lg:mt-0">
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-400 mb-4 hidden lg:block">
          All Series —
        </p>
        <div
          className="flex flex-col divide-y divide-zinc-100 overflow-y-auto"
          style={{ maxHeight: '360px' }}
        >
          {series.map((s, i) => (
            <button
              key={s.name}
              onClick={() => setActiveIdx(i)}
              className={`group w-full text-left py-4 flex gap-3 transition-colors ${
                i === activeIdx ? 'opacity-100' : 'opacity-60 hover:opacity-100'
              }`}
            >
              {s.image && (
                <div
                  className="flex-shrink-0 overflow-hidden bg-zinc-100"
                  style={{ width: 52, aspectRatio: '16/9' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.image} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className="text-[9px] font-bold tracking-[0.12em] uppercase"
                    style={{ color: i === activeIdx ? '#cdb079' : '#999' }}
                  >
                    {s.type === 'expositional' ? 'Expositional' : 'Topical'}
                  </span>
                </div>
                <p
                  className={`text-[13px] font-semibold leading-snug ${
                    i === activeIdx ? 'text-zinc-900' : 'text-zinc-600 group-hover:text-zinc-900'
                  } transition-colors`}
                >
                  {s.name}
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">{s.count} sessions</p>
              </div>
              {i === activeIdx && (
                <div className="ml-auto flex-shrink-0 self-center">
                  <div className="w-1 h-6 rounded-full" style={{ backgroundColor: '#cdb079' }} />
                </div>
              )}
            </button>
          ))}
        </div>
        <div className="pt-4 border-t border-zinc-100 mt-2">
          <Link
            href="/teaching"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] uppercase transition-opacity hover:opacity-70"
            style={{ color: '#cdb079' }}
          >
            All Teaching <ArrowRight size={10} />
          </Link>
        </div>
      </div>
    </div>
  )
}
