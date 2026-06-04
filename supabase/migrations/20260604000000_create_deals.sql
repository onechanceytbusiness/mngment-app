-- ---------------------------------------------------------------
-- FA Deals Automation — deals table
-- ---------------------------------------------------------------
-- Rows are inserted post-enrichment (the enrich webhook returns a
-- canonical Deal shape; the row is stored verbatim plus id/created_at).
-- Reads/writes happen from the SPA via the Supabase JS client using the
-- signed-in user's JWT. RLS keeps anonymous traffic out — every policy
-- gates on the `authenticated` role.

create table public.deals (
  id             bigint generated always as identity primary key,
  audience       text not null check (audience in ('men', 'women')),
  category       text not null,
  store          text,
  product_name   text not null,
  mrp            numeric,
  price          numeric,
  discount_pct   int,
  image_url      text,
  raw_link       text,
  affiliate_link text,
  link_status    text default 'manual' check (link_status in ('auto', 'manual')),
  glow_title     text,
  pitch          text,
  status         text default 'found' check (status in ('found', 'posted')),
  posted_to      jsonb default '[]'::jsonb,
  created_at     timestamptz default now()
);

-- Hot path: per-audience listing ordered by recency, often filtered by status.
create index deals_audience_status_created_idx
  on public.deals (audience, status, created_at desc);

-- ---------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------
-- This is an internal hub — every signed-in user has full access.
-- If we ever need per-user isolation, add a `user_id uuid` column
-- defaulting to auth.uid() and tighten these policies.

alter table public.deals enable row level security;

create policy "deals: authenticated read"
  on public.deals for select
  to authenticated
  using (true);

create policy "deals: authenticated insert"
  on public.deals for insert
  to authenticated
  with check (true);

create policy "deals: authenticated update"
  on public.deals for update
  to authenticated
  using (true)
  with check (true);

create policy "deals: authenticated delete"
  on public.deals for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------
-- Optional: daily pg_cron cleanup of unposted deals older than 2 days.
-- ---------------------------------------------------------------
-- Requires the pg_cron extension. Uncomment after enabling it in the
-- Supabase Dashboard → Database → Extensions panel. Posted history is
-- intentionally preserved.
--
-- create extension if not exists pg_cron;
--
-- select cron.schedule(
--   'cleanup-old-unposted-deals',
--   '0 3 * * *',  -- 03:00 daily
--   $$ delete from public.deals
--      where status <> 'posted'
--        and created_at < now() - interval '2 days'; $$
-- );
