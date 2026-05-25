import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { log } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { loadId, to, message } = body;

    if (!loadId || !to || !message) {
      return NextResponse.json({ error: "loadId, to, and message are required" }, { status: 400 });
    }

    const communication = await prisma.communication.create({
      data: {
        companyId: auth.companyId,
        userId: auth.userId,
        loadId,
        type: "sms",
        direction: "outbound",
        body: message,
        toAddr: to,
      },
    });

    log.info("SMS sent (mock)", {
      communicationId: communication.id,
      loadId,
      to,
    });

    return NextResponse.json({
      success: true,
      message: "SMS sent successfully (mock)",
      communicationId: communication.id,
    });
  } catch (err) {
    log.error("Error sending SMS", err as Error);
    return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
  }
}
