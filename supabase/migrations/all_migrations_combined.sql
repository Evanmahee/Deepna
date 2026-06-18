-- =============================================================================
-- Deepna — toutes les migrations combinées (idempotent)
-- Coller et exécuter en une fois dans le SQL Editor Supabase.
-- Ordre chronologique : 000 → add_* → identity_checkins → 20260618*
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1/9 — 000_production_align.sql
-- ─────────────────────────────────────────────────────────────────────────────

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

-- ─────────────────────────────────────────────────────────────────────────────
-- 2/9 — add_display_name.sql
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.profiles add column if not exists display_name text default '';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3/9 — add_goals_term.sql
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.goals add column if not exists term text default 'short';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4/9 — add_identity_statement.sql
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.profiles add column if not exists identity_statement text default '';

-- ─────────────────────────────────────────────────────────────────────────────
-- 5/9 — identity_checkins_logged_on_and_prompt.sql
-- ─────────────────────────────────────────────────────────────────────────────

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'identity_checkins' and column_name = 'logged_on'
  ) then
    null;
  elsif exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'identity_checkins' and column_name = 'date'
  ) then
    alter table public.identity_checkins rename column date to logged_on;
  else
    alter table public.identity_checkins add column if not exists logged_on date;
    update public.identity_checkins
    set logged_on = (timezone('utc', now()))::date
    where logged_on is null;
    alter table public.identity_checkins alter column logged_on set not null;
  end if;
end $$;

alter table public.identity_checkins add column if not exists prompt text;
alter table public.identity_checkins add column if not exists reflection text;
alter table public.identity_checkins add column if not exists checked_at timestamptz;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'identity_checkins' and column_name = 'text_snapshot'
  ) then
    update public.identity_checkins
    set prompt = coalesce(prompt, text_snapshot)
    where prompt is null and text_snapshot is not null;
  end if;
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'identity_checkins' and column_name = 'completed_at'
  ) then
    update public.identity_checkins
    set checked_at = coalesce(checked_at, completed_at)
    where checked_at is null and completed_at is not null;
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6/9 — 202606181001_habits_sort_order.sql
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.habits add column if not exists sort_order integer not null default 0;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7/9 — 202606181002_habits_description.sql
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.habits add column if not exists description text;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8/9 — 202606181003_habits_icon_color.sql
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.habits add column if not exists icon_color text;

-- ─────────────────────────────────────────────────────────────────────────────
-- 9/9 — 202606181004_schema_align.sql
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.notification_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  habit_id uuid references public.habits (id) on delete cascade,
  label text not null,
  message text,
  scheduled_time time,
  days text[] not null default '{}',
  enabled boolean not null default true
);

alter table public.notification_settings enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'notification_settings' and policyname = 'notification_settings_select_own'
  ) then
    create policy "notification_settings_select_own" on public.notification_settings for select using (auth.uid() = user_id);
    create policy "notification_settings_insert_own" on public.notification_settings for insert with check (auth.uid() = user_id);
    create policy "notification_settings_update_own" on public.notification_settings
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
    create policy "notification_settings_delete_own" on public.notification_settings for delete using (auth.uid() = user_id);
  end if;
end $$;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null,
  keys jsonb not null,
  unique (user_id, endpoint)
);

alter table public.push_subscriptions enable row level security;

alter table public.habit_logs add column if not exists completed_at timestamptz;

alter table public.habits add column if not exists description text;
alter table public.habits add column if not exists icon_color text;
alter table public.habits add column if not exists sort_order integer not null default 0;
alter table public.habits add column if not exists frequency text not null default 'daily';

alter table public.time_blocks add column if not exists created_at timestamptz not null default now();
alter table public.time_blocks add column if not exists updated_at timestamptz not null default now();

-- =============================================================================
-- Fin — toutes les migrations appliquées (idempotent, ré-exécutable)
-- =============================================================================
