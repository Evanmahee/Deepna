-- identity_checkins : jour en `logged_on` (aligné habit_logs) + colonnes mantra / check-in
-- Exécuter une fois dans le SQL Editor Supabase si l’erreur « column date does not exist » apparaît.

-- 1) Colonne jour : `logged_on`, ou renommage depuis `date`
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
    alter table public.identity_checkins add column logged_on date;
    update public.identity_checkins
    set logged_on = (timezone('utc', now()))::date
    where logged_on is null;
    alter table public.identity_checkins alter column logged_on set not null;
  end if;
end $$;

-- 2) Mantra / validation (nouveau schéma)
alter table public.identity_checkins add column if not exists prompt text;
alter table public.identity_checkins add column if not exists reflection text;
alter table public.identity_checkins add column if not exists checked_at timestamptz;

-- Données legacy (si colonnes présentes)
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
