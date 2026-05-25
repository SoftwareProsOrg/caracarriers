import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { log } from "@/lib/logger";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ loadId: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { loadId } = await params;

    const load = await prisma.load.findFirst({
      where: { id: loadId, companyId: auth.companyId },
      select: { id: true, companyId: true },
    });

    if (!load) {
      return NextResponse.json({ error: "Load not found" }, { status: 404 });
    }

    const events = await prisma.trackingEvent.findMany({
      where: { loadId },
      orderBy: { recordedAt: "desc" },
      take: 100,
    });

    return NextResponse.json(events);
  } catch (err) {
    log.error("Error fetching tracking events", err as Error);
    return NextResponse.json({ error: "Failed to fetch tracking events" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ loadId: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { loadId } = await params;
    const body = await request.json();
    const { latitude, longitude, speed, heading, locationName, source } = body;

    if (latitude == null || longitude == null) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 });
    }

    const load = await prisma.load.findFirst({
      where: { id: loadId, companyId: auth.companyId },
    });

    if (!load) {
      return NextResponse.json({ error: "Load not found" }, { status: 404 });
    }

    const event = await prisma.trackingEvent.create({
      data: {
        loadId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        speed: speed != null ? parseFloat(speed) : null,
        heading: heading != null ? parseFloat(heading) : null,
        locationName: locationName || null,
        source: source || "manual",
      },
    });

    await prisma.load.update({
      where: { id: loadId },
      data: {
        currentLocation: locationName || `${latitude}, ${longitude}`,
      },
    });

    await prisma.communication.create({
      data: {
        companyId: auth.companyId,
        loadId,
        type: "system",
        direction: "outbound",
        subject: `Location update: ${load.loadNumber}`,
        body: `Location update: ${locationName || `${latitude}, ${longitude}`}`,
      },
    });

    log.info("Tracking event created", {
      eventId: event.id,
      loadId,
      companyId: auth.companyId,
    });

    return NextResponse.json(event, { status: 201 });
  } catch (err) {
    log.error("Error creating tracking event", err as Error);
    return NextResponse.json({ error: "Failed to create tracking event" }, { status: 500 });
  }
}
