'use client'

import { useState, useEffect } from 'react'
import { splitGreek, initGreekMorph } from '@/lib/greek-morph'
import GreekWord from '@/components/greek-tooltip'

const PLACEHOLDER = `Ἐν ἀρχῇ ἦν ὁ λόγος, καὶ ὁ λόγος ἦν πρὸς τὸν θεόν, καὶ θεὸς ἦν ὁ λόγος.`

export default function GreekToolClient() {
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(PLACEHOLDER)
  const [wasmReady, setWasmReady] = useState(false)

  // Load WASM on mount
  useEffect(() => {
    initGreekMorph().then((m) => setWasmReady(!!m))
  }, [])

  const segments = splitGreek(submitted)

  return (
    <div>
      {/* Input */}
      <div className="mb-8">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste Greek text here…"
          rows={4}
          className="w-full resize-y px-4 py-3 text-[1rem] outline-none transition-colors"
          style={{
            fontFamily: 'var(--font-source-serif)',
            background: '#fff',
            border: '1px solid #E2DACE',
            color: '#1A1714',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#B8892E')}
          onBlur={(e) => (e.target.style.borderColor = '#E2DACE')}
        />
        <div className="flex items-center gap-3 mt-2.5">
          <button
            onClick={() => { if (input.trim()) setSubmitted(input.trim()) }}
            disabled={!input.trim()}
            className="px-5 py-2 text-[0.72rem] font-bold tracking-[0.1em] uppercase text-white transition-opacity disabled:opacity-40"
            style={{ background: '#7A5C1E' }}
          >
            Parse Text
          </button>
          <button
            onClick={() => { setInput(''); setSubmitted(PLACEHOLDER) }}
            className="text-[0.72rem] font-medium tracking-[0.08em] uppercase transition-colors hover:text-[#B8892E]"
            style={{ color: '#9A9189' }}
          >
            Reset
          </button>
          {!wasmReady && (
            <span
              className="text-[0.68rem]"
              style={{ fontFamily: 'var(--font-source-serif)', color: '#C8BFA8', fontStyle: 'italic' }}
            >
              Loading morphology database…
            </span>
          )}
        </div>
      </div>

      {/* Rendered text */}
      <div
        className="p-6 lg:p-8 leading-[2.2]"
        style={{
          background: '#fff',
          border: '1px solid #E2DACE',
          fontFamily: 'var(--font-source-serif)',
          fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
          color: '#1A1714',
        }}
      >
        {segments.map((seg, i) =>
          seg.greek ? (
            // Each individual Greek word gets its own GreekWord
            seg.text.split(/(\s+)/).map((token, j) => {
              if (/^\s+$/.test(token)) return <span key={`${i}-${j}`}>{token}</span>
              // Strip leading/trailing punctuation for lookup but display full token
              const stripped = token.replace(/^[.,;·:!?—()\[\]"'«»]+|[.,;·:!?—()\[\]"'«»]+$/g, '')
              const before = token.slice(0, token.length - token.trimStart().length + (token.length - stripped.length - (token.length - stripped.length - (token.replace(/^[.,;·:!?—()\[\]"'«»]+/, '').length - stripped.length))))
              const after = token.slice(token.length - (token.length - token.replace(/[.,;·:!?—()\[\]"'«»]+$/, '').length))

              if (!stripped) return <span key={`${i}-${j}`}>{token}</span>
              return (
                <span key={`${i}-${j}`}>
                  {token.replace(stripped, '') !== '' && token.startsWith(token.replace(stripped, '').charAt(0))
                    ? token.replace(stripped, '').charAt(0)
                    : ''}
                  <GreekWord>{stripped}</GreekWord>
                  {after}
                </span>
              )
            })
          ) : (
            <span key={i}>{seg.text}</span>
          )
        )}
      </div>

      {/* Instructions */}
      <p
        className="mt-4 text-[0.75rem] leading-[1.7]"
        style={{ fontFamily: 'var(--font-source-serif)', color: '#C8BFA8' }}
      >
        Hover to preview · Click to pin open · Click again or press Escape to dismiss.
        Data: MorphGNT (SBL Greek NT) + Dodson NT Lexicon.
      </p>
    </div>
  )
}
