'use client'

import { useEffect, useState } from 'react'

/*
  TEMPORARY. A floating chip for comparing the two candidate secondary accents
  live on the running site, since swatches do not tell you much in context.

  Sets data-accent on <html>, which globals.css reads to resolve --awd-accent-2.
  The choice persists in localStorage so it survives a reload.

  Once one is chosen: delete this component, drop it from app/page.tsx, and
  hard-code --awd-accent-2 in globals.css to the winner.
*/

type Accent = 'steel' | 'sage'

const LABELS: Record<Accent, string> = {
  steel: 'Steel #748790',
  sage: 'Sage #7F8A78',
}

export default function AccentToggle() {
  const [accent, setAccent] = useState<Accent>('steel')

  useEffect(() => {
    let stored: string | null = null
    try {
      stored = window.localStorage.getItem('awd-accent')
    } catch {
      // Private windows and blocked site data throw on access; ignore.
    }
    const initial: Accent = stored === 'sage' ? 'sage' : 'steel'
    setAccent(initial)
    document.documentElement.setAttribute('data-accent', initial)
  }, [])

  function choose(next: Accent) {
    setAccent(next)
    document.documentElement.setAttribute('data-accent', next)
    try {
      window.localStorage.setItem('awd-accent', next)
    } catch {
      // Non-fatal: the toggle still works for this page view.
    }
  }

  return (
    <div
      className="fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/15 p-1 backdrop-blur-md"
      style={{ background: 'color-mix(in srgb, var(--awd-black) 70%, transparent)' }}
    >
      <span className="px-3 text-[0.6rem] uppercase tracking-[0.16em] text-white/40">
        2nd accent
      </span>
      {(['steel', 'sage'] as Accent[]).map(a => (
        <button
          key={a}
          type="button"
          onClick={() => choose(a)}
          className="flex items-center gap-2 rounded-full px-3.5 py-2 text-[0.65rem] uppercase tracking-[0.12em] transition-colors"
          style={{
            background: accent === a ? 'rgba(255,255,255,0.10)' : 'transparent',
            color: accent === a ? 'var(--awd-bone)' : 'rgba(238,234,225,0.5)',
          }}
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: a === 'steel' ? '#748790' : '#7f8a78' }}
          />
          {LABELS[a]}
        </button>
      ))}
    </div>
  )
}
