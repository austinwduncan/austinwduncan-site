// Maps a YouTube video id to a sermon's series/date/speaker/scripture so the
// builder can prefill a record from the video alone. Empty on this site; the
// shape is kept so the builder code ported from Crosswalk needs no changes.
export type CatalogEntry = { seriesSlug: string; seriesTitle: string; date: string; speaker: string; scripture: string; title: string };
export const SERMON_CATALOG: Record<string, CatalogEntry> = {};
export function lookupCatalog(youtubeId: string): CatalogEntry | undefined {
  return SERMON_CATALOG[youtubeId];
}
