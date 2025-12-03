-- Create group schedules table for managing group travel dates
create table if not exists public.group_schedules (
  id uuid primary key default gen_random_uuid(),
  group_name text not null,
  start_date date not null,
  end_date date not null,
  max_participants integer not null default 12,
  current_participants integer not null default 0,
  price_per_person decimal(10,2),
  description text,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.group_schedules enable row level security;

-- Admin users can manage all group schedules
create policy "group_schedules_select_admin"
  on public.group_schedules for select
  using (auth.uid() in (select id from public.admin_users));

create policy "group_schedules_insert_admin"
  on public.group_schedules for insert
  with check (auth.uid() in (select id from public.admin_users));

create policy "group_schedules_update_admin"
  on public.group_schedules for update
  using (auth.uid() in (select id from public.admin_users));

create policy "group_schedules_delete_admin"
  on public.group_schedules for delete
  using (auth.uid() in (select id from public.admin_users));

-- Allow public read access to active schedules
create policy "group_schedules_select_public"
  on public.group_schedules for select
  using (is_active = true);
