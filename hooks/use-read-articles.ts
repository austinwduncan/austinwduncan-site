'use client'

import { useState, useEffect } from 'react'

const KEY = 'read_articles'

function load(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

export function useReadArticles(): Set<string> {
  const [read, setRead] = useState<Set<string>>(new Set())

  useEffect(() => {
    setRead(load())
  }, [])

  return read
}
