import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { log } from "@/lib/logger";
import { parseEdi204, parseEdi210, parseEdi214 } from "@/lib/edi/parser";
import type { Edi204Parsed, Edi214Parsed } from "@/lib/edi/types";

const LOAD_STATUS_MAP: Record<string, string> = {
  X1: "AVAILABLE",
  X2: "BOOKED",
  X3: "DISPATCHED",
  X4: "IN_TRANSIT",
  X5: "DELIVERED",
} as const;

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ediType, rawContent, partnerId } = body;

    if (!ediType || !rawContent) {
      return NextResponse.json(
        { error: "ediType and rawContent are required" },
        { status: 400 }
      );
    }

    let parsed: Record<string, unknown> | null = null;

    if (ediType === "204") {
      parsed = parseEdi204(rawContent) as unknown as Record<string, unknown>;
    } else if (ediType === "210") {
      parsed = parseEdi210(rawContent) as unknown as Record<string, unknown>;
    } else if (ediType === "214") {
      parsed = parseEdi214(rawContent) as unknown as Record<string, unknown>;
    }

    const parsedData = parsed?.data as Record<string, unknown> | undefined;
    const parsedSuccess = parsed?.status === "success";

    let loadId: string | undefined;
    let loadResult: unknown = null;

    if (ediType === "204" && parsedSuccess) {
      const data = parsedData as unknown as Edi204Parsed;

      const loadNumber = data.reference ?? `EDI-${Date.now()}`;

      const existing = await prisma.load.findUnique({
        where: { loadNumber },
      });

      if (!existing) {
        const load = await prisma.load.create({
          data: {
            companyId: auth.companyId,
            loadNumber,
            status: "BOOKED",
            equipmentType: "DRY_VAN",
            originCity: data.origin.city,
            originState: data.origin.state,
            destCity: data.destination.city,
            destState: data.destination.state,
            commodity: data.commodity ?? null,
            weight: data.weight ?? null,
            pickupDate: data.origin.date
              ? new Date(data.origin.date)
              : new Date(),
            deliveryDate: data.destination.date
              ? new Date(data.destination.date)
              : new Date(Date.now() + 86400000 * 3),
            shipperRate: 0,
          },
        });
        loadId = load.id;
        loadResult = load;
      } else {
        loadId = existing.id;
        loadResult = existing;
      }
    }

    if (ediType === "214" && parsedSuccess) {
      const data = parsedData as unknown as Edi214Parsed;
      if (data.loadReference) {
        const load = await prisma.load.findUnique({
          where: { loadNumber: data.loadReference },
        });
        if (load) {
          loadId = load.id;
          const newStatus = data.status
            ? (LOAD_STATUS_MAP[data.status] ?? null)
            : null;
          if (newStatus) {
            await prisma.load.update({
              where: { id: load.id },
              data: { status: newStatus as never },
            });
          }
        }
      }
    }

    const document = await prisma.ediDocument.create({
      data: {
        companyId: auth.companyId,
        ediType,
        direction: "inbound",
        rawContent,
        status: parsedSuccess ? "processed" : "failed",
        partnerId: partnerId || null,
        loadId: loadId || null,
        processedAt: new Date(),
      },
      include: {
        load: { select: { id: true, loadNumber: true } },
      },
    });

    log.info("EDI document received", {
      id: document.id,
      ediType,
      partnerId: partnerId ?? null,
      autoCreatedLoad: !!loadId,
    });

    return NextResponse.json(
      {
        document,
        parsed,
        autoCreatedLoad: loadResult,
      },
      { status: 201 }
    );
  } catch (err) {
    log.error("Error receiving EDI document", err as Error);
    return NextResponse.json({ error: "Failed to receive EDI document" }, { status: 500 });
  }
}
