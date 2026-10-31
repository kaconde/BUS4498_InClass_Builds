create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null unique,
  nicknames text not null default '',
  usual_place_code text not null default '',
  usual_place_detail text not null default '',
  active boolean not null default true,
  note text not null default ''
);

alter table public.clubs enable row level security;

revoke all on public.clubs from public;
revoke all on public.clubs from anon, authenticated;
grant select (id, name, nicknames, active) on public.clubs to anon, authenticated;
grant all on public.clubs to service_role;

create policy "Active clubs are readable"
  on public.clubs
  for select
  to anon, authenticated
  using (active);

insert into public.clubs (name, nicknames, usual_place_code, usual_place_detail, active, note)
values
  ('Board Game Guild', 'BGG, board game club', 'UU', 'Room 220', true, ''),
  ('Mustang Pitch Society', 'MPS, pitch society', 'UU-PLAZA', '', true, ''),
  ('Women in Finance Circle', 'WIF, Women in Finance', 'BUSINESS', '', true, ''),
  ('Sustainability Crew', 'SC, sustainability club', 'DEXTER-LAWN', '', true, ''),
  ('Accounting Society', 'AS, accounting club', 'BUSINESS', 'Room 212', true, ''),
  ('Cal Poly Ski & Snowboard Club', 'ski club, snow club', 'REC-CENTER', '', true, '')
on conflict (name) do nothing;

alter table public.events
  add column agent_notes text[] not null default '{}';

create policy "Authenticated moderators can delete events"
  on public.events
  for delete
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'moderator');

grant delete on public.events to authenticated;
