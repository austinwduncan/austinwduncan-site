import { NextResponse } from "next/server";
import { canManage } from "@/lib/adminSession";
import { supabaseService } from "@/lib/supabase";

/*
  Grab a candidate hero still from YouTube. The builder shows a few frames from
  the service video (the poster + storyboard frames at ~1/4, 1/2, 3/4); when the
  pastor picks one, we fetch that i.ytimg.com image server-side and store it in
  our own bucket so it survives and works with the focal-point tool.
  Staff/sermons-gated.
*/
export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!(await canManage("sermons"))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const db = supabaseService();
  if (!db) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 501 });

  const body = await req.json().catch(() => null);
  const url = String(body?.url ?? "");
  let host = "";
  try {
    host = new URL(url).host;
  } catch {
    return NextResponse.json({ ok: false, error: "bad_url" }, { status: 400 });
  }
  // Only allow YouTube's image CDN.
  if (!/(^|\.)ytimg\.com$/.test(host)) {
    return NextResponse.json({ ok: false, error: "bad_host" }, { status: 400 });
  }

  const res = await fetch(url).catch(() => null);
  if (!res || !res.ok) {
    return NextResponse.json({ ok: false, error: "fetch_failed" }, { status: 502 });
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) {
    // YouTube returns a tiny placeholder for frames that don't exist.
    return NextResponse.json({ ok: false, error: "no_frame" }, { status: 404 });
  }

  const path = `sermons/hero/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error: up } = await db.storage.from("content-intake").upload(path, buf, {
    contentType: "image/jpeg",
    upsert: true,
  });
  if (up) return NextResponse.json({ ok: false, error: "upload", detail: up.message }, { status: 502 });

  const { data: pub } = db.storage.from("content-intake").getPublicUrl(path);
  return NextResponse.json({ ok: true, url: pub?.publicUrl ?? null });
}
