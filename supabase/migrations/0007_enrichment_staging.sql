-- ============================================================================
-- 0007_enrichment_staging.sql
-- Staging for the two-pass enrichment.
--
-- One pass proposing directly into the live taxonomy produced four names for
-- one idea across just three pieces ("Bible Study Methods", "Bible Study
-- Method", "Greek Word Study", "Biblical Word Study"). At 213 pieces that is a
-- taxonomy nobody can filter on.
--
-- So proposals land here first:
--   1. propose      Claude reads each piece, full proposal stored as JSONB
--   2. consolidate  one pass over every proposed topic name produces a
--                   canonical vocabulary, recorded in topic_merges for review
--   3. apply        proposals are mapped through topic_merges and written to
--                   the join tables. No new API calls, so the reruns are free.
--
-- Keeping the raw payload means step 3 can be re-run after editing the merge
-- map without paying for inference again.
-- ============================================================================

create table if not exists enrichment_proposals (
  id          bigserial primary key,
  content_id  uuid not null references content(id) on delete cascade,
  run_id      uuid references enrichment_runs(id) on delete set null,
  payload     jsonb not null,
  model       text,
  created_at  timestamptz not null default now(),
  -- One live proposal per piece: re-proposing replaces rather than accumulates.
  unique (content_id)
);

-- The canonical vocabulary decision. raw_name is what Claude proposed;
-- canonical_name is what it should become. canonical_name null means "drop
-- this one", for proposals that are not really topics.
create table if not exists topic_merges (
  id             bigserial primary key,
  raw_name       text not null unique,
  canonical_name text,
  reason         text,
  approved       boolean not null default false,
  created_at     timestamptz not null default now()
);

create index if not exists enrichment_proposals_run_idx
  on enrichment_proposals (run_id);

alter table public.enrichment_proposals enable row level security;
alter table public.topic_merges enable row level security;
grant select, insert, update, delete on public.enrichment_proposals to service_role;
grant select, insert, update, delete on public.topic_merges to service_role;
grant usage, select on all sequences in schema public to service_role;
