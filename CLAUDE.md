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

These were each learned the expensive way. Breaking them is a regression.

### 1. There is no serif anywhere

Every word on this site is **CMG Sans**, which is Montserrat (see below), via
`--font-cmg`. Headings, body copy, article prose, metadata, all of it. Source
Serif is no longer loaded and Cormorant is gone. This is not a preference to be
re-litigated.

Reading text needs different settings from display text: weight 400, leading
near 1.72, and **letter-spacing 0**. The negative tracking display sizes need
makes a paragraph cramped.

`app/page.tsx` routes every heading through a single `Heading` component and
names the typeface in exactly one constant, so it cannot drift. Do the same in
new work rather than hand-rolling headings.

> **CMG Sans is Montserrat.** The church's licensed "CMG Sans" woff2 files are
> Montserrat with a renamed name table (designer Julieta Ulanovsky, SIL Open
> Font License), confirmed by reading the font's name records. We load real
> Montserrat from Google Fonts to get the full variable weight axis instead of
> four static cuts. Montserrat is wide and geometric: at display sizes it needs
> `tracking-[-0.02em]`, leading near 0.95, and weight 700 uppercase.

### 2. No em dashes or en dashes. Anywhere.

Same rule as the Crosswalk site. Applies to all copy, comments, docs and
commit messages. Rewrite the sentence instead.

Currently clean: `app/page.tsx`, `app/browse/`, nav, footer, metadata.
Still dirty: MDX article bodies (~9,000) and `data/teaching-series.ts` (33).

### 3. Branding is Austin's call, never a reason to stall

He owns the logos, the names and the visual identity, and he edits them as he
sees fit. Raise a concern once if there is one, then build what was asked. Do
not hold work back waiting on a branding decision.

### 4. Swapping an asset is not permission to restyle

When asked to change a photo or video, change the `src` and the framing. Do
not move the layout around it. This has been asked for explicitly.

---

## Palette

Dark dominant, roughly 55 / 20 / 10 / 8 / 5 / 2.

```
--awd-black     #171918   soft black   ~55%   primary surface
--awd-graphite  #2C302F   graphite     ~20%
--awd-bone      #EEEAE1   warm bone    ~10%   light bands, reading
--awd-gold      #CDB079   antique gold  ~8%   THE signature
--awd-accent-2            secondary     ~5%   steel #748790 or sage #7F8A78
--awd-stone     #AAA79E   stone         ~2%   metadata
```

**Gold is never a large field.** It is type, rules, brackets, and one button.

### Measured contrast, non-negotiable

On `#171918`: gold 8.48, bone 14.72, stone 7.34, sage 4.89, steel 4.72. All
clear AA.

| Surface | Rule |
| :-- | :-- |
| Warm bone | gold is **1.73** and stone **2.00**. Neither is ever text here. Use `#6E5A2E` (5.53) for the accent clause, graphite (11.13) for body. |
| Graphite | the secondary accent falls to ~3.6. Large text or non-text only. |

**Open decision:** secondary accent is still steel vs sage.
`components/accent-toggle.tsx` is a temporary chip that flips `data-accent` on
`<html>`. Once chosen, hard-code `--awd-accent-2` in `globals.css` and delete
the toggle.

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

## Architecture: The Library

The site is being rebuilt around one idea: **everything Austin has taught lives
in one collection**, entered through Scripture, topic, format, series, depth,
search, or one of the branded properties.

Word for Word, Exegetica, Forum & Pulpit and In the Text keep their identities
as **collections**, but they are one dimension among many, not the spine. A
visitor should never have to know what "Exegetica" means to find an answer.

### Dimensions are independent

The old `tags` field conflated four things at once (a Bible book, a series, a
collection and a topic in one array). That is the mistake the schema exists to
prevent. Format is what a piece **is**; approach is how it **argues**; they do
not compete.

### Data

**Postgres (Supabase) is the source of truth.** Not MDX, not Sanity.

- `supabase/migrations/` — numbered SQL, lowercase, idempotent, RLS on with
  explicit grants to `service_role`. Austin runs these himself.
- Article bodies will be **Tiptap** documents stored as JSONB, so custom blocks
  (scripture, original language, key idea, citation) stay queryable.
- Scripture is stored as structured refs **plus integer bounds**:
  `book_position * 1_000_000 + chapter * 1_000 + verse`. A passage is a closed
  interval, so "what touches Luke 15:11-32" is an index-backed range
  intersection. This is what makes `/scripture/luke/15/11-32` generate itself.
- `content_slug_history` preserves every legacy URL. ~220 published paths must
  never 404.
- **AI never writes taxonomy directly.** The Claude pipeline proposes into
  `content_suggestions` with a confidence and rationale; Austin accepts or
  rejects from the admin.

### Scripts

- `scripts/library/transform.mjs` — MDX to normalized records
- `scripts/library/load.mjs` — records into Postgres, idempotent
- `scripts/library/verify.mjs` — connection and migration state

### Still to build

Custom admin/editor at a staff route, the enrichment pass, `/explore` with
faceted URL state, the Scripture explorer, generated topic pages, and search.

---

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
