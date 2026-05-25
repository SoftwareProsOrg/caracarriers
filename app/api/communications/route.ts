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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const loadId = searchParams.get("loadId");
    const search = searchParams.get("search");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 200);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    const where: Record<string, unknown> = { companyId: auth.companyId };

    if (type && type !== "") {
      where.type = type;
    }

    if (loadId && loadId !== "") {
      where.loadId = loadId;
    }

    if (search && search.trim()) {
      where.OR = [
        { subject: { contains: search.trim(), mode: "insensitive" } },
        { body: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const [communications, total] = await Promise.all([
      prisma.communication.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          load: { select: { id: true, loadNumber: true } },
        },
      }),
      prisma.communication.count({ where }),
    ]);

    return NextResponse.json({
      data: communications,
      total,
      limit,
      offset,
    });
  } catch (err) {
    log.error("Error fetching communications", err as Error);
    return NextResponse.json({ error: "Failed to fetch communications" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { loadId, type, direction, subject, body: commBody, fromAddr, toAddr } = body;

    if (!type) {
      return NextResponse.json({ error: "Type is required" }, { status: 400 });
    }

    const validTypes = ["note", "email", "sms", "call", "system"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const communication = await prisma.communication.create({
      data: {
        companyId: auth.companyId,
        userId: auth.userId,
        loadId: loadId || null,
        type,
        direction: direction || "outbound",
        subject: subject || null,
        body: commBody || null,
        fromAddr: fromAddr || null,
        toAddr: toAddr || null,
      },
      include: {
        load: { select: { id: true, loadNumber: true } },
      },
    });

    log.info("Communication created", {
      id: communication.id,
      type: communication.type,
      loadId: communication.loadId,
    });

    return NextResponse.json(communication, { status: 201 });
  } catch (err) {
    log.error("Error creating communication", err as Error);
    return NextResponse.json({ error: "Failed to create communication" }, { status: 500 });
  }
}
