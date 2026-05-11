import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  if (!q) return Response.json({ error: 'Missing q parameter' }, { status: 400 })

  const key = process.env.ESV_API_KEY
  if (!key) return Response.json({ error: 'ESV API key not configured' }, { status: 500 })

  const url = new URL('https://api.esv.org/v3/passage/text/')
  url.searchParams.set('q', q)
  url.searchParams.set('include-headings', 'false')
  url.searchParams.set('include-footnotes', 'false')
  url.searchParams.set('include-short-copyright', 'true')
  url.searchParams.set('include-passage-references', 'true')

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Token ${key}` },
    next: { revalidate: 86400 },
  })

  if (!res.ok) return Response.json({ error: 'ESV API error' }, { status: res.status })
  const data = await res.json()
  return Response.json(data)
}
