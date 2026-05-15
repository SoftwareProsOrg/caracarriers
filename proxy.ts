import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

const PUBLIC_PREFIXES = [
  "/api/health",
  "/api/webhooks",
  "/_next",
  "/icon",
  "/apple-icon",
];

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

  if (!isPublic) {
    try {
      const supabase = createMiddlewareClient({ req, res });
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = "/login";
        if (pathname !== "/") {
          loginUrl.searchParams.set("redirect", pathname);
        }
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      // Supabase not yet configured — allow through in development
    }
  }

  // Redirect already-authenticated users away from auth pages
  if (pathname === "/login" || pathname === "/signup") {
    try {
      const supabase = createMiddlewareClient({ req, res });
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const dashboardUrl = req.nextUrl.clone();
        dashboardUrl.pathname = "/dashboard";
        return NextResponse.redirect(dashboardUrl);
      }
    } catch {
      // Supabase not configured — skip
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
