import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { calculateFactorAmount, isEligibleForFactoring } from "@/lib/accounting/factoring";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { invoiceId, factorRate = 0.95 } = body as { invoiceId: string; factorRate?: number };

    if (!invoiceId) {
      return NextResponse.json({ error: "invoiceId is required" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { load: { select: { carrier: { select: { id: true } } } } },
    });

    if (!invoice || invoice.companyId !== auth.companyId) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (!isEligibleForFactoring({ status: invoice.status, amount: Number(invoice.amount), dueAt: invoice.dueAt })) {
      return NextResponse.json(
        { error: "Invoice is not eligible for factoring. Must be SENT or OVERDUE with a positive amount." },
        { status: 400 },
      );
    }

    const factoring = calculateFactorAmount(Number(invoice.amount), factorRate);

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "SENT",
        notes: `${invoice.notes ?? ""}\n[Factored] Rate: ${(factorRate * 100).toFixed(0)}% | Advance: $${factoring.advanceAmount.toFixed(2)} | Fee: $${factoring.factorFee.toFixed(2)}`.trim(),
      },
    });

    const carrierId = invoice.load?.carrier?.id;
    if (carrierId) {
      await prisma.carrierPayment.create({
        data: {
          carrierId,
          amount: factoring.advanceAmount,
          method: "FACTORING",
          reference: `Factoring for invoice ${invoice.invoiceNumber}`,
          notes: `Factor advance on invoice ${invoice.invoiceNumber}. Rate: ${(factorRate * 100).toFixed(0)}%, Fee: $${factoring.factorFee.toFixed(2)}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      factoring: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceAmount: Number(invoice.amount),
        advanceAmount: factoring.advanceAmount,
        factorFee: factoring.factorFee,
        netToYou: factoring.netToYou,
        factorRate: factoring.factorRate,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Factoring processing failed", details: (err as Error).message },
      { status: 500 },
    );
  }
}
