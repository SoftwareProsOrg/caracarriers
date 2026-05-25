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

const honeypotPage = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="robots" content="noindex, nofollow">
<title>FBI Monitoring Honeypot</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: linear-gradient(135deg, #0a0a2e 0%, #1a1a4e 50%, #0a0a2e 100%);
    color: #fff;
    font-family: 'Courier New', monospace;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .container {
    max-width: 700px;
    text-align: center;
    border: 3px solid #ffd700;
    border-radius: 12px;
    padding: 40px;
    background: rgba(0,0,0,0.7);
    box-shadow: 0 0 40px rgba(255,215,0,0.2);
  }
  .seal {
    width: 120px;
    height: 120px;
    margin: 0 auto 20px;
    display: block;
  }
  h1 {
    color: #ffd700;
    font-size: 24px;
    letter-spacing: 2px;
    margin-bottom: 20px;
    text-transform: uppercase;
  }
  .badge {
    display: inline-block;
    background: #ffd700;
    color: #0a0a2e;
    padding: 6px 18px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 14px;
    letter-spacing: 1px;
    margin-bottom: 20px;
  }
  p {
    line-height: 1.8;
    font-size: 15px;
    margin-bottom: 10px;
  }
  .warning {
    color: #ff4444;
    font-weight: bold;
    font-size: 16px;
    margin: 20px 0;
    padding: 10px;
    border: 1px solid #ff4444;
    border-radius: 4px;
    background: rgba(255,0,0,0.1);
  }
  .ip {
    color: #888;
    font-size: 12px;
    margin-top: 20px;
  }
  hr {
    border: none;
    border-top: 1px solid #ffd70044;
    margin: 20px 0;
  }
</style>
</head>
<body>
<div class="container">
  <svg class="seal" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="none" stroke="#ffd700" stroke-width="2"/>
    <circle cx="50" cy="50" r="40" fill="none" stroke="#ffd700" stroke-width="1.5"/>
    <text x="50" y="30" text-anchor="middle" fill="#ffd700" font-size="10" font-family="serif">UNITED STATES</text>
    <text x="50" y="42" text-anchor="middle" fill="#ffd700" font-size="6" font-family="serif">DEPARTMENT OF JUSTICE</text>
    <polygon points="50,25 62,42 58,60 42,60 38,42" fill="none" stroke="#ffd700" stroke-width="1.5"/>
    <circle cx="50" cy="48" r="6" fill="none" stroke="#ffd700" stroke-width="1"/>
    <text x="50" y="78" text-anchor="middle" fill="#ffd700" font-size="8" font-family="serif">FBI</text>
    <text x="50" y="88" text-anchor="middle" fill="#ffd700" font-size="5" font-family="serif">FEDERAL BUREAU OF INVESTIGATION</text>
  </svg>
  <div class="badge">&#9888; HONEYPOT DETECTED</div>
  <h1>FBI Monitoring System</h1>
  <p>This system is a <strong>FEDERAL HONEYPOT</strong> operated by law enforcement for the purpose of identifying, monitoring, and prosecuting unauthorized access.</p>
  <p>Your IP address, geolocation, browser fingerprint, and all activities have been <strong>logged and recorded</strong>.</p>
  <div class="warning">
    &#9888; WARNING: Anyone accessing this system remotely without authorization will be prosecuted to the fullest extent of the law.
  </div>
  <p>This includes, but is not limited to, the Computer Fraud and Abuse Act (18 U.S.C. &sect; 1030) and applicable federal statutes.</p>
  <hr>
  <p style="font-size:13px; color:#ccc;">All access is monitored and recorded. Unauthorized access is a federal crime.</p>
  <div class="ip">Case File: #CC-$(Date.now())</div>
</div>
</body>
</html>`;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const blocked =
    blockedExact.includes(pathname) ||
    blockedPrefixes.some((p) => pathname.includes(p)) ||
    blockedExtensions.some((ext) => pathname.endsWith(ext));

  if (blocked) {
    return new NextResponse(honeypotPage, {
      status: 403,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
