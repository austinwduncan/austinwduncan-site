-- A whole book sweep is not a direct reference.
--
-- Austin's rule: what counts is a passage actually read or directly referenced
-- in the work. A sermon tagged "Psalms 1-150" is a gesture at the book, not
-- teaching on Psalm 73, and counting it made Psalms read as 150 of 150
-- chapters taught when the true figure is 36.
--
-- Marked rather than deleted, so the reference is still there for a piece that
-- genuinely surveys a whole book, and so this is reversible.
--
-- A single chapter book is deliberately excluded. Jude 1 covers the whole of
-- Jude but is a direct reference, not a sweep. Without that guard, Jude,
-- Philemon, Obadiah and 3 John all lose their only coverage.

alter table scripture_references
  add column if not exists is_sweep boolean not null default false;

update scripture_references sr
set is_sweep = true
from bible_books b
where sr.book_id = b.id
  and b.chapter_count > 1
  and sr.chapter_start <= 1
  and coalesce(sr.chapter_end, sr.chapter_start) >= b.chapter_count
  and sr.verse_start is null
  and sr.verse_end is null;

-- Direct references are what every scripture page reads, so index for them.
create index if not exists scripture_direct_idx
  on scripture_references (start_ref, end_ref)
  where is_sweep = false;

comment on column scripture_references.is_sweep is
  'True when the reference spans an entire multi chapter book with no verse detail. Excluded from scripture browsing, which counts direct references only.';
