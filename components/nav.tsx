'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Home', exact: true },
  { href: '/sermons', label: 'Sermons' },
  {
    href: '/teaching',
    label: 'Teaching',
    children: [
      { href: '/teaching/expositional', label: 'Expositional' },
      { href: '/teaching/topical', label: 'Topical' },
    ],
  },
  { href: '/word-for-word', label: 'Word for Word' },
  { href: '/exegetica', label: 'Exegetica' },
  { href: '/forum-and-pulpit', label: 'Forum & Pulpit' },
  { href: '/resources', label: 'Resources' },
  { href: '/about', label: 'About' },
]

function isActive(pathname: string, href: string, exact = false) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(href + '/')
}

export default function Nav() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [teachingOpen, setTeachingOpen] = useState(false)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  return (
    <header className="sticky top-0 z-50 bg-zinc-950 border-b border-zinc-800">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Wordmark */}
          <Link
            href="/"
            className="text-white text-sm font-light tracking-[0.18em] uppercase hover:text-gold transition-colors"
          >
            Austin W. Duncan
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden lg:flex items-center gap-7"
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {navLinks.map((link, i) => {
              const active = isActive(pathname, link.href, link.exact)
              const dimmed = hoveredIdx !== null && hoveredIdx !== i

              if (link.children) {
                return (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => {
                      setHoveredIdx(i)
                      setTeachingOpen(true)
                    }}
                    onMouseLeave={() => setTeachingOpen(false)}
                  >
                    <button
                      className="flex items-center gap-1 text-sm transition-all duration-150"
                      style={{
                        color: active ? '#cdb079' : dimmed ? 'rgba(161,161,170,0.5)' : 'rgb(161,161,170)',
                        opacity: dimmed ? 0.5 : 1,
                      }}
                    >
                      {link.label}
                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-150 ${teachingOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {teachingOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3">
                        <div className="bg-zinc-900 border border-zinc-700 rounded-md py-1 min-w-[160px] shadow-xl">
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                              style={{
                                color: isActive(pathname, child.href) ? '#cdb079' : undefined,
                              }}
                              onClick={() => setTeachingOpen(false)}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm transition-all duration-150"
                  style={{
                    color: active ? '#cdb079' : dimmed ? 'rgba(161,161,170,0.5)' : 'rgb(161,161,170)',
                    opacity: dimmed ? 0.5 : 1,
                  }}
                  onMouseEnter={() => setHoveredIdx(i)}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Mobile menu button */}
          <button
            className="lg:hidden text-zinc-400 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-zinc-950 border-t border-zinc-800 px-6 py-4">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href, link.exact)
              if (link.children) {
                return (
                  <div key={link.href}>
                    <Link
                      href={link.href}
                      className="block py-2 text-sm transition-colors"
                      style={{ color: active ? '#cdb079' : 'rgb(161,161,170)' }}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                    <div className="pl-4 border-l border-zinc-800">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                          style={{
                            color: isActive(pathname, child.href) ? '#cdb079' : undefined,
                          }}
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-2 text-sm transition-colors"
                  style={{ color: active ? '#cdb079' : 'rgb(161,161,170)' }}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
