import { NextResponse } from "next/server";

export function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  const metadata = {
    resource: "https://www.caracarriers.com",
    authorization_servers: [`${supabaseUrl}/auth/v1`],
    scopes_supported: ["openid", "email", "profile"],
    bearer_methods_supported: ["header"],
    resource_documentation: "https://www.caracarriers.com/docs/api",
  };

  return NextResponse.json(metadata);
}
