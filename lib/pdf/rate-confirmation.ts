import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const BLUE = rgb(0.23, 0.51, 0.96);
const DARK = rgb(0.07, 0.09, 0.14);
const GRAY = rgb(0.42, 0.47, 0.56);
const LIGHT = rgb(0.95, 0.97, 0.99);
const WHITE = rgb(1, 1, 1);

export interface RateConData {
  loadNumber: string;
  equipmentType: string;
  commodity: string | null;
  weight: number | null;
  miles: number | null;
  originAddress: string | null;
  originCity: string;
  originState: string;
  originZip: string | null;
  pickupDate: Date;
  pickupWindow: string | null;
  destAddress: string | null;
  destCity: string;
  destState: string;
  destZip: string | null;
  deliveryDate: Date;
  deliveryWindow: string | null;
  carrierRate: number;
  fuelSurcharge: number | null;
  bolNumber: string | null;
  poNumber: string | null;
  carrier: {
    name: string;
    mcNumber: string | null;
    dotNumber: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
  };
  company: {
    name: string;
    mcNumber: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
  };
}

function fmt(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function currency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export async function buildRateConPdf(data: RateConData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const { width, height } = page.getSize();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = height;

  page.drawRectangle({ x: 0, y: height - 70, width, height: 70, color: BLUE });
  page.drawText("RATE CONFIRMATION", { x: 36, y: height - 28, size: 18, font: bold, color: WHITE });
  page.drawText(data.company.name.toUpperCase(), { x: 36, y: height - 48, size: 10, font, color: rgb(0.8, 0.9, 1) });
  page.drawText(`Load #: ${data.loadNumber}`, { x: width - 160, y: height - 28, size: 10, font: bold, color: WHITE });
  page.drawText(`Date: ${fmt(new Date())}`, { x: width - 160, y: height - 44, size: 9, font, color: rgb(0.8, 0.9, 1) });

  y = height - 85;

  function sectionHeader(label: string) {
    page.drawRectangle({ x: 36, y: y - 16, width: width - 72, height: 18, color: LIGHT });
    page.drawText(label, { x: 40, y: y - 12, size: 8, font: bold, color: GRAY });
    y -= 30;
  }

  function row(label: string, value: string, indent = 40) {
    page.drawText(label + ":", { x: indent, y, size: 9, font, color: GRAY });
    page.drawText(value, { x: indent + 120, y, size: 9, font: bold, color: DARK });
    y -= 14;
  }

  function twoCol(l1: string, v1: string, l2: string, v2: string) {
    const mid = width / 2;
    page.drawText(l1 + ":", { x: 40, y, size: 9, font, color: GRAY });
    page.drawText(v1, { x: 160, y, size: 9, font: bold, color: DARK });
    page.drawText(l2 + ":", { x: mid, y, size: 9, font, color: GRAY });
    page.drawText(v2, { x: mid + 120, y, size: 9, font: bold, color: DARK });
    y -= 14;
  }

  sectionHeader("BROKER / FREIGHT BROKER");
  row("Company", data.company.name);
  if (data.company.mcNumber) row("MC #", data.company.mcNumber);
  if (data.company.phone) row("Phone", data.company.phone);
  if (data.company.email) row("Email", data.company.email);
  if (data.company.address) {
    const addr = [data.company.address, data.company.city, data.company.state, data.company.zip].filter(Boolean).join(", ");
    row("Address", addr);
  }
  y -= 4;

  sectionHeader("CARRIER");
  row("Carrier Name", data.carrier.name);
  twoCol("MC #", data.carrier.mcNumber ?? "—", "DOT #", data.carrier.dotNumber ?? "—");
  if (data.carrier.phone) row("Phone", data.carrier.phone);
  if (data.carrier.email) row("Email", data.carrier.email);
  y -= 4;

  sectionHeader("SHIPMENT DETAILS");
  row("Equipment", data.equipmentType.replace(/_/g, " "));
  if (data.commodity) row("Commodity", data.commodity);
  if (data.weight) row("Weight", `${Number(data.weight).toLocaleString()} lbs`);
  if (data.miles) row("Miles", `${data.miles.toLocaleString()} mi`);
  if (data.bolNumber) row("BOL #", data.bolNumber);
  if (data.poNumber) row("PO #", data.poNumber);
  y -= 4;

  sectionHeader("ROUTE");
  const originFull = [data.originAddress, `${data.originCity}, ${data.originState}`, data.originZip].filter(Boolean).join(" ");
  const destFull = [data.destAddress, `${data.destCity}, ${data.destState}`, data.destZip].filter(Boolean).join(" ");
  row("Origin", originFull);
  row("Pickup Date", `${fmt(data.pickupDate)}${data.pickupWindow ? `  ·  ${data.pickupWindow}` : ""}`);
  row("Destination", destFull);
  row("Delivery Date", `${fmt(data.deliveryDate)}${data.deliveryWindow ? `  ·  ${data.deliveryWindow}` : ""}`);
  y -= 4;

  sectionHeader("RATE & PAYMENT");
  row("Carrier Rate", currency(data.carrierRate));
  if (data.fuelSurcharge) row("Fuel Surcharge", currency(data.fuelSurcharge));
  const total = data.carrierRate + (data.fuelSurcharge ?? 0);
  y -= 2;
  page.drawLine({ start: { x: 40, y: y + 12 }, end: { x: 200, y: y + 12 }, thickness: 0.5, color: GRAY });
  page.drawText("Total:", { x: 40, y, size: 10, font: bold, color: DARK });
  page.drawText(currency(total), { x: 160, y, size: 10, font: bold, color: BLUE });
  y -= 20;

  sectionHeader("TERMS & CONDITIONS");
  const terms = [
    "1. Carrier agrees to transport the above shipment at the stated rate and pursuant to the terms of the broker-carrier agreement.",
    "2. Carrier is responsible for all loss, damage, or delay to the shipment.",
    "3. Carrier must call with check calls every 4 hours and immediately report any problems.",
    "4. Payment will be issued within 30 days of receipt of all required documents (POD, BOL, invoice).",
    "5. Carrier may not re-broker this load without prior written consent from the broker.",
  ];
  for (const term of terms) {
    const words = term.split(" ");
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      const w = font.widthOfTextAtSize(test, 8);
      if (w > width - 80 && line) {
        page.drawText(line, { x: 40, y, size: 8, font, color: GRAY });
        y -= 12;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) { page.drawText(line, { x: 40, y, size: 8, font, color: GRAY }); y -= 12; }
    y -= 2;
  }
  y -= 8;

  const sigPage = y < 120 ? doc.addPage([612, 792]) : page;
  if (y < 120) y = 792 - 60;

  sigPage.drawText("CARRIER SIGNATURE", { x: 40, y, size: 9, font: bold, color: DARK });
  sigPage.drawText("BROKER SIGNATURE", { x: width / 2, y, size: 9, font: bold, color: DARK });
  y -= 40;
  sigPage.drawLine({ start: { x: 40, y }, end: { x: 260, y }, thickness: 0.75, color: DARK });
  sigPage.drawLine({ start: { x: width / 2, y }, end: { x: width - 40, y }, thickness: 0.75, color: DARK });
  y -= 14;
  sigPage.drawText("Signature / Date", { x: 40, y, size: 8, font, color: GRAY });
  sigPage.drawText("Signature / Date", { x: width / 2, y, size: 8, font, color: GRAY });

  return doc.save();
}
