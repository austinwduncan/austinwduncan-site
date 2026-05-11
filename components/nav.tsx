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
    <header className="sticky top-0 z-50 bg-white border-b border-zinc-200">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-[60px] items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-70 transition-opacity">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/AWDLogoWhite.svg"
              alt="Austin W. Duncan"
              className="h-8 w-auto"
              style={{ filter: 'brightness(0)' }}
            />
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden lg:flex items-center gap-6 xl:gap-8"
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {navLinks.map((link, i) => {
              const active = isActive(pathname, link.href, link.exact)
              const dimmed = hoveredIdx !== null && hoveredIdx !== i && !active
              const linkStyle = {
                color: active ? '#cdb079' : 'rgb(82,82,91)',
                opacity: dimmed ? 0.4 : 1,
                transition: 'opacity 0.15s ease, color 0.15s ease',
              }

              if (link.children) {
                return (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => { setHoveredIdx(i); setTeachingOpen(true) }}
                    onMouseLeave={() => setTeachingOpen(false)}
                  >
                    <button className="flex items-center gap-1 text-[13px]" style={linkStyle}>
                      {link.label}
                      <ChevronDown
                        size={12}
                        className={`transition-transform duration-150 ${teachingOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {teachingOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
                        <div className="bg-white border border-zinc-200 py-1 min-w-[164px] shadow-lg">
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block px-4 py-2.5 text-[13px] text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                              style={{ color: isActive(pathname, child.href) ? '#cdb079' : undefined }}
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
                  className="text-[13px]"
                  style={linkStyle}
                  onMouseEnter={() => setHoveredIdx(i)}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Mobile toggle */}
          <button
            className="lg:hidden text-zinc-500 hover:text-zinc-900 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-zinc-200 bg-white px-6 py-5">
          <nav className="flex flex-col">
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href, link.exact)
              if (link.children) {
                return (
                  <div key={link.href}>
                    <Link
                      href={link.href}
                      className="block py-2.5 text-[13px] transition-colors"
                      style={{ color: active ? '#cdb079' : 'rgb(82,82,91)' }}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                    <div className="ml-4 pl-4 border-l border-zinc-200 mb-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block py-2 text-[13px] transition-colors"
                          style={{
                            color: isActive(pathname, child.href)
                              ? '#cdb079'
                              : 'rgb(113,113,122)',
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
                  className="block py-2.5 text-[13px] transition-colors"
                  style={{ color: active ? '#cdb079' : 'rgb(82,82,91)' }}
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
