import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'

/*
  Shared pieces for the About pages, so the typeface and palette are named
  once. Headings are Bebas Neue (caps only, one weight). Body is Montserrat.
*/

export const INK = '#1C2427'
export const PRIMARY = '#3D484C'
export const PRIMARY_DEEP = '#262D31'
export const SOFT_BLUE = '#7B9BB5'
export const SOFT_BLUE_LIGHT = '#9DB4C8'
export const ACCENT = '#4F6B84'
export const WHITE = '#FFFFFF'
export const LIGHT_GRAY = '#F4F4F5'
export const RULE = 'rgba(28,36,39,0.1)'

export const BODY_FONT = 'var(--font-cmg), system-ui, sans-serif'

export function display(fontSize: string, color: string): CSSProperties {
  return {
    fontFamily: 'var(--font-bebas), var(--font-cmg), sans-serif',
    fontSize,
    fontWeight: 400,
    letterSpacing: '0.01em',
    lineHeight: 0.9,
    textTransform: 'uppercase',
    color,
  }
}

export const H1_SIZE = 'clamp(2.6rem, 4.6vw, 4rem)'
export const H2_SIZE = 'clamp(2rem, 3.2vw, 2.75rem)'
export const H3_SIZE = 'clamp(1.5rem, 2.1vw, 1.9rem)'

export function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-8 shrink-0" style={{ background: SOFT_BLUE }} />
      <span
        className="text-[0.72rem] font-semibold tracking-[0.2em] uppercase"
        style={{ fontFamily: BODY_FONT, color: dark ? SOFT_BLUE_LIGHT : ACCENT }}
      >
        {children}
      </span>
    </div>
  )
}

export function SubpageHeader({ title, note }: { title: string; note?: string }) {
  return (
    <section style={{ background: PRIMARY_DEEP }}>
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8 pt-20 pb-16 lg:pt-28 lg:pb-20">
        <Eyebrow dark>About</Eyebrow>
        <h1 className="mt-6" style={display(H1_SIZE, WHITE)}>
          {title}
        </h1>
        {note && (
          <p
            className="mt-6 max-w-[520px] text-[1rem] leading-[1.7]"
            style={{ fontFamily: BODY_FONT, color: SOFT_BLUE_LIGHT }}
          >
            {note}
          </p>
        )}
      </div>
    </section>
  )
}

export function BackToAbout() {
  return (
    <div className="mt-16 pt-8 border-t" style={{ borderColor: RULE }}>
      <Link
        href="/about"
        className="text-[0.85rem] font-medium transition-colors hover:text-[#262D31]"
        style={{ fontFamily: BODY_FONT, color: ACCENT }}
      >
        ← Back to About
      </Link>
    </div>
  )
}
