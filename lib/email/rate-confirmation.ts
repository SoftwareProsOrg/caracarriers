import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { buildRateConPdf } from "@/lib/pdf/rate-confirmation";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendRateConfirmationEmail(loadId: string): Promise<boolean> {
  const load = await prisma.load.findUnique({
    where: { id: loadId },
    include: { carrier: true, company: true },
  });

  if (!load?.carrier?.email) return false;

  try {
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

    const from = process.env.RESEND_FROM ?? "onboarding@resend.dev";

    await resend.emails.send({
      from,
      to: load.carrier.email,
      subject: `Rate Confirmation — Load ${load.loadNumber} | ${load.company.name}`,
      html: `
        <p>Hello ${load.carrier.name},</p>
        <p>Please find your rate confirmation for load <strong>${load.loadNumber}</strong> attached.</p>
        <table style="border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Route:</td><td><strong>${load.originCity}, ${load.originState} → ${load.destCity}, ${load.destState}</strong></td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Pickup:</td><td>${load.pickupDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Delivery:</td><td>${load.deliveryDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Rate:</td><td><strong>$${Number(load.carrierRate).toFixed(2)}</strong></td></tr>
        </table>
        <p>Please sign and return this rate confirmation before picking up the load.</p>
        <p>If you have any questions, reply to this email or call us directly.</p>
        <p>Thank you,<br/>${load.company.name}</p>
      `,
      attachments: [
        {
          filename: `RateCon-${load.loadNumber}.pdf`,
          content: Buffer.from(pdfBytes).toString("base64"),
        },
      ],
    });

    return true;
  } catch {
    return false;
  }
}
