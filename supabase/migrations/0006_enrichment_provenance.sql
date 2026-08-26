-- ============================================================================
-- 0006_enrichment_provenance.sql
-- Let the enrichment pipeline write taxonomy directly, but keep track of what
-- it wrote.
--
-- Austin's call is that AI-assigned tags land straight in the join tables and
-- he edits from there, rather than queueing every proposal for review. That is
-- the right trade at 213 pieces. The only thing it needs to be safe is
-- provenance: without it a machine guess and a considered human judgment look
-- identical, so a bad batch is unfindable and unrevertable.
--
-- With `source` and `run_id` on the join rows:
--   * the admin can show "AI suggested" vs "you set this"
--   * a whole bad run is one delete away
--   * low-confidence tags can be surfaced for a second look
--
-- content_suggestions stays in the schema. It is still the right home for
-- proposals that need a decision rather than a default, e.g. merging two
-- topics or a proposed relationship between pieces.
-- ============================================================================

create table if not exists enrichment_runs (
  id          uuid primary key default gen_random_uuid(),
  model       text,
  note        text,
  started_at  timestamptz not null default now(),
  finished_at timestamptz,
  stats       jsonb
);

do $$
declare t text;
begin
  foreach t in array array[
    'content_topics','content_doctrines','content_approaches','scripture_references'
  ] loop
    execute format($f$
      alter table public.%I
        add column if not exists source text not null default 'human'
          check (source in ('human','ai','import')),
        add column if not exists confidence numeric(4,3),
        add column if not exists run_id uuid references enrichment_runs(id) on delete set null
    $f$, t);
    execute format(
      'create index if not exists %1$s_source_idx on public.%1$I (source)', t);
  end loop;
end $$;

-- Everything already in the tables came from the MDX import, not from a person
-- and not from a model. Label it so the distinction starts out honest.
update content_topics       set source = 'import' where source = 'human';
update content_doctrines    set source = 'import' where source = 'human';
update content_approaches   set source = 'import' where source = 'human';
update scripture_references set source = 'import' where source = 'human';

alter table public.enrichment_runs enable row level security;
grant select, insert, update, delete on public.enrichment_runs to service_role;
