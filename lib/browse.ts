/*
  Derive the browse surfaces (topics, speakers, series rows) from the published
  library. The catalog is small, so we group in memory rather than adding queries.
*/
import { type Sermon, slugify } from "./sermons";
import type { Series } from "./series";
import { parseScriptureList } from "./scriptureRef";
import { BOOK_BY_NAME, type Book } from "./bible";

function chipsOf(s: Sermon): string[] {
  return s.scripture?.length ? s.scripture : s.passage ? [s.passage] : [];
}

export type Coverage = { book: Book; sermonCount: number; chapters: number[] };

/** Which books the church has taught (from the scripture chips), in canon order. */
export function coverageFrom(sermons: Sermon[]): Coverage[] {
  const m = new Map<string, { book: Book; slugs: Set<string>; chapters: Set<number> }>();
  for (const s of sermons) {
    for (const r of parseScriptureList(chipsOf(s))) {
      const book = BOOK_BY_NAME[r.book];
      if (!book) continue;
      let e = m.get(book.slug);
      if (!e) {
        e = { book, slugs: new Set(), chapters: new Set() };
        m.set(book.slug, e);
      }
      e.slugs.add(s.slug);
      if (r.chapter) e.chapters.add(r.chapter);
    }
  }
  return [...m.values()]
    .map((e) => ({ book: e.book, sermonCount: e.slugs.size, chapters: [...e.chapters].sort((a, b) => a - b) }))
    .sort((a, b) => a.book.order - b.book.order);
}

/** Sermons that reference a given book (by slug). */
export function sermonsForBookSlug(sermons: Sermon[], slug: string): Sermon[] {
  return sermons.filter((s) => parseScriptureList(chipsOf(s)).some((r) => BOOK_BY_NAME[r.book]?.slug === slug));
}

/** Sermons referencing a given book + chapter. */
export function sermonsForBookChapter(sermons: Sermon[], slug: string, chapter: number): Sermon[] {
  return sermons.filter((s) =>
    parseScriptureList(chipsOf(s)).some((r) => BOOK_BY_NAME[r.book]?.slug === slug && r.chapter === chapter),
  );
}

/*
  The slim shape sermon CARD surfaces need. Client components that list many
  sermons must receive this instead of full Sermon objects: a full Sermon
  carries the entire manuscript in `body`, and serializing hundreds of them
  into the page payload made the speaker archive an 8MB document.
*/
export type CardSermon = Pick<
  Sermon,
  | "slug" | "title" | "date" | "speaker" | "passage" | "scripture"
  | "series" | "seriesTitle" | "seriesBackgroundUrl"
  | "heroStillUrl" | "heroCutoutUrl" | "heroFocalX" | "heroFocalY"
  | "heroTargetX" | "heroTargetY" | "heroZoom"
  | "artworkUrl" | "seriesArtworkUrl" | "youtubeId"
>;

export function toCardSermon(s: Sermon): CardSermon {
  return {
    slug: s.slug,
    title: s.title,
    date: s.date,
    speaker: s.speaker,
    passage: s.passage,
    scripture: s.scripture,
    series: s.series,
    seriesTitle: s.seriesTitle,
    seriesBackgroundUrl: s.seriesBackgroundUrl,
    heroStillUrl: s.heroStillUrl,
    heroCutoutUrl: s.heroCutoutUrl,
    heroFocalX: s.heroFocalX,
    heroFocalY: s.heroFocalY,
    heroTargetX: s.heroTargetX,
    heroTargetY: s.heroTargetY,
    heroZoom: s.heroZoom,
    artworkUrl: s.artworkUrl,
    seriesArtworkUrl: s.seriesArtworkUrl,
    youtubeId: s.youtubeId,
  };
}

export function sermonPoster(s: Pick<Sermon, "artworkUrl" | "seriesArtworkUrl" | "youtubeId">): string | undefined {
  return (
    s.artworkUrl ??
    s.seriesArtworkUrl ??
    (s.youtubeId ? `https://i.ytimg.com/vi/${s.youtubeId}/hqdefault.jpg` : undefined)
  );
}

export function seriesPoster(series: Series): string | undefined {
  return series.artworkUrl ?? undefined;
}

/** Returns a resolver from a sermon to its series' hero background (for episode cards). */
export function seriesBgLookup(series: Series[]): (s: Sermon) => string | undefined {
  const byId = new Map<number, string | undefined>();
  const bySlug = new Map<string, string | undefined>();
  for (const se of series) {
    byId.set(se.id, se.backgroundUrl);
    bySlug.set(se.slug, se.backgroundUrl);
  }
  return (s: Sermon) => {
    if (s.seriesId != null && byId.has(s.seriesId)) return byId.get(s.seriesId);
    if (s.seriesSlug && bySlug.has(s.seriesSlug)) return bySlug.get(s.seriesSlug);
    if (s.series) return bySlug.get(slugify(s.series));
    return undefined;
  };
}

export type Tile = { slug: string; label: string; count: number; poster?: string };

/** Distinct topics with counts, most-used first. */
export function topicsFrom(sermons: Sermon[]): Tile[] {
  const map = new Map<string, Tile>();
  for (const s of sermons) {
    for (const t of s.topics ?? []) {
      const label = t.trim();
      if (!label) continue;
      const slug = slugify(label);
      const cur = map.get(slug);
      if (cur) cur.count += 1;
      else map.set(slug, { slug, label, count: 1, poster: sermonPoster(s) });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/** Distinct speakers with counts. */
// Former staff and one-off guests who won't teach again. Their sermons stay in
// the archive and stay credited to them by name, but they're removed from the
// Browse-by-Speaker directory and given no speaker page (name shows as plain text).
export const HIDDEN_SPEAKERS = new Set(["paul-bane", "mark-edington", "peter-wells", "kim-klaudt"]);
export const isHiddenSpeaker = (slugOrName: string) => HIDDEN_SPEAKERS.has(slugify(slugOrName));

export function speakersFrom(sermons: Sermon[]): Tile[] {
  const map = new Map<string, Tile>();
  for (const s of sermons) {
    const names = s.speakers?.length ? s.speakers : s.speaker ? [s.speaker] : [];
    for (const n of names) {
      const label = n.trim();
      if (!label) continue;
      const slug = slugify(label);
      if (HIDDEN_SPEAKERS.has(slug)) continue;
      const cur = map.get(slug);
      if (cur) cur.count += 1;
      else map.set(slug, { slug, label, count: 1, poster: sermonPoster(s) });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function sermonsByTopicSlug(sermons: Sermon[], slug: string): Sermon[] {
  return sermons.filter((s) => (s.topics ?? []).some((t) => slugify(t) === slug));
}

export function sermonsBySpeakerSlug(sermons: Sermon[], slug: string): Sermon[] {
  return sermons.filter((s) => {
    const names = s.speakers?.length ? s.speakers : s.speaker ? [s.speaker] : [];
    return names.some((n) => slugify(n) === slug);
  });
}

export function sermonsInSeries(sermons: Sermon[], series: Series): Sermon[] {
  return sermons
    .filter((s) => s.seriesId === series.id || (s.series && slugify(s.series) === series.slug))
    // Order by week when set, otherwise oldest-first by date.
    .sort((a, b) => (a.week ?? 9999) - (b.week ?? 9999) || (a.date ?? "").localeCompare(b.date ?? ""));
}

export type SearchResults = {
  q: string;
  messages: Sermon[];
  series: Series[];
  topics: Tile[];
  speakers: Tile[];
};

/** Keyword search across title, series, speakers, topics, scripture, and blurb.
    (Transcript "moments" search comes in Phase 3.) */
export function searchLibrary(sermons: Sermon[], series: Series[], q: string): SearchResults {
  const needle = q.trim().toLowerCase();
  if (!needle) return { q, messages: [], series: [], topics: [], speakers: [] };
  const hit = (v?: string | null) => !!v && v.toLowerCase().includes(needle);
  const hitAny = (arr?: string[]) => (arr ?? []).some((v) => hit(v));

  const messages = sermons.filter(
    (s) =>
      hit(s.title) ||
      hit(s.subtitle) ||
      hit(s.summary) ||
      hit(s.series) ||
      hit(s.seriesTitle) ||
      hit(s.speaker) ||
      hitAny(s.speakers) ||
      hitAny(s.topics) ||
      hitAny(s.scripture) ||
      hit(s.passage),
  );
  const matchedSeries = series.filter((se) => hit(se.title) || hit(se.subtitle) || hit(se.description));
  const topics = topicsFrom(sermons).filter((t) => t.label.toLowerCase().includes(needle));
  const speakers = speakersFrom(sermons).filter((t) => t.label.toLowerCase().includes(needle));
  return { q, messages, series: matchedSeries, topics, speakers };
}

/** Series that currently have at least one published sermon, newest activity first. */
export function activeSeries(series: Series[], sermons: Sermon[]): Series[] {
  const withCount = series
    .map((se) => ({ se, items: sermonsInSeries(sermons, se) }))
    .filter((x) => x.items.length > 0);
  withCount.sort((a, b) => {
    const la = a.items[a.items.length - 1]?.date ?? "";
    const lb = b.items[b.items.length - 1]?.date ?? "";
    return lb.localeCompare(la);
  });
  return withCount.map((x) => x.se);
}
