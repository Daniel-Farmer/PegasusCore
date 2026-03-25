import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const FLOWISE_URL = "http://127.0.0.1:3001";

async function proxyRequest(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { path } = await params;
  const targetPath = path.join("/");
  const url = new URL(targetPath, FLOWISE_URL);
  url.search = request.nextUrl.search;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!["host", "connection", "transfer-encoding"].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const res = await fetch(url.toString(), {
    method: request.method,
    headers,
    body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
    // @ts-expect-error duplex is needed for streaming request bodies
    duplex: "half",
  });

  return new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: Object.fromEntries(res.headers.entries()),
  });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;
