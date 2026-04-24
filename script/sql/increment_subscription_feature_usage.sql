-- Atomic monthly usage increment (run in Supabase SQL Editor after subscription_gumroad.sql).
-- Fixes race when two concurrent requests both read the same counter before upsert.

create or replace function public.increment_subscription_feature_usage(
  p_period text,
  p_kind text
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  if p_kind not in ('generate', 'audit') then
    raise exception 'Invalid kind';
  end if;

  insert into public.subscription_feature_usage (user_id, period, generate_count, audit_count)
  values (
    uid,
    p_period,
    case when p_kind = 'generate' then 1 else 0 end,
    case when p_kind = 'audit' then 1 else 0 end
  )
  on conflict (user_id, period) do update set
    generate_count = subscription_feature_usage.generate_count
      + case when p_kind = 'generate' then 1 else 0 end,
    audit_count = subscription_feature_usage.audit_count
      + case when p_kind = 'audit' then 1 else 0 end;
end;
$$;

grant execute on function public.increment_subscription_feature_usage(text, text) to authenticated;

notify pgrst, 'reload schema';
