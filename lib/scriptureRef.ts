/*
  Parse free-text scripture references ("John 3:16", "1 John 2:1-5", "Ps 23",
  "Genesis 1-2", "John 3:16-4:2") into structured rows, one per referenced chapter,
  so a sermon can be matched by book + chapter. Chapter ranges expand to a row per
  chapter; verse spans keep verse_start/verse_end when within one chapter.
*/
import { lookupBook } from "./bible";

export type ScriptureRef = {
  book: string; // canonical name
  bookOrder: number;
  chapter: number | null; // null = whole book
  verseStart: number | null;
  verseEnd: number | null;
  refText: string; // original token, for display
};

const DASH = /\s*[-–—]\s*/;
const MAX_ROWS = 40; // guard against absurd ranges

function pushChapter(out: ScriptureRef[], book: string, order: number, chapters: number, chapter: number, vs: number | null, ve: number | null, refText: string) {
  if (chapter < 1 || chapter > chapters) return;
  out.push({ book, bookOrder: order, chapter, verseStart: vs, verseEnd: ve, refText });
}

/** Parse a single reference token (already split from any list). */
function parseOne(token: string, out: ScriptureRef[]) {
  const raw = token.trim();
  if (!raw) return;
  // book = optional ordinal + letters; tail = the numeric part (optional).
  const m = raw.match(/^((?:[1-3]|i{1,3}|first|second|third)\s+)?([a-z][a-z ]*?)\s*(\d.*)?$/i);
  if (!m) return;
  const bookRaw = `${m[1] ?? ""}${m[2] ?? ""}`.trim();
  const book = lookupBook(bookRaw);
  if (!book) return;
  const tail = (m[3] ?? "").trim();

  if (!tail) {
    out.push({ book: book.name, bookOrder: book.order, chapter: null, verseStart: null, verseEnd: null, refText: raw });
    return;
  }

  // c1[:v1][ - c2[:v2] ]
  const t = tail.match(new RegExp(`^(\\d+)(?::(\\d+))?(?:${DASH.source}(\\d+)(?::(\\d+))?)?$`, "i"));
  if (!t) {
    // Unparseable numbers — still record the book (chapterless) so it's browsable.
    out.push({ book: book.name, bookOrder: book.order, chapter: null, verseStart: null, verseEnd: null, refText: raw });
    return;
  }
  const c1 = Number(t[1]);
  const v1 = t[2] != null ? Number(t[2]) : null;
  const end = t[3] != null ? Number(t[3]) : null;
  const endV = t[4] != null ? Number(t[4]) : null;

  if (v1 != null) {
    if (end != null && endV != null) {
      // cross-chapter verse span: c1:v1 .. end:endV
      pushChapter(out, book.name, book.order, book.chapters, c1, v1, null, raw);
      for (let c = c1 + 1; c < end && out.length < MAX_ROWS; c++) pushChapter(out, book.name, book.order, book.chapters, c, null, null, raw);
      if (end !== c1) pushChapter(out, book.name, book.order, book.chapters, end, null, endV, raw);
    } else if (end != null) {
      // verse range within the chapter: c1:v1-end
      pushChapter(out, book.name, book.order, book.chapters, c1, v1, end, raw);
    } else {
      // single verse
      pushChapter(out, book.name, book.order, book.chapters, c1, v1, v1, raw);
    }
  } else if (end != null) {
    // chapter range: c1..end (whole chapters)
    const hi = Math.min(end, c1 + MAX_ROWS);
    for (let c = c1; c <= hi && out.length < MAX_ROWS; c++) pushChapter(out, book.name, book.order, book.chapters, c, null, null, raw);
  } else {
    // whole chapter
    pushChapter(out, book.name, book.order, book.chapters, c1, null, null, raw);
  }
}

/** Parse a scripture string (may contain several refs separated by ; or ,) into rows. */
export function parseScripture(input: string): ScriptureRef[] {
  const out: ScriptureRef[] = [];
  for (const token of input.split(/[;]+/)) parseOne(token, out);
  return out;
}

/** Parse an array of scripture chips into a de-duplicated set of rows. */
export function parseScriptureList(chips: string[]): ScriptureRef[] {
  const out: ScriptureRef[] = [];
  const seen = new Set<string>();
  for (const chip of chips) {
    for (const r of parseScripture(chip)) {
      const key = `${r.bookOrder}:${r.chapter ?? 0}:${r.verseStart ?? 0}:${r.verseEnd ?? 0}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(r);
      }
    }
  }
  return out;
}
