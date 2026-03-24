import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const { supabaseUrl, supabaseKey, type } = await request.json();

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "URL and key are required" }, { status: 400 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (type === "bifrost") {
      // Validate Bifrost by pinging models endpoint
      const res = await fetch(`${supabaseUrl}/models`, { signal: AbortSignal.timeout(5000) }).catch(() => null);
      if (res && res.ok) {
        return NextResponse.json({ ok: true });
      }
      // Also try root
      const res2 = await fetch(supabaseUrl, { signal: AbortSignal.timeout(5000) }).catch(() => null);
      return NextResponse.json({ ok: !!res2?.ok });
    }

    if (type === "flowise") {
      const res = await fetch(`${supabaseUrl}/api/v1/ping`, { signal: AbortSignal.timeout(5000) }).catch(() => null);
      return NextResponse.json({ ok: !!res?.ok });
    }

    // Default: validate Supabase connection
    const { error } = await supabase.auth.getSession();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Connection failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
