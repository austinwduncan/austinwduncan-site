'use client'

import { useMemo, useSyncExternalStore } from 'react'

const KEY = 'read_articles'

/*
  The read list lives in localStorage, which is external state, so it is read
  through useSyncExternalStore rather than set from an effect. getSnapshot must
  return a stable value, so the raw string is cached and only replaced when it
  actually changes. ReadMarker writes the key on every piece page.
*/
let cached = '[]'

function getSnapshot(): string {
  try {
    const raw = localStorage.getItem(KEY) ?? '[]'
    if (raw !== cached) cached = raw
  } catch {
    // Private windows and blocked site data throw; the cached value stands.
  }
  return cached
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('storage', onChange)
  return () => window.removeEventListener('storage', onChange)
}

export function useReadArticles(): Set<string> {
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => '[]')
  return useMemo(() => {
    try {
      return new Set<string>(JSON.parse(raw) as string[])
    } catch {
      return new Set<string>()
    }
  }, [raw])
}
