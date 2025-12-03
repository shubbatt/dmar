-- Create bookings table to store all booking information
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  service_type text not null,
  service_name text not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  customer_whatsapp text,
  booking_date date not null,
  booking_time text,
  number_of_people integer not null default 1,
  special_requests text,
  total_price decimal(10,2),
  status text not null default 'pending',
  language text not null default 'en',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.bookings enable row level security;

-- Admin users can view all bookings
create policy "bookings_select_admin"
  on public.bookings for select
  using (auth.uid() in (select id from public.admin_users));

-- Admin users can update bookings
create policy "bookings_update_admin"
  on public.bookings for update
  using (auth.uid() in (select id from public.admin_users));

-- Admin users can delete bookings
create policy "bookings_delete_admin"
  on public.bookings for delete
  using (auth.uid() in (select id from public.admin_users));

-- Allow public insert for new bookings (from website)
create policy "bookings_insert_public"
  on public.bookings for insert
  with check (true);
