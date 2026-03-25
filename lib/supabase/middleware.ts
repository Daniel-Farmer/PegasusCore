import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
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

  // Do not use getSession() — getClaims() validates the JWT signature
  // against published public keys every time.
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
