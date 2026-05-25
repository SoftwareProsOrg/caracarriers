import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { log } from "@/lib/logger";
import { generateMockLatLng, generateMockSpeed } from "@/lib/tracking/mock-data";
import { calculateEta } from "@/lib/tracking/eta";

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { loadId } = body;

    if (!loadId) {
      return NextResponse.json({ error: "loadId is required" }, { status: 400 });
    }

    const load = await prisma.load.findFirst({
      where: { id: loadId, companyId: auth.companyId },
    });

    if (!load) {
      return NextResponse.json({ error: "Load not found" }, { status: 404 });
    }

    const { lat, lng, locationName } = generateMockLatLng();
    const speed = generateMockSpeed();

    const eta = calculateEta(
      lat,
      lng,
      load.destCity === "Los Angeles" ? 34.0522 : load.destCity === "Atlanta" ? 33.749 : 32.8,
      load.destState === "CA" ? -118.2437 : load.destState === "GA" ? -84.388 : -96.8,
      speed
    );

    const event = await prisma.trackingEvent.create({
      data: {
        loadId,
        latitude: lat,
        longitude: lng,
        speed,
        heading: Math.random() * 360,
        locationName,
        source: "eld",
      },
    });

    await prisma.load.update({
      where: { id: loadId },
      data: {
        currentLocation: locationName,
        eta,
      },
    });

    log.info("Mock ELD ping created", {
      eventId: event.id,
      loadId,
      companyId: auth.companyId,
    });

    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    log.error("Error creating mock ELD ping", err as Error);
    return NextResponse.json({ error: "Failed to create mock ELD ping" }, { status: 500 });
  }
}
