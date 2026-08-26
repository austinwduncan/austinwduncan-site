-- ============================================================================
-- 0005_read_policies.sql
-- Public read policies for the detail tables, plus two hardening fixes the
-- Supabase linter flagged.
--
-- Why this is needed: 0001 enabled RLS everywhere and granted anon SELECT only
-- on `content` and the taxonomy lookups. The join and detail tables were left
-- with RLS on and no policy, which is a deny-all. Correct for the private
-- tables, but it means the public site cannot read a passage, a topic tag or a
-- video: /scripture/luke/15 would come back empty with the data sitting right
-- there.
--
-- The rule below is "visible when the parent content is published", not
-- blanket public, so unpublished drafts leak nothing through their references.
--
-- Deliberately NOT given public policies (they stay deny-all for anon):
--   content_suggestions  AI proposals awaiting review
--   content_revisions    editing history
--   search_events        analytics
--   content_slug_history redirect lookups happen server-side
-- ============================================================================

-- ── Detail tables tied to a content row ─────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'scripture_references','content_topics','content_doctrines',
    'content_approaches','media'
  ] loop
    execute format('drop policy if exists "public read %1$s" on public.%1$I', t);
    execute format($f$
      create policy "public read %1$s" on public.%1$I
        for select using (
          exists (
            select 1 from public.content c
            where c.id = %1$I.content_id and c.status = 'published'
          )
        )
    $f$, t);
    execute format('grant select on public.%I to anon, authenticated', t);
  end loop;
end $$;

-- ── content_relations references content twice, so it needs both sides ──────
drop policy if exists "public read content_relations" on public.content_relations;
create policy "public read content_relations" on public.content_relations
  for select using (
    exists (select 1 from public.content c where c.id = source_id and c.status = 'published')
    and
    exists (select 1 from public.content c where c.id = target_id and c.status = 'published')
  );
grant select on public.content_relations to anon, authenticated;

-- ── Supporting indexes ──────────────────────────────────────────────────────
-- Each policy above runs an EXISTS against content.id on every row read, so
-- the join columns want indexes. Most already have one; these were missing.
create index if not exists content_approaches_content_idx
  on content_approaches (content_id);
create index if not exists content_topics_content_idx
  on content_topics (content_id);
create index if not exists content_doctrines_content_idx
  on content_doctrines (content_id);
create index if not exists content_relations_source_idx
  on content_relations (source_id);

-- ── Linter: function_search_path_mutable ────────────────────────────────────
-- A SECURITY DEFINER-adjacent function with a mutable search_path can be
-- influenced by whatever the caller has set. Pin it.
create or replace function touch_updated_at() returns trigger
  language plpgsql
  set search_path = pg_catalog, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Linter: anon/authenticated can execute rls_auto_enable() ────────────────
-- Not created by this project: it is an event-trigger helper that turns RLS on
-- for newly created tables. It only does anything inside a DDL event, so
-- calling it over REST is inert, but it is exposed at
-- /rest/v1/rpc/rls_auto_enable for no reason. Revoke rather than alter, so the
-- event trigger itself keeps working untouched.
do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'rls_auto_enable'
  ) then
    revoke execute on function public.rls_auto_enable() from anon, authenticated, public;
  end if;
end $$;
