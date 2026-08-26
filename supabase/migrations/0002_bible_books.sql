-- ============================================================================
-- 0002_bible_books.sql
-- The 66 books in canonical order, with chapter counts.
--
-- `position` is the sort key that scripture_references encodes into start_ref
-- and end_ref (position * 1_000_000 + chapter * 1_000 + verse), so it must
-- never be renumbered once references exist.
--
-- Chapter counts follow the English/ESV versification, which is what the site
-- uses elsewhere. Note Joel is 3 chapters here, not the 4 of the Hebrew Bible.
--
-- Idempotent: safe to re-run.
-- ============================================================================

insert into bible_books (slug, name, abbreviation, testament, position, chapter_count)
values
  ('genesis', 'Genesis', 'Gen', 'OT', 1, 50),
  ('exodus', 'Exodus', 'Ex', 'OT', 2, 40),
  ('leviticus', 'Leviticus', 'Lev', 'OT', 3, 27),
  ('numbers', 'Numbers', 'Num', 'OT', 4, 36),
  ('deuteronomy', 'Deuteronomy', 'Deut', 'OT', 5, 34),
  ('joshua', 'Joshua', 'Josh', 'OT', 6, 24),
  ('judges', 'Judges', 'Judg', 'OT', 7, 21),
  ('ruth', 'Ruth', 'Ruth', 'OT', 8, 4),
  ('1-samuel', '1 Samuel', '1 Sam', 'OT', 9, 31),
  ('2-samuel', '2 Samuel', '2 Sam', 'OT', 10, 24),
  ('1-kings', '1 Kings', '1 Kgs', 'OT', 11, 22),
  ('2-kings', '2 Kings', '2 Kgs', 'OT', 12, 25),
  ('1-chronicles', '1 Chronicles', '1 Chr', 'OT', 13, 29),
  ('2-chronicles', '2 Chronicles', '2 Chr', 'OT', 14, 36),
  ('ezra', 'Ezra', 'Ezra', 'OT', 15, 10),
  ('nehemiah', 'Nehemiah', 'Neh', 'OT', 16, 13),
  ('esther', 'Esther', 'Est', 'OT', 17, 10),
  ('job', 'Job', 'Job', 'OT', 18, 42),
  ('psalms', 'Psalms', 'Ps', 'OT', 19, 150),
  ('proverbs', 'Proverbs', 'Prov', 'OT', 20, 31),
  ('ecclesiastes', 'Ecclesiastes', 'Eccl', 'OT', 21, 12),
  ('song-of-solomon', 'Song of Solomon', 'Song', 'OT', 22, 8),
  ('isaiah', 'Isaiah', 'Isa', 'OT', 23, 66),
  ('jeremiah', 'Jeremiah', 'Jer', 'OT', 24, 52),
  ('lamentations', 'Lamentations', 'Lam', 'OT', 25, 5),
  ('ezekiel', 'Ezekiel', 'Ezek', 'OT', 26, 48),
  ('daniel', 'Daniel', 'Dan', 'OT', 27, 12),
  ('hosea', 'Hosea', 'Hos', 'OT', 28, 14),
  ('joel', 'Joel', 'Joel', 'OT', 29, 3),
  ('amos', 'Amos', 'Amos', 'OT', 30, 9),
  ('obadiah', 'Obadiah', 'Obad', 'OT', 31, 1),
  ('jonah', 'Jonah', 'Jonah', 'OT', 32, 4),
  ('micah', 'Micah', 'Mic', 'OT', 33, 7),
  ('nahum', 'Nahum', 'Nah', 'OT', 34, 3),
  ('habakkuk', 'Habakkuk', 'Hab', 'OT', 35, 3),
  ('zephaniah', 'Zephaniah', 'Zeph', 'OT', 36, 3),
  ('haggai', 'Haggai', 'Hag', 'OT', 37, 2),
  ('zechariah', 'Zechariah', 'Zech', 'OT', 38, 14),
  ('malachi', 'Malachi', 'Mal', 'OT', 39, 4),
  ('matthew', 'Matthew', 'Matt', 'NT', 40, 28),
  ('mark', 'Mark', 'Mark', 'NT', 41, 16),
  ('luke', 'Luke', 'Luke', 'NT', 42, 24),
  ('john', 'John', 'John', 'NT', 43, 21),
  ('acts', 'Acts', 'Acts', 'NT', 44, 28),
  ('romans', 'Romans', 'Rom', 'NT', 45, 16),
  ('1-corinthians', '1 Corinthians', '1 Cor', 'NT', 46, 16),
  ('2-corinthians', '2 Corinthians', '2 Cor', 'NT', 47, 13),
  ('galatians', 'Galatians', 'Gal', 'NT', 48, 6),
  ('ephesians', 'Ephesians', 'Eph', 'NT', 49, 6),
  ('philippians', 'Philippians', 'Phil', 'NT', 50, 4),
  ('colossians', 'Colossians', 'Col', 'NT', 51, 4),
  ('1-thessalonians', '1 Thessalonians', '1 Thess', 'NT', 52, 5),
  ('2-thessalonians', '2 Thessalonians', '2 Thess', 'NT', 53, 3),
  ('1-timothy', '1 Timothy', '1 Tim', 'NT', 54, 6),
  ('2-timothy', '2 Timothy', '2 Tim', 'NT', 55, 4),
  ('titus', 'Titus', 'Titus', 'NT', 56, 3),
  ('philemon', 'Philemon', 'Phlm', 'NT', 57, 1),
  ('hebrews', 'Hebrews', 'Heb', 'NT', 58, 13),
  ('james', 'James', 'Jas', 'NT', 59, 5),
  ('1-peter', '1 Peter', '1 Pet', 'NT', 60, 5),
  ('2-peter', '2 Peter', '2 Pet', 'NT', 61, 3),
  ('1-john', '1 John', '1 John', 'NT', 62, 5),
  ('2-john', '2 John', '2 John', 'NT', 63, 1),
  ('3-john', '3 John', '3 John', 'NT', 64, 1),
  ('jude', 'Jude', 'Jude', 'NT', 65, 1),
  ('revelation', 'Revelation', 'Rev', 'NT', 66, 22)
on conflict (slug) do update set
  name          = excluded.name,
  abbreviation  = excluded.abbreviation,
  testament     = excluded.testament,
  position      = excluded.position,
  chapter_count = excluded.chapter_count;
