/*
  Canonical Bible catalog + book lookup. Powers Browse-the-Bible, scripture search,
  cross-links, and the coverage timeline. `lookupBook` normalizes the many ways a
  book gets written ("1 John", "1 Jn", "First John", "i john", "Jn") to a canonical
  book, so free-text scripture tags resolve reliably.
*/

export type Testament = "OT" | "NT";

export type Book = {
  order: number; // 1..66
  name: string; // canonical display, e.g. "1 Corinthians"
  slug: string; // url slug, e.g. "1-corinthians"
  testament: Testament;
  chapters: number;
  /** Extra abbreviations/aliases (besides the name); lowercase, no periods. */
  aka: string[];
};

/* prettier-ignore */
export const BOOKS: Book[] = [
  { order: 1, name: "Genesis", slug: "genesis", testament: "OT", chapters: 50, aka: ["gen", "gn"] },
  { order: 2, name: "Exodus", slug: "exodus", testament: "OT", chapters: 40, aka: ["exod", "exo", "ex"] },
  { order: 3, name: "Leviticus", slug: "leviticus", testament: "OT", chapters: 27, aka: ["lev", "lv"] },
  { order: 4, name: "Numbers", slug: "numbers", testament: "OT", chapters: 36, aka: ["num", "nm", "nb"] },
  { order: 5, name: "Deuteronomy", slug: "deuteronomy", testament: "OT", chapters: 34, aka: ["deut", "dt"] },
  { order: 6, name: "Joshua", slug: "joshua", testament: "OT", chapters: 24, aka: ["josh", "jos", "jsh"] },
  { order: 7, name: "Judges", slug: "judges", testament: "OT", chapters: 21, aka: ["judg", "jdg", "jg"] },
  { order: 8, name: "Ruth", slug: "ruth", testament: "OT", chapters: 4, aka: ["rth", "ru"] },
  { order: 9, name: "1 Samuel", slug: "1-samuel", testament: "OT", chapters: 31, aka: ["1 sam", "1sam", "1 sm", "1sm", "1 s"] },
  { order: 10, name: "2 Samuel", slug: "2-samuel", testament: "OT", chapters: 24, aka: ["2 sam", "2sam", "2 sm", "2sm", "2 s"] },
  { order: 11, name: "1 Kings", slug: "1-kings", testament: "OT", chapters: 22, aka: ["1 kgs", "1kgs", "1 ki", "1ki", "1 k"] },
  { order: 12, name: "2 Kings", slug: "2-kings", testament: "OT", chapters: 25, aka: ["2 kgs", "2kgs", "2 ki", "2ki", "2 k"] },
  { order: 13, name: "1 Chronicles", slug: "1-chronicles", testament: "OT", chapters: 29, aka: ["1 chr", "1chr", "1 ch", "1ch"] },
  { order: 14, name: "2 Chronicles", slug: "2-chronicles", testament: "OT", chapters: 36, aka: ["2 chr", "2chr", "2 ch", "2ch"] },
  { order: 15, name: "Ezra", slug: "ezra", testament: "OT", chapters: 10, aka: ["ezr", "ez"] },
  { order: 16, name: "Nehemiah", slug: "nehemiah", testament: "OT", chapters: 13, aka: ["neh", "ne"] },
  { order: 17, name: "Esther", slug: "esther", testament: "OT", chapters: 10, aka: ["esth", "est", "es"] },
  { order: 18, name: "Job", slug: "job", testament: "OT", chapters: 42, aka: ["jb"] },
  { order: 19, name: "Psalms", slug: "psalms", testament: "OT", chapters: 150, aka: ["psalm", "pss", "ps", "psa", "psm"] },
  { order: 20, name: "Proverbs", slug: "proverbs", testament: "OT", chapters: 31, aka: ["prov", "prv", "pr"] },
  { order: 21, name: "Ecclesiastes", slug: "ecclesiastes", testament: "OT", chapters: 12, aka: ["eccl", "ecc", "ec", "qoh"] },
  { order: 22, name: "Song of Solomon", slug: "song-of-solomon", testament: "OT", chapters: 8, aka: ["song of songs", "song", "sos", "sng", "canticles"] },
  { order: 23, name: "Isaiah", slug: "isaiah", testament: "OT", chapters: 66, aka: ["isa", "is"] },
  { order: 24, name: "Jeremiah", slug: "jeremiah", testament: "OT", chapters: 52, aka: ["jer", "je", "jr"] },
  { order: 25, name: "Lamentations", slug: "lamentations", testament: "OT", chapters: 5, aka: ["lam", "la"] },
  { order: 26, name: "Ezekiel", slug: "ezekiel", testament: "OT", chapters: 48, aka: ["ezek", "eze", "ezk"] },
  { order: 27, name: "Daniel", slug: "daniel", testament: "OT", chapters: 12, aka: ["dan", "dn", "da"] },
  { order: 28, name: "Hosea", slug: "hosea", testament: "OT", chapters: 14, aka: ["hos", "ho"] },
  { order: 29, name: "Joel", slug: "joel", testament: "OT", chapters: 3, aka: ["jl", "joe"] },
  { order: 30, name: "Amos", slug: "amos", testament: "OT", chapters: 9, aka: ["am"] },
  { order: 31, name: "Obadiah", slug: "obadiah", testament: "OT", chapters: 1, aka: ["obad", "ob"] },
  { order: 32, name: "Jonah", slug: "jonah", testament: "OT", chapters: 4, aka: ["jon", "jnh"] },
  { order: 33, name: "Micah", slug: "micah", testament: "OT", chapters: 7, aka: ["mic", "mc"] },
  { order: 34, name: "Nahum", slug: "nahum", testament: "OT", chapters: 3, aka: ["nah", "na"] },
  { order: 35, name: "Habakkuk", slug: "habakkuk", testament: "OT", chapters: 3, aka: ["hab", "hb"] },
  { order: 36, name: "Zephaniah", slug: "zephaniah", testament: "OT", chapters: 3, aka: ["zeph", "zep", "zp"] },
  { order: 37, name: "Haggai", slug: "haggai", testament: "OT", chapters: 2, aka: ["hag", "hg"] },
  { order: 38, name: "Zechariah", slug: "zechariah", testament: "OT", chapters: 14, aka: ["zech", "zec", "zc"] },
  { order: 39, name: "Malachi", slug: "malachi", testament: "OT", chapters: 4, aka: ["mal", "ml"] },
  { order: 40, name: "Matthew", slug: "matthew", testament: "NT", chapters: 28, aka: ["matt", "mt"] },
  { order: 41, name: "Mark", slug: "mark", testament: "NT", chapters: 16, aka: ["mrk", "mk", "mr"] },
  { order: 42, name: "Luke", slug: "luke", testament: "NT", chapters: 24, aka: ["luk", "lk"] },
  { order: 43, name: "John", slug: "john", testament: "NT", chapters: 21, aka: ["jhn", "jn"] },
  { order: 44, name: "Acts", slug: "acts", testament: "NT", chapters: 28, aka: ["act", "ac"] },
  { order: 45, name: "Romans", slug: "romans", testament: "NT", chapters: 16, aka: ["rom", "rm", "ro"] },
  { order: 46, name: "1 Corinthians", slug: "1-corinthians", testament: "NT", chapters: 16, aka: ["1 cor", "1cor", "1 co", "1co"] },
  { order: 47, name: "2 Corinthians", slug: "2-corinthians", testament: "NT", chapters: 13, aka: ["2 cor", "2cor", "2 co", "2co"] },
  { order: 48, name: "Galatians", slug: "galatians", testament: "NT", chapters: 6, aka: ["gal", "ga"] },
  { order: 49, name: "Ephesians", slug: "ephesians", testament: "NT", chapters: 6, aka: ["eph", "ephes"] },
  { order: 50, name: "Philippians", slug: "philippians", testament: "NT", chapters: 4, aka: ["phil", "php", "pp"] },
  { order: 51, name: "Colossians", slug: "colossians", testament: "NT", chapters: 4, aka: ["col", "co"] },
  { order: 52, name: "1 Thessalonians", slug: "1-thessalonians", testament: "NT", chapters: 5, aka: ["1 thess", "1thess", "1 thes", "1 th", "1th"] },
  { order: 53, name: "2 Thessalonians", slug: "2-thessalonians", testament: "NT", chapters: 3, aka: ["2 thess", "2thess", "2 thes", "2 th", "2th"] },
  { order: 54, name: "1 Timothy", slug: "1-timothy", testament: "NT", chapters: 6, aka: ["1 tim", "1tim", "1 ti", "1ti"] },
  { order: 55, name: "2 Timothy", slug: "2-timothy", testament: "NT", chapters: 4, aka: ["2 tim", "2tim", "2 ti", "2ti"] },
  { order: 56, name: "Titus", slug: "titus", testament: "NT", chapters: 3, aka: ["tit", "ti"] },
  { order: 57, name: "Philemon", slug: "philemon", testament: "NT", chapters: 1, aka: ["philem", "phm", "pm"] },
  { order: 58, name: "Hebrews", slug: "hebrews", testament: "NT", chapters: 13, aka: ["heb"] },
  { order: 59, name: "James", slug: "james", testament: "NT", chapters: 5, aka: ["jas", "jm"] },
  { order: 60, name: "1 Peter", slug: "1-peter", testament: "NT", chapters: 5, aka: ["1 pet", "1pet", "1 pe", "1pe", "1 pt"] },
  { order: 61, name: "2 Peter", slug: "2-peter", testament: "NT", chapters: 3, aka: ["2 pet", "2pet", "2 pe", "2pe", "2 pt"] },
  { order: 62, name: "1 John", slug: "1-john", testament: "NT", chapters: 5, aka: ["1 jn", "1jn", "1 jhn", "1 jo"] },
  { order: 63, name: "2 John", slug: "2-john", testament: "NT", chapters: 1, aka: ["2 jn", "2jn", "2 jhn", "2 jo"] },
  { order: 64, name: "3 John", slug: "3-john", testament: "NT", chapters: 1, aka: ["3 jn", "3jn", "3 jhn", "3 jo"] },
  { order: 65, name: "Jude", slug: "jude", testament: "NT", chapters: 1, aka: ["jud", "jd"] },
  { order: 66, name: "Revelation", slug: "revelation", testament: "NT", chapters: 22, aka: ["rev", "rv", "re", "apocalypse"] },
];

export const BOOKS_BY_SLUG: Record<string, Book> = Object.fromEntries(BOOKS.map((b) => [b.slug, b]));
export const BOOK_BY_NAME: Record<string, Book> = Object.fromEntries(BOOKS.map((b) => [b.name, b]));

// Normalize a raw book string: lowercase, drop periods, collapse whitespace, and
// turn leading ordinal words/numerals (first/second/third, i/ii/iii) into 1/2/3.
export function normalizeBookKey(raw: string): string {
  let s = raw.toLowerCase().replace(/\./g, " ").replace(/\s+/g, " ").trim();
  s = s
    .replace(/^(1st|first)\s+/, "1 ")
    .replace(/^(2nd|second)\s+/, "2 ")
    .replace(/^(3rd|third)\s+/, "3 ")
    .replace(/^iii\s+/, "3 ")
    .replace(/^ii\s+/, "2 ")
    .replace(/^i\s+/, "1 ");
  return s;
}

// Build a lookup from every alias/name/no-space variant to its Book.
const LOOKUP: Map<string, Book> = (() => {
  const m = new Map<string, Book>();
  const add = (k: string, b: Book) => {
    const key = normalizeBookKey(k);
    if (key) m.set(key, b);
    const nospace = key.replace(/\s+/g, "");
    if (nospace) m.set(nospace, b);
  };
  for (const b of BOOKS) {
    add(b.name, b);
    add(b.slug.replace(/-/g, " "), b);
    for (const a of b.aka) add(a, b);
  }
  return m;
})();

/** Resolve a raw book string (any common form) to its canonical Book, or null. */
export function lookupBook(raw: string): Book | null {
  const key = normalizeBookKey(raw);
  return LOOKUP.get(key) ?? LOOKUP.get(key.replace(/\s+/g, "")) ?? null;
}
