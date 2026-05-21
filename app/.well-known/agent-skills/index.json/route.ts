import { NextResponse } from "next/server";

export function GET() {
  const index = {
    $schema: "https://agentskills.io/registry/schema/v0.2.0.json",
    skills: [],
  };

  return NextResponse.json(index);
}
