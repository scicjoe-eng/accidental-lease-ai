-- Legacy: logged-in monthly quotas + Gumroad license on user_subscriptions.
-- The current app uses `license_redemptions` + httpOnly unlock cookie instead; keep this only if you still rely on these tables.

-- 1) Subscription row per user (extend if your table already exists)
create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  status text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_subscriptions
  add column if not exists gumroad_license_key text,
  add column if not exists gumroad_product_id text,
  add column if not exists is_pro boolean not null default false;

-- 2) Monthly usage counters (UTC month string YYYY-MM)
create table if not exists public.subscription_feature_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  period text not null,
  audit_count int not null default 0 check (audit_count >= 0),
  generate_count int not null default 0 check (generate_count >= 0),
  primary key (user_id, period)
);

create index if not exists subscription_feature_usage_period_idx
  on public.subscription_feature_usage (period);

-- 3) RLS
alter table public.user_subscriptions enable row level security;
alter table public.subscription_feature_usage enable row level security;

drop policy if exists "user_subscriptions_select_own" on public.user_subscriptions;
create policy "user_subscriptions_select_own"
  on public.user_subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "user_subscriptions_insert_own" on public.user_subscriptions;
create policy "user_subscriptions_insert_own"
  on public.user_subscriptions for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_subscriptions_update_own" on public.user_subscriptions;
create policy "user_subscriptions_update_own"
  on public.user_subscriptions for update
  using (auth.uid() = user_id);

drop policy if exists "subscription_usage_select_own" on public.subscription_feature_usage;
create policy "subscription_usage_select_own"
  on public.subscription_feature_usage for select
  using (auth.uid() = user_id);

drop policy if exists "subscription_usage_insert_own" on public.subscription_feature_usage;
create policy "subscription_usage_insert_own"
  on public.subscription_feature_usage for insert
  with check (auth.uid() = user_id);

drop policy if exists "subscription_usage_update_own" on public.subscription_feature_usage;
create policy "subscription_usage_update_own"
  on public.subscription_feature_usage for update
  using (auth.uid() = user_id);

notify pgrst, 'reload schema';
