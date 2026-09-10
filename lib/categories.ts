/*
  The one "what is it" axis of the library. Every published piece has exactly
  one category. Series (a curated run), topics (many) and scripture (many) are
  independent of it and never encode it.

  The old brand names survive only as display labels here.
*/
export type Category = "sermon" | "teaching" | "episode" | "paper" | "commentary";

export type CategoryInfo = {
  key: Category;
  /** URL segment: /{path} is the category page, /{path}/{slug} the piece. */
  path: string;
  /** Display label (the old brand name). */
  label: string;
  /** Singular noun for one piece. */
  noun: string;
  /** Plural noun. */
  nouns: string;
  /** One line under the label on the category page. */
  blurb: string;
  /** Verb for the primary action on a card or hero. */
  action: string;
};

export const CATEGORIES: Record<Category, CategoryInfo> = {
  sermon: {
    key: "sermon", path: "sermons", label: "Sermons", noun: "sermon", nouns: "sermons",
    blurb: "Messages preached at Crosswalk Church, with the full text.", action: "Watch",
  },
  teaching: {
    key: "teaching", path: "teaching", label: "In the Text", noun: "session", nouns: "sessions",
    blurb: "Written teaching that works through a book of the Bible or a theme, one session at a time.", action: "Read",
  },
  episode: {
    key: "episode", path: "word-for-word", label: "Word for Word", noun: "episode", nouns: "episodes",
    blurb: "Short answers to real questions about the Bible, theology and the Christian life.", action: "Read",
  },
  paper: {
    key: "paper", path: "exegetica", label: "Exegetica", noun: "paper", nouns: "papers",
    blurb: "Scholarly papers on exegesis, biblical languages and the history of interpretation.", action: "Read",
  },
  commentary: {
    key: "commentary", path: "forum-and-pulpit", label: "Forum & Pulpit", noun: "piece", nouns: "pieces",
    blurb: "Cultural commentary and pastoral response to the moment, from Scripture.", action: "Read",
  },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];
export const CATEGORY_ORDER: Category[] = ["sermon", "teaching", "episode", "paper", "commentary"];

export function isCategory(v: unknown): v is Category {
  return typeof v === "string" && v in CATEGORIES;
}

export function categoryFromPath(path: string): CategoryInfo | undefined {
  return CATEGORY_KEYS.map((k) => CATEGORIES[k]).find((c) => c.path === path);
}

/** Canonical URL of a piece, by its category. */
export function pathFor(piece: { slug: string; category?: string | null }): string {
  const cat = isCategory(piece.category) ? piece.category : "sermon";
  return `/${CATEGORIES[cat].path}/${piece.slug}`;
}

export function categoryLabel(cat: string | null | undefined): string {
  return isCategory(cat) ? CATEGORIES[cat].label : CATEGORIES.sermon.label;
}
