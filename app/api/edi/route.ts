import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { log } from "@/lib/logger";
import { parseEdi204, parseEdi210, parseEdi214 } from "@/lib/edi/parser";

export async function GET() {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documents = await prisma.ediDocument.findMany({
      where: { companyId: auth.companyId },
      orderBy: { createdAt: "desc" },
      include: {
        load: { select: { id: true, loadNumber: true } },
      },
      take: 200,
    });

    return NextResponse.json(documents);
  } catch (err) {
    log.error("Error fetching EDI documents", err as Error);
    return NextResponse.json({ error: "Failed to fetch EDI documents" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ediType, direction, rawContent, loadId, partnerId } = body;

    if (!ediType || typeof ediType !== "string") {
      return NextResponse.json({ error: "EDI type is required" }, { status: 400 });
    }

    const validTypes = ["204", "210", "214", "990"];
    if (!validTypes.includes(ediType)) {
      return NextResponse.json({ error: "Invalid EDI type" }, { status: 400 });
    }

    const parsed = rawContent
      ? parseEdi(rawContent, ediType)
      : null;

    const document = await prisma.ediDocument.create({
      data: {
        companyId: auth.companyId,
        ediType,
        direction: direction || "outbound",
        rawContent: rawContent || null,
        status: parsed?.status === "success" ? "processed" : "received",
        loadId: loadId || null,
        partnerId: partnerId || null,
        processedAt: parsed?.status === "success" ? new Date() : null,
      },
      include: {
        load: { select: { id: true, loadNumber: true } },
      },
    });

    log.info("EDI document created", {
      id: document.id,
      ediType,
      direction: document.direction,
    });

    return NextResponse.json(
      { document, parsed },
      { status: 201 }
    );
  } catch (err) {
    log.error("Error creating EDI document", err as Error);
    return NextResponse.json({ error: "Failed to create EDI document" }, { status: 500 });
  }
}

function parseEdi(raw: string, type: string) {
  switch (type) {
    case "204":
      return parseEdi204(raw);
    case "210":
      return parseEdi210(raw);
    case "214":
      return parseEdi214(raw);
    default:
      return null;
  }
}
