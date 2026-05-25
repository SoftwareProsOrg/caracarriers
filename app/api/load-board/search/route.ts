import { NextRequest, NextResponse } from "next/server";
import { loadBoard } from "@/lib/load-board";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  try {
    const result = await loadBoard.search({
      origin: searchParams.get("origin") ?? undefined,
      destination: searchParams.get("destination") ?? undefined,
      equipmentType: searchParams.get("equipment_type") ?? undefined,
      minRate: searchParams.get("min_rate") ? Number(searchParams.get("min_rate")) : undefined,
      maxWeight: searchParams.get("max_weight") ? Number(searchParams.get("max_weight")) : undefined,
      source: (searchParams.get("source") as any) ?? "all",
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 50,
      offset: searchParams.get("offset") ? Number(searchParams.get("offset")) : 0,
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to search load board", details: (err as Error).message },
      { status: 500 },
    );
  }
}
