import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { log } from "@/lib/logger";
import { calculateTrend } from "./utils";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const originCity = searchParams.get("originCity");
    const originState = searchParams.get("originState");
    const destCity = searchParams.get("destCity");
    const destState = searchParams.get("destState");
    const equipmentType = searchParams.get("equipmentType");

    const where: Record<string, unknown> = {
      companyId: auth.companyId,
    };

    if (originCity) where.originCity = { equals: originCity, mode: "insensitive" };
    if (originState) where.originState = { equals: originState, mode: "insensitive" };
    if (destCity) where.destCity = { equals: destCity, mode: "insensitive" };
    if (destState) where.destState = { equals: destState, mode: "insensitive" };
    if (equipmentType) where.equipmentType = equipmentType;

    const history = await prisma.laneHistory.findMany({
      where,
      orderBy: { recordedAt: "desc" },
      take: 100,
    });

    const rates = history.map((h) => Number(h.rate));
    const withRpm = history.filter((h) => h.ratePerMile != null);

    const averageRate =
      rates.length > 0
        ? Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 100) / 100
        : 0;

    const averageRpm =
      withRpm.length > 0
        ? Math.round(
            (withRpm.reduce((a, h) => a + Number(h.ratePerMile), 0) /
              withRpm.length) *
              100
          ) / 100
        : 0;

    const recentRates = history.slice(0, 20).map((h) => ({
      id: h.id,
      originCity: h.originCity,
      originState: h.originState,
      destCity: h.destCity,
      destState: h.destState,
      equipmentType: h.equipmentType,
      rate: Number(h.rate),
      ratePerMile: h.ratePerMile ? Number(h.ratePerMile) : null,
      source: h.source,
      recordedAt: h.recordedAt.toISOString(),
    }));

    const trend = calculateTrend(recentRates);

    return NextResponse.json({
      averageRate,
      averageRpm,
      count: history.length,
      trend,
      recentRates,
    });
  } catch (err) {
    log.error("Error fetching rates", err as Error);
    return NextResponse.json({ error: "Failed to fetch rates" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { originCity, originState, destCity, destState, equipmentType, rate, ratePerMile, source } = body;

    if (!originCity || typeof originCity !== "string") {
      return NextResponse.json({ error: "originCity is required" }, { status: 400 });
    }
    if (!originState || typeof originState !== "string") {
      return NextResponse.json({ error: "originState is required" }, { status: 400 });
    }
    if (!destCity || typeof destCity !== "string") {
      return NextResponse.json({ error: "destCity is required" }, { status: 400 });
    }
    if (!destState || typeof destState !== "string") {
      return NextResponse.json({ error: "destState is required" }, { status: 400 });
    }
    if (rate == null || isNaN(Number(rate))) {
      return NextResponse.json({ error: "rate is required and must be a number" }, { status: 400 });
    }

    const entry = await prisma.laneHistory.create({
      data: {
        companyId: auth.companyId,
        originCity,
        originState,
        destCity,
        destState,
        equipmentType: equipmentType || null,
        rate: parseFloat(rate),
        ratePerMile: ratePerMile != null ? parseFloat(ratePerMile) : null,
        source: source || "manual",
      },
    });

    log.info("Lane rate recorded", {
      entryId: entry.id,
      origin: `${originCity}, ${originState}`,
      dest: `${destCity}, ${destState}`,
      companyId: auth.companyId,
    });

    return NextResponse.json(
      {
        success: true,
        entry: {
          ...entry,
          rate: Number(entry.rate),
          ratePerMile: entry.ratePerMile ? Number(entry.ratePerMile) : null,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    log.error("Error recording lane rate", err as Error);
    return NextResponse.json({ error: "Failed to record lane rate" }, { status: 500 });
  }
}
