-- IP Whitelist table for securing access to all services
create table if not exists public.ip_whitelist (
  id uuid default gen_random_uuid() primary key,
  ip_address inet not null,
  label text default '',
  allowed_services text[] default array['nextjs', 'bifrost', 'flowise'],
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now() not null
);

-- Unique constraint on IP
create unique index if not exists ip_whitelist_ip_idx on public.ip_whitelist(ip_address);

-- Enable RLS
alter table public.ip_whitelist enable row level security;

-- Anon + authenticated can read (middleware needs to check IPs before auth)
create policy "Anyone can read whitelist"
  on public.ip_whitelist for select
  to anon, authenticated
  using (true);

-- Only authenticated users can add IPs
create policy "Authenticated users can add IPs"
  on public.ip_whitelist for insert
  to authenticated
  with check (true);

-- Only authenticated users can remove IPs
create policy "Authenticated users can delete IPs"
  on public.ip_whitelist for delete
  to authenticated
  using (true);
