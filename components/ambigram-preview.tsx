'use client'

import { useState } from 'react'

/* The mark is one drawing that reads the same turned 180 degrees, so the only
   honest way to show it is to let the reader turn it and watch nothing change. */
export function AmbigramPreview({ svg }: { svg: string }) {
  const [turned, setTurned] = useState(false)

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="w-full rounded-sm border border-[var(--awd-graphite)] bg-[var(--awd-black)] px-4 py-12 sm:px-10 sm:py-16">
        <div
          className="text-gold transition-transform duration-1000 ease-in-out [&_svg]:block [&_svg]:h-auto [&_svg]:w-full"
          style={{ transform: `rotate(${turned ? 180 : 0}deg)` }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>

      <button
        type="button"
        onClick={() => setTurned((t) => !t)}
        aria-pressed={turned}
        className="border border-gold px-7 py-3 text-xs font-bold tracking-[0.18em] text-gold uppercase transition-colors hover:bg-gold hover:text-[var(--awd-black)]"
      >
        {turned ? 'Turn it back' : 'Turn it over'}
      </button>
    </div>
  )
}
