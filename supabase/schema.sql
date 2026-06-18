-- Deepna — schéma Supabase (public)
-- Exécuter dans le SQL Editor du projet Supabase (ou via CLI).

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  display_name text,
  identity_statement text,
  onboarding_done boolean not null default false,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text not null default 'free'
);

create table if not exists public.time_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  notes text,
  day_of_week integer,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  block_date date,
  sort_order integer not null default 0,
  icon_emoji text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  time_block_id uuid references public.time_blocks (id) on delete set null,
  name text not null,
  icon_emoji text,
  habit_type text not null check (habit_type in ('good', 'bad', 'neutral')),
  description text,
  icon_color text,
  frequency text not null default 'daily',
  missed_days_count integer not null default 0,
  archived boolean not null default false,
  sort_order integer not null default 0
);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  logged_on date not null,
  completed boolean not null default false,
  completed_at timestamptz,
  unique (habit_id, logged_on)
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  target_date date,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  term text not null default 'short' check (term in ('short', 'mid', 'long'))
);

create table if not exists public.identity_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  logged_on date not null,
  period text not null check (period in ('morning', 'afternoon', 'evening')),
  prompt text,
  reflection text,
  checked_at timestamptz,
  unique (user_id, logged_on, period)
);

create table if not exists public.hourly_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  slot_hour smallint not null check (slot_hour >= 0 and slot_hour <= 23),
  note text,
  mood smallint not null check (mood in (1, 2, 3)),
  created_at timestamptz not null default now()
);

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

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null,
  keys jsonb not null,
  unique (user_id, endpoint)
);

-- ---------------------------------------------------------------------------
-- Trigger : profil à la création utilisateur
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
  as $$
begin
  insert into public.profiles (id, name, onboarding_done)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email), false);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;

alter table public.time_blocks enable row level security;

alter table public.habits enable row level security;

alter table public.habit_logs enable row level security;

alter table public.goals enable row level security;

alter table public.identity_checkins enable row level security;

alter table public.hourly_checkins enable row level security;

alter table public.notification_settings enable row level security;

alter table public.push_subscriptions enable row level security;

-- profiles : pas de colonne user_id — la ligne utilisateur est identifiée par id
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

create policy "time_blocks_select_own" on public.time_blocks for select using (auth.uid() = user_id);

create policy "time_blocks_insert_own" on public.time_blocks for insert with check (auth.uid() = user_id);

create policy "time_blocks_update_own" on public.time_blocks
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "time_blocks_delete_own" on public.time_blocks for delete using (auth.uid() = user_id);

create policy "habits_select_own" on public.habits for select using (auth.uid() = user_id);

create policy "habits_insert_own" on public.habits for insert with check (auth.uid() = user_id);

create policy "habits_update_own" on public.habits
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "habits_delete_own" on public.habits for delete using (auth.uid() = user_id);

create policy "habit_logs_select_own" on public.habit_logs for select using (auth.uid() = user_id);

create policy "habit_logs_insert_own" on public.habit_logs for insert with check (auth.uid() = user_id);

create policy "habit_logs_update_own" on public.habit_logs
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "habit_logs_delete_own" on public.habit_logs for delete using (auth.uid() = user_id);

create policy "goals_select_own" on public.goals for select using (auth.uid() = user_id);

create policy "goals_insert_own" on public.goals for insert with check (auth.uid() = user_id);

create policy "goals_update_own" on public.goals
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "goals_delete_own" on public.goals for delete using (auth.uid() = user_id);

create policy "identity_checkins_select_own" on public.identity_checkins for select using (auth.uid() = user_id);

create policy "identity_checkins_insert_own" on public.identity_checkins for insert with check (auth.uid() = user_id);

create policy "identity_checkins_update_own" on public.identity_checkins
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "identity_checkins_delete_own" on public.identity_checkins for delete using (auth.uid() = user_id);

create policy "hourly_checkins_select_own" on public.hourly_checkins for select using (auth.uid() = user_id);

create policy "hourly_checkins_insert_own" on public.hourly_checkins for insert with check (auth.uid() = user_id);

create policy "hourly_checkins_update_own" on public.hourly_checkins
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "hourly_checkins_delete_own" on public.hourly_checkins for delete using (auth.uid() = user_id);

create policy "notification_settings_select_own" on public.notification_settings for select using (auth.uid() = user_id);

create policy "notification_settings_insert_own" on public.notification_settings for insert with check (auth.uid() = user_id);

create policy "notification_settings_update_own" on public.notification_settings
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "notification_settings_delete_own" on public.notification_settings for delete using (auth.uid() = user_id);

create policy "push_subscriptions_select_own" on public.push_subscriptions for select using (auth.uid() = user_id);

create policy "push_subscriptions_insert_own" on public.push_subscriptions for insert with check (auth.uid() = user_id);

create policy "push_subscriptions_update_own" on public.push_subscriptions
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "push_subscriptions_delete_own" on public.push_subscriptions for delete using (auth.uid() = user_id);
