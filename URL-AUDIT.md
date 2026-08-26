# URL audit

Audited 25 August 2026 against the working tree and the live Supabase project.
Every count below was measured, not estimated. Where something could not be
determined it says so.

The hard constraint on the rebuild: roughly 220 published paths exist in the
wild, indexed and linked, and none of them may ever 404.

---

## Headline

**No published URL 404s today, and no redirect is currently needed.**

All 213 rows in `content_slug_history` record a path that is byte for byte
identical to the canonical path `hrefFor()` produces for the same piece. The
rebuild renamed the collections and left the routes alone, exactly as the
comment in `lib/library/queries.ts` says it intended to. There is nothing to
redirect because nothing has moved.

The redirect machinery is in place anyway, generated rather than listed, so
that the first slug that does move is redirected by the act of recording the
move.

---

## 1. What the data holds

| Table | Rows | Note |
| :-- | --: | :-- |
| `content` | 213 | every row `status = 'published'` |
| `content_slug_history` | 213 | one row per piece, none orphaned |
| `collections` | 5 | in-the-text, word-for-word, exegetica, forum-and-pulpit, sermons |
| `series` | 14 | all 14 have at least one piece |
| `topics` | 152 | all 152 have at least one piece |
| `doctrines` | 61 | all 61 used |
| `bible_books` | 66 | 64 have at least one reference |
| `scripture_references` | 1634 | |
| `content_topics` | 1047 | |

Canonical hrefs by prefix, from `hrefFor()` over all 213 rows:

| Prefix | Count |
| :-- | --: |
| `/word-for-word/` | 71 |
| `/sermons/` | 47 |
| `/teaching/expositional/` | 38 |
| `/teaching/topical/` | 34 |
| `/exegetica/` | 15 |
| `/forum-and-pulpit/` | 8 |

Every one of those 213 slugs also exists as an MDX file on disk at the path in
`legacy_id`, and in every case the filename matches the database slug. Zero
mismatches, zero missing files. Two MDX files in `content/` are page bodies
rather than pieces and correctly have no database row: `content/about.mdx` and
`content/resources.mdx`.

Publication dates run from 7 June 2021 to 15 June 2026. All 213 rows have a
`published_at`. All 213 rows carry an `updated_at` of either 25 or 26 August
2026, which is the pipeline load, not a content edit.

---

## 2. Canonical hrefs that no route can serve

**None.** All six prefixes have a matching route, and every slug resolves.

There is one latent hazard rather than a live one. The last line of `hrefFor()`
is a fallback:

```ts
return `/library/${row.slug}`
```

That fires for any `content` row with a null or unrecognised `legacy_id`. No
row is in that state today, so the fallback has never been taken. If it ever
is, the produced path collides with `app/library/[show]/`, whose page calls
`notFound()` for any slug that is not a collection. A piece created in the
admin without a legacy path would therefore get a canonical href that 404s.
This is worth a guard in the data layer, which is outside this agent's
ownership and has not been changed.

---

## 3. Routes that exist in `app/` but that no data points at

These are real, reachable pages that the Library data layer never produces a
link to. None of them is broken. They are listed because each is a decision
waiting to be made.

| Route | Status | Note |
| :-- | :-- | :-- |
| `/teaching/series/[slug]` | 200, six slugs | See below. Not in the sitemap. |
| `/browse` | 200 | The pre rebuild browse hub, built from MDX. Superseded in purpose by `/library` but still linked and still published. |
| `/sermons/scripture-index` | 200 | Built from MDX frontmatter, not from `scripture_references`. Overlaps `/scripture`. |
| `/greek` | 200 | A tool. No content rows. |
| `/resources`, `/about`, `/about/beliefs`, `/about/values`, `/about/faq`, `/about/disclosure` | 200 | Hand written pages. |
| `/reading`, `/reading/browse` | 200 | The recommended reading list, sourced from `data/books.json`. New during this session. |
| `/studio/[[...tool]]` | 200 | Sanity admin. Disallowed in robots.txt. |
| `/api/esv`, `/api/greek-explain` | route handlers | Data for pages. Disallowed in robots.txt. |
| `/sermons/feed`, `/word-for-word/feed` | route handlers | RSS. Declared in the root layout's `alternates`. Left crawlable on purpose. |

### The two series vocabularies

`/teaching/series/[slug]` is driven by `data/teaching-series.ts` and serves six
slugs, all 200:

```
hebrews   daniel   minor-prophets   the-covenant   old-laws-new-life
words-that-change-everything
```

The database `series` table names the same six groupings differently:

```
the-book-of-hebrews   the-book-of-daniel   the-minor-prophets
the-covenant   old-laws-for-a-new-life   words-that-change-everything
```

So `/teaching/series/daniel` and `/library/in-the-text?season=the-book-of-daniel`
are two URLs for the same season, reached through two unrelated slug
vocabularies. Neither points at the other. The eight remaining database series
are the Word for Word groupings and have no `/teaching/series/` equivalent at
all.

`/teaching/series/*` is deliberately absent from the sitemap. It duplicates the
show page seasons, and putting both in would ask Google to index two URLs for
one thing. It is still linked from `/teaching` and `/browse`, so it stays
crawlable. **This needs a decision: one of the two should become canonical and
the other should redirect to it.** That decision is Austin's, not this agent's,
which is why no redirect was written.

### The `/library` identity change

`/library` and `/library/browse` were the recommended reading list, 800 plus
books. During this session both were rewritten to serve the teaching Library,
and the book list moved to `/reading` and `/reading/browse`.

Nothing 404s: all four paths return 200. But `/library` is a published URL whose
subject changed, and any accumulated ranking it had for book recommendations now
lands on a page about sermons. A redirect is the wrong fix, since `/library` is
the right home for the Library. Flagging it as a content decision rather than a
URL fault. `components/library-category-expander.tsx` and
`components/library-review-spotlight.tsx` were updated by another agent and now
point at `/reading/browse`, so no internal link is wrong.

### A route that came and went

`app/scripture/probe-tmp/route.ts`, a row count diagnostic, existed during part
of this audit and was deleted before it finished. It is not in robots.txt
because it no longer exists. If a diagnostic route like it comes back, it
should be disallowed.

---

## 4. Legacy paths that resolve to neither

**None.**

Every `old_path` in `content_slug_history` maps to a `content_id` that exists,
and every one of those pieces has a canonical route. Zero orphans, zero
unresolvable paths, zero pieces missing a history row.

---

## 5. A data layer defect found while auditing

Not a URL fault, but it is the reason `lib/seo.ts` reads Postgres itself
instead of calling `getPieces()`, and it affects pages other agents are
building right now.

PostgREST caps a response at 1000 rows. `decorate()` in
`lib/library/queries.ts` fetches every topic link and every scripture reference
for the pieces it is decorating in one request each. Run against all 213 pieces,
measured with the same anon key the app uses:

```
content ids passed to .in():                      213
scripture_references rows returned:              1000   (of 1634)
content_topics rows returned:                    1000   (of 1047)
pieces that come back with any scripture:         185   (of 213)
pieces that come back with any topic:             204   (of 213)
```

No error is raised. 634 scripture references and 47 topic links are silently
dropped, and 28 pieces come back looking like they touch no Scripture at all.
Any unfiltered `getPieces()` call is affected, which includes `getShows()` and
therefore every show page card. Narrow calls such as `getPieces({ topic })` and
`getPieces({ book, chapter })` are fine, because the id set is intersected
first.

`components/library/scripture/data.ts` already works around this with paged
reads and documents why. `lib/seo.ts` does the same. The fix belongs in
`decorate()`, which is outside this agent's ownership and has not been touched.

---

## 6. What was built

### `app/sitemap.ts`

**963 URLs**, all verified present in the production build output
(`.next/server/app/sitemap.xml.body`), not just in dev.

| Family | Count |
| :-- | --: |
| Pieces | 213 |
| Scripture chapters | 506 |
| Topics | 152 |
| Scripture books | 64 |
| Hubs and standing pages | 23 |
| Shows | 5 |

Rules applied:

- **`lastModified` is `published_at`**, not `updated_at`. `updated_at` is the
  same two days across the whole table, so using it would tell Google that all
  213 pieces changed on the same afternoon. A page that collects pieces (a
  show, a book, a chapter, a topic) carries the newest date of what it collects.
- **Every generated family is gated on its route file existing on disk.** Seven
  other agents were creating `/library/[show]`, `/scripture/**` and `/topics/**`
  while this ran, and two of those routes did not exist when the audit started.
  A sitemap entry for a route nobody built is worse than a missing entry, so
  each family is included only when its page file can be proven to be there.
  This also means the sitemap picks up new families without anyone remembering
  to flip a flag.
- **The sitemap is deliberately not revalidated.** With no request time input
  Next prerenders it once per build and serves it as a static file, which is
  what makes the existence check trustworthy: it runs where the `app/` source
  tree is on disk. A revalidate window would move some runs to a server that may
  only have compiled output, where every check would fail and whole families
  would silently drop out. The cost is that the sitemap refreshes on deploy
  rather than on a timer.
- **Chapters are filtered to focused references.** A reference spanning more
  than three chapters is a statement about the book, not a treatment of those
  chapters. Counted naively, one piece marked Psalms 1 to 150 mints 150 chapter
  URLs whose only content is that same book level piece. Including every
  chapter any reference crosses gives 857 chapter URLs; requiring a span of
  three or fewer gives 506. The 506 are in.
- **Seasons are deliberately absent.** A season is a `?season=` view of the show
  page, and that page declares the show itself as its canonical URL. Listing the
  season URLs would ask Google to index pages that point away from themselves.
- **`/about`, `/resources`, `/greek`, `/reading` carry no `lastModified`.** They
  have no date the database knows. An absent lastmod is read as unknown, a wrong
  one is read as fact.
- Duplicates are filtered, and anything not on the site origin is dropped.

### `app/robots.ts`

Allows everything, points at the sitemap, sets `Host`, and disallows `/studio`
and `/api/`. Nothing else on the site is an admin surface. The RSS feeds stay
crawlable.

### Redirects, in `next.config.ts`

`redirects()` reads `content_slug_history` at build, compares each `old_path`
against the canonical path `hrefFor()` produces for that piece, and emits a 308
for every row where they differ. A row whose recorded path already equals its
canonical path is skipped, since redirecting a path to itself is an infinite
loop.

**It currently emits zero redirects, because zero paths have moved.** The build
log prints the count on every run:

```
[urls] 0 legacy redirects generated from content_slug_history
```

Static redirects rather than a proxy, because the set is known at build time
and static redirects are checked before the filesystem and cost nothing per
request, where a proxy would run on every request in the site. The trade is
that a slug moving after a deploy does not redirect until the next build. That
is the right trade while the table is stable, and the log line makes the count
visible on every deploy. If slugs start moving between builds, a `proxy.ts`
calling `resolveLegacyPath()` is the escalation, and `resolveLegacyPath()`
already exists unused for exactly that purpose.

A failure reading the table is caught and logged, never thrown. Losing the
redirect table for one deploy is recoverable. Losing the deploy is not.

### `app/not-found.tsx`

In the site's design system: soft black ground, CMG Sans headings, Source Serif
body, gold as type and one button and the corner brackets but never a field,
steel for the ruled eyebrow. It says plainly that nothing has been taken down,
then offers eight doors into the Library and a way back to the front page.

**One thing worth knowing about it.** A first version read the collections live
so the doors would name what actually exists. That turned out to break pages.
The not-found boundary is part of every route's tree, so the component renders
on every request in the site, not only on a 404, and an `await` in it became a
database read on every page. `/library/browse` and `/library/in-the-text` both
returned 500 with the component present and 200 with it removed, reproduced
three times. The doors are now a static list of the nine standing paths, none of
which moved in the rebuild. The page does no I/O and cannot fail.

### `lib/seo.ts`

`SITE_URL`, `absolute()`, `routeExists()`, the paged Postgres reads behind the
sitemap, and `legacyRedirects()`. Its imports are relative rather than aliased
because `next.config.ts` imports it and the config loader does not apply
tsconfig paths.

---

## 7. Verification

All of the following were run, not assumed.

- `npx tsc --noEmit` passes clean.
- `npx next build` succeeds. `/sitemap.xml` and `/robots.txt` are both listed as
  static. The built `sitemap.xml.body` holds 963 `<loc>` entries, including all
  64 scripture books, all 506 chapters and all 152 topics, which proves the
  route existence checks ran correctly at build and not only in dev.
- `curl /robots.txt` and `curl /sitemap.xml` on the dev server return the real
  document with real URLs.
- All 213 canonical piece hrefs from the database appear in the sitemap. All 213
  legacy paths appear in the sitemap. Both checked by set difference, both zero
  missing.

### Legacy paths tested by request

One from each of the six sections, chosen from `content_slug_history`:

| Path | Result |
| :-- | :-- |
| `/sermons/a-broken-man-before-a-boundless-gospel` | 200, direct, no redirect |
| `/word-for-word/what-are-the-most-significant-apologetic-issues` | 200, direct, no redirect |
| `/exegetica/canonical-criticism` | 200, direct, no redirect |
| `/forum-and-pulpit/a-response-to-tragedy` | 200, direct, no redirect |
| `/teaching/expositional/daniel-7-the-son-of-man` | 200, direct, no redirect |
| `/teaching/topical/the-covenant-5-mosaic-covenant-pt2` | 200, direct, no redirect |

All six resolve at their published address. None needed a redirect, which is
the expected result given that no path has moved.

### Other routes tested by request

`/`, `/library`, `/library/browse`, `/library/in-the-text`,
`/library/word-for-word`, `/library/exegetica`, `/library/forum-and-pulpit`,
`/library/sermons`, `/scripture`, `/scripture/hebrews`, `/scripture/genesis/1`,
`/scripture/luke/15`, `/topics`, `/topics/anger`, `/sermons`, `/reading`,
`/reading/browse`, `/studio`, and all six `/teaching/series/*` paths: all 200.

`/this-page-does-not-exist` returns **404** with the new page, confirmed by both
the status code and the rendered copy.

---

## 8. What could not be verified

- **Production behaviour.** Everything above was measured against the local dev
  server and a local production build. Nothing was deployed and no live site was
  requested.
- **That 220 is the true number of published URLs.** The database knows about
  213 pieces. The 13 hub paths in the previous `app/sitemap.ts` bring the
  documented set to 226. Whether anything outside those two sources was ever
  published and indexed cannot be determined from inside the repository. Search
  Console would answer it and was not consulted.
- **Routes added after this audit finished.** Several appeared mid audit, and
  `/reading` and `/topics/page.tsx` appeared while the sitemap was being written.
  The route existence checks mean new families are picked up automatically at the
  next build, but a genuinely new shape, `/scripture/[book]/[chapter]/[verses]`
  for instance, needs a line added to `app/sitemap.ts`.
- **`/word-for-word` renders dynamic.** The build marks it `ƒ` rather than
  prerendered, and two builds during this session failed there with
  `canceling statement due to statement timeout` out of `getPieces`. Later builds
  passed. It looks like Supabase statement timeouts under nine prerender workers
  competing with seven other agents against the same database, not a fault in
  any one file, but it was not run to ground and could recur in CI. The page
  belongs to another agent.
