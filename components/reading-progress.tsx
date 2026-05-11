'use client'

import { useEffect, useState } from 'react'

export default function ReadingProgress() {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    function update() {
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      setPct(max > 0 ? (window.scrollY / max) * 100 : 0)
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div className="reading-progress fixed bottom-0 left-0 right-0 z-50 h-[3px] bg-zinc-100">
      <div
        className="h-full"
        style={{ width: `${pct}%`, backgroundColor: '#cdb079', transition: 'width 80ms linear' }}
      />
    </div>
  )
}
