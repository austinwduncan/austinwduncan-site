'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { lookupWord, initGreekMorph, type ParseEntry } from '@/lib/greek-morph'
import GreekPopover from '@/components/greek-popover'

// Used in MDX as <GreekWord>πιστεύει</GreekWord>
// Also registered as <G> shorthand — see lib/mdx-components.tsx
export default function GreekWord({ children }: { children: string }) {
  const [entries, setEntries] = useState<ParseEntry[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [pinned, setPinned] = useState(false)
  const spanRef = useRef<HTMLSpanElement>(null)

  // Pre-warm the WASM loader on mount so first hover is instant
  useEffect(() => { initGreekMorph() }, [])

  const resolve = useCallback(async () => {
    if (entries !== null) return
    setLoading(true)
    const result = await lookupWord(children)
    setEntries(result)
    setLoading(false)
  }, [children, entries])

  const handleMouseEnter = useCallback(() => {
    resolve()
    setOpen(true)
  }, [resolve])

  const handleMouseLeave = useCallback(() => {
    // Hover closes only if not pinned by a click
    if (!pinned) setOpen(false)
  }, [pinned])

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (open && pinned) {
      setOpen(false)
      setPinned(false)
    } else if (open && !pinned) {
      // Hover-open → click pins it open
      setPinned(true)
    } else {
      resolve()
      setOpen(true)
      setPinned(true)
    }
  }, [open, pinned, resolve])

  const handleClose = useCallback(() => {
    setOpen(false)
    setPinned(false)
  }, [])

  return (
    <span className="relative inline" ref={spanRef}>
      <span
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="cursor-pointer border-b border-dotted transition-colors duration-150 not-italic"
        style={{
          borderColor: open ? '#CDB079' : 'rgba(205,176,121,0.5)',
          color: open ? '#6E5A2E' : 'inherit',
        }}
      >
        {children}
      </span>

      {open && (
        <GreekPopover
          word={children}
          entries={entries}
          loading={loading}
          onClose={handleClose}
          anchorEl={spanRef.current}
        />
      )}
    </span>
  )
}
