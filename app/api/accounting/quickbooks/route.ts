import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { syncInvoices, syncPayments } from "@/lib/accounting/quickbooks";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoices = await prisma.invoice.findMany({
      where: { companyId: auth.companyId },
      include: { shipper: { select: { name: true } } },
    });

    const payments = await prisma.carrierPayment.findMany({
      where: { carrier: { companyId: auth.companyId } },
      include: { carrier: { select: { name: true } } },
    });

    const qbInvoices = syncInvoices(
      invoices.map((i) => ({
        invoiceNumber: i.invoiceNumber,
        shipperName: i.shipper.name,
        amount: Number(i.amount),
        tax: Number(i.tax),
        dueAt: i.dueAt,
      })),
    );

    const qbPayments = syncPayments(
      payments.map((p) => ({
        carrierName: p.carrier.name,
        amount: Number(p.amount),
        method: p.method,
        paidAt: p.paidAt,
      })),
    );

    await prisma.communication.create({
      data: {
        companyId: auth.companyId,
        type: "system",
        direction: "outbound",
        subject: "QuickBooks Sync",
        body: JSON.stringify({
          invoicesSynced: qbInvoices.length,
          paymentsSynced: qbPayments.length,
          syncedAt: new Date().toISOString(),
        }),
        userId: auth.userId,
      },
    });

    return NextResponse.json({
      success: true,
      invoicesSynced: qbInvoices.length,
      paymentsSynced: qbPayments.length,
      errors: [],
    });
  } catch (err) {
    return NextResponse.json(
      { error: "QuickBooks sync failed", details: (err as Error).message },
      { status: 500 },
    );
  }
}
