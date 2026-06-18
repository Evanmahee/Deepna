-- Alignement complet avec supabase/schema.sql (idempotent)

-- notification_settings (par habitude)
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

-- push_subscriptions
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
