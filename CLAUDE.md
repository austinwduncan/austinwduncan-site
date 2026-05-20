@AGENTS.md

# Word for Word Page — Design Spec

## Project Context

This is the `Word for Word` page of Austin Duncan's personal pastor website, built with **Next.js / React**. The goal is a content-rich news/magazine-style page modeled as closely as possible on the **Newspaper Pro** WordPress theme demo:

**Reference template:** https://demo.tagdiv.com/newspaper_pro/

Study that URL before making layout or style decisions. When in doubt, match it.

---

## Design Philosophy

This page should feel like a **professional editorial publication**, not a blog. Think: dense, organized, image-forward, scannable. Every section should feel deliberate. Content hierarchy is communicated through size, weight, and position — not color overload.

Key traits to preserve from the reference:

- Information-dense layout without feeling cluttered
- Strong typographic hierarchy (big bold headlines dominate)
- Featured content leads the page; supporting content fills out sections below
- Red (or strong accent color) used sparingly — category labels, section borders, interactive highlights
- Sidebar on the right for secondary content (popular posts, categories, recent items)
- Clear section demarcation with bold uppercase section headers

---

## Color System

Match these values closely. Adjust brand accent from red to whatever accent color is already established in the project — but keep the structural palette.

| Token | Value | Usage |
| :---- | :---- | :---- |
| `--color-bg` | `#ffffff` | Page background |
| `--color-surface` | `#f7f7f7` | Section backgrounds, sidebar |
| `--color-border` | `#e8e8e8` | Dividers, card borders |
| `--color-text-primary` | `#1a1a1a` | Headlines, body |
| `--color-text-secondary` | `#555555` | Metadata (dates, authors) |
| `--color-text-muted` | `#888888` | Labels, captions |
| `--color-accent` | site gold `#B8892E` / hover `#7A5C1E` | Category badges, hover states, section header borders |
| `--color-header-bg` | `#111111` | Ticker / dark bars |
| `--color-header-text` | `#ffffff` | Nav text |

---

## Typography

Use the existing Cormorant Garamond for headlines and Source Serif 4 for body/excerpts.

### Type Scale

| Element | Size | Weight | Notes |
| :---- | :---- | :---- | :---- |
| Hero headline | 2.4–3rem | 700–800 | Dominates the page |
| Section headline | 1.25–1.5rem | 700 | Card titles, article titles |
| Section header label | 0.75rem | 900 (font-black) | Uppercase, letter-spaced |
| Category badge | 0.55–0.65rem | 700 | Uppercase, amber background, white text |
| Author / date | 0.65rem | 400 | Muted (#888888) |
| Body text | 0.875–1rem | 400 | Comfortable line height (1.65) |

---

## Page Layout Structure

The page is composed of a **full-width trending ticker**, then a **main content column (~70%)** and a **right sidebar (~30%)**, wrapped in a centered container with a max-width of `1200px`. The sidebar runs alongside the hero AND all content sections below it.

```
┌─────────────────────────────────────────────────────────────┐
│  TRENDING TICKER (scrolling row of article titles)          │
├──────────────────────────────────┬──────────────────────────┤
│                                  │                          │
│  HERO / FEATURED ARTICLE         │  SIDEBAR                 │
│  (large 16:9 image, big headline)│  - Popular Posts         │
│                                  │  - Categories w/ counts  │
│  4-UP RECENT GRID                │  - Search                │
│  (4 cards, image + badge + title)│  - About                 │
│                                  │                          │
│  DON'T MISS (tabbed section)     │                          │
│  1 large + 4 stacked small       │                          │
│                                  │                          │
│  PER-TOPIC SECTIONS              │                          │
│  (3-col card grids, each topic)  │                          │
│                                  │                          │
│  ALL QUESTIONS (numbered list)   │                          │
│                                  │                          │
└──────────────────────────────────┴──────────────────────────┘
```

---

## Component Specifications

### 1. Trending Ticker

- Full-width, dark background (`#111111`)
- "Trending Now:" label on left (accent color, bold)
- Auto-scrolling headlines using CSS animation (pause on hover)
- Titles separated by `/` dividers

### 2. Hero Article Block

- Large featured image (16:9 aspect ratio), full main column width
- Category badge overlaid top-left corner on image (amber background, white text)
- Headline below image: very large, bold, Cormorant
- Short excerpt below headline (Source Serif, muted)
- Date in muted small text

### 3. Article Card (reusable)

- Thumbnail image (top, 16:9 aspect ratio)
- Category badge overlaid on image top-left
- Headline (bold Cormorant, 2–3 lines max, truncated)
- Date (muted, small, #888888)
- No body text on standard cards
- Hover: image scale(1.04) + headline color to #7A5C1E

### 4. Section Header

- Left border: `4px solid #B8892E`
- Label: uppercase, font-black, ~0.78rem, letter-spacing
- Followed by a full-width horizontal rule (thin, #e8e8e8)
- Pattern: `| LATEST ARTICLES`, `| DON'T MISS`, `| GOD & THEOLOGY`

### 5. "Don't Miss" Tabbed Section

- Section header at top
- Row of category filter tabs: All | Theology | Life | Apologetics | NT Issues | OT Issues
- Active tab: amber bottom border + amber text color
- Content: 1 large card (left, 3:2 image + headline + excerpt) + 4 stacked small articles (right, thumbnail + badge + title + date)
- Vertical divider between large and small columns

### 6. Per-Topic Sections

- One section per topic that has articles
- Section header with topic number badge + topic name + "All N →" action
- 3-column article card grid (or 2-col if fewer articles)
- Clicking "All N →" activates the topic filter

### 7. All Questions Numbered List

- At the bottom of the main column
- Each row: Cormorant italic number | category badge (amber bg) | headline | date
- Thin dividers between rows
- Shows ALL articles

### 8. Sidebar Widgets (all use the same section header style)

**Search**: input with border, focus turns amber

**Popular Posts**: numbered 01–05, each with category badge + headline + date

**Categories**: list of topic names with article count badges (amber bg when active)

**About**: short italic description of the series

---

## Article Card Grid Patterns

### 4-Up Grid (recent articles after hero)
```
[ card ] [ card ] [ card ] [ card ]
```
Equal width, 16:9 image, category badge, headline, date. Responsive: 2-up tablet, 1-up mobile.

### 1 Large + 4 Stacked (Don't Miss)
```
[ === LARGE CARD === ] | [ small ]
                       | [ small ]
                       | [ small ]
                       | [ small ]
```
Large: ~50% width, 3:2 image, headline, excerpt. Small: thumbnail + badge + title + date.

### 3-Column Section Grid (per topic)
```
[ card ] [ card ] [ card ]
```

---

## Spacing & Layout

```
section-gap: 40px (border-t + pt-6 between sections)
card-gap: 20px (gap-5)
container-max: 1200px
container-pad: 20px (px-5)
sidebar-width: 280px
border-radius: 0 (editorial feel — no rounded corners)
```

---

## Interaction & Behavior

- **Article cards**: hover → image scale(1.04) + headline color to #7A5C1E
- **Trending ticker**: CSS animation auto-scroll, pauses on hover
- **Category tabs** in Don't Miss: filter the content below
- **Category buttons** in sidebar: activate the filter (same as clicking a topic in main content)
- **Active filter**: hero and 4-up grid hide; filtered results show in main column; sidebar stays
- **Clear filters**: button appears when filter is active

---

## Responsive Breakpoints

| Breakpoint | Behavior |
| :---- | :---- |
| >= 1024px | Full layout: main + sidebar side by side |
| 640px–1023px | Main column goes full width; sidebar hidden |
| < 640px | Single column; 2-up grids go 1-up |

---

## Do Not

- Do not use a card-heavy "Pinterest grid" or masonry layout
- Do not use gradients on section backgrounds — keep it flat and clean
- Do not use more than 2 accent colors
- Do not add shadows heavier than `box-shadow: 0 2px 8px rgba(0,0,0,0.08)`
- Do not put body text on standard article cards (only excerpt on hero/large cards)
- Do not skip the sidebar or collapse it into the main flow at desktop widths
- Do not use rounded corners on cards, badges, or buttons (border-radius: 0)
- Do not use the warm cream palette (#FAFAF7, #F0EDE6) for the WFW page background — use white (#ffffff) and light gray (#f7f7f7)
