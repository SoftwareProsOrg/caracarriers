import { NextResponse } from "next/server";

export function GET() {
  const card = {
    schemaVersion: "1.0",
    serverInfo: {
      name: "CaraCarriers TMS API",
      version: "1.0.0",
      description:
        "CaraCarriers freight broker TMS — manage loads, carriers, and dispatch via MCP.",
    },
    transport: {
      type: "http",
      endpoint: "https://www.caracarriers.com/api/mcp",
    },
    capabilities: {
      tools: true,
      resources: false,
      prompts: false,
    },
    contact: {
      email: "dispatch@caracarriers.com",
      url: "https://www.caracarriers.com",
    },
  };

  return NextResponse.json(card);
}
