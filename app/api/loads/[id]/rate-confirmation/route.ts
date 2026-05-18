import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { buildRateConPdf } from "@/lib/pdf/rate-confirmation";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getAuthContext();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const load = await prisma.load.findUnique({
    where: { id, companyId: auth.companyId },
    include: {
      carrier: true,
      company: true,
    },
  });

  if (!load) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!load.carrier) return NextResponse.json({ error: "No carrier assigned" }, { status: 400 });

  const pdfBytes = await buildRateConPdf({
    loadNumber: load.loadNumber,
    equipmentType: load.equipmentType,
    commodity: load.commodity,
    weight: load.weight ? Number(load.weight) : null,
    miles: load.miles,
    originAddress: load.originAddress,
    originCity: load.originCity,
    originState: load.originState,
    originZip: load.originZip,
    pickupDate: load.pickupDate,
    pickupWindow: load.pickupWindow,
    destAddress: load.destAddress,
    destCity: load.destCity,
    destState: load.destState,
    destZip: load.destZip,
    deliveryDate: load.deliveryDate,
    deliveryWindow: load.deliveryWindow,
    carrierRate: Number(load.carrierRate ?? 0),
    fuelSurcharge: load.fuelSurcharge ? Number(load.fuelSurcharge) : null,
    bolNumber: load.bolNumber,
    poNumber: load.poNumber,
    carrier: load.carrier,
    company: load.company,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="RateCon-${load.loadNumber}.pdf"`,
    },
  });
}
