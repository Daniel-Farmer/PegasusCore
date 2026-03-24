import { createClient } from "@/lib/supabase/server";
import { createBifrostClient } from "@/lib/bifrost";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content, metadata } = await request.json();

  if (!content || typeof content !== "string") {
    return NextResponse.json(
      { error: "content is required" },
      { status: 400 }
    );
  }

  // Generate embedding via Bifrost (OpenAI-compatible)
  const bifrost = createBifrostClient();
  const embeddingResponse = await bifrost.embeddings.create({
    model: "text-embedding-3-small",
    input: content,
  });

  const embedding = embeddingResponse.data[0].embedding;

  // Store in Supabase with pgvector
  const { data, error } = await supabase.from("documents").insert({
    user_id: user.id,
    content,
    embedding: embedding as unknown as string,
    metadata: metadata ?? {},
  }).select("id, content, created_at").single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
