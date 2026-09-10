import { toCardSermon } from "@/lib/browse";
import type { Sermon } from "@/lib/sermons";
import type { CardPiece } from "@/components/watch/SermonCard";

/*
  The slim card shape plus the category, which is what decides the card's URL.
  Client components that list many pieces must receive this rather than full
  Sermon objects (a full row carries the whole manuscript in `body`).
*/
export function toCardPiece(s: Sermon): CardPiece {
  return { ...toCardSermon(s), category: s.category };
}

export const display = "font-[family-name:var(--font-display)]";
export const kicker = "text-xs font-semibold uppercase tracking-[0.22em] text-secondary-soft";
export const GROUND = "#0a0e10";

export function fmtDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso + "T12:00:00Z");
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(d);
}
