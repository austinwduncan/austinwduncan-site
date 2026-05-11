import { cache } from 'react'

const ESV_API = 'https://api.esv.org/v3/passage/text/'

export const getEsvPassage = cache(async (reference: string): Promise<string | null> => {
  const key = process.env.ESV_API_KEY
  if (!key) return null

  try {
    const url = new URL(ESV_API)
    url.searchParams.set('q', reference)
    url.searchParams.set('include-headings', 'false')
    url.searchParams.set('include-footnotes', 'false')
    url.searchParams.set('include-short-copyright', 'true')
    url.searchParams.set('include-passage-references', 'true')

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Token ${key}` },
      next: { revalidate: 86400 }, // cache 24 hours — scripture doesn't change
    })

    if (!res.ok) return null
    const data = await res.json()
    return (data.passages?.[0] as string) ?? null
  } catch {
    return null
  }
})
