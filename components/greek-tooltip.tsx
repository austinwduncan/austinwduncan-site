'use client'

import { useState } from 'react'

interface Props {
  word: string
  translit: string
  definition: string
  children: React.ReactNode
}

export default function GreekWord({ word, translit, definition, children }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <span
      className="relative cursor-help inline"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span
        className="border-b border-dotted"
        style={{ borderColor: '#cdb079', color: '#a07840' }}
      >
        {children}
      </span>
      {open && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-20 w-64 bg-zinc-950 text-white text-xs p-3.5 shadow-xl pointer-events-none not-italic">
          <span className="block font-semibold mb-0.5" style={{ color: '#cdb079' }}>
            {word}
          </span>
          <span className="block text-zinc-400 italic text-[11px] mb-1.5">{translit}</span>
          <span className="block text-zinc-300 leading-relaxed">{definition}</span>
        </span>
      )}
    </span>
  )
}
