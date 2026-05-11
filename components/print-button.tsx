'use client'

import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-1.5 text-[12px] tracking-wide uppercase text-zinc-400 hover:text-zinc-700 transition-colors"
    >
      <Printer size={13} />
      Print
    </button>
  )
}
