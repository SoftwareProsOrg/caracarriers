import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPortalUser } from "@/lib/portal/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const portalUser = await getPortalUser();
    if (!portalUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loads = await prisma.load.findMany({
      where: {
        companyId: portalUser.companyId,
        shipperId: portalUser.shipperId,
      },
      orderBy: { createdAt: "desc" },
      include: {
        carrier: { select: { name: true } },
      },
      take: 100,
    });

    return NextResponse.json({ loads });
  } catch (error) {
    console.error("Portal loads error:", error);
    return NextResponse.json({ error: "Failed to fetch loads" }, { status: 500 });
  }
}
