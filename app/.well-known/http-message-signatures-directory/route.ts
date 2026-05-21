import { NextResponse } from "next/server";

// Public JWKS for Web Bot Auth (RFC-draft: http-message-signatures)
// Replace key material with a real P-256 key pair before signing bot requests.
// Generate with: openssl ecparam -name prime256v1 -genkey | openssl pkcs8 -topk8 -nocrypt
export function GET() {
  const jwks = {
    keys: [
      {
        kty: "EC",
        crv: "P-256",
        use: "sig",
        alg: "ES256",
        kid: "caracarriers-bot-v1",
        // TODO: replace with real base64url-encoded public key coordinates
        x: "REPLACE_WITH_REAL_X_COORDINATE",
        y: "REPLACE_WITH_REAL_Y_COORDINATE",
      },
    ],
  };

  return NextResponse.json(jwks, {
    headers: { "Content-Type": "application/json" },
  });
}
