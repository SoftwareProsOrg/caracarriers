import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const blockedPaths = ["/xmlrpc.php", "/wp-admin", "/wp-login.php", "/wp-content", "/wp-includes"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (blockedPaths.some((p) => pathname.startsWith(p))) {
    return new NextResponse(null, { status: 403 });
  }

  return NextResponse.next();
}
