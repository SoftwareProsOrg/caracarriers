import { NextResponse } from "next/server";

export function GET() {
  const catalog = {
    linkset: [
      {
        anchor: "https://www.caracarriers.com",
        "service-doc": [
          { href: "https://www.caracarriers.com/docs", type: "text/html" },
        ],
        status: [
          {
            href: "https://www.caracarriers.com/api/health",
            type: "application/json",
          },
        ],
      },
    ],
  };

  return NextResponse.json(catalog, {
    headers: { "Content-Type": "application/linkset+json" },
  });
}
