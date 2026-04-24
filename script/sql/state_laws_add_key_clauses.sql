-- Run in Supabase: SQL Editor → New query → paste → Run.
-- Fixes: "Could not find the 'key_clauses' column of 'state_laws' in the schema cache"

alter table public.state_laws
  add column if not exists key_clauses jsonb not null default '{}'::jsonb;

-- Refresh PostgREST schema cache (may take a few seconds to apply)
notify pgrst, 'reload schema';
