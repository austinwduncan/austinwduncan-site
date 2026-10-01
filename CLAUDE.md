@AGENTS.md

# austinwduncan.com

The personal site of Austin W. Duncan: pastor and Bible teacher at Crosswalk
Church in Brentwood, Tennessee. Sermons, teaching series, scholarly papers,
cultural commentary, and a reading library.

---

## What this site is NOT

An earlier version of this file instructed cloning the "Newspaper Pro" tagdiv
WordPress demo. **That brief is retired.** Do not reintroduce any of it:

- ❌ trending tickers
- ❌ right-hand sidebars alongside content
- ❌ colored category badges pinned to image corners
- ❌ dense 3- and 4-up card grids as the organizing metaphor
- ❌ sub-0.7rem uppercase metadata as a structural device
- ❌ "latest posts" as the dominant structure

If a change makes the page feel like a magazine or a blog, it is wrong.

---

## Hard rules

### 1. Type: Bebas Neue for headings, Montserrat for everything else

Changed 2026-10-01 at Austin's request, to match the Crosswalk site. Every
heading and big numeral is **Bebas Neue** (`--font-bebas`, exposed as
`--font-display` and as `DISPLAY` in `components/bright/PageHeader.tsx`).
Bebas is caps only with one weight: weight 400, letter spacing about 0.01em,
line height about 0.9, and sized roughly 1.25x what Montserrat needed because
it is narrow. Body, ledes, labels, pills and buttons are **Montserrat**
(`--font-cmg`, "CMG Sans"). No serif anywhere.

### 2. No em dashes or en dashes. Anywhere.

Applies to all copy, comments, docs and commit messages. Rewrite the sentence.
Also never write "it is not X, it is Y"; rewrite that too.

### 3. Branding is Austin's call, never a reason to stall

Raise a concern once if there is one, then build what was asked.

### 4. Swapping an asset is not permission to restyle

When asked to change a photo or video, change the `src` and the framing.

### 5. Never use a raw YouTube livestream frame as a fallback picture

It shows whatever was on screen (announcements, other people). Pieces without
artwork get the typographic tile in `components/bright/Poster.tsx`.

### 6. Never reword the mission statement

`MISSION` in `app/page.tsx` is Austin's own sentence.

---

## Palette: the Crosswalk palette (adopted 2026-10-01)

```
ink            #1C2427   darkest ground, text on white
primary        #3D484C   muted teal gray
primary deep   #262D31   dark sections
secondary      #7B9BB5   soft blue: large type, rules, fills, buttons
secondary soft #9DB4C8   text and accents on dark
accent         #4F6B84   small text and links on white (AA)
white          #FFFFFF   light bands (never cream)
mist           #F4F4F5   alternating light band
```

The old `--awd-*` and `--cw-*` variable names still exist and now carry these
values. There is no gold, no cream, no brown anywhere. `#7B9BB5` fails AA for
small text on white: use `#4F6B84` there.

---

## Audience right now

Austin is interviewing for a senior pastor position. Judge every public page
by what a search committee member sees first. The nav is four items (Home,
Sermons, Series, About); everything else lives in the footer. Sermons, Word
for Word, Forum & Pulpit and Exegetica share one bright list page
(`components/bright/CategoryList.tsx`). `/series` groups Teaching series
(newest first; a series with no "Ends on" date is labelled still being
written), Word for Word, Forum & Pulpit and Exegetica. Each teaching series has
a guide page fed by `data/teaching-series.ts`.

---

## Visual language

Carried over from the Crosswalk site deliberately, since Austin designed it:
the ruled eyebrow, generous vertical rhythm (`py-28 lg:py-36`), scroll reveals
on every section, glass surfaces (`backdrop-blur` over a translucent
near-black), and the L-shaped corner bracket motif, rendered in gold here
rather than Crosswalk's white.

**Media treatment.** Two techniques that matter:

- **Bake video blur into the file with ffmpeg, never CSS.** A large CSS blur on
  a full-width video element locked the renderer outright. Pre-blurred footage
  also compresses hard: the preaching loop is ~200KB against an 8MB source.
- **Pad the frame to move a subject sideways.** A section wider than its
  footage shows the full source width, so horizontal position in the file maps
  straight to position on screen. Padding costs no resolution; cropping does.
- **Grade all artwork to one tonal range.** Austin's art runs near-white
  (Hebrews) to near-black (Daniel). Shown raw, a grid of it reads as noise.
  Grayscale, reduced contrast and brightness, a graphite veil, an accent tint,
  all lifting on hover.

---

## Architecture: one library, one category axis

Everything Austin has taught is one collection in the `sermons` table
(the name is historical; the publishing system was ported file for file from
the Crosswalk site on 2026-09-07). Each piece has exactly ONE `category`
(`lib/categories.ts`): sermon, teaching, episode, paper, commentary. The old
brand names (Sermons, In the Text, Word for Word, Exegetica, Forum & Pulpit)
survive only as the display labels of those categories.

Three independent axes sit beside category and must never be collapsed into
it: **series** (a curated run with a start and an end, `sermon_series`),
**topics** (many per piece, free text), **scripture** (many per piece, parsed
into `sermon_scripture_refs` for the Scripture Atlas). Bible books are not
tags.

### URLs

- `/` home = animated hero + the library (latest, category row, recent,
  series, topics, coverage).
- `/sermons`, `/teaching`, `/word-for-word`, `/exegetica`,
  `/forum-and-pulpit` category pages; `/{category path}/[slug]` pieces
  (`pathFor()` builds these, always use it). A piece requested under the
  wrong category path is permanently redirected.
- `/series/[slug]`, `/library/series`, `/library/topics/[slug]`,
  `/library/bible` (Scripture Atlas), `/library/search`.
- `/browse` is the main hub for every article (billboard, channel rail, read state). `/library` is the books page.
- Old URLs (`/library/*` shows, `/teaching/expositional/...`,
  `/sermons/bible` etc.) are static redirects in `next.config.ts`.

### Publishing

- **Staff login**: `/staff` (STAFF_PASSCODE) and `/staff/sermons`
  (SERMONS_PASSCODE or the staff passcode). HMAC cookie `cw_admin`, 12 hour
  TTL, gate in `lib/adminSession.ts`. Works from a phone.
- **Builder**: `/staff/sermons` (`components/SermonsEditor.tsx`). Category
  select in Basic info, category filter on the list. Paste a YouTube link and
  "Build from the video" pulls the transcript (Supadata, needs SUPADATA_KEY)
  and drafts with Claude (`lib/sermonFormat.ts`), or paste a manuscript and
  press Format. Hero still, focal point, cutout, series and speakers tabs.
- **API**: `app/api/sermons/*`, `app/api/series`, `app/api/speakers`.
  Writes use the service role, log to `audit_log`, revalidate pages.
- **Tables**: `sermons`, `sermon_series`, `sermon_scripture_refs`,
  `speakers`, `audit_log`; bucket `content-intake` (`sermons/` prefix).
  Migrations `0011_sermon_publishing.sql`, `0012_sermon_category.sql`,
  both applied 2026-09-07. Visibility: status published, or scheduled with
  scheduled_at in the past.
- **Bodies** are plain text split on blank lines: `## ` section (in the
  contents), `### ` subhead, a quoted block ending in an ESV citation,
  a lone image `![alt](src)` optionally wrapped in a link, else a paragraph.
  `components/SermonParagraph.tsx` renders inline **bold**, *italic*,
  [links](url), line breaks and "> " quotes.
- The 213 pieces that were MDX were imported once with
  `scripts/import-mdx-library.ts` and the MDX removed. Only
  `content/about.mdx`, `resources.mdx` and `books.json` remain.
- Crosswalk token names (`text-ink`, `bg-primary-deep`,
  `text-secondary-soft`, `font-display`) are mapped onto this palette at
  the bottom of `globals.css`.

### Known content gaps

10 Word for Word episodes are scrape stubs (a heading and the same line as
the only paragraph) and need real bodies. The Library tables from the earlier
Postgres rewrite (`content`, `topics`, `formats`, ...) are unused.

## Tooling notes

- **Austin's tools must work from his phone.** He rejects any admin step that
  needs a terminal or a desktop. This has killed features before.
- **Never print secrets.** Show key names only. If one leaks, tell him to
  rotate it.
- **Never send `immutable` on `/_next/static/` in development.** Production
  filenames are content hashed, so immutable is right there. In dev Next reuses
  a stable name across every rebuild, and immutable then tells the browser not
  to revalidate for a year. A stylesheet cached before a directory existed is
  kept forever: the page renders with classes that no longer resolve while the
  server serves correct CSS, and no reload or restart fixes it. `next.config.ts`
  now sends `no-store` in dev. Escaping a cache already poisoned this way takes
  one hard reload.
- **A long-running dev server will not see a new directory.** Tailwind v4
  auto-detects sources when it starts. Create `components/library/` two hours
  into a session and every class in it silently fails to generate: the class
  lands in the DOM, resolves to nothing, and an element sized by a utility
  falls back to its intrinsic size. A card meant to be 13.5rem rendered at its
  image's natural 1920px. `next build` is unaffected, so an agent that verifies
  by building will report success while the running page is broken. Restart the
  dev server after adding a directory.
- **Chrome serves stale bundles constantly in dev.** Before diagnosing a bug,
  load a different page and come back, or check the server HTML with curl.
  Several hours were lost to phantom bugs that were only cache.
- **IntersectionObserver does not fire in a non-foreground automated tab.**
  Every `ScrollReveal` on the page will read `opacity: 0` and the content looks
  missing. Before calling that a bug, run the same check against a page known
  to work. On the homepage all 50 reveals read zero under automation and are
  perfectly fine in a real browser.
- Full-page screenshots of pages with heavy `backdrop-blur` render near-black
  and lie. Zoomed captures are accurate; computed styles are better still.

## Stack

Next.js 16 App Router, React 19, Tailwind v4 (CSS-first `@theme`), Supabase
Postgres, deployed on Vercel. Read `node_modules/next/dist/docs/` before
assuming Next behavior; see AGENTS.md.
