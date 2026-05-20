'use client'

import { useState } from 'react'
import Link from 'next/link'

type Book = {
  title: string
  author: string
  coverImageUrl: string
}

export default function BookCovers({ books }: { books: Book[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  return (
    <div className="hidden lg:flex gap-4 items-end justify-center">
      {books.map((book, i) => {
        const isHovered = hoveredIdx === i
        const baseRotation = (i - Math.floor(books.length / 2)) * 4
        return (
          <Link
            key={book.title}
            href="/library"
            className="relative flex-shrink-0 group"
            style={{ width: 72 + i * 6 }}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div
              className="overflow-hidden shadow-lg"
              style={{
                transform: isHovered
                  ? 'rotate(0deg) translateY(-10px) scale(1.04)'
                  : `rotate(${baseRotation}deg) translateY(0px) scale(1)`,
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: isHovered
                  ? '0 20px 40px rgba(0,0,0,0.5)'
                  : '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={book.coverImageUrl} alt={book.title} className="w-full h-auto block" />
            </div>

            {/* Tooltip on hover */}
            {isHovered && (
              <div
                className="absolute bottom-full left-1/2 mb-3 w-40 p-2.5 text-left pointer-events-none"
                style={{
                  transform: 'translateX(-50%)',
                  background: 'rgba(9,9,11,0.95)',
                  border: '1px solid rgba(205,176,121,0.3)',
                }}
              >
                <p className="text-[12px] font-semibold text-white leading-snug line-clamp-2">{book.title}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">{book.author}</p>
              </div>
            )}
          </Link>
        )
      })}
    </div>
  )
}
