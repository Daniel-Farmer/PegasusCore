-- Enable pgvector extension
create extension if not exists vector with schema extensions;

create table public.documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  embedding vector(1536),
  metadata jsonb default '{}',
  created_at timestamptz default now() not null
);

alter table public.documents enable row level security;

create policy "Users can view their own documents"
  on public.documents for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own documents"
  on public.documents for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own documents"
  on public.documents for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create index documents_user_id_idx on public.documents(user_id);

-- Similarity search function (called via supabase.rpc())
create or replace function match_documents(
  query_embedding vector(1536),
  match_threshold float default 0.5,
  match_count int default 10,
  filter_user_id uuid default null
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    d.id,
    d.content,
    d.metadata,
    1 - (d.embedding <=> query_embedding) as similarity
  from public.documents d
  where
    (filter_user_id is null or d.user_id = filter_user_id)
    and 1 - (d.embedding <=> query_embedding) > match_threshold
  order by d.embedding <=> query_embedding
  limit match_count;
end;
$$;
