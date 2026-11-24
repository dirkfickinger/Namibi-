-- Hulpfuncties uit het API-schema halen (zelfde als supabase/schema.sql).
-- Basisschema: supabase/schema.sql (eerder via de SQL Editor uitgevoerd).

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.member_role(p_trip uuid) returns text
language sql stable security definer set search_path = '' as $$
  select m.role from public.trip_members m where m.trip_id = p_trip and m.user_id = auth.uid()
$$;

create or replace function private.is_member(p_trip uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.trip_members m where m.trip_id = p_trip and m.user_id = auth.uid())
$$;

-- Veilig een mapnaam (uit een opslagpad) omzetten naar een reis-id; ongeldige invoer => null.
create or replace function private.folder_trip(p_name text) returns uuid
language sql immutable set search_path = '' as $$
  select case when p_name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[A-Za-z0-9_-]{1,64}$'
              then split_part(p_name, '/', 1)::uuid end
$$;

create or replace function private.shares_trip_with(p_user uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.trip_members a join public.trip_members b on a.trip_id = b.trip_id
    where a.user_id = auth.uid() and b.user_id = p_user)
$$;

revoke all on function private.member_role(uuid), private.is_member(uuid), private.shares_trip_with(uuid),
  private.folder_trip(text) from anon, public;
grant execute on function private.member_role(uuid), private.is_member(uuid), private.shares_trip_with(uuid),
  private.folder_trip(text) to authenticated;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or private.shares_trip_with(id));

drop policy if exists trips_select on public.trips;
create policy trips_select on public.trips for select to authenticated using (owner = auth.uid() or private.is_member(id));

drop policy if exists members_select on public.trip_members;
create policy members_select on public.trip_members for select to authenticated using (private.is_member(trip_id));
drop policy if exists members_update on public.trip_members;
create policy members_update on public.trip_members for update to authenticated
  using (private.member_role(trip_id) = 'owner' and user_id <> auth.uid())
  with check (private.member_role(trip_id) = 'owner' and role in ('editor', 'viewer'));
drop policy if exists members_delete on public.trip_members;
create policy members_delete on public.trip_members for delete to authenticated
  using ((user_id = auth.uid() and role <> 'owner') or (private.member_role(trip_id) = 'owner' and user_id <> auth.uid()));

drop policy if exists invites_select on public.invites;
create policy invites_select on public.invites for select to authenticated using (private.member_role(trip_id) = 'owner');
drop policy if exists invites_insert on public.invites;
create policy invites_insert on public.invites for insert to authenticated
  with check (private.member_role(trip_id) = 'owner' and created_by = auth.uid() and uses = 0
              and expires_at <= now() + interval '30 days');
drop policy if exists invites_delete on public.invites;
create policy invites_delete on public.invites for delete to authenticated using (private.member_role(trip_id) = 'owner');

drop policy if exists records_select on public.records;
create policy records_select on public.records for select to authenticated using (private.is_member(trip_id));
drop policy if exists records_insert on public.records;
create policy records_insert on public.records for insert to authenticated
  with check (private.member_role(trip_id) in ('owner', 'editor') and author = auth.uid() and updated_by = auth.uid());
drop policy if exists records_update on public.records;
create policy records_update on public.records for update to authenticated
  using (private.member_role(trip_id) = 'owner'
         or (private.member_role(trip_id) = 'editor' and (kind in ('trip', 'plan') or author = auth.uid())))
  with check (private.member_role(trip_id) in ('owner', 'editor') and updated_by = auth.uid());

drop policy if exists trip_photos_select on storage.objects;
create policy trip_photos_select on storage.objects for select to authenticated
  using (bucket_id = 'trip-photos' and private.is_member(private.folder_trip(name)));
drop policy if exists trip_photos_insert on storage.objects;
create policy trip_photos_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'trip-photos' and private.member_role(private.folder_trip(name)) in ('owner', 'editor'));
drop policy if exists trip_photos_delete on storage.objects;
create policy trip_photos_delete on storage.objects for delete to authenticated
  using (bucket_id = 'trip-photos' and private.is_member(private.folder_trip(name))
         and (owner_id = auth.uid()::text or private.member_role(private.folder_trip(name)) = 'owner'));

drop function if exists public.member_role(uuid);
drop function if exists public.is_member(uuid);
drop function if exists public.shares_trip_with(uuid);
drop function if exists public.folder_trip(text);
