# Homepage shot list

What to shoot so the homepage stops leaning on the headshot and starts carrying
imagery the way the Crosswalk site does.

## How the photos get used

Every image on the homepage goes through `PhotoSlot` in `app/page.tsx`. It
renders **grayscale by default and comes to full colour on hover**, over 900ms.
That matches the Crosswalk treatment. If a slot has no photo, it falls back to
the gold diamond lattice, so the page never breaks while you are still
shooting — you can add these one at a time.

Because everything is grayscale at rest, **tonal contrast matters far more than
colour**. A shot that is all mid-grey will disappear. Look for a clear bright
area and a clear dark area in every frame.

## Priority 1 — the hero

**Slot:** hero, right side. Portrait, **4:5**, needs to hold up at 420px wide
and roughly 525px tall.
**Save as:** `public/images/home/hero.jpg`
**Then:** change the `src` on the hero `PhotoSlot` (it is commented in the file).

Shoot **you actually teaching**, not a posed portrait. The headshot in there now
is the thing making the page feel like a business card.

- Mid-shot, from the side or three-quarter, open Bible or notes visible
- Shot during a real session if possible, so the room reads as real
- Let the background go dark and out of focus; you want a lit face against a
  dark field, which is what makes the grayscale treatment sing
- Vertical framing, plenty of headroom, since it crops to 4:5

Take 3 or 4 variations. One where you are looking down at the text, one
mid-sentence with a hand gesture.

## Priority 2 — a wide establishing shot

**Slot:** could open a future section, or replace the closing band background.
**Ratio:** 16:9. **Save as:** `public/images/home/teaching-wide.jpg`

- The room from the back, people in frame, you small and up front
- This is the shot that says "this is taught to actual people"
- Needs a strong light source in it (windows, stage lights) for tonal range

## Priority 3 — desk and text detail

**Ratio:** 16:9 or 3:2. **Save as:** `public/images/home/study.jpg`

- Overhead or close side angle of the desk mid-study: open Bible, Greek text,
  lexicon, notes, pen, coffee
- No faces, no hands posed unnaturally. Let it look used, not styled
- This is the one that signals Exegetica and the Library without a caption

## Priority 4 — hands and Bible, close

**Ratio:** 4:5 or 1:1. **Save as:** `public/images/home/text.jpg`

- Very close: a hand on the page, a marked-up margin, a highlighted verse
- Shallow depth of field
- Useful as a small accent anywhere the layout needs weight

## Practical notes

- **Shoot RAW or HEIF max quality** if you can, then export JPEG at 2000px on
  the long edge. Anything smaller looks soft on a retina screen at these sizes.
- **Do not colour grade toward warm gold.** The site adds its own gold; a warm
  photo underneath fights it. Shoot neutral and let the grayscale do the work.
- **Avoid busy backgrounds.** Every one of these reads better with a simple,
  darker background than with a cluttered room.
- Existing series art and book covers already carry the Teaching and Library
  sections, so nothing new is needed there.

## Reusing Crosswalk photos

`~/crosswalk-website/public/photos/` has usable material already shot. Two
cautions: the site rule that each photo is used exactly once still applies, and
a photo that reads as *the church* rather than *you teaching* will pull the page
back toward being a church site. Prefer new shots for the hero.
