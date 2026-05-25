import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const blockedPrefixes = [
  "/xmlrpc",
  "/wp-",
  "/wordpress",
  "/adm",
  "/administrator",
  ".php",
  ".asp",
  ".aspx",
  ".jsp",
  "/cgi-bin",
  "/phpmyadmin",
  "/pma",
  "/myadmin",
  "/backup",
  "/.env",
  "/.git",
  "/.svn",
  "/.hg",
  "/composer.json",
  "/composer.lock",
  "/yarn.lock",
  "/package-lock.json",
  "/config.php",
  "/config.asp",
  "/shell",
  "/cmd",
  "/exec",
  "/server-status",
  "/server-info",
  "/actuator",
  "/swagger",
  "/api-docs",
  "//",
];

const blockedExact = [
  "/Dockerfile",
  "/docker-compose.yml",
  "/docker-compose.yaml",
  "/sftp-config.json",
  "/proc/self",
  "/crossdomain.xml",
  "/clientaccesspolicy.xml",
];

const blockedExtensions = [".php", ".asp", ".aspx", ".jsp", ".cgi", ".pl", ".py"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (blockedExact.includes(pathname)) {
    return new NextResponse(null, { status: 403 });
  }

  if (blockedPrefixes.some((p) => pathname.includes(p))) {
    return new NextResponse(null, { status: 403 });
  }

  if (pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  if (blockedExtensions.some((ext) => pathname.endsWith(ext))) {
    return new NextResponse(null, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
