-- LeadForge — Supabase schema
-- Run this once in the Supabase dashboard: SQL Editor → New query → Run.

create extension if not exists "pgcrypto";

create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,

  osm_id        text,              -- e.g. "node/123456789" — used for de-duplication
  name          text not null,
  niche         text,
  city          text,
  phone         text,
  email         text,
  website       text,
  address       text,
  instagram     text,
  facebook      text,
  whatsapp      text,
  opening_hours text,
  lat           double precision,
  lon           double precision,

  status        text not null default 'New'
                check (status in ('New','Contacted','Follow Up','Closed','Not Interested')),
  notes         text,
  outreach      text,              -- last AI-generated message saved for this lead

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Saving the same OSM business twice updates the row instead of duplicating it
-- (this is the target of the client's .upsert(onConflict: 'user_id,osm_id')).
create unique index if not exists leads_user_osm_idx
  on public.leads (user_id, osm_id)
  where osm_id is not null;

create index if not exists leads_user_created_idx on public.leads (user_id, created_at desc);
create index if not exists leads_user_status_idx  on public.leads (user_id, status);

-- Keep updated_at honest.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_touch_updated_at on public.leads;
create trigger leads_touch_updated_at
  before update on public.leads
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security: every user sees only their own leads.
-- This is what makes shipping the anon key to the browser safe.
-- ---------------------------------------------------------------------------
alter table public.leads enable row level security;

drop policy if exists "leads_select_own" on public.leads;
create policy "leads_select_own" on public.leads
  for select using (auth.uid() = user_id);

drop policy if exists "leads_insert_own" on public.leads;
create policy "leads_insert_own" on public.leads
  for insert with check (auth.uid() = user_id);

drop policy if exists "leads_update_own" on public.leads;
create policy "leads_update_own" on public.leads
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "leads_delete_own" on public.leads;
create policy "leads_delete_own" on public.leads
  for delete using (auth.uid() = user_id);
