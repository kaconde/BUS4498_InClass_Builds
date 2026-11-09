create table if not exists public.agent_permissions (
  key text primary key check (key in ('paused', 'publish_on_its_own', 'posts_per_day', 'days_ahead', 'new_club_wait_days')),
  label text not null,
  kind text not null check (kind in ('switch', 'number')),
  value jsonb not null,
  reason text not null default '',
  changed_by text not null default 'builder',
  updated_at timestamptz not null default now(),
  sort integer not null unique,
  constraint agent_permissions_value_check check (
    (kind = 'switch' and key in ('paused', 'publish_on_its_own') and jsonb_typeof(value) = 'boolean')
    or (kind = 'number' and key in ('posts_per_day', 'days_ahead', 'new_club_wait_days')
      and jsonb_typeof(value) = 'number' and (value #>> '{}')::numeric >= 0)
  )
);

alter table public.agent_permissions enable row level security;

revoke all on public.agent_permissions from public;
revoke all on public.agent_permissions from anon, authenticated;
grant select on public.agent_permissions to authenticated;
grant update (value, reason, changed_by, updated_at) on public.agent_permissions to authenticated;
grant all on public.agent_permissions to service_role;

drop policy if exists "Moderators can read agent permissions" on public.agent_permissions;
create policy "Moderators can read agent permissions"
  on public.agent_permissions
  for select
  to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'moderator');

drop policy if exists "Moderators can change agent permissions" on public.agent_permissions;
create policy "Moderators can change agent permissions"
  on public.agent_permissions
  for update
  to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'moderator')
  with check (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'moderator'
    and char_length(btrim(reason)) > 0
    and changed_by = ((select auth.jwt()) ->> 'email')
  );

create or replace function public.set_agent_permission_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists agent_permissions_updated_at on public.agent_permissions;
create trigger agent_permissions_updated_at
before update on public.agent_permissions
for each row execute function public.set_agent_permission_updated_at();

insert into public.agent_permissions (key, label, kind, value, reason, changed_by, sort)
values
  ('paused', 'Paused', 'switch', 'false'::jsonb, 'The agent starts available to process posts.', 'builder', 1),
  ('publish_on_its_own', 'Publish on its own', 'switch', 'true'::jsonb, 'The agent may publish when every posting rule passes.', 'builder', 2),
  ('posts_per_day', 'Posts per day', 'number', '100'::jsonb, 'The agent refuses new posts after 100 in any rolling 24 hours.', 'builder', 3),
  ('days_ahead', 'Days ahead', 'number', '60'::jsonb, 'Events farther out wait for a moderator.', 'builder', 4),
  ('new_club_wait_days', 'New-club wait', 'number', '30'::jsonb, 'A club added after this permission is enabled waits for a moderator during its first 30 days.', 'builder', 5)
on conflict (key) do nothing;

alter table public.clubs
  add column if not exists established boolean not null default false;

update public.clubs
set established = true
where established = false;

drop policy if exists "Authenticated moderators can delete events" on public.events;
revoke delete, truncate on public.events from public, anon, authenticated, service_role;

create or replace function public.prevent_event_delete()
returns trigger
language plpgsql
as $$
begin
  raise exception using errcode = '42501', message = 'Events cannot be deleted.';
end;
$$;

drop trigger if exists prevent_event_delete on public.events;
create trigger prevent_event_delete
before delete on public.events
for each row execute function public.prevent_event_delete();
