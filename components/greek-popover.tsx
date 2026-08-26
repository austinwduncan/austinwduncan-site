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
type AiResult = { meaning: string | null; why: string | null }

// Module-level cache: lemma:parsing → AI result
const aiCache = new Map<string, AiResult>()

export default function GreekPopover({ word, entries, loading, onClose, anchorEl }: Props) {
  const [pos, setPos] = useState<Pos | null>(null)
  const [mounted, setMounted] = useState(false)
  const [aiResult, setAiResult] = useState<AiResult | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!anchorEl) return
    const rect = anchorEl.getBoundingClientRect()
    const scrollY = window.scrollY
    const scrollX = window.scrollX
    const PW = 320
    const PH_EST = 340
    const GAP = 10
    const PAD = 12
    const vw = window.innerWidth
    const vh = window.innerHeight

    let vLeft = rect.left
    if (vLeft + PW > vw - PAD) vLeft = vw - PW - PAD
    if (vLeft < PAD) vLeft = PAD
    const left = vLeft + scrollX

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

  // Fetch AI explanation when the primary entry is known
  const primaryEntry = entries?.[0] ?? null
  useEffect(() => {
    if (!primaryEntry) { setAiResult(null); return }
    const key = `${primaryEntry.lemma}:${primaryEntry.parsing}`
    const cached = aiCache.get(key)
    if (cached) { setAiResult(cached); setAiLoading(false); return }

    setAiResult(null)
    setAiLoading(true)
    let cancelled = false

    fetch('/api/greek-explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word, ...primaryEntry }),
    })
      .then(r => r.json())
      .then((data: AiResult) => {
        if (cancelled) return
        aiCache.set(key, data)
        setAiResult(data)
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setAiLoading(false) })

    return () => { cancelled = true }
  }, [primaryEntry, word])

  if (!mounted || !pos) return null

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
        border: '1px solid rgba(205,176,121,0.28)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
        zIndex: 9999,
      }}
    >
      {/* Header: word + lemma + close */}
      <div
        className="flex items-start justify-between px-4 pt-4 pb-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              fontFamily: 'var(--font-source-serif), Georgia, serif',
              fontSize: '1.7rem',
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
          <EntryPanel
            entry={primaryEntry}
            aiResult={aiResult}
            aiLoading={aiLoading}
          />

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

function EntryPanel({
  entry,
  compact = false,
  aiResult,
  aiLoading,
}: {
  entry: ParseEntry
  compact?: boolean
  aiResult?: AiResult | null
  aiLoading?: boolean
}) {
  const significanceNote =
    entry.tense_note ?? entry.mood_note ?? entry.case_note ?? entry.voice_note ?? null

  if (compact) {
    return (
      <div className="px-4 py-2.5">
        <p style={{ fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(205,176,121,0.6)', marginBottom: 3 }}>
          {entry.parsing_human}
        </p>
        <p style={{ fontFamily: 'var(--font-source-serif)', fontSize: '0.82rem', color: 'rgba(249,246,240,0.55)', fontStyle: 'italic' }}>
          {entry.inflected_gloss}
        </p>
      </div>
    )
  }

  // Which meaning and why text to show
  const meaningText = aiResult?.meaning ?? null
  const whyText = aiResult?.why ?? (aiResult ? null : significanceNote)
  const showAlgoMeaning = !aiResult && !aiLoading

  return (
    <div className="px-4 py-3.5" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Gloss */}
      <div>
        <span style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(205,176,121,0.6)', marginRight: 6 }}>
          Gloss:
        </span>
        <span style={{ fontFamily: 'var(--font-source-serif)', fontSize: '0.82rem', color: 'rgba(249,246,240,0.6)' }}>
          {entry.gloss}
        </span>
      </div>

      {/* Here's what it means */}
      <div>
        <p style={{ fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>
          Here&rsquo;s what it means:
        </p>
        {aiLoading && !meaningText && (
          <p style={{ fontFamily: 'var(--font-source-serif)', fontSize: '0.85rem', color: 'rgba(249,246,240,0.25)', fontStyle: 'italic' }}>
            &ldquo;{entry.inflected_gloss}&rdquo;
          </p>
        )}
        {meaningText && (
          <p style={{ fontFamily: 'var(--font-source-serif)', fontSize: '0.92rem', color: '#F9F6F0', lineHeight: 1.6 }}>
            {meaningText}
          </p>
        )}
        {showAlgoMeaning && (
          <p style={{ fontFamily: 'var(--font-source-serif)', fontSize: '1.02rem', color: '#F9F6F0', fontStyle: 'italic', lineHeight: 1.4 }}>
            &ldquo;{entry.inflected_gloss}&rdquo;
          </p>
        )}
      </div>

      {/* Here's why the grammar makes it mean that */}
      {(whyText || aiLoading) && (
        <div>
          <p style={{ fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>
            Here&rsquo;s why the grammar makes it mean that:
          </p>
          {aiLoading && !whyText && (
            <p style={{ fontFamily: 'var(--font-source-serif)', fontSize: '0.78rem', color: 'rgba(249,246,240,0.2)', fontStyle: 'italic', lineHeight: 1.6 }}>
              {significanceNote ?? 'Thinking…'}
            </p>
          )}
          {whyText && (
            <p style={{ fontFamily: 'var(--font-source-serif)', fontSize: '0.88rem', color: 'rgba(249,246,240,0.75)', lineHeight: 1.65 }}>
              {whyText}
            </p>
          )}
        </div>
      )}

      {/* Abbott-Smith definition — dimmed at bottom as reference */}
      {entry.short_def && (
        <p
          style={{
            fontFamily: 'var(--font-source-serif)',
            fontSize: '0.72rem',
            color: 'rgba(249,246,240,0.22)',
            lineHeight: 1.65,
            borderTop: '1px solid rgba(255,255,255,0.05)',
            paddingTop: 10,
          }}
        >
          {entry.short_def}
        </p>
      )}
    </div>
  )
}
