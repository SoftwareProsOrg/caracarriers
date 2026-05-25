import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { log } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const dealId = url.searchParams.get("dealId");
    const leadId = url.searchParams.get("leadId");

    const where: Record<string, unknown> = { companyId: auth.companyId };
    if (dealId) where.dealId = dealId;
    if (leadId) where.leadId = leadId;

    const activities = await prisma.crmActivity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(activities);
  } catch (err) {
    log.error("Error fetching activities", err as Error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { dealId, leadId, type, subject, body: activityBody } = body;

    if (!type || !subject) {
      return NextResponse.json({ error: "Type and subject are required" }, { status: 400 });
    }

    if (!dealId && !leadId) {
      return NextResponse.json({ error: "Either dealId or leadId is required" }, { status: 400 });
    }

    const activity = await prisma.crmActivity.create({
      data: {
        companyId: auth.companyId,
        dealId: dealId || null,
        leadId: leadId || null,
        type,
        subject,
        body: activityBody || null,
        userId: auth.userId,
      },
    });

    log.info("Activity created", { activityId: activity.id, type, companyId: auth.companyId });

    return NextResponse.json(activity, { status: 201 });
  } catch (err) {
    log.error("Error creating activity", err as Error);
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 });
  }
}
