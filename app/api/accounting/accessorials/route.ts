import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { loadId, type, amount, notes } = body as {
      loadId: string;
      type: "detention" | "lumper" | "fuel" | "other";
      amount: number;
      notes?: string;
    };

    if (!loadId || !type || amount == null) {
      return NextResponse.json({ error: "loadId, type, and amount are required" }, { status: 400 });
    }

    const load = await prisma.load.findUnique({
      where: { id: loadId },
    });

    if (!load || load.companyId !== auth.companyId) {
      return NextResponse.json({ error: "Load not found" }, { status: 404 });
    }

    const chargeLabel = type.charAt(0).toUpperCase() + type.slice(1);
    const chargeNote = `[Accessorial: ${chargeLabel}] $${Number(amount).toFixed(2)}${notes ? ` - ${notes}` : ""}`;
    const updatedNotes = load.notes ? `${load.notes}\n${chargeNote}` : chargeNote;

    await Promise.all([
      prisma.communication.create({
        data: {
          companyId: auth.companyId,
          loadId,
          type: "system",
          direction: "outbound",
          subject: `Accessorial Charge: ${chargeLabel}`,
          body: chargeNote,
          userId: auth.userId,
        },
      }),
      prisma.load.update({
        where: { id: loadId },
        data: { notes: updatedNotes },
      }),
    ]);

    return NextResponse.json({
      success: true,
      accessorial: {
        loadId,
        loadNumber: load.loadNumber,
        type,
        amount: Number(amount),
        notes: notes ?? null,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to add accessorial charge", details: (err as Error).message },
      { status: 500 },
    );
  }
}
