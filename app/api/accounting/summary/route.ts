import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [invoices, carrierPayments, loads] = await Promise.all([
      prisma.invoice.findMany({
        where: { companyId: auth.companyId },
        select: { id: true, status: true, amount: true, paidAt: true },
      }),
      prisma.carrierPayment.findMany({
        where: { carrier: { companyId: auth.companyId } },
        select: { id: true, amount: true, paidAt: true },
      }),
      prisma.load.findMany({
        where: { companyId: auth.companyId, status: { not: "CANCELLED" }, carrierRate: { not: null } },
        select: { carrierRate: true },
      }),
    ]);

    const outstandingAR = invoices
      .filter((i) => i.status === "SENT" || i.status === "OVERDUE")
      .reduce((s, i) => s + Number(i.amount), 0);

    const paidThisMonth = invoices
      .filter((i) => i.status === "PAID" && i.paidAt && i.paidAt >= startOfMonth)
      .reduce((s, i) => s + Number(i.amount), 0);

    const totalAP = loads.reduce((s, l) => s + Number(l.carrierRate!), 0);

    const totalTransactionCount = invoices.length + carrierPayments.length;

    return NextResponse.json({
      outstandingAR: Math.round(outstandingAR * 100) / 100,
      unpaidAP: Math.round(totalAP * 100) / 100,
      paidThisMonth: Math.round(paidThisMonth * 100) / 100,
      transactionCount: totalTransactionCount,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch accounting summary", details: (err as Error).message },
      { status: 500 },
    );
  }
}
