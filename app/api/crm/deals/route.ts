import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { log } from "@/lib/logger";

export async function GET() {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deals = await prisma.deal.findMany({
      where: { companyId: auth.companyId },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json(deals);
  } catch (err) {
    log.error("Error fetching deals", err as Error);
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, value, probability, stage, expectedCloseDate, assignedTo, notes } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!stage || typeof stage !== "string") {
      return NextResponse.json({ error: "Stage is required" }, { status: 400 });
    }

    const deal = await prisma.deal.create({
      data: {
        companyId: auth.companyId,
        name,
        value: value != null ? parseFloat(value) : null,
        probability: probability != null ? parseInt(probability, 10) : 10,
        stage,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        assignedTo: assignedTo || null,
        notes: notes || null,
      },
    });

    log.info("Deal created", { dealId: deal.id, name, companyId: auth.companyId });

    return NextResponse.json(deal, { status: 201 });
  } catch (err) {
    log.error("Error creating deal", err as Error);
    return NextResponse.json({ error: "Failed to create deal" }, { status: 500 });
  }
}
