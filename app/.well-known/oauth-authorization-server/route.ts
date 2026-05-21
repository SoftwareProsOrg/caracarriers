import { NextResponse } from "next/server";

export function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const authBase = `${supabaseUrl}/auth/v1`;

  const metadata = {
    issuer: authBase,
    authorization_endpoint: `${authBase}/authorize`,
    token_endpoint: `${authBase}/token`,
    jwks_uri: `${authBase}/.well-known/jwks.json`,
    userinfo_endpoint: `${authBase}/user`,
    grant_types_supported: ["authorization_code", "refresh_token", "implicit"],
    response_types_supported: ["code", "token"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
    scopes_supported: ["openid", "email", "profile"],
    token_endpoint_auth_methods_supported: ["client_secret_basic", "client_secret_post"],
    code_challenge_methods_supported: ["S256"],
  };

  return NextResponse.json(metadata);
}
