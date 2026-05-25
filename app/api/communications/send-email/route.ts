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
    const { loadId, to, subject, body: emailBody } = body;

    if (!loadId || !to) {
      return NextResponse.json({ error: "loadId and to are required" }, { status: 400 });
    }

    const communication = await prisma.communication.create({
      data: {
        companyId: auth.companyId,
        userId: auth.userId,
        loadId,
        type: "email",
        direction: "outbound",
        subject: subject || null,
        body: emailBody || null,
        toAddr: to,
      },
    });

    log.info("Email sent (mock)", {
      communicationId: communication.id,
      loadId,
      to,
      subject: subject || "(no subject)",
    });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully (mock)",
      communicationId: communication.id,
    });
  } catch (err) {
    log.error("Error sending email", err as Error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
