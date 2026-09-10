-- One collection, one "what is it" axis. Series, topics and scripture stay
-- independent. Values are fixed in lib/categories.ts. Applied 2026-09-07.
alter table public.sermons add column if not exists category text not null default 'sermon';
alter table public.sermons drop constraint if exists sermons_category_check;
alter table public.sermons add constraint sermons_category_check
  check (category in ('sermon','teaching','episode','paper','commentary'));
create index if not exists sermons_category_idx on public.sermons (category, date desc);
notify pgrst, 'reload schema';
