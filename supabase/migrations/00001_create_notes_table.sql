create table public.notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  content text default '',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.notes enable row level security;

create policy "Users can view their own notes"
  on public.notes for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own notes"
  on public.notes for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own notes"
  on public.notes for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own notes"
  on public.notes for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create index notes_user_id_idx on public.notes(user_id);
