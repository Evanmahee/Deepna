-- Deepna — alignement production (idempotent)
-- Exécuter une fois dans le SQL Editor Supabase.

alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists identity_statement text;
alter table public.profiles add column if not exists onboarding_done boolean not null default false;
alter table public.profiles add column if not exists stripe_customer_id text;
alter table public.profiles add column if not exists stripe_subscription_id text;
alter table public.profiles add column if not exists subscription_status text not null default 'free';

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'habits' and column_name = 'title'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'habits' and column_name = 'name'
  ) then
    alter table public.habits rename column title to name;
  end if;
end $$;

alter table public.habits add column if not exists name text;
alter table public.habits add column if not exists icon_emoji text;
alter table public.habits add column if not exists habit_type text;
alter table public.habits add column if not exists time_block_id uuid;
alter table public.habits add column if not exists missed_days_count integer not null default 0;
alter table public.habits add column if not exists archived boolean not null default false;
alter table public.habits add column if not exists frequency text;
update public.habits set frequency = 'daily' where frequency is null;
alter table public.habits alter column frequency set default 'daily';

alter table public.time_blocks add column if not exists title text;
alter table public.time_blocks add column if not exists notes text;
alter table public.time_blocks add column if not exists starts_at timestamptz;
alter table public.time_blocks add column if not exists ends_at timestamptz;
alter table public.time_blocks add column if not exists block_date date;
alter table public.time_blocks add column if not exists sort_order integer not null default 0;
alter table public.time_blocks add column if not exists icon_emoji text;

alter table public.goals add column if not exists term text default 'short';
update public.goals set term = 'short' where term is null;

alter table public.identity_checkins add column if not exists logged_on date;
alter table public.identity_checkins add column if not exists prompt text;
alter table public.identity_checkins add column if not exists reflection text;
alter table public.identity_checkins add column if not exists checked_at timestamptz;
alter table public.identity_checkins add column if not exists period text;

alter table public.hourly_checkins add column if not exists slot_hour smallint;
alter table public.hourly_checkins add column if not exists note text;
alter table public.hourly_checkins add column if not exists mood smallint;
alter table public.hourly_checkins add column if not exists created_at timestamptz not null default now();

alter table public.push_subscriptions add column if not exists keys jsonb;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'push_subscriptions' and column_name = 'p256dh'
  ) then
    update public.push_subscriptions
    set keys = jsonb_build_object('p256dh', p256dh, 'auth', auth_key)
    where keys is null and p256dh is not null and auth_key is not null;
  end if;
end $$;
