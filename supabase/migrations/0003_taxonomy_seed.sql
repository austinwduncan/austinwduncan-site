-- ============================================================================
-- 0003_taxonomy_seed.sql
-- Starting values for the fixed-ish dimensions.
--
-- These are rows, not enums, precisely so they can be renamed, reordered and
-- extended from the admin without a migration. Seeding them here just means
-- the library is usable on day one.
--
-- Topics and doctrines are deliberately NOT seeded: those come out of the
-- content itself during the import and enrichment pass, and inventing a
-- taxonomy before reading the material is how you end up with categories
-- nothing fits.
--
-- Idempotent: safe to re-run.
-- ============================================================================

-- Format: what a piece IS.
insert into formats (slug, name, position) values
  ('sermon',  'Sermon',  1),
  ('study',   'Study',   2),
  ('article', 'Article', 3),
  ('paper',   'Paper',   4)
on conflict (slug) do update set name = excluded.name, position = excluded.position;

-- Approach: how it ARGUES. Independent of format, which is the distinction the
-- old single `tags` field could not express.
insert into approaches (slug, name, position) values
  ('expositional',   'Expositional',   1),
  ('topical',        'Topical',        2),
  ('apologetics',    'Apologetics',    3),
  ('academic',       'Academic',       4),
  ('current-events', 'Current Events', 5)
on conflict (slug) do update set name = excluded.name, position = excluded.position;

-- Level: depth is ordered so "at least this deep" filtering is possible.
insert into levels (slug, name, depth) values
  ('accessible',   'Accessible',   1),
  ('intermediate', 'Intermediate', 2),
  ('advanced',     'Advanced',     3),
  ('academic',     'Academic',     4)
on conflict (slug) do update set name = excluded.name, depth = excluded.depth;

-- Collections keep their identities. They are a dimension, not the spine.
insert into collections (slug, name, tagline, position) values
  ('in-the-text',      'In the Text',     'Book studies and biblical theology, worked through in order.', 1),
  ('word-for-word',    'Word for Word',   'Straight answers to the questions people actually ask.',       2),
  ('exegetica',        'Exegetica',       'Longer scholarly work, with the Greek and Hebrew left in.',    3),
  ('forum-and-pulpit', 'Forum & Pulpit',  'What Scripture says about what is actually happening now.',    4)
on conflict (slug) do update set
  name = excluded.name, tagline = excluded.tagline, position = excluded.position;
