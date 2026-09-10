import { NextResponse } from "next/server";
import { canManage } from "@/lib/adminSession";
import { supabaseService } from "@/lib/supabase";
import { removeBackground } from "@/lib/cutout";

/*
  Background-remove a sermon hero still (staff/sermons-gated). Takes the URL of
  a frame already in our storage, produces a transparent speaker cut-out, stores
  it, and returns the public URL. The cut-out feeds the hero/card compositing.
  Node runtime; onnxruntime-node is only pulled into this one function.
*/
export const runtime = "nodejs";
export const maxDuration = 60;

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
  // Only accept frames from our own Supabase storage.
  let allowedHost = "";
  try {
    allowedHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "").host;
  } catch {
    /* ignore */
  }
  if (!allowedHost || host !== allowedHost) {
    return NextResponse.json({ ok: false, error: "bad_host" }, { status: 400 });
  }

  const res = await fetch(url).catch(() => null);
  if (!res || !res.ok) {
    return NextResponse.json({ ok: false, error: "fetch_failed" }, { status: 502 });
  }
  const input = Buffer.from(await res.arrayBuffer());

  let png: Buffer;
  try {
    png = await removeBackground(input);
  } catch (e) {
    return NextResponse.json({ ok: false, error: "remove_failed", detail: String(e) }, { status: 500 });
  }

  const path = `sermons/hero/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-cutout.png`;
  const { error: up } = await db.storage.from("content-intake").upload(path, png, {
    contentType: "image/png",
    upsert: true,
  });
  if (up) return NextResponse.json({ ok: false, error: "upload", detail: up.message }, { status: 502 });

  const { data: pub } = db.storage.from("content-intake").getPublicUrl(path);
  return NextResponse.json({ ok: true, url: pub?.publicUrl ?? null });
}
