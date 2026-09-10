import { NextResponse } from "next/server";
import { canManage } from "@/lib/adminSession";
import { supabaseService } from "@/lib/supabase";
import { replaceSermonScriptureRefs } from "@/lib/scripture";

/*
  One-time (re-runnable) backfill: parse every sermon's scripture chips into
  sermon_scripture_refs. Safe to run repeatedly — it replaces each sermon's rows.
  Staff/sermons-gated. Hit it once after running migration 0020.
*/
export async function POST() {
  if (!(await canManage("sermons"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = supabaseService();
  if (!db) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const { data, error } = await db.from("sermons").select("id, scripture, passage");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  let sermons = 0;
  for (const row of (data ?? []) as { id: number; scripture: string[] | null; passage: string | null }[]) {
    const chips = row.scripture?.length ? row.scripture : row.passage ? [row.passage] : [];
    try {
      await replaceSermonScriptureRefs(db, row.id, chips);
      sermons += 1;
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : "failed", sermonsDone: sermons }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: true, sermons });
}
