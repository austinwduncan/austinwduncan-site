'use client'

import { useEffect } from 'react'

const KEY = 'read_articles'

export default function ReadMarker({ slug }: { slug: string }) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      const slugs: string[] = raw ? JSON.parse(raw) : []
      if (!slugs.includes(slug)) {
        localStorage.setItem(KEY, JSON.stringify([...slugs, slug]))
      }
    } catch {}
  }, [slug])

  return null
}
