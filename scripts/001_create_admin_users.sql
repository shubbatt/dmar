-- Create admin users table for content management
create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.admin_users enable row level security;

-- Admin users can view all admin records
create policy "admin_users_select_all"
  on public.admin_users for select
  using (auth.uid() in (select id from public.admin_users));

-- Admin users can insert new admin records
create policy "admin_users_insert"
  on public.admin_users for insert
  with check (auth.uid() in (select id from public.admin_users));

-- Admin users can update admin records
create policy "admin_users_update"
  on public.admin_users for update
  using (auth.uid() in (select id from public.admin_users));
