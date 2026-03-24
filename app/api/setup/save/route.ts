import { NextResponse } from "next/server";
import { writeFileSync } from "fs";
import { join } from "path";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const config = await request.json();

  const lines = [
    "# Supabase",
    `NEXT_PUBLIC_SUPABASE_URL=${config.supabaseUrl || ""}`,
    `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${config.supabaseKey || ""}`,
    "",
    "# Bifrost AI Gateway",
    `BIFROST_BASE_URL=${config.bifrostUrl || "http://localhost:8080/openai"}`,
    `BIFROST_API_KEY=${config.bifrostKey || "bifrost-internal"}`,
    "",
    "# Flowise",
    `FLOWISE_BASE_URL=${config.flowiseUrl || "http://localhost:3001"}`,
    `FLOWISE_CHATFLOW_ID=${config.flowiseChatflowId || ""}`,
    `FLOWISE_API_KEY=${config.flowiseKey || ""}`,
    "",
    "# Vercel (auto-set on deploy)",
    "# VERCEL_URL",
    "",
  ];

  try {
    const envPath = join(process.cwd(), ".env.local");
    writeFileSync(envPath, lines.join("\n"), "utf-8");
    return NextResponse.json({ ok: true, path: envPath });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to write .env.local";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
