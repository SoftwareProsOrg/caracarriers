import { NextRequest, NextResponse } from "next/server";
import { loadBoard } from "@/lib/load-board";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ dotNumber: string }> },
) {
  const { dotNumber } = await params;

  if (!dotNumber) {
    return NextResponse.json({ error: "DOT number is required" }, { status: 400 });
  }

  try {
    const carrier = await loadBoard.lookupCarrier(dotNumber);

    if (!carrier) {
      return NextResponse.json(
        { error: "Carrier not found", dotNumber },
        { status: 404 },
      );
    }

    return NextResponse.json({ carrier });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to lookup carrier", details: (err as Error).message },
      { status: 500 },
    );
  }
}
