import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { writeFileSync } from "fs";
import { join } from "path";
import { getClientIp } from "@/lib/ip";

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
  ];

  try {
    const envPath = join(process.cwd(), ".env.local");
    writeFileSync(envPath, lines.join("\n"), "utf-8");

    // Auto-whitelist the installer's IP
    let whitelistedIp: string | null = null;
    if (config.supabaseUrl && config.serviceRoleKey) {
      const ip = getClientIp(request);
      if (ip) {
        try {
          const supabase = createClient(config.supabaseUrl, config.serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false },
          });
          await supabase.from("ip_whitelist").upsert(
            {
              ip_address: ip,
              label: "Setup installer",
              allowed_services: ["nextjs", "bifrost", "flowise"],
            },
            { onConflict: "ip_address" }
          );
          whitelistedIp = ip;
        } catch {
          // Non-critical — IP whitelist table might not exist yet
        }
      }
    }

    return NextResponse.json({ ok: true, path: envPath, whitelistedIp });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to write .env.local";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
