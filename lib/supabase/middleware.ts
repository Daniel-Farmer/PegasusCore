import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getClientIp } from "@/lib/ip";

// ── IP whitelist cache ──
let ipCache: { ips: string[]; fetchedAt: number } | null = null;
const IP_CACHE_TTL = 60_000; // 60 seconds

/** Invalidate the IP cache (called from server actions when whitelist changes) */
export function invalidateIpCache() {
  ipCache = null;
}

async function getWhitelistedIps(supabaseUrl: string, supabaseKey: string): Promise<string[]> {
  const now = Date.now();
  if (ipCache && now - ipCache.fetchedAt < IP_CACHE_TTL) {
    return ipCache.ips;
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/ip_whitelist?select=ip_address`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 0 },
      }
    );

    if (!res.ok) return ipCache?.ips ?? [];

    const data: { ip_address: string }[] = await res.json();
    const ips = data.map((r) => r.ip_address);
    ipCache = { ips, fetchedAt: now };
    return ips;
  } catch {
    // On error, return cached or empty (fail open to avoid lockout)
    return ipCache?.ips ?? [];
  }
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // If Supabase is not configured (missing or placeholder), force setup wizard
  const isConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project") &&
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.includes("xxxxx");

  if (!isConfigured) {
    const pathname = request.nextUrl.pathname;
    // Allow the root page (setup wizard) and setup API routes
    if (pathname === "/" || pathname.startsWith("/api/setup")) {
      return supabaseResponse;
    }
    // Redirect everything else to the setup wizard
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // ── IP whitelist check ──
  const ipWhitelistDisabled = process.env.IP_WHITELIST_DISABLED === "true";
  const isDev = process.env.NODE_ENV === "development";

  if (!ipWhitelistDisabled && !isDev) {
    const clientIp = getClientIp(request);

    // Always allow localhost
    const isLocalhost = !clientIp || clientIp === "127.0.0.1" || clientIp === "::1";

    if (!isLocalhost) {
      const whitelisted = await getWhitelistedIps(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
      );

      // If whitelist is empty, allow all (first-time setup with no entries)
      if (whitelisted.length > 0 && !whitelisted.includes(clientIp!)) {
        return new NextResponse("Access denied — your IP is not whitelisted.", {
          status: 403,
          headers: { "Content-Type": "text/plain" },
        });
      }
    }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users trying to access protected routes
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup") ||
    request.nextUrl.pathname.startsWith("/auth");

  if (!user && !isAuthRoute && request.nextUrl.pathname !== "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
