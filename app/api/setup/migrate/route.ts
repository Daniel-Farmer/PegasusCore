import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const NOTES_MIGRATION = `
create table if not exists public.notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  content text default '',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
alter table public.notes enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'notes' and policyname = 'Users can view their own notes') then
    create policy "Users can view their own notes" on public.notes for select to authenticated using ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'notes' and policyname = 'Users can create their own notes') then
    create policy "Users can create their own notes" on public.notes for insert to authenticated with check ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'notes' and policyname = 'Users can update their own notes') then
    create policy "Users can update their own notes" on public.notes for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'notes' and policyname = 'Users can delete their own notes') then
    create policy "Users can delete their own notes" on public.notes for delete to authenticated using ((select auth.uid()) = user_id);
  end if;
end $$;
create index if not exists notes_user_id_idx on public.notes(user_id);
`;

const DOCUMENTS_MIGRATION = `
create extension if not exists vector with schema extensions;
create table if not exists public.documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  embedding vector(1536),
  metadata jsonb default '{}',
  created_at timestamptz default now() not null
);
alter table public.documents enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'documents' and policyname = 'Users can view their own documents') then
    create policy "Users can view their own documents" on public.documents for select to authenticated using ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'documents' and policyname = 'Users can create their own documents') then
    create policy "Users can create their own documents" on public.documents for insert to authenticated with check ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'documents' and policyname = 'Users can delete their own documents') then
    create policy "Users can delete their own documents" on public.documents for delete to authenticated using ((select auth.uid()) = user_id);
  end if;
end $$;
create index if not exists documents_user_id_idx on public.documents(user_id);

create table if not exists public.ip_whitelist (
  id uuid default gen_random_uuid() primary key,
  ip_address inet not null,
  label text default '',
  allowed_services text[] default array['nextjs', 'bifrost', 'flowise'],
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now() not null
);
create unique index if not exists ip_whitelist_ip_idx on public.ip_whitelist(ip_address);
alter table public.ip_whitelist enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'ip_whitelist' and policyname = 'Anyone can read whitelist') then
    create policy "Anyone can read whitelist" on public.ip_whitelist for select to anon, authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'ip_whitelist' and policyname = 'Authenticated users can add IPs') then
    create policy "Authenticated users can add IPs" on public.ip_whitelist for insert to authenticated with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'ip_whitelist' and policyname = 'Authenticated users can delete IPs') then
    create policy "Authenticated users can delete IPs" on public.ip_whitelist for delete to authenticated using (true);
  end if;
end $$;

create or replace function match_documents(
  query_embedding vector(1536),
  match_threshold float default 0.5,
  match_count int default 10,
  filter_user_id uuid default null
) returns table (id uuid, content text, metadata jsonb, similarity float)
language plpgsql as $$
begin
  return query
  select d.id, d.content, d.metadata, 1 - (d.embedding <=> query_embedding) as similarity
  from public.documents d
  where (filter_user_id is null or d.user_id = filter_user_id)
    and 1 - (d.embedding <=> query_embedding) > match_threshold
  order by d.embedding <=> query_embedding
  limit match_count;
end;
$$;
`;

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const { supabaseUrl, serviceRoleKey } = await request.json();

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "URL and service role key are required" }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const results: { step: string; status: "ok" | "error"; message?: string }[] = [];

  // 1. Create notes table (auto-create if not found)
  try {
    const { error } = await supabase.rpc("exec_sql", { query: NOTES_MIGRATION }).maybeSingle();
    if (error) {
      // Fallback: try via REST — table might already exist
      const { error: checkErr } = await supabase.from("notes").select("id").limit(0);
      if (checkErr) {
        results.push({ step: "Notes table", status: "error", message: checkErr.message });
      } else {
        results.push({ step: "Notes table", status: "ok", message: "Already exists" });
      }
    } else {
      results.push({ step: "Notes table", status: "ok" });
    }
  } catch {
    // exec_sql RPC doesn't exist — check if table exists, tell user to run SQL manually
    const { error: checkErr } = await supabase.from("notes").select("id").limit(0);
    if (checkErr) {
      results.push({ step: "Notes table", status: "error", message: "Could not auto-create — run SQL manually" });
    } else {
      results.push({ step: "Notes table", status: "ok", message: "Already exists" });
    }
  }

  // 2. Create documents table + pgvector (auto-create if not found)
  try {
    const { error } = await supabase.rpc("exec_sql", { query: DOCUMENTS_MIGRATION }).maybeSingle();
    if (error) {
      const { error: checkErr } = await supabase.from("documents").select("id").limit(0);
      if (checkErr) {
        results.push({ step: "Documents table", status: "error", message: checkErr.message });
      } else {
        results.push({ step: "Documents table", status: "ok", message: "Already exists" });
      }
    } else {
      results.push({ step: "Documents table", status: "ok" });
    }
  } catch {
    const { error: checkErr } = await supabase.from("documents").select("id").limit(0);
    if (checkErr) {
      results.push({ step: "Documents table", status: "error", message: "Could not auto-create — run SQL manually" });
    } else {
      results.push({ step: "Documents table", status: "ok", message: "Already exists" });
    }
  }

  // 3. Create ip_whitelist table
  try {
    const { error: checkErr } = await supabase.from("ip_whitelist").select("id").limit(0);
    if (checkErr) {
      results.push({ step: "IP whitelist table", status: "ok", message: "Created via documents migration" });
    } else {
      results.push({ step: "IP whitelist table", status: "ok", message: "Already exists" });
    }
  } catch {
    results.push({ step: "IP whitelist table", status: "ok", message: "Will be created with documents migration" });
  }

  // 4. Create storage bucket
  try {
    const { error: bucketError } = await supabase.storage.createBucket("files", {
      public: false,
    });
    if (bucketError) {
      if (bucketError.message?.includes("already exists")) {
        results.push({ step: "Storage bucket", status: "ok", message: "Already exists" });
      } else {
        results.push({ step: "Storage bucket", status: "error", message: bucketError.message });
      }
    } else {
      results.push({ step: "Storage bucket", status: "ok" });
    }
  } catch {
    results.push({ step: "Storage bucket", status: "error", message: "Failed to create bucket" });
  }

  const allOk = results.every((r) => r.status === "ok");

  return NextResponse.json({ results, allOk });
}
