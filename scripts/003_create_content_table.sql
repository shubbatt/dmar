-- Create content table for managing website content
create table if not exists public.content (
  id uuid primary key default gen_random_uuid(),
  section text not null, -- 'hero', 'services', 'about', etc.
  key text not null, -- 'title', 'description', etc.
  content_en text,
  content_es text,
  content_de text,
  content_type text not null default 'text', -- 'text', 'image', 'html'
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(section, key)
);

alter table public.content enable row level security;

-- Admin users can manage all content
create policy "content_select_admin"
  on public.content for select
  using (auth.uid() in (select id from public.admin_users));

create policy "content_insert_admin"
  on public.content for insert
  with check (auth.uid() in (select id from public.admin_users));

create policy "content_update_admin"
  on public.content for update
  using (auth.uid() in (select id from public.admin_users));

create policy "content_delete_admin"
  on public.content for delete
  using (auth.uid() in (select id from public.admin_users));

-- Allow public read access to active content
create policy "content_select_public"
  on public.content for select
  using (is_active = true);
