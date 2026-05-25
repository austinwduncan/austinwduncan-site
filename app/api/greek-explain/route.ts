import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { word, lemma, gloss, parsing_human, inflected_gloss, tense_note, voice_note, mood_note, case_note } = body

  const significanceNote = tense_note ?? mood_note ?? case_note ?? voice_note ?? null

  const prompt = `A reader of the Bible just clicked on a Greek word to understand it. Your job is to explain it to them as if you're a pastor leaning over and whispering a helpful note — warm, plain, no jargon at all.

Word as it appears in the text: ${word}
Dictionary form: ${lemma} (meaning: ${gloss})
Grammatical form: ${parsing_human}
What this form means: ${inflected_gloss}
${significanceNote ? `Grammatical note: ${significanceNote}` : ''}

Write two short pieces:
1. "meaning" — What does this word mean RIGHT HERE in this sentence? (1-2 sentences. Plain English. Don't use words like "aorist," "genitive," "indicative," "participle," "lemma." Explain the concept, not the label.)
2. "why" — Why does the grammar make it mean that? (1-2 sentences. Translate the grammar into an everyday observation — like "this form is used when the action was actively happening in the background" or "Greek uses this form when something happened once and is done." No jargon.)

If there's genuinely nothing interesting about the grammar — like it's just a plain noun with no special force — set "why" to null.

Keep total under 75 words. Respond ONLY with valid JSON: { "meaning": "...", "why": "..." or null }`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : '{}'
    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const result = JSON.parse(cleaned)

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ meaning: null, why: null }, { status: 500 })
  }
}
