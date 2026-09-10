/*
  Transcript fetch via Supadata (https://supadata.ai). Supadata runs the
  residential-proxy / caption machinery on their side, so this works from
  Vercel's datacenter IPs where a direct YouTube fetch is blocked. One GET with
  an x-api-key header; long sermons come back synchronously. The video title
  comes free from YouTube's oEmbed (no key, not IP-gated), as a hint for the
  drafter. Returns { result, detail } so the route can report why it failed.
*/

const BASE = "https://api.supadata.ai/v1/youtube/transcript";

export type TranscriptResult = { transcript: string; title?: string };

function stamp(ms: number): string {
  const s = Math.floor((ms || 0) / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

async function oembedTitle(id: string): Promise<string | undefined> {
  try {
    const r = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`,
    );
    if (!r.ok) return undefined;
    return (await r.json())?.title ?? undefined;
  } catch {
    return undefined;
  }
}

export async function fetchTranscript(
  videoId: string,
): Promise<{ result: TranscriptResult | null; detail: string }> {
  const key = process.env.SUPADATA_KEY ?? process.env.SUPADATA_API_KEY;
  if (!key) return { result: null, detail: "not_configured" };

  const url = `${BASE}?videoId=${encodeURIComponent(videoId)}&lang=en`;
  let res: Response;
  try {
    res = await fetch(url, { headers: { "x-api-key": key } });
  } catch {
    return { result: null, detail: "network_error" };
  }
  if (res.status === 206) return { result: null, detail: "no_captions" }; // transcript unavailable
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { result: null, detail: `http_${res.status}: ${body.slice(0, 140)}` };
  }

  let data: { content?: unknown };
  try {
    data = await res.json();
  } catch {
    return { result: null, detail: "bad_json" };
  }

  const content = data.content;
  let lines: string[] = [];
  if (Array.isArray(content)) {
    for (const c of content as { text?: string; offset?: number }[]) {
      const text = String(c.text ?? "").replace(/\s+/g, " ").trim();
      if (text) lines.push(`${stamp(c.offset ?? 0)} ${text}`);
    }
  } else if (typeof content === "string") {
    lines = [content.trim()]; // plain-text fallback (no timestamps)
  }
  const transcript = lines.join("\n").trim();
  if (transcript.length < 40) return { result: null, detail: "empty" };

  return { result: { transcript, title: await oembedTitle(videoId) }, detail: "" };
}
