-- =====================================================================
-- Namibië Reisapp – gedeelde reizen (Supabase / PostgreSQL)
--
-- Plak dit volledige script in Supabase → SQL Editor → Run.
-- Het script mag meerdere keren worden uitgevoerd.
--
-- Beveiligingsmodel
-- * Alle reisinhoud (reisplan, verhalen, waarnemingen, foto's) wordt IN DE APP
--   versleuteld met een reissleutel (AES-256-GCM). Die sleutel zit alleen in de
--   uitnodigingslink en komt nooit op deze server. De database bewaart dus alleen
--   onleesbare blokken ("ciphertext").
-- * Row Level Security bepaalt wie welke (versleutelde) gegevens mag lezen/schrijven:
--     owner  – eigenaar: alles, incl. leden beheren en uitnodigen
--     editor – mag toevoegen; mag eigen verhalen/waarnemingen/foto's wijzigen,
--              en het gezamenlijke reisplan
--     viewer – mag alleen lezen
-- * Uitnodigingen: de app maakt een willekeurig token (128 bit). Alleen de SHA-256-hash
--   wordt hier opgeslagen; uitnodigingen verlopen en zijn beperkt in gebruik.
-- * De rol "anon" (niet ingelogd) heeft nergens toegang toe.
-- =====================================================================

-- ---------- Tabellen ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  created_at timestamptz not null default now()
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.trip_members (
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  joined_at timestamptz not null default now(),
  primary key (trip_id, user_id)
);
create index if not exists trip_members_user_idx on public.trip_members (user_id);

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  role text not null check (role in ('editor', 'viewer')),
  created_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  max_uses int not null default 1 check (max_uses between 1 and 10),
  uses int not null default 0
);

create sequence if not exists public.records_seq;
create table if not exists public.records (
  trip_id uuid not null references public.trips(id) on delete cascade,
  id text not null check (id ~ '^[A-Za-z0-9_-]{1,64}$'),
  kind text not null check (kind in ('trip', 'plan', 'entry', 'sighting', 'photo')),
  ciphertext text not null check (char_length(ciphertext) <= 1000000),
  deleted boolean not null default false,
  author uuid not null default auth.uid() references auth.users(id) on delete cascade,
  updated_by uuid not null default auth.uid(),
  updated_at timestamptz not null default now(),
  seq bigint not null default 0, -- wordt door de trigger gezet (records_before_write)
  primary key (trip_id, id)
);
create index if not exists records_sync_idx on public.records (trip_id, seq);
alter table public.records alter column seq set default 0;

-- Hulpfuncties staan in een eigen schema dat niet via de API bereikbaar is.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

-- ---------- Hulpfuncties (security definer: omzeilen RLS veilig, alleen voor de ingelogde gebruiker) ----------
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

-- ---------- Triggers ----------
-- Eigenaar wordt automatisch lid; maximaal 20 reizen per gebruiker (misbruikrem).
create or replace function public.trips_before_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Niet ingelogd'; end if;
  new.owner := auth.uid();
  new.created_at := now();
  if (select count(*) from public.trips t where t.owner = auth.uid()) >= 20 then
    raise exception 'Maximaal aantal gedeelde reizen bereikt';
  end if;
  return new;
end $$;

create or replace function public.trips_after_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.trip_members (trip_id, user_id, role) values (new.id, new.owner, 'owner');
  return new;
end $$;

drop trigger if exists trips_before_insert on public.trips;
create trigger trips_before_insert before insert on public.trips for each row execute function public.trips_before_insert();
drop trigger if exists trips_after_insert on public.trips;
create trigger trips_after_insert after insert on public.trips for each row execute function public.trips_after_insert();

-- Server bepaalt auteur, tijdstip en volgnummer; auteur/soort/sleutel kunnen niet worden gewijzigd.
create or replace function public.records_before_write() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    new.author := auth.uid();
  else
    new.author := old.author;
    new.kind := old.kind;
    new.trip_id := old.trip_id;
    new.id := old.id;
  end if;
  new.updated_by := auth.uid();
  new.updated_at := now();
  new.seq := nextval('public.records_seq');
  return new;
end $$;

drop trigger if exists records_before_write on public.records;
create trigger records_before_write before insert or update on public.records for each row execute function public.records_before_write();

-- Rolwijziging: de eigenaar kan zijn eigen rol niet wijzigen en niemand kan eigenaar worden gemaakt.
create or replace function public.members_before_update() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if old.role = 'owner' or new.role = 'owner' then raise exception 'Eigenaarschap kan niet worden gewijzigd'; end if;
  new.trip_id := old.trip_id; new.user_id := old.user_id; new.joined_at := old.joined_at;
  return new;
end $$;
drop trigger if exists members_before_update on public.trip_members;
create trigger members_before_update before update on public.trip_members for each row execute function public.members_before_update();

-- ---------- Uitnodiging accepteren ----------
create or replace function public.accept_invite(p_token text)
returns table (trip_id uuid, role text)
language plpgsql security definer set search_path = '' as $$
declare
  v public.invites%rowtype;
  n int;
  existing text;
begin
  if auth.uid() is null then raise exception 'Niet ingelogd'; end if;
  if p_token is null or p_token !~ '^[A-Za-z0-9_-]{20,64}$' then raise exception 'Uitnodiging ongeldig of verlopen'; end if;
  select * into v from public.invites i
    where i.token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex') for update;
  if not found or v.expires_at < now() then raise exception 'Uitnodiging ongeldig of verlopen'; end if;
  select m.role into existing from public.trip_members m where m.trip_id = v.trip_id and m.user_id = auth.uid();
  if existing is not null then
    return query select v.trip_id, existing; return;
  end if;
  if v.uses >= v.max_uses then raise exception 'Uitnodiging ongeldig of verlopen'; end if;
  select count(*) into n from public.trip_members m where m.trip_id = v.trip_id;
  if n >= 10 then raise exception 'Deze reis heeft al het maximale aantal deelnemers'; end if;
  insert into public.trip_members (trip_id, user_id, role) values (v.trip_id, auth.uid(), v.role);
  update public.invites set uses = uses + 1 where id = v.id;
  return query select v.trip_id, v.role;
end $$;

-- ---------- Row Level Security ----------
alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_members enable row level security;
alter table public.invites enable row level security;
alter table public.records enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or private.shares_trip_with(id));
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert to authenticated with check (id = auth.uid());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists trips_select on public.trips;
create policy trips_select on public.trips for select to authenticated using (owner = auth.uid() or private.is_member(id));
drop policy if exists trips_insert on public.trips;
create policy trips_insert on public.trips for insert to authenticated with check (owner = auth.uid());
drop policy if exists trips_delete on public.trips;
create policy trips_delete on public.trips for delete to authenticated using (owner = auth.uid());

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

-- ---------- Rechten (minimaal) ----------
revoke all on public.profiles, public.trips, public.trip_members, public.invites, public.records from anon, public;
revoke all on public.profiles, public.trips, public.trip_members, public.invites, public.records from authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, delete on public.trips to authenticated;
grant select, update, delete on public.trip_members to authenticated;
grant select, insert, delete on public.invites to authenticated;
grant select, insert, update on public.records to authenticated;
revoke all on sequence public.records_seq from anon, authenticated, public;

revoke all on function private.member_role(uuid), private.is_member(uuid), private.shares_trip_with(uuid),
  private.folder_trip(text), public.accept_invite(text) from anon, public;
grant execute on function private.member_role(uuid), private.is_member(uuid), private.shares_trip_with(uuid),
  private.folder_trip(text), public.accept_invite(text) to authenticated;
revoke all on function public.trips_before_insert(), public.trips_after_insert(), public.records_before_write(),
  public.members_before_update() from anon, authenticated, public;

-- ---------- Foto-opslag (versleutelde bestanden) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('trip-photos', 'trip-photos', false, 5242880, array['application/octet-stream'])
on conflict (id) do update set public = false, file_size_limit = 5242880, allowed_mime_types = array['application/octet-stream'];

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
-- Bewust geen UPDATE-beleid: een opgeslagen foto kan niet worden overschreven.

-- Oudere versies hadden deze hulpfuncties in het API-schema; opruimen (alle beleid verwijst nu naar private.*).
drop function if exists public.member_role(uuid);
drop function if exists public.is_member(uuid);
drop function if exists public.shares_trip_with(uuid);
drop function if exists public.folder_trip(text);
