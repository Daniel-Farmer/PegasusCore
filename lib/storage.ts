import { createClient } from "@/lib/supabase/client";

const BUCKET = "files";

export async function uploadFile(file: File, userId: string) {
  const supabase = createClient();
  const path = `${userId}/${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file);

  if (error) throw error;
  return data;
}

export async function listFiles(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(userId, { sortBy: { column: "created_at", order: "desc" } });

  if (error) throw error;
  return data ?? [];
}

export async function downloadFile(path: string) {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(path);

  if (error) throw error;
  return data;
}

export async function deleteFile(path: string) {
  const supabase = createClient();

  const { error } = await supabase.storage.from(BUCKET).remove([path]);

  if (error) throw error;
}
