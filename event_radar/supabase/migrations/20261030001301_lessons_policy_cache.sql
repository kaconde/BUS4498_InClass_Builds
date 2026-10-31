alter policy "Authenticated moderators can read lessons"
  on public.lessons
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'moderator');

alter policy "Authenticated moderators can add lessons"
  on public.lessons
  with check (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'moderator'
    and ((select auth.jwt()) ->> 'email') = created_by
  );

alter policy "Authenticated moderators can switch lessons"
  on public.lessons
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'moderator')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'moderator');
