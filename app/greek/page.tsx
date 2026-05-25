import type { Metadata } from 'next'
import GreekToolClient from './greek-tool-client'

export const metadata: Metadata = {
  title: 'Greek Morphology Tool — Austin W. Duncan',
  description: 'Paste Greek NT text to see morphological parsing, inflected glosses, and grammatical significance for every word.',
}

export default function GreekToolPage() {
  return (
    <div style={{ background: '#FAFAF7', minHeight: '100vh' }}>
      <div className="mx-auto max-w-[860px] px-5 py-12 lg:py-16">

        {/* Header */}
        <div className="mb-10">
          <p
            className="text-[0.62rem] font-bold tracking-[0.22em] uppercase mb-3"
            style={{ color: '#B8892E' }}
          >
            Tool
          </p>
          <h1
            className="leading-[1.06] tracking-tight mb-4"
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 600,
              color: '#1A1714',
            }}
          >
            Greek Morphology
          </h1>
          <p
            className="leading-[1.72] max-w-[560px]"
            style={{
              fontFamily: 'var(--font-source-serif)',
              fontSize: '0.95rem',
              color: '#5A544C',
            }}
          >
            Paste any Greek NT text below. Click or hover any word to see its
            parsing, an inflected gloss, and a note on what the grammar actually means.
          </p>
        </div>

        <GreekToolClient />
      </div>
    </div>
  )
}
