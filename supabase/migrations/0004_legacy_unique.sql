-- ============================================================================
-- 0004_legacy_unique.sql
-- Make the legacy identity a real unique CONSTRAINT rather than a partial
-- unique index.
--
-- 0001 created it as `unique index ... where legacy_id is not null`. A partial
-- index cannot be used for ON CONFLICT inference, so re-importing content
-- fails instead of updating in place. A plain unique constraint works, and
-- costs nothing here: Postgres treats NULLs as distinct by default, so rows
-- authored natively in the admin (no legacy_id) are unaffected and can be
-- as numerous as they like.
-- ============================================================================

drop index if exists content_legacy_idx;

alter table content
  drop constraint if exists content_legacy_unique;

alter table content
  add constraint content_legacy_unique unique (legacy_source, legacy_id);
