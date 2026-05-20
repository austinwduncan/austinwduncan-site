'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const PATHS = [
  {
    need: 'I have a Bible question',
    section: 'Word for Word',
    href: '/word-for-word',
    desc: 'Clear, grounded answers to hard questions about Scripture and faith.',
  },
  {
    need: 'I want the latest sermon',
    section: 'Sermons',
    href: '/sermons',
    desc: 'Weekly expositional preaching through the Bible, available anytime.',
  },
  {
    need: 'I want to study more deeply',
    section: 'Exegetica',
    href: '/exegetica',
    desc: 'Text studies with attention to the Greek and Hebrew, argument flow, and context.',
  },
  {
    need: 'I need a book recommendation',
    section: 'Library',
    href: '/library',
    desc: '793 books organized for study, theology, ministry, and formation.',
  },
] as const

export default function HeroPathCard() {
  const [activeIdx, setActiveIdx] = useState(0)

  return (
    <div className="border border-zinc-200 bg-white flex flex-col">
      <div className="px-5 py-3.5 border-b border-zinc-100">
        <p className="text-[10px] font-bold tracking-[0.24em] uppercase text-zinc-400">
          Where do you want to start?
        </p>
      </div>
      <div className="flex flex-col divide-y divide-zinc-100">
        {PATHS.map((path, i) => {
          const isActive = i === activeIdx
          return (
            <Link
              key={path.href}
              href={path.href}
              className={`group flex items-start gap-3 px-5 py-4 transition-colors ${isActive ? 'bg-[#fefdf9]' : 'hover:bg-zinc-50'}`}
              onMouseEnter={() => setActiveIdx(i)}
            >
              {/* Gold active bar */}
              <div
                className="flex-shrink-0 w-0.5 rounded-full mt-0.5 transition-all duration-200"
                style={{
                  height: isActive ? 36 : 16,
                  backgroundColor: isActive ? '#cdb079' : '#e4e4e7',
                }}
              />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-[13px] font-semibold leading-snug transition-colors ${
                    isActive ? 'text-zinc-900' : 'text-zinc-500 group-hover:text-zinc-700'
                  }`}
                >
                  {path.need}
                </p>
                <div
                  style={{
                    maxHeight: isActive ? '48px' : '0',
                    overflow: 'hidden',
                    opacity: isActive ? 1 : 0,
                    transition: 'max-height 0.22s ease, opacity 0.18s ease',
                  }}
                >
                  <p className="text-[12px] text-zinc-500 leading-relaxed mt-1">{path.desc}</p>
                </div>
              </div>
              <div
                className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold tracking-[0.12em] uppercase whitespace-nowrap transition-colors pt-0.5"
                style={{ color: isActive ? '#cdb079' : '#ccc' }}
              >
                {path.section} <ArrowRight size={9} />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
