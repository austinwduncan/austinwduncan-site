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

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!anchorEl) return
    const rect = anchorEl.getBoundingClientRect()
    const scrollY = window.scrollY
    const scrollX = window.scrollX
    const PW = 320
    const PH_EST = 320
    const GAP = 10
    const PAD = 12
    const vw = window.innerWidth
    const vh = window.innerHeight

    // Horizontal: clamp in viewport space, then convert to page coords
    let vLeft = rect.left
    if (vLeft + PW > vw - PAD) vLeft = vw - PW - PAD
    if (vLeft < PAD) vLeft = PAD
    const left = vLeft + scrollX

    // Vertical: open below unless too close to bottom of viewport
    const top = (vh - rect.bottom) >= PH_EST + GAP
      ? rect.bottom + scrollY + GAP
      : rect.top + scrollY - PH_EST - GAP

    setPos({ top, left })
  }, [anchorEl])

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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
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
        width: 320,
        background: '#141210',
        border: '1px solid rgba(184,137,46,0.28)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
        zIndex: 9999,
      }}
    >
      {/* Header: word + brief gloss + close */}
      <div
        className="flex items-start justify-between px-4 pt-4 pb-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: '1.7rem',
                fontWeight: 400,
                color: '#F9F6F0',
                lineHeight: 1,
              }}
            >
              {word}
            </span>
            {primaryEntry && (
              <span
                style={{
                  fontSize: '0.72rem',
                  color: '#B8892E',
                  fontStyle: 'italic',
                  lineHeight: 1,
                }}
              >
                {primaryEntry.gloss}
              </span>
            )}
          </div>
          {primaryEntry && (
            <span
              style={{
                fontSize: '0.62rem',
                color: 'rgba(255,255,255,0.28)',
                display: 'block',
                marginTop: 3,
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
            fontSize: '1.15rem',
            lineHeight: 1,
            marginTop: 2,
            marginLeft: 8,
            cursor: 'pointer',
            flexShrink: 0,
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

      {/* Attribution footer */}
      <div
        className="px-4 py-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <p style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.12)' }}>
          MorphGNT · STEPBible/Tyndale House (CC BY)
        </p>
      </div>
    </div>
  )

  return createPortal(panel, document.body)
}

function EntryPanel({ entry, compact = false }: { entry: ParseEntry; compact?: boolean }) {
  const significanceNote =
    entry.tense_note ?? entry.mood_note ?? entry.case_note ?? entry.voice_note ?? null

  return (
    <div className={compact ? 'px-4 py-2.5' : 'px-4 py-3.5'}>
      {/* Parsing label */}
      <p
        style={{
          fontSize: '0.58rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'rgba(184,137,46,0.7)',
          marginBottom: compact ? 3 : 6,
        }}
      >
        {entry.parsing_human}
      </p>

      {/* Inflected gloss — what this form means right here */}
      {!compact && (
        <p
          style={{
            fontFamily: 'var(--font-source-serif)',
            fontSize: '1.08rem',
            color: '#F9F6F0',
            fontStyle: 'italic',
            lineHeight: 1.4,
            marginBottom: significanceNote ? 6 : entry.short_def ? 10 : 0,
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
            color: 'rgba(249,246,240,0.55)',
            fontStyle: 'italic',
          }}
        >
          {entry.inflected_gloss}
        </p>
      )}

      {/* Why this form means that — directly after inflected gloss, no separator */}
      {!compact && significanceNote && (
        <p
          style={{
            fontFamily: 'var(--font-source-serif)',
            fontSize: '0.75rem',
            color: 'rgba(184,137,46,0.55)',
            lineHeight: 1.6,
            marginBottom: entry.short_def ? 10 : 0,
          }}
        >
          {significanceNote}
        </p>
      )}

      {/* Abbott-Smith short definition — broader lexical context, separated below */}
      {!compact && entry.short_def && (
        <p
          style={{
            fontFamily: 'var(--font-source-serif)',
            fontSize: '0.78rem',
            color: 'rgba(249,246,240,0.35)',
            lineHeight: 1.65,
            borderTop: '1px solid rgba(255,255,255,0.05)',
            paddingTop: 8,
          }}
        >
          {entry.short_def}
        </p>
      )}
    </div>
  )
}
