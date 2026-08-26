# Content gaps

Generated from Postgres. 26 pieces need real content written or restored.
Everything else on the site has a usable body.

## 1. Empty files, 12

Frontmatter only, no body. These render as blank pages today.

### Hebrews, 7 missing (the series has 13 parts)
- `content/teaching/expositional/Hebrews/hebrews-3.mdx` Hebrews 3: The Faithful Builder
- `content/teaching/expositional/Hebrews/hebrews-5.mdx` Hebrews 5: The High Priest Who Understands
- `content/teaching/expositional/Hebrews/hebrews-9.mdx` Hebrews 9: The Better Tabernacle
- `content/teaching/expositional/Hebrews/hebrews-10.mdx` Hebrews 10: Draw Near with Confidence
- `content/teaching/expositional/Hebrews/hebrews-11.mdx` Hebrews 11: Faith That Sees the Unseen
- `content/teaching/expositional/Hebrews/hebrews-12.mdx` Hebrews 12: Running with Endurance
- `content/teaching/expositional/Hebrews/hebrews-13.mdx` Hebrews 13: Go to Him Outside the Camp

### Exegetica papers, 4
- `content/exegetica/eschatological-ethics-how-the-biblical-vision-of-the-future-shapes-present-christian-practice.mdx`
- `content/exegetica/israel-the-church-and-eschatology-an-examination-of-covenant-continuity-and-discontinuity.mdx`
- `content/exegetica/justification-and-covenant-membership-reevaluating-the-new-perspective-on-paul.mdx`
- `content/exegetica/the-divine-council-motif-in-the-hebrew-bible-and-its-influence-on-new-testament-christology.mdx`

### Series index, 1
- `content/teaching/expositional/The Minor Prophets/the-minor-prophets.mdx` (may be intentional)

## 2. Wrong content, 18

These have a body, so nothing flags them as missing, but the body belongs to a
different piece. Found by comparing normalised text, not exact hashes: two of
these groups differ by a single escape character and survived an exact-hash
check.

### 10 Word for Word pieces share one 749 character stub
The body is a repeated heading, "Why do Christians worship on Sunday rather
than on the Sabbath day?", which matches none of these titles. All 10 need
writing.

- `content/word-for-word/are-images-of-jesus-idolatrous.mdx`
- `content/word-for-word/did-jesus-claim-to-be-god.mdx`
- `content/word-for-word/does-isaiah-535-guarantee-our-healing-today.mdx`
- `content/word-for-word/does-the-bible-claim-jesus-is-god.mdx`
- `content/word-for-word/how-can-we-be-sure-about-the-resurrection-of-christ.mdx`
- `content/word-for-word/is-baptism-necessary-for-salvation.mdx`
- `content/word-for-word/is-the-virgin-birth-miracle-or-myth.mdx`
- `content/word-for-word/was-christianity-influenced-by-ancient-pagan-mystery-religions.mdx`
- `content/word-for-word/what-credentials-back-up-jesus-claim-to-deity.mdx`
- `content/word-for-word/what-does-it-mean-to-say-that-jesus-ascended-into-heaven.mdx`

### Daniel 7 holds Daniel 8's manuscript
- `content/teaching/expositional/Daniel/daniel-7-the-son-of-man.mdx` needs the real Daniel 7
- `content/teaching/expositional/Daniel/daniel-8.mdx` appears genuine

### Daniel 10, 11, 12 all hold the same manuscript
Opens "When Prayer Opens History". One is genuine, two need writing.
- `content/teaching/expositional/Daniel/daniel-10.mdx`
- `content/teaching/expositional/Daniel/daniel-11.mdx`
- `content/teaching/expositional/Daniel/daniel-12.mdx`

### 3 sermons all hold the same manuscript
Opens "A Glutton". One is genuine, two need writing.
- `content/sermons/the-new-standard.mdx`
- `content/sermons/who-are-you-inviting.mdx`
- `content/sermons/wont-you-be-my-neighbor.mdx`

## 3. No artwork, 13

Will render as holes in every grid and shelf.

- Eschatological Ethics (exegetica)
- Israel, the Church, and Eschatology (exegetica)
- Justification and Covenant Membership (exegetica)
- The Kingdom of God in Biblical Theology (exegetica)
- The Servant Songs of Isaiah (exegetica)
- Parents, Pluralism, and Public Schools (forum-and-pulpit, filed under `chamad-guarding-desire.mdx`, the filename does not match the title and is worth checking)
- Daniel 4
- Hebrews 3, 9, 10, 11, 12, 13

Note the overlap: the 4 empty Exegetica papers and 6 of the 7 empty Hebrews
files also have no artwork, so those pieces are entirely unbuilt rather than
partly missing.

## Not on this list

Summaries and card subtitles are being regenerated automatically and need
nothing from you.
