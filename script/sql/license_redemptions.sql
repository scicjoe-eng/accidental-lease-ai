-- One-time unlock redemptions for Gumroad license keys.
-- Stores only hashes (never store raw license keys or session tokens).

create table if not exists public.license_redemptions (
  id uuid primary key default gen_random_uuid(),
  key_hash text not null unique,
  gumroad_product_id text not null,
  gumroad_purchase_id text null,

  -- 10-minute unlock session token (hash) and expiry
  session_token_hash text null,
  session_expires_at timestamptz null,

  -- When set, the key has been consumed and can never be used again.
  consumed_at timestamptz null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists license_redemptions_session_idx
  on public.license_redemptions (session_token_hash, session_expires_at);

create index if not exists license_redemptions_consumed_idx
  on public.license_redemptions (consumed_at);

-- Keep updated_at fresh.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists license_redemptions_set_updated_at on public.license_redemptions;
create trigger license_redemptions_set_updated_at
before update on public.license_redemptions
for each row execute function public.set_updated_at();

