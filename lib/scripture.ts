/*
  Persist a sermon's parsed scripture references into sermon_scripture_refs.
  Called on save (and by the one-time backfill), tolerant of the table not
  existing yet (pre-migration) so it never breaks a save.
*/
import type { SupabaseClient } from "@supabase/supabase-js";
import { parseScriptureList } from "./scriptureRef";

export function scriptureRefRows(sermonId: number, chips: string[]) {
  return parseScriptureList(chips).map((r) => ({
    sermon_id: sermonId,
    book: r.book,
    book_order: r.bookOrder,
    chapter: r.chapter,
    verse_start: r.verseStart,
    verse_end: r.verseEnd,
    ref_text: r.refText,
  }));
}

/** Replace the stored refs for a sermon with the ones parsed from its chips. */
export async function replaceSermonScriptureRefs(db: SupabaseClient, sermonId: number, chips: string[]): Promise<void> {
  await db.from("sermon_scripture_refs").delete().eq("sermon_id", sermonId);
  const rows = scriptureRefRows(sermonId, chips);
  if (rows.length) await db.from("sermon_scripture_refs").insert(rows);
}
