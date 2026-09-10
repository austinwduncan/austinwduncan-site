import { NextResponse } from "next/server";
import { canManage } from "@/lib/adminSession";
import { draftSermon, draftSermonResult } from "@/lib/sermonFormat";
import { parseYouTubeId } from "@/lib/youtubeId";
import { fetchTranscript } from "@/lib/supadata";

/*
  Draft a sermon article from the CMS (SOW: sermon-article pipeline).
  Staff/sermons-gated. Actions:
    "build"      -> URL/id: fetch the transcript (Supadata), then Claude drafts
                    the whole thing (title, series, passage, summary, body).
    "format"     -> a pasted source (transcript or manuscript) -> full draft.
    "transcript" -> just fetch a YouTube transcript by URL/id.
  Transcripts come from Supadata, which fetches from a non-datacenter IP so it
  works from Vercel (a direct YouTube fetch is IP-blocked). Needs SUPADATA_KEY.
*/

export const maxDuration = 300;

export async function POST(req: Request) {
  if (!(await canManage("sermons"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: {
    action?: string;
    source?: string;
    youtubeId?: string;
    title?: string;
    passage?: string;
    speaker?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // Just fetch a transcript.
  if (body.action === "transcript") {
    const id = parseYouTubeId(String(body.youtubeId ?? ""));
    if (!id) return NextResponse.json({ error: "no_video" }, { status: 400 });
    const { result, detail } = await fetchTranscript(id);
    if (!result) {
      const err = detail === "not_configured" ? "transcript_not_configured" : "no_transcript";
      return NextResponse.json({ error: err, detail }, { status: detail === "not_configured" ? 503 : 422 });
    }
    return NextResponse.json(result);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  // One-shot: URL -> transcript -> full draft.
  if (body.action === "build") {
    const id = parseYouTubeId(String(body.youtubeId ?? ""));
    if (!id) return NextResponse.json({ error: "no_video" }, { status: 400 });
    const { result: transcript, detail } = await fetchTranscript(id);
    if (!transcript) {
      const err = detail === "not_configured" ? "transcript_not_configured" : "no_transcript";
      return NextResponse.json({ error: err, detail }, { status: detail === "not_configured" ? 503 : 422 });
    }
    const draft = await draftSermon({
      source: transcript.transcript,
      hintTitle: transcript.title,
      speaker: body.speaker,
    });
    if (!draft) return NextResponse.json({ error: "draft_failed" }, { status: 502 });
    return NextResponse.json({ ...draft, videoTitle: transcript.title });
  }

  // Format a pasted source into a full draft.
  const source = String(body.source ?? "").trim();
  if (!source) return NextResponse.json({ error: "no_source" }, { status: 400 });
  const r = await draftSermonResult({
    source,
    hintTitle: body.title,
    speaker: body.speaker,
  });
  if (!r.ok) {
    return NextResponse.json({ error: "draft_failed", reason: r.reason, detail: r.detail }, { status: 502 });
  }
  return NextResponse.json(r.draft);
}
