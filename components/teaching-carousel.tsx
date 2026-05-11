'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'

type Series = {
  category: string
  title: string
  excerpt: string
  href: string
  meta: string
}

const allSeries: Series[] = [
  {
    category: 'Expositional',
    title: 'The Letter to the Romans',
    excerpt:
      "A verse-by-verse walk through Paul's definitive statement of the gospel — from the wrath of God through justification by faith to the doxology of chapters 9–11 and the renewed ethics of 12–16. This series is currently in progress.",
    href: '/teaching/expositional/romans',
    meta: 'Ongoing',
  },
  {
    category: 'Topical',
    title: 'The Doctrines of Grace',
    excerpt:
      'Five sessions on the TULIP: what the Reformation recovered, and why it still matters for the local church today.',
    href: '/teaching/topical/doctrines-of-grace',
    meta: '5 parts',
  },
  {
    category: 'Expositional',
    title: 'A Walk through Philippians',
    excerpt:
      "Paul's letter of joy from a Roman prison cell — a study in contentment, unity, and the mind of Christ.",
    href: '/teaching/expositional/philippians',
    meta: '8 parts',
  },
  {
    category: 'Topical',
    title: 'What Is the Church?',
    excerpt:
      'A six-part ecclesiology series for the local congregation: what the church is, what it does, and why it matters.',
    href: '/teaching/topical/ecclesiology',
    meta: '6 parts',
  },
]

export default function TeachingCarousel() {
  const [activeIdx, setActiveIdx] = useState(0)
  const featured = allSeries[activeIdx]

  return (
    <div className="grid lg:grid-cols-[1fr_260px] gap-10 lg:gap-14 xl:gap-20">
      {/* Featured series */}
      <article className="bg-white border border-zinc-200 p-8 lg:p-10">
        <span
          className="text-[11px] font-semibold tracking-[0.14em] uppercase"
          style={{ color: '#cdb079' }}
        >
          {featured.category}
        </span>
        <h3 className="mt-3 text-2xl lg:text-[1.65rem] font-bold leading-tight tracking-tight text-zinc-900">
          {featured.title}
        </h3>
        <p className="mt-4 text-[15px] text-zinc-500 leading-relaxed">
          {featured.excerpt}
        </p>
        <Link
          href={featured.href}
          className="mt-7 inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] uppercase hover:opacity-75 transition-opacity"
          style={{ color: '#cdb079' }}
        >
          Continue Series <ArrowRight size={11} />
        </Link>
      </article>

      {/* Series selector */}
      <div className="flex flex-col divide-y divide-zinc-100">
        {allSeries.map((s, i) => {
          const isSelected = i === activeIdx
          return (
            <button
              key={s.href}
              onClick={() => setActiveIdx(i)}
              className={`group w-full text-left py-5 first:pt-0 last:pb-0 transition-all ${
                isSelected ? 'opacity-35 cursor-default' : 'cursor-pointer'
              }`}
            >
              <span
                className="text-[10px] font-semibold tracking-[0.14em] uppercase"
                style={{ color: '#cdb079' }}
              >
                {s.category}
              </span>
              <h4
                className={`mt-1.5 text-[14px] font-semibold leading-snug transition-colors ${
                  isSelected ? 'text-zinc-600' : 'text-zinc-800 group-hover:text-zinc-500'
                }`}
              >
                {s.title}
              </h4>
              <p className="mt-1 text-[12px] text-zinc-400">{s.meta}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
