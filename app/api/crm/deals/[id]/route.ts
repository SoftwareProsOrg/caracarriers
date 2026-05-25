import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { log } from "@/lib/logger";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { stage, value, probability, name, expectedCloseDate, assignedTo, notes } = body;

    const existing = await prisma.deal.findFirst({
      where: { id, companyId: auth.companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (stage !== undefined) updateData.stage = stage;
    if (value !== undefined) updateData.value = parseFloat(value);
    if (probability !== undefined) updateData.probability = parseInt(probability, 10);
    if (name !== undefined) updateData.name = name;
    if (expectedCloseDate !== undefined) updateData.expectedCloseDate = expectedCloseDate ? new Date(expectedCloseDate) : null;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo || null;
    if (notes !== undefined) updateData.notes = notes || null;

    if (stage === "won" && existing.stage !== "won") {
      updateData.closedAt = new Date();
    }

    const deal = await prisma.deal.update({
      where: { id },
      data: updateData,
    });

    log.info("Deal updated", { dealId: id, updates: Object.keys(updateData), companyId: auth.companyId });

    return NextResponse.json(deal);
  } catch (err) {
    log.error("Error updating deal", err as Error);
    return NextResponse.json({ error: "Failed to update deal" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.deal.findFirst({
      where: { id, companyId: auth.companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    await prisma.deal.delete({ where: { id } });

    log.info("Deal deleted", { dealId: id, companyId: auth.companyId });

    return NextResponse.json({ success: true });
  } catch (err) {
    log.error("Error deleting deal", err as Error);
    return NextResponse.json({ error: "Failed to delete deal" }, { status: 500 });
  }
}
