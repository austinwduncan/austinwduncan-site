'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ParseEntry } from '@/lib/greek-morph'

type Props = {
  word: string
  entries: ParseEntry[] | null
  loading: boolean
  onClose: () => void
  anchorEl: HTMLElement | null
}

type Pos = { top: number; left: number }

export default function GreekPopover({ word, entries, loading, onClose, anchorEl }: Props) {
  const [pos, setPos] = useState<Pos | null>(null)
  const [mounted, setMounted] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Portal needs document to exist
  useEffect(() => setMounted(true), [])

  // Position relative to anchor
  useEffect(() => {
    if (!anchorEl) return
    const rect = anchorEl.getBoundingClientRect()
    const scrollY = window.scrollY
    const scrollX = window.scrollX
    const PW = 296 // panel width
    const vw = window.innerWidth
    const padding = 12

    let left = rect.left + scrollX
    if (left + PW > vw - padding) left = vw - PW - padding
    if (left < padding) left = padding

    // Always open below — if near bottom of viewport, let it scroll
    const top = rect.bottom + scrollY + 10

    setPos({ top, left })
  }, [anchorEl])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        anchorEl &&
        !anchorEl.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [anchorEl, onClose])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!mounted || !pos) return null

  const primaryEntry = entries?.[0] ?? null
  const extraEntries = entries?.slice(1) ?? []

  const panel = (
    <div
      ref={panelRef}
      style={{
        position: 'absolute',
        top: pos.top,
        left: pos.left,
        width: 296,
        background: '#141210',
        border: '1px solid rgba(184,137,46,0.28)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        zIndex: 9999,
      }}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between px-4 pt-4 pb-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div>
          <span
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.65rem',
              fontWeight: 400,
              color: '#F9F6F0',
              lineHeight: 1,
              display: 'block',
            }}
          >
            {word}
          </span>
          {primaryEntry && (
            <span
              style={{
                fontSize: '0.68rem',
                color: '#B8892E',
                display: 'block',
                marginTop: 4,
                fontStyle: 'italic',
              }}
            >
              {primaryEntry.lemma}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            color: 'rgba(255,255,255,0.22)',
            fontSize: '1.1rem',
            lineHeight: 1,
            marginTop: 2,
            cursor: 'pointer',
          }}
        >
          ×
        </button>
      </div>

      {/* Body */}
      {loading && (
        <div
          className="px-4 py-5"
          style={{
            fontFamily: 'var(--font-source-serif)',
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.25)',
            fontStyle: 'italic',
          }}
        >
          Looking up…
        </div>
      )}

      {!loading && (!entries || entries.length === 0) && (
        <div
          className="px-4 py-5"
          style={{
            fontFamily: 'var(--font-source-serif)',
            fontSize: '0.82rem',
            color: 'rgba(255,255,255,0.3)',
            fontStyle: 'italic',
          }}
        >
          Not found in NT morphology database.
        </div>
      )}

      {!loading && primaryEntry && (
        <div>
          <EntryPanel entry={primaryEntry} />

          {/* Additional parsings (same form, different function) */}
          {extraEntries.length > 0 && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <p
                className="px-4 pt-3 pb-1"
                style={{
                  fontSize: '0.58rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.2)',
                }}
              >
                Also possible
              </p>
              {extraEntries.slice(0, 2).map((e, i) => (
                <EntryPanel key={i} entry={e} compact />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom — full gloss */}
      {!loading && primaryEntry && (
        <div
          className="px-4 py-2.5"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <p
            style={{
              fontSize: '0.62rem',
              color: 'rgba(255,255,255,0.2)',
              fontStyle: 'italic',
            }}
          >
            {primaryEntry.gloss}
          </p>
        </div>
      )}
    </div>
  )

  return createPortal(panel, document.body)
}

function EntryPanel({ entry, compact = false }: { entry: ParseEntry; compact?: boolean }) {
  // Most relevant note: tense for verbs, case for nouns
  const significanceNote =
    entry.tense_note ??
    entry.mood_note ??
    entry.case_note ??
    entry.voice_note ??
    null

  return (
    <div className={compact ? 'px-4 py-2.5' : 'px-4 py-4'}>
      {/* Parsing line */}
      <p
        style={{
          fontSize: '0.58rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#B8892E',
          marginBottom: compact ? 4 : 8,
        }}
      >
        {entry.parsing_human}
      </p>

      {/* Inflected gloss — the star of the show */}
      {!compact && (
        <p
          style={{
            fontFamily: 'var(--font-source-serif)',
            fontSize: '1.05rem',
            color: '#F9F6F0',
            fontStyle: 'italic',
            marginBottom: significanceNote ? 10 : 0,
            lineHeight: 1.4,
          }}
        >
          &ldquo;{entry.inflected_gloss}&rdquo;
        </p>
      )}

      {compact && (
        <p
          style={{
            fontFamily: 'var(--font-source-serif)',
            fontSize: '0.82rem',
            color: 'rgba(249,246,240,0.6)',
            fontStyle: 'italic',
          }}
        >
          {entry.inflected_gloss}
        </p>
      )}

      {/* Significance note */}
      {!compact && significanceNote && (
        <p
          style={{
            fontFamily: 'var(--font-source-serif)',
            fontSize: '0.78rem',
            color: 'rgba(249,246,240,0.5)',
            lineHeight: 1.7,
          }}
        >
          {significanceNote}
        </p>
      )}
    </div>
  )
}
