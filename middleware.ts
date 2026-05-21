import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const accept = request.headers.get("accept") ?? "";
  const { pathname } = request.nextUrl;

  if (accept.includes("text/markdown") && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/api/markdown";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
