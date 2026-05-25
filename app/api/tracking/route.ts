import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { log } from "@/lib/logger";
import { LoadStatus } from "@prisma/client";

export async function GET() {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loads = await prisma.load.findMany({
      where: {
        companyId: auth.companyId,
        status: { in: [LoadStatus.IN_TRANSIT, LoadStatus.DISPATCHED] },
      },
      orderBy: { updatedAt: "desc" },
      include: {
        carrier: { select: { name: true, phone: true } },
        trackingEvents: {
          orderBy: { recordedAt: "desc" },
          take: 1,
        },
      },
      take: 100,
    });

    const result = loads.map((load) => ({
      load: {
        id: load.id,
        loadNumber: load.loadNumber,
        status: load.status,
        originCity: load.originCity,
        originState: load.originState,
        destCity: load.destCity,
        destState: load.destState,
        currentLocation: load.currentLocation,
        eta: load.eta,
        carrier: load.carrier,
      },
      latestTrackingEvent: load.trackingEvents[0] ?? null,
    }));

    return NextResponse.json(result);
  } catch (err) {
    log.error("Error fetching tracking data", err as Error);
    return NextResponse.json({ error: "Failed to fetch tracking data" }, { status: 500 });
  }
}
