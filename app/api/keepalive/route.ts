import { NextResponse } from "next/server";
import { supabaseAnon } from "@/lib/supabase";

/*
  Keeps the database awake.

  The Supabase free tier pauses a project after a week with no activity, and a
  paused project takes the whole library offline (this happened in September
  2026). Vercel calls this once a day (see vercel.json). It reads one id, which
  is enough to count as activity and costs almost nothing.
*/
export const dynamic = "force-dynamic";

export async function GET() {
  const db = supabaseAnon();
  if (!db) return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 503 });
  const { error } = await db.from("sermons").select("id").limit(1);
  if (error) return NextResponse.json({ ok: false, reason: error.message }, { status: 502 });
  return NextResponse.json({ ok: true, at: new Date().toISOString() });
}
