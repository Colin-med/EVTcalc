-- ============================================================
--  EVT Activate — realtime sync table (Supabase / Postgres)
--  Run this in Supabase → SQL Editor once, then paste your
--  project URL + anon key into index.html (SUPABASE_URL / KEY).
-- ============================================================

create table if not exists public.activations (
  code        text primary key,
  state       jsonb not null,
  rev         int   not null default 0,
  updated_at  timestamptz not null default now()
);

alter table public.activations enable row level security;

-- DEMO policy: anyone holding the public anon key can read/write.
-- This is fine for a controlled prototype among your team, but for
-- production you should require authentication (Supabase Auth) and
-- scope access to the activation code. See SETUP.md → "Locking it down".
drop policy if exists "activations anon rw" on public.activations;
create policy "activations anon rw"
  on public.activations for all
  using (true) with check (true);

-- Enable realtime change streaming on the table.
alter publication supabase_realtime add table public.activations;
