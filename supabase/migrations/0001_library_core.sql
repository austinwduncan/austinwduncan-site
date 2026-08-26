-- ============================================================================
-- 0001_library_core.sql
-- The Library: one collection, many entrances.
--
-- Design notes worth keeping in mind while reading:
--
--  * There is ONE content table. A sermon and an Exegetica paper are the same
--    kind of thing wearing different metadata. Splitting them into separate
--    tables is what produced the current problem, where five sections cannot
--    be searched together.
--
--  * "Collection" (Word for Word, Exegetica, Forum & Pulpit, In the Text) is
--    just one dimension among many. It is deliberately NOT the spine.
--
--  * Everything that could grow a synonym, be renamed, or be merged later is a
--    row, not an enum. Renaming a topic must never require a migration.
--
--  * Scripture is stored structurally AND as integer bounds, so "everything
--    that touches Luke 15:11-32" is an index-backed range intersection rather
--    than a string match. See the note above scripture_references.
--
-- Conventions match the Crosswalk project: lowercase SQL, create-if-not-exists,
-- RLS on with explicit policies, and explicit grants to service_role (the
-- missing-grant failure mode has bitten this stack before).
-- ============================================================================

-- ── Lookups ─────────────────────────────────────────────────────────────────
-- Format = what it IS (sermon, paper). Approach = how it ARGUES (expositional,
-- apologetic). These are independent: a sermon can be expositional or topical,
-- and conflating them is exactly the mistake the old `tags` field made.

create table if not exists formats (
  id          serial primary key,
  slug        text not null unique,
  name        text not null,
  position    int  not null default 0
);

create table if not exists approaches (
  id          serial primary key,
  slug        text not null unique,
  name        text not null,
  position    int  not null default 0
);

create table if not exists levels (
  id          serial primary key,
  slug        text not null unique,
  name        text not null,
  -- Ordered so "at least this deep" queries are possible.
  depth       int  not null
);

create table if not exists collections (
  id          serial primary key,
  slug        text not null unique,
  name        text not null,
  tagline     text,
  description text,
  artwork_url text,
  position    int  not null default 0
);

create table if not exists series (
  id            serial primary key,
  slug          text not null unique,
  name          text not null,
  subtitle      text,
  description   text,
  artwork_url   text,
  collection_id int references collections(id) on delete set null,
  -- Ongoing series should be able to say so without a separate status table.
  is_complete   boolean not null default false,
  position      int not null default 0
);

create table if not exists topics (
  id          serial primary key,
  slug        text not null unique,
  name        text not null,
  description text,
  -- Topics form a shallow tree (Christian Life > Suffering). Nullable parent
  -- keeps it optional rather than forcing a hierarchy on every topic.
  parent_id   int references topics(id) on delete set null
);

create table if not exists doctrines (
  id          serial primary key,
  slug        text not null unique,
  name        text not null,
  description text
);

-- Vocabulary mismatch is a real discovery problem: people search "can women
-- preach" for content tagged "women in ministry". Aliases feed the search
-- layer's synonym list and are editable from the admin.
create table if not exists topic_aliases (
  id        serial primary key,
  topic_id  int not null references topics(id) on delete cascade,
  alias     text not null,
  unique (topic_id, alias)
);

-- ── Bible books ─────────────────────────────────────────────────────────────
-- A real table, not a string. Gives canonical ordering for the Scripture
-- explorer and lets chapter counts drive the chapter grid.

create table if not exists bible_books (
  id            serial primary key,
  slug          text not null unique,        -- 'luke', '1-corinthians'
  name          text not null,               -- 'Luke'
  abbreviation  text,                        -- 'Lk'
  testament     text not null check (testament in ('OT','NT')),
  position      int  not null unique,        -- 1..66, canonical order
  chapter_count int  not null
);

-- ── Content ─────────────────────────────────────────────────────────────────

create table if not exists content (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  title          text not null,
  subtitle       text,
  summary        text,

  -- Tiptap/Lexical document. JSONB rather than HTML or Markdown so custom
  -- blocks (scripture, original-language, key idea, citation) stay queryable:
  -- "every teaching that discusses σπλαγχνίζομαι" is a jsonb path query.
  body           jsonb,
  -- Flattened plain text, maintained on save. Feeds search and reading time
  -- without walking the JSON on every query.
  body_text      text,

  format_id      int references formats(id) on delete set null,
  level_id       int references levels(id)  on delete set null,
  collection_id  int references collections(id) on delete set null,
  series_id      int references series(id) on delete set null,
  -- Position within its series, so "next in this series" is trivial.
  series_position int,

  status         text not null default 'draft'
                   check (status in ('draft','scheduled','published','archived')),
  published_at   timestamptz,
  reading_minutes int,

  featured_image text,
  seo_title      text,
  seo_description text,

  -- Provenance during the migration off MDX/Sanity, so a re-import can be
  -- matched to an existing row instead of duplicating it.
  legacy_source  text,   -- 'mdx' | 'sanity'
  legacy_id      text,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists content_status_published_idx
  on content (status, published_at desc);
create index if not exists content_collection_idx on content (collection_id);
create index if not exists content_series_idx on content (series_id, series_position);
create unique index if not exists content_legacy_idx
  on content (legacy_source, legacy_id) where legacy_id is not null;

-- Old URLs must keep working. ~220 published paths already exist across
-- /sermons, /teaching, /word-for-word, /exegetica and /forum-and-pulpit;
-- every one of them gets a row here so nothing 404s after the move.
create table if not exists content_slug_history (
  id          serial primary key,
  content_id  uuid not null references content(id) on delete cascade,
  old_path    text not null unique,
  created_at  timestamptz not null default now()
);

-- ── Many-to-many ────────────────────────────────────────────────────────────

create table if not exists content_approaches (
  content_id  uuid not null references content(id) on delete cascade,
  approach_id int  not null references approaches(id) on delete cascade,
  primary key (content_id, approach_id)
);

create table if not exists content_topics (
  content_id uuid not null references content(id) on delete cascade,
  topic_id   int  not null references topics(id) on delete cascade,
  -- Lets a topic page lead with the pieces genuinely about it rather than the
  -- ones that mention it once.
  is_primary boolean not null default false,
  primary key (content_id, topic_id)
);

create table if not exists content_doctrines (
  content_id  uuid not null references content(id) on delete cascade,
  doctrine_id int  not null references doctrines(id) on delete cascade,
  primary key (content_id, doctrine_id)
);

create index if not exists content_topics_topic_idx on content_topics (topic_id);
create index if not exists content_doctrines_doctrine_idx on content_doctrines (doctrine_id);

-- ── Scripture ───────────────────────────────────────────────────────────────
-- start_ref/end_ref encode book/chapter/verse as one sortable integer:
--     book_position * 1_000_000 + chapter * 1_000 + verse
-- A passage is a closed interval, so "what touches Luke 15:11-32" becomes
--     start_ref <= :range_end and end_ref >= :range_start
-- which a btree index answers directly. String matching could never do this.

create table if not exists scripture_references (
  id            bigserial primary key,
  content_id    uuid not null references content(id) on delete cascade,
  book_id       int  not null references bible_books(id),
  chapter_start int  not null,
  verse_start   int,
  chapter_end   int,
  verse_end     int,
  -- The passage the piece is actually expounding, versus one it cites in
  -- passing. Drives ordering on /scripture pages.
  is_primary    boolean not null default false,
  start_ref     bigint not null,
  end_ref       bigint not null
);

create index if not exists scripture_range_idx
  on scripture_references (start_ref, end_ref);
create index if not exists scripture_book_idx
  on scripture_references (book_id, chapter_start);
create index if not exists scripture_content_idx
  on scripture_references (content_id);

-- ── Media ───────────────────────────────────────────────────────────────────
-- Read / Watch / Listen comes from here. Every teaching will eventually have
-- video, so this is a table rather than columns on content.

create table if not exists media (
  id            bigserial primary key,
  content_id    uuid not null references content(id) on delete cascade,
  kind          text not null check (kind in ('video','audio','transcript','slides','handout')),
  provider      text,           -- 'youtube', 'vimeo', 'file'
  url           text not null,
  external_id   text,           -- youtube id, etc
  duration_secs int,
  position      int not null default 0
);

create index if not exists media_content_idx on media (content_id, kind);

-- ── Relationships ───────────────────────────────────────────────────────────
-- Typed, so the frontend can say "a deeper treatment" or "answers this
-- question" instead of a meaningless "Related Articles" block.

create table if not exists content_relations (
  id            bigserial primary key,
  source_id     uuid not null references content(id) on delete cascade,
  target_id     uuid not null references content(id) on delete cascade,
  relation      text not null check (relation in
                  ('deeper','prerequisite','answers','responds_to','companion','related')),
  -- Set when the AI pipeline proposed it, so suggestions can be reviewed and
  -- machine-made links can be told apart from ones Austin chose.
  confidence    numeric(4,3),
  created_at    timestamptz not null default now(),
  check (source_id <> target_id),
  unique (source_id, target_id, relation)
);

create index if not exists content_relations_target_idx on content_relations (target_id);

-- ── AI enrichment queue ─────────────────────────────────────────────────────
-- The Claude pipeline never writes taxonomy directly. It proposes here and
-- Austin accepts or rejects from the admin, so the library never fills with
-- unreviewed machine tagging.

create table if not exists content_suggestions (
  id           bigserial primary key,
  content_id   uuid not null references content(id) on delete cascade,
  dimension    text not null check (dimension in
                 ('topic','doctrine','scripture','approach','level','series','relation','summary')),
  payload      jsonb not null,
  confidence   numeric(4,3),
  rationale    text,
  status       text not null default 'pending'
                 check (status in ('pending','accepted','rejected')),
  model        text,
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz
);

create index if not exists content_suggestions_pending_idx
  on content_suggestions (status, content_id);

-- ── Revisions ───────────────────────────────────────────────────────────────
-- Snapshot on publish. Cheap insurance for a decade of writing.

create table if not exists content_revisions (
  id          bigserial primary key,
  content_id  uuid not null references content(id) on delete cascade,
  title       text,
  body        jsonb,
  note        text,
  created_at  timestamptz not null default now()
);

create index if not exists content_revisions_content_idx
  on content_revisions (content_id, created_at desc);

-- ── Search analytics ────────────────────────────────────────────────────────
-- Zero-result and no-click queries are how the alias list gets written.

create table if not exists search_events (
  id            bigserial primary key,
  query         text not null,
  filters       jsonb,
  result_count  int  not null default 0,
  clicked_id    uuid references content(id) on delete set null,
  created_at    timestamptz not null default now()
);

create index if not exists search_events_query_idx on search_events (created_at desc);

-- ── updated_at ──────────────────────────────────────────────────────────────

create or replace function touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists content_touch on content;
create trigger content_touch before update on content
  for each row execute function touch_updated_at();

-- ── RLS + grants ────────────────────────────────────────────────────────────
-- Published content is world-readable; everything else is service_role only.
-- The grants are explicit because a missing grant (not a missing policy) is
-- what has caused permission-denied on this stack before.

do $$
declare t text;
begin
  foreach t in array array[
    'formats','approaches','levels','collections','series','topics','doctrines',
    'topic_aliases','bible_books','content','content_slug_history',
    'content_approaches','content_topics','content_doctrines',
    'scripture_references','media','content_relations','content_suggestions',
    'content_revisions','search_events'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('grant select, insert, update, delete on public.%I to service_role', t);
  end loop;
end $$;

grant usage, select on all sequences in schema public to service_role;

-- Public read for the taxonomy and for published content only.
do $$
declare t text;
begin
  foreach t in array array[
    'formats','approaches','levels','collections','series','topics','doctrines',
    'topic_aliases','bible_books'
  ] loop
    execute format('drop policy if exists "public read %1$s" on public.%1$I', t);
    execute format(
      'create policy "public read %1$s" on public.%1$I for select using (true)', t);
    execute format('grant select on public.%I to anon, authenticated', t);
  end loop;
end $$;

drop policy if exists "public read published" on public.content;
create policy "public read published" on public.content
  for select using (status = 'published');
grant select on public.content to anon, authenticated;
