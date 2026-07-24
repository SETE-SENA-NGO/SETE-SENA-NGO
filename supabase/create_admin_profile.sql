-- Create the Auth user first in Supabase Dashboard:
-- Authentication > Users > Add user
-- Email: your real admin email
-- Password: a strong unique password
--
-- Replace replace-with-your-admin-email@example.org below with that admin email.
--
-- Then run this SQL to grant admin access.
-- If you have not run the project migrations yet, this also creates the
-- minimal public.profiles table needed by the login guard.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'viewer'
);

alter table public.profiles
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists avatar_url text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  alter table public.profiles
    add constraint profiles_role_check
    check (role in ('super_admin', 'admin', 'editor', 'viewer'));
exception
  when duplicate_object then null;
end $$;

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can read own profile or admins can read all" on public.profiles;

create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

insert into public.profiles (id, email, role, full_name)
select
  id,
  email,
  'super_admin',
  'Admin'
from auth.users
where lower(email) = lower('replace-with-your-admin-email@example.org')
on conflict (id) do update
set
  email = excluded.email,
  role = 'super_admin',
  full_name = excluded.full_name,
  updated_at = now();

do $$
begin
  if not exists (
    select 1
    from auth.users
    where lower(email) = lower('replace-with-your-admin-email@example.org')
  ) then
    raise exception 'Create the Supabase Auth admin user first, then replace the placeholder email in this SQL file.';
  end if;
end $$;

select id, email, role, full_name
from public.profiles
where lower(email) = lower('replace-with-your-admin-email@example.org');
