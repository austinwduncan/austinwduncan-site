import Anthropic from "@anthropic-ai/sdk";

/*
  Sermon-article drafter. Turns a raw source (a YouTube transcript or the
  preacher's manuscript) into a full draft: the article body the sermon page
  parses (see parseSermonBody) PLUS the metadata fields (title, series, passage,
  summary) derived from the same words.

  Faithful, not creative: Claude restructures and summarizes what's there and
  never invents content, applications, or Scripture. Runs server-side; returns
  null on failure so the caller can fall back to hand-entry.
*/

export const MODEL = "claude-opus-5";

export const SYSTEM = `You prepare a preached sermon for a church website. Your input is a raw source for ONE sermon: a video transcript or the preacher's manuscript, sometimes with timestamps.

Return ONLY a JSON object with these keys:
- "title": the sermon's title. Use the preacher's own title if they state one; otherwise write a short, plain, faithful title drawn from the message's actual theme. Sentence case. No dashes. Never sensational.
- "subtitle": a short secondary line IF the sermon clearly has one (e.g. a stated tagline or the part in a series); otherwise "". Never invent one.
- "series": the sermon series name IF the source clearly indicates one; otherwise "". Never invent a series.
- "passage": the main Scripture passage the sermon expounds, as "Book Chapter:Verse" or a range (e.g. "James 5:1-6"). If the sermon has no single main passage, use "". Never guess a reference.
- "topics": an array of 2 to 5 short topical tags describing the sermon's themes (e.g. ["Prayer","Trusting God","Suffering"]). Sentence case, grounded in the content. Empty array if unclear.
- "summary": 2 to 3 plain sentences describing what the sermon is about, for search results and link previews. Faithful to the content; no hype.
- "body": the article body, formatted exactly as specified below.

The source is often a recording of the WHOLE worship service, not just the sermon. Include ONLY the sermon — the sustained teaching from Scripture by the preacher. Exclude everything around it: the countdown/welcome, worship songs and any song lyrics, announcements, the offering, transitions, and the closing/benediction. Find where the preaching actually begins and ends, and article only that. If the source is already just the sermon, use all of it.

Body format:
- Section headings on their own line: "## Heading". When (and only when) the source contains timestamps, prefix with the nearest preceding timestamp: "## [mm:ss] Heading" ([h:mm:ss] past an hour). No timestamps in the source -> plain "## Heading".
- KEEP the source's real timestamps exactly as they are — do NOT rebase them to zero. They map to the full-service video, so the reader can jump to the right moment. The FIRST heading's timestamp must be where the sermon begins.
- Body paragraphs in plain prose, separated by a blank line.
- Scripture the preacher reads FROM THE ESV, on its own line: "the quoted words" — Book Chapter:Verse, ESV. The em dash " — " before the reference is REQUIRED and is the ONLY place any dash may appear.

Absolute faithfulness rules:
- Do NOT add, invent, embellish, or infer. No new illustrations, points, applications, theology, transitions, or conclusions not in the source. You restructure existing words; you do not write new ones.
- Preserve the preacher's wording and meaning. You MAY remove filler ("um", "uh", false starts, stutters, repeats), fix punctuation and capitalization, join fragments into sentences, and group sentences into paragraphs. That is the extent of the editing.
- Never invent or "correct" a Scripture reference or wording. Only format a passage as a Scripture line when the preacher actually quotes it and it is clearly the ESV. If unsure of the reference or translation, leave it as an ordinary paragraph.
- Headings: short, plain, sentence case, no dashes.

Output the JSON object only: no preamble, no commentary, no code fences.`;

export type SermonDraft = {
  title: string;
  subtitle: string;
  series: string;
  passage: string;
  topics: string[];
  summary: string;
  body: string;
};

type DraftInput = {
  source: string;
  hintTitle?: string; // e.g. the YouTube title
  speaker?: string;
};

/** Why a draft failed, so the caller (and the UI) can say something useful. */
export type DraftFailure =
  | "not_configured"
  | "no_source"
  | "no_credit" // the Anthropic account/key is out of credits (billing)
  | "busy" // rate limited or model overloaded; retrying later works
  | "refusal"
  | "truncated"
  | "no_json"
  | "empty_body"
  | "exception";

export type DraftResult =
  | { ok: true; draft: SermonDraft }
  | { ok: false; reason: DraftFailure; detail?: string };

/*
  A full worship-service transcript is mostly NOT the sermon: a long countdown,
  several worship songs (pages of repeated lyric lines tagged [music]/[singing]),
  announcements, offering. That bulk is what makes a big service time out or
  trips a copyright refusal on the lyrics. We keep the model's job (find and
  article ONLY the sermon), but first drop the pure lyric lines so it isn't
  wading through — or asked to reproduce — song lyrics. Timestamps on the spoken
  lines are untouched, so the sermon's jump points survive.
*/
export function stripLyricLines(source: string): string {
  const lines = source.split(/\r?\n/);
  const kept = lines.filter((line) => {
    const l = line.trim();
    if (!l) return true; // keep blank lines (paragraph structure)
    // A timestamp line (e.g. "0:02:15.760,0:02:20.080" or "1:03 -->") is structure.
    if (/^\d{1,2}:\d{2}(:\d{2})?([.,]\d{1,3})?/.test(l) && !/[a-z]/i.test(l.replace(/^[\d:.,\s>-]+/, ""))) {
      return true;
    }
    // Drop spoken/sung lines carrying a music or singing cue — that's worship.
    if (/\[(music|singing)[^\]]*\]/i.test(l)) return false;
    return true;
  });
  return kept.join("\n");
}

/** Draft a full sermon (metadata + body) from a raw source. */
export async function draftSermonResult(input: DraftInput): Promise<DraftResult> {
  if (!process.env.ANTHROPIC_API_KEY) return { ok: false, reason: "not_configured" };
  const raw = input.source.trim();
  if (!raw) return { ok: false, reason: "no_source" };
  const source = stripLyricLines(raw).trim() || raw;

  const context = [
    input.hintTitle ? `The video is titled: ${input.hintTitle}` : null,
    input.speaker ? `Preacher: ${input.speaker}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const userMsg =
    (context ? `Context (orientation only, not content to include):\n${context}\n\n` : "") +
    `Source to prepare:\n\n${source}`;

  try {
    const client = new Anthropic();
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 32000,
      system: SYSTEM,
      messages: [{ role: "user", content: userMsg }],
      // Scoped transform, not open-ended reasoning; typing lags this SDK version.
      ...({ output_config: { effort: "low" } } as object),
    });
    const msg = await stream.finalMessage();
    if (msg.stop_reason === "refusal") return { ok: false, reason: "refusal" };
    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();

    // Extract the JSON object (tolerate stray fences/prose around it).
    const cleaned = text.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) {
      // Ran past the token budget mid-object -> no closing brace to find.
      if (msg.stop_reason === "max_tokens") return { ok: false, reason: "truncated" };
      return { ok: false, reason: "no_json" };
    }
    let parsed: Partial<SermonDraft>;
    try {
      parsed = JSON.parse(cleaned.slice(start, end + 1)) as Partial<SermonDraft>;
    } catch {
      return { ok: false, reason: msg.stop_reason === "max_tokens" ? "truncated" : "no_json" };
    }
    if (!parsed.body?.trim()) return { ok: false, reason: "empty_body" };

    return {
      ok: true,
      draft: {
        title: (parsed.title ?? "").trim(),
        subtitle: (parsed.subtitle ?? "").trim(),
        series: (parsed.series ?? "").trim(),
        passage: (parsed.passage ?? "").trim(),
        topics: Array.isArray(parsed.topics)
          ? parsed.topics.map((t) => String(t).trim()).filter(Boolean).slice(0, 6)
          : [],
        summary: (parsed.summary ?? "").trim(),
        body: parsed.body.trim(),
      },
    };
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    // Turn the common API errors into reasons the UI can explain plainly.
    if (/credit balance is too low|billing|insufficient[_\s-]?quota|payment/i.test(detail)) {
      return { ok: false, reason: "no_credit", detail };
    }
    if (/rate.?limit|overloaded|\b429\b|\b529\b/i.test(detail)) {
      return { ok: false, reason: "busy", detail };
    }
    return { ok: false, reason: "exception", detail };
  }
}

/** Back-compat: draft a full sermon, or null on failure. */
export async function draftSermon(input: DraftInput): Promise<SermonDraft | null> {
  const r = await draftSermonResult(input);
  return r.ok ? r.draft : null;
}
