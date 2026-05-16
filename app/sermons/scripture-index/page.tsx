import type { Metadata } from 'next'
import {
  getAll,
  sortByDate,
  readingTime,
  bibleBooksFromTags,
  formatDate,
  type SermonFrontmatter,
} from '@/lib/content'
import ScriptureIndexBrowser, { type IndexBook } from '@/components/scripture-index-browser'

export const metadata: Metadata = {
  title: 'Scripture Index',
  description: 'Every sermon organized by Bible book and passage.',
}

// Canonical order — NT first (matches reference design), OT second
const NT_BOOKS = [
  'Matthew','Mark','Luke','John','Acts',
  'Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians',
  'Philippians','Colossians','1 Thessalonians','2 Thessalonians',
  '1 Timothy','2 Timothy','Titus','Philemon',
  'Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation',
]
const OT_BOOKS = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth',
  '1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles',
  'Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon',
  'Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel',
  'Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum',
  'Habakkuk','Zephaniah','Haggai','Zechariah','Malachi',
]

export default function ScriptureIndexPage() {
  const raw = sortByDate(getAll<SermonFrontmatter>('sermons'))

  // Map each Bible book → list of sermons
  const bookMap = new Map<string, IndexBook['sermons']>()

  for (const { frontmatter: fm, content, slug } of raw) {
    const books = bibleBooksFromTags(fm.tags)
    if (books.length === 0) continue

    for (const book of books) {
      if (!bookMap.has(book)) bookMap.set(book, [])
      bookMap.get(book)!.push({
        slug,
        title: fm.title,
        formattedDate: formatDate(fm.date),
        readingMinutes: readingTime(content),
        passage: fm.scripture
          ? fm.scripture.replace(new RegExp(`^${book}\\s*`), '').trim() || undefined
          : undefined,
      })
    }
  }

  function toIndexBooks(bookList: string[], testament: 'ot' | 'nt'): IndexBook[] {
    return bookList
      .filter((b) => bookMap.has(b))
      .map((b) => ({ book: b, testament, sermons: bookMap.get(b)! }))
  }

  const ntBooks = toIndexBooks(NT_BOOKS, 'nt')
  const otBooks = toIndexBooks(OT_BOOKS, 'ot')
  const allBooks = [...otBooks, ...ntBooks]

  const totalSermons = raw.length
  const totalBooks = allBooks.length

  return (
    <>
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div style={{ background: '#141210' }}>
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8 pt-14">
          <div
            className="flex items-end justify-between gap-8 pb-10 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <div>
              <div
                className="flex items-center gap-2 text-[0.7rem] font-medium tracking-[0.12em] uppercase mb-3"
                style={{ color: '#B8892E' }}
              >
                <span className="inline-block h-px w-[18px]" style={{ background: '#B8892E' }} />
                Sermons
              </div>
              <h1
                className="leading-[1.1] tracking-tight"
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: 'clamp(2.2rem, 3.5vw, 3rem)',
                  fontWeight: 400,
                  color: '#F9F6F0',
                }}
              >
                Scripture Index
              </h1>
            </div>
            <p
              className="text-[0.92rem] italic max-w-[380px] text-right pb-0.5 leading-relaxed"
              style={{
                fontFamily: 'var(--font-source-serif)',
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              {totalSermons} sermons across {totalBooks} books of the Bible.
            </p>
          </div>
        </div>
      </div>

      {/* ── Amber strip ─────────────────────────────────────────────────── */}
      <div
        className="h-[14px] w-full"
        style={{
          backgroundColor: '#7A5C1E',
          backgroundImage: `
            repeating-linear-gradient(60deg, transparent, transparent 6px, rgba(255,255,255,0.07) 6px, rgba(255,255,255,0.07) 7px),
            repeating-linear-gradient(-60deg, transparent, transparent 6px, rgba(255,255,255,0.07) 6px, rgba(255,255,255,0.07) 7px)
          `,
        }}
      />

      {/* ── Browser ─────────────────────────────────────────────────────── */}
      <div style={{ background: '#FAFAF7' }}>
        <ScriptureIndexBrowser books={allBooks} />
      </div>
    </>
  )
}
