"use server";

import { faker } from "@faker-js/faker";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { log } from "@/lib/logger";
import {
  LoadStatus, CarrierStatus, InsuranceStatus, AuthorityStatus,
  EquipmentType, InvoiceStatus, DocumentType, DocumentStatus,
  LoadEventType, CarrierPaymentMethod,
} from "@prisma/client";

faker.seed(12345);

// ─── Helpers ──────────────────────────────────────────────────────────

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function ri(min: number, max: number) { return faker.number.int({ min, max }); }
function pick<T>(arr: readonly T[]): T { return arr[ri(0, arr.length - 1)]; }
function pickDiff<T>(arr: readonly T[], exclude?: T): T {
  const f = exclude ? arr.filter((x) => x !== exclude) : arr;
  return pick(f);
}

// ─── Data pools ───────────────────────────────────────────────────────

const CARRIER_SUFFIXES = ["Trucking", "Transport", "Logistics", "Freight", "Hauling", "Carriers", "Express", "Distribution", "Lines", "Solutions"];
const SHIPPER_SUFFIXES = ["Inc", "LLC", "Corp", "Co", "Group", "Industries", "Enterprises", "Partners", "Supply", "Distributors"];

const EQUIPMENT = Object.values(EquipmentType);

const FREIGHT_HUBS = [
  { city: "Houston", state: "TX" }, { city: "Dallas", state: "TX" }, { city: "Chicago", state: "IL" },
  { city: "Atlanta", state: "GA" }, { city: "Los Angeles", state: "CA" }, { city: "Memphis", state: "TN" },
  { city: "Savannah", state: "GA" }, { city: "Newark", state: "NJ" }, { city: "Seattle", state: "WA" },
  { city: "Denver", state: "CO" }, { city: "Phoenix", state: "AZ" }, { city: "Portland", state: "OR" },
  { city: "Indianapolis", state: "IN" }, { city: "Nashville", state: "TN" }, { city: "Charlotte", state: "NC" },
  { city: "Columbus", state: "OH" }, { city: "Kansas City", state: "MO" }, { city: "Louisville", state: "KY" },
  { city: "Jacksonville", state: "FL" }, { city: "San Antonio", state: "TX" }, { city: "Philadelphia", state: "PA" },
  { city: "Mobile", state: "AL" }, { city: "Birmingham", state: "AL" }, { city: "Cleveland", state: "OH" },
  { city: "Long Beach", state: "CA" }, { city: "St. Louis", state: "MO" }, { city: "Tampa", state: "FL" },
  { city: "Raleigh", state: "NC" }, { city: "Salt Lake City", state: "UT" }, { city: "Omaha", state: "NE" },
  { city: "Richmond", state: "VA" }, { city: "Oklahoma City", state: "OK" }, { city: "Tulsa", state: "OK" },
  { city: "Des Moines", state: "IA" }, { city: "Boulder", state: "CO" }, { city: "Oakland", state: "CA" },
  { city: "Austin", state: "TX" }, { city: "Orlando", state: "FL" }, { city: "Miami", state: "FL" },
  { city: "Detroit", state: "MI" }, { city: "Milwaukee", state: "WI" }, { city: "Minneapolis", state: "MN" },
];

const COMMODITIES = [
  "General freight", "Fresh produce", "Electronics", "Auto parts", "Lumber",
  "Steel coils", "Furniture", "Packaged food", "Chemicals", "Pharmaceuticals",
  "Building materials", "Textiles", "Machinery", "Dairy products", "Frozen food",
  "Pet supplies", "Beverages", "Paper products", "Plastic resins", "Aerospace components",
  "Medical devices", "Appliances", "Tires", "Agricultural supplies",
  "Construction equipment", "Office supplies", "Solar panels", "Wine",
  "Canned goods", "Household goods", "Industrial equipment", "Craft beer",
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

// ─── Generator: Carriers ──────────────────────────────────────────────

interface CarrierSeed {
  id: string; name: string; mcNumber: string; dotNumber: string;
  email: string; phone: string; address: string; city: string; state: string; zip: string;
  status: CarrierStatus; insuranceStatus: InsuranceStatus; insuranceExpiry?: Date;
  authorityStatus: AuthorityStatus; safetyRating?: string; rating: number; equipment: EquipmentType[];
}

function generateCarriers(count: number): CarrierSeed[] {
  const carriers: CarrierSeed[] = [];
  for (let i = 0; i < count; i++) {
    const idx = String(i + 1).padStart(3, "0");
    const lastName = faker.person.lastName();
    const suffix = pick(CARRIER_SUFFIXES);
    const st = pick(US_STATES);

    const statusRoll = Math.random();
    const status = statusRoll < 0.85 ? CarrierStatus.APPROVED
      : statusRoll < 0.93 ? CarrierStatus.PENDING
      : statusRoll < 0.98 ? CarrierStatus.SUSPENDED
      : CarrierStatus.REJECTED;

    const insRoll = Math.random();
    const insuranceStatus = insRoll < 0.80 ? InsuranceStatus.ACTIVE
      : insRoll < 0.92 ? InsuranceStatus.EXPIRING_SOON
      : InsuranceStatus.EXPIRED;

    const authRoll = Math.random();
    const authorityStatus = authRoll < 0.88 ? AuthorityStatus.ACTIVE
      : authRoll < 0.94 ? AuthorityStatus.INACTIVE
      : authRoll < 0.98 ? AuthorityStatus.SUSPENDED
      : AuthorityStatus.REVOKED;

    const safety = status === CarrierStatus.APPROVED
      ? (Math.random() < 0.7 ? "Satisfactory" : "Conditional")
      : undefined;

    const rating = status === CarrierStatus.APPROVED
      ? Number((3.0 + Math.random() * 2.0).toFixed(1))
      : 0;

    const equipCount = ri(1, 4);
    const equipment = EQUIPMENT.slice(0, equipCount);

    const numEquip = ri(1, 4);
    const shuffled = [...EQUIPMENT].sort(() => Math.random() - 0.5).slice(0, numEquip);

    carriers.push({
      id: `demo-carrier-${idx}`,
      name: `${lastName} ${suffix}`,
      mcNumber: `MC-${ri(100000, 999999)}`,
      dotNumber: `DOT-${ri(1000000, 9999999)}`,
      email: `dispatch@${lastName.toLowerCase()}${suffix.toLowerCase().replace(/\s/g, "")}.com`,
      phone: `(${ri(200, 999)}) 555-${String(ri(1000, 9999)).padStart(4, "0")}`,
      address: `${ri(100, 9999)} ${faker.location.street()}`,
      city: faker.location.city(),
      state: st,
      zip: faker.location.zipCode(),
      status,
      insuranceStatus,
      insuranceExpiry: insuranceStatus === InsuranceStatus.EXPIRING_SOON ? daysFromNow(ri(3, 45))
        : insuranceStatus === InsuranceStatus.EXPIRED ? daysAgo(ri(5, 90))
        : undefined,
      authorityStatus,
      safetyRating: safety,
      rating,
      equipment: shuffled,
    });
  }
  return carriers;
}

// ─── Generator: Shippers ──────────────────────────────────────────────

interface ShipperSeed {
  id: string; name: string; contactName: string; email: string; phone: string;
  address: string; city: string; state: string; zip: string;
  creditLimit: number; paymentTerms: number; industry: string;
}

const INDUSTRIES = [
  "Manufacturing", "Food & Beverage", "Retail", "Chemicals", "Construction",
  "Agriculture", "Automotive", "Electronics", "Pharmaceuticals", "Textiles",
  "Aerospace", "Medical", "Energy", "Steel & Metals", "Packaging",
  "Plastics", "Paper & Forest", "Wine & Spirits", "Furniture", "Appliances",
];

function generateShippers(count: number): ShipperSeed[] {
  const shippers: ShipperSeed[] = [];
  for (let i = 0; i < count; i++) {
    const idx = String(i + 1).padStart(3, "0");
    const industry = pick(INDUSTRIES);
    const companyName = `${faker.company.name()} ${pick(SHIPPER_SUFFIXES)}`;
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const st = pick(US_STATES);

    shippers.push({
      id: `demo-shipper-${idx}`,
      name: companyName,
      contactName: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      phone: `(${ri(200, 999)}) 555-${String(ri(1000, 9999)).padStart(4, "0")}`,
      address: `${ri(100, 9999)} ${faker.location.street()}`,
      city: faker.location.city(),
      state: st,
      zip: faker.location.zipCode(),
      creditLimit: pick([10000, 15000, 25000, 30000, 50000, 75000, 100000, 150000, 200000]),
      paymentTerms: pick([15, 30, 30, 30, 45, 60]),
      industry,
    });
  }
  return shippers;
}

// ─── Generator: Loads ─────────────────────────────────────────────────

interface LoadSeed {
  id: string; loadNumber: string; carrierIdx: number | null; shipperIdx: number;
  status: LoadStatus; equipmentType: EquipmentType;
  originCity: string; originState: string; destCity: string; destState: string;
  pickupDate: Date; deliveryDate: Date; shipperRate: number; carrierRate: number | null;
  miles: number; weight: number; commodity: string; hazmat?: boolean;
  pieces?: number; bolNumber?: string; poNumber?: string; proNumber?: string; notes?: string;
}

function generateLoads(count: number): LoadSeed[] {
  const loads: LoadSeed[] = [];

  const statusDistribution: { status: LoadStatus; pct: number }[] = [
    { status: LoadStatus.AVAILABLE, pct: 0.12 },
    { status: LoadStatus.BOOKED, pct: 0.10 },
    { status: LoadStatus.DISPATCHED, pct: 0.09 },
    { status: LoadStatus.IN_TRANSIT, pct: 0.14 },
    { status: LoadStatus.DELIVERED, pct: 0.45 },
    { status: LoadStatus.CANCELLED, pct: 0.07 },
    { status: LoadStatus.PROBLEM, pct: 0.03 },
  ];

  for (let i = 0; i < count; i++) {
    const idx = String(i + 1).padStart(3, "0");
    const roll = Math.random();
    let cum = 0;
    let status: LoadStatus = LoadStatus.AVAILABLE;
    for (const s of statusDistribution) {
      cum += s.pct;
      if (roll <= cum) { status = s.status; break; }
    }

    const origin = pick(FREIGHT_HUBS);
    const dest = pickDiff(FREIGHT_HUBS, origin);
    const eq = pick(EQUIPMENT);
    const miles = ri(50, 2500);
    const weight = ri(5000, 48000);
    const ratePerMile = 1.50 + Math.random() * 2.50;
    const shipperRate = Math.round(miles * ratePerMile);

    const now = new Date();
    let pickupDate: Date, deliveryDate: Date;

    switch (status) {
      case LoadStatus.IN_TRANSIT:
        pickupDate = daysAgo(ri(0, 2));
        deliveryDate = daysFromNow(ri(0, 2));
        break;
      case LoadStatus.DISPATCHED:
        pickupDate = daysFromNow(0);
        deliveryDate = daysFromNow(ri(1, 3));
        break;
      case LoadStatus.BOOKED:
        pickupDate = daysFromNow(ri(1, 3));
        deliveryDate = daysFromNow(ri(3, 7));
        break;
      case LoadStatus.AVAILABLE:
        pickupDate = daysFromNow(ri(1, 5));
        deliveryDate = daysFromNow(ri(3, 10));
        break;
      case LoadStatus.DELIVERED:
        pickupDate = daysAgo(ri(3, 60));
        deliveryDate = daysAgo(ri(1, 55));
        if (deliveryDate >= pickupDate) {
          const diff = pickupDate.getTime() - deliveryDate.getTime();
          deliveryDate = new Date(pickupDate.getTime() - diff - ri(1, 3) * 86400000);
        }
        break;
      case LoadStatus.CANCELLED:
        pickupDate = daysAgo(ri(5, 60));
        deliveryDate = daysAgo(ri(2, 55));
        break;
      case LoadStatus.PROBLEM:
        pickupDate = daysAgo(ri(0, 3));
        deliveryDate = daysFromNow(ri(0, 3));
        break;
      default:
        pickupDate = daysFromNow(ri(1, 5));
        deliveryDate = daysFromNow(ri(3, 10));
    }

    if (deliveryDate <= pickupDate) {
      deliveryDate = new Date(pickupDate.getTime() + (ri(1, 5)) * 86400000);
    }

    const assigned = status !== LoadStatus.AVAILABLE && status !== LoadStatus.CANCELLED;
    const delivered = status === LoadStatus.DELIVERED;

    const carrierRate = assigned ? Math.round(shipperRate * (0.60 + Math.random() * 0.25)) : null;
    const hazmat = Math.random() < 0.05;
    const commodity = pick(COMMODITIES);
    const pieces = eq === EquipmentType.BOX_TRUCK ? ri(1, 50) : eq === EquipmentType.FLATBED ? ri(1, 20) : ri(100, 1500);

    loads.push({
      id: `demo-load-${idx}`,
      loadNumber: `LD-${String(1000 + i + 1).slice(1)}`,
      carrierIdx: assigned ? ri(0, 59) : null,
      shipperIdx: ri(0, 324),
      status,
      equipmentType: eq,
      originCity: origin.city,
      originState: origin.state,
      destCity: dest.city,
      destState: dest.state,
      pickupDate,
      deliveryDate,
      shipperRate,
      carrierRate,
      miles,
      weight,
      commodity,
      hazmat,
      pieces,
      bolNumber: Math.random() < 0.7 ? `BOL-${String(ri(10000, 99999)).padStart(5, "0")}` : undefined,
      poNumber: Math.random() < 0.5 ? `PO-${now.getFullYear()}-${String(ri(100, 9999)).padStart(4, "0")}` : undefined,
      proNumber: Math.random() < 0.3 ? `PRO-${String(ri(100000, 999999)).padStart(6, "0")}` : undefined,
      notes: status === LoadStatus.PROBLEM ? pick([
        "Breakdown awaiting repairs", "Driver HOS violation",
        "Weather delay", "Customer refused delivery",
        "Paperwork issues at pickup",
      ]) : status === LoadStatus.CANCELLED ? pick([
        "Shipper cancelled order", "No carrier found",
        "Weather cancellation", "Customer changed plans",
      ]) : Math.random() < 0.15 ? pick([
        "Drop trailer at dock 7", "Appointment required",
        "Lumper fee applies", "Team drive preferred",
        "Live load/unload",
      ]) : undefined,
    });
  }
  return loads;
}

// ─── Event generation ─────────────────────────────────────────────────

interface EventSeed { loadIdx: number; events: { eventType: LoadEventType; status?: LoadStatus; notes?: string; location?: string; daysAgo: number }[]; }

function generateEvents(loads: LoadSeed[], count: number): EventSeed[] {
  const events: EventSeed[] = [];
  const candidates = loads
    .map((l, i) => ({ load: l, idx: i }))
    .filter(({ load }) => load.status !== LoadStatus.CANCELLED && load.status !== LoadStatus.AVAILABLE);

  const selected = candidates.sort(() => Math.random() - 0.5).slice(0, count);

  for (const { load, idx } of selected) {
    const evts: EventSeed["events"] = [];
    const pickupDays = Math.round((Date.now() - load.pickupDate.getTime()) / 86400000);

    if (load.status === LoadStatus.IN_TRANSIT || load.status === LoadStatus.DELIVERED) {
      evts.push({ eventType: LoadEventType.STATUS_CHANGE, status: LoadStatus.AVAILABLE, notes: "Load created and posted", daysAgo: pickupDays + ri(2, 5) });
      evts.push({ eventType: LoadEventType.CARRIER_ASSIGNED, status: LoadStatus.BOOKED, notes: `Carrier assigned at $${load.carrierRate?.toLocaleString() ?? "TBD"}`, daysAgo: pickupDays + ri(1, 3) });
      if (Math.random() < 0.6) evts.push({ eventType: LoadEventType.DOCUMENT_UPLOADED, notes: "Rate confirmation uploaded", daysAgo: pickupDays + ri(1, 2) });
      evts.push({ eventType: LoadEventType.STATUS_CHANGE, status: LoadStatus.DISPATCHED, notes: "Dispatched to carrier", daysAgo: pickupDays });
      evts.push({ eventType: LoadEventType.STATUS_CHANGE, status: LoadStatus.IN_TRANSIT, notes: "In transit", daysAgo: Math.max(1, pickupDays - ri(0, 1)) });
      const numCheckCalls = ri(1, 4);
      for (let c = 0; c < numCheckCalls; c++) {
        const hub = pickDiff(FREIGHT_HUBS, undefined);
        evts.push({
          eventType: LoadEventType.CHECK_CALL,
          location: `${hub.city}, ${hub.state}`,
          notes: pick(["Making good time", "Fuel stop — rolling soon", "On schedule", "Slight delay but on track", "Driver update — all good"]),
          daysAgo: Math.max(0, pickupDays - ri(0, c + 1)),
        });
      }
      if (load.status === LoadStatus.DELIVERED) {
        evts.push({ eventType: LoadEventType.STATUS_CHANGE, status: LoadStatus.DELIVERED, notes: "Delivered — POD signed", daysAgo: Math.max(0, pickupDays - ri(leadDays(load.pickupDate, load.deliveryDate), 0)) });
      }
    } else if (load.status === LoadStatus.DISPATCHED || load.status === LoadStatus.BOOKED) {
      evts.push({ eventType: LoadEventType.STATUS_CHANGE, status: LoadStatus.AVAILABLE, notes: "Load created", daysAgo: ri(2, 5) });
      if (load.status === LoadStatus.DISPATCHED) {
        evts.push({ eventType: LoadEventType.CARRIER_ASSIGNED, status: LoadStatus.BOOKED, notes: `Carrier assigned at $${load.carrierRate?.toLocaleString() ?? "TBD"}`, daysAgo: ri(1, 3) });
        evts.push({ eventType: LoadEventType.STATUS_CHANGE, status: LoadStatus.DISPATCHED, notes: "Dispatched to carrier", daysAgo: ri(0, 1) });
      } else {
        evts.push({ eventType: LoadEventType.CARRIER_ASSIGNED, status: LoadStatus.BOOKED, notes: `Carrier assigned at $${load.carrierRate?.toLocaleString() ?? "TBD"}`, daysAgo: ri(0, 2) });
      }
    } else if (load.status === LoadStatus.PROBLEM) {
      evts.push({ eventType: LoadEventType.STATUS_CHANGE, status: LoadStatus.AVAILABLE, notes: "Load created", daysAgo: ri(3, 7) });
      evts.push({ eventType: LoadEventType.CARRIER_ASSIGNED, status: LoadStatus.BOOKED, notes: `Carrier assigned at $${load.carrierRate?.toLocaleString() ?? "TBD"}`, daysAgo: ri(2, 5) });
      evts.push({ eventType: LoadEventType.STATUS_CHANGE, status: LoadStatus.DISPATCHED, notes: "Dispatched", daysAgo: ri(1, 3) });
      evts.push({ eventType: LoadEventType.STATUS_CHANGE, status: LoadStatus.IN_TRANSIT, notes: "In transit", daysAgo: ri(0, 2) });
      evts.push({ eventType: LoadEventType.NOTE, notes: load.notes ?? "Issue reported", daysAgo: ri(0, 1) });
    }

    if (evts.length > 0) events.push({ loadIdx: idx, events: evts });
  }
  return events;
}

function leadDays(pickup: Date, delivery: Date): number {
  return Math.round((delivery.getTime() - pickup.getTime()) / 86400000);
}

// ─── Invoice generation ───────────────────────────────────────────────

interface InvoiceSeed {
  id: string; invoiceNumber: string; loadIdx: number; shipperIdx: number;
  status: InvoiceStatus; amount: number; tax: number; dueAt: Date; paidAt?: Date; notes?: string;
}

function generateInvoices(loads: LoadSeed[]): InvoiceSeed[] {
  const delivered = loads.map((l, i) => ({ load: l, idx: i })).filter(({ load }) => load.status === LoadStatus.DELIVERED);
  const invoices: InvoiceSeed[] = [];

  for (const { load, idx } of delivered) {
    const invIdx = String(invoices.length + 1).padStart(3, "0");
    const daysSinceDelivery = Math.round((Date.now() - load.deliveryDate.getTime()) / 86400000);

    const statusRoll = Math.random();
    const status = daysSinceDelivery > 30 && statusRoll < 0.3 ? InvoiceStatus.OVERDUE
      : daysSinceDelivery > 14 ? (statusRoll < 0.6 ? InvoiceStatus.SENT : statusRoll < 0.9 ? InvoiceStatus.PAID : InvoiceStatus.OVERDUE)
      : daysSinceDelivery > 5 ? (statusRoll < 0.4 ? InvoiceStatus.PAID : statusRoll < 0.7 ? InvoiceStatus.SENT : InvoiceStatus.DRAFT)
      : InvoiceStatus.DRAFT;

    const dueAt = new Date(load.deliveryDate);
    dueAt.setDate(dueAt.getDate() + 30);
    const paidAt = status === InvoiceStatus.PAID ? new Date(Math.min(Date.now(), dueAt.getTime() - ri(0, 5) * 86400000)) : undefined;
    const tax = Math.round(load.shipperRate * 0.08);

    invoices.push({
      id: `demo-invoice-${invIdx}`,
      invoiceNumber: `INV-${String(1000 + invoices.length + 1).slice(1)}`,
      loadIdx: idx,
      shipperIdx: load.shipperIdx,
      status,
      amount: load.shipperRate,
      tax,
      dueAt,
      paidAt,
      notes: status === InvoiceStatus.OVERDUE ? pick(["Second notice sent", "Late fee applied", "Collections pending"]) : undefined,
    });
  }

  return invoices;
}

// ─── Payment generation ───────────────────────────────────────────────

interface PaymentSeed {
  carrierIdx: number; amount: number; method: CarrierPaymentMethod; reference: string; paidAt: Date; notes: string;
}

function generatePayments(loads: LoadSeed[]): PaymentSeed[] {
  const delivered = loads
    .map((l, i) => ({ load: l, idx: i }))
    .filter(({ load }) => load.status === LoadStatus.DELIVERED && load.carrierIdx !== null);

  return delivered.map(({ load }) => ({
    carrierIdx: load.carrierIdx!,
    amount: load.carrierRate ?? Math.round(load.shipperRate * 0.75),
    method: pick([CarrierPaymentMethod.ACH, CarrierPaymentMethod.ACH, CarrierPaymentMethod.CHECK, CarrierPaymentMethod.WIRE, CarrierPaymentMethod.FACTORING, CarrierPaymentMethod.FUEL_CARD]),
    reference: `${pick(["ACH", "CK", "WIRE", "FACT"])}-${load.deliveryDate.getFullYear()}${String(load.deliveryDate.getMonth() + 1).padStart(2, "0")}${String(load.deliveryDate.getDate()).padStart(2, "0")}-${String(ri(100, 999)).padStart(3, "0")}`,
    paidAt: new Date(load.deliveryDate.getTime() + ri(1, 14) * 86400000),
    notes: `Payment for ${load.loadNumber}`,
  }));
}

// ─── Document generation ──────────────────────────────────────────────

interface DocumentSeed {
  id: string; name: string; type: DocumentType; status: DocumentStatus; loadIdx?: number; carrierIdx?: number;
}

function generateDocuments(loads: LoadSeed[], carrierCount: number): DocumentSeed[] {
  const docs: DocumentSeed[] = [];
  let docIdx = 0;

  for (const [i, load] of loads.entries()) {
    if (load.status === LoadStatus.CANCELLED) continue;

    if (Math.random() < 0.6) {
      docIdx++;
      docs.push({
        id: `demo-doc-${String(docIdx).padStart(3, "0")}`,
        name: `Bill of Lading — ${load.loadNumber}`,
        type: DocumentType.BOL,
        status: load.status === LoadStatus.DELIVERED ? DocumentStatus.COMPLETE : DocumentStatus.PENDING_UPLOAD,
        loadIdx: i,
      });
    }

    if (load.status === LoadStatus.DELIVERED && Math.random() < 0.5) {
      docIdx++;
      docs.push({
        id: `demo-doc-${String(docIdx).padStart(3, "0")}`,
        name: `Proof of Delivery — ${load.loadNumber}`,
        type: DocumentType.POD,
        status: DocumentStatus.COMPLETE,
        loadIdx: i,
      });
    }

    if ((load.status === LoadStatus.DISPATCHED || load.status === LoadStatus.BOOKED || load.status === LoadStatus.IN_TRANSIT) && Math.random() < 0.4) {
      docIdx++;
      docs.push({
        id: `demo-doc-${String(docIdx).padStart(3, "0")}`,
        name: `Rate Confirmation — ${load.loadNumber}`,
        type: DocumentType.RATE_CONFIRMATION,
        status: DocumentStatus.COMPLETE,
        loadIdx: i,
      });
    }
  }

  for (let c = 0; c < carrierCount; c++) {
    const insRoll = Math.random();
    if (insRoll < 0.7) {
      docIdx++;
      docs.push({
        id: `demo-doc-${String(docIdx).padStart(3, "0")}`,
        name: `Insurance Certificate — Carrier ${String(c + 1).padStart(3, "0")}`,
        type: DocumentType.INSURANCE_CERTIFICATE,
        status: pick([DocumentStatus.COMPLETE, DocumentStatus.COMPLETE, DocumentStatus.COMPLETE, DocumentStatus.EXPIRING_SOON, DocumentStatus.EXPIRED]),
        carrierIdx: c,
      });
    }
    if (Math.random() < 0.5) {
      docIdx++;
      docs.push({
        id: `demo-doc-${String(docIdx).padStart(3, "0")}`,
        name: `W-9 — Carrier ${String(c + 1).padStart(3, "0")}`,
        type: DocumentType.W9,
        status: pick([DocumentStatus.COMPLETE, DocumentStatus.COMPLETE, DocumentStatus.MISSING]),
        carrierIdx: c,
      });
    }
  }

  return docs;
}

// ─── Main seed function ───────────────────────────────────────────────

export async function seedDemoData(): Promise<{ error?: string; success?: boolean }> {
  const auth = await getAuthContext();
  if (!auth) return { error: "Unauthorized" };

  const { companyId, userId } = auth;

  try {
    log.info("Seeding demo data", { companyId });

    const carrierData = generateCarriers(60);
    const shipperData = generateShippers(325);
    const loadData = generateLoads(200);
    const eventData = generateEvents(loadData, 60);
    const invoiceData = generateInvoices(loadData);
    const paymentData = generatePayments(loadData);

    log.info("Generated seed data", {
      carriers: carrierData.length,
      shippers: shipperData.length,
      loads: loadData.length,
      events: eventData.reduce((s, g) => s + g.events.length, 0),
      invoices: invoiceData.length,
      payments: paymentData.length,
    });

    // Upsert carriers
    const createdCarriers: Record<string, string> = {};
    for (const c of carrierData) {
      const carrier = await prisma.carrier.upsert({
        where: { id: c.id },
        update: {},
        create: {
          id: c.id, companyId, name: c.name,
          mcNumber: c.mcNumber, dotNumber: c.dotNumber,
          email: c.email, phone: c.phone,
          address: c.address, city: c.city, state: c.state, zip: c.zip,
          status: c.status,
          insuranceStatus: c.insuranceStatus,
          insuranceExpiry: c.insuranceExpiry ?? null,
          authorityStatus: c.authorityStatus,
          safetyRating: c.safetyRating ?? null,
          rating: c.rating,
          equipment: { create: c.equipment.map((t) => ({ type: t })) },
        },
      });
      createdCarriers[c.id] = carrier.id;
    }

    // Upsert shippers
    const createdShippers: Record<string, string> = {};
    for (const s of shipperData) {
      const shipper = await prisma.shipper.upsert({
        where: { id: s.id },
        update: {},
        create: {
          id: s.id, companyId, name: s.name,
          contactName: s.contactName, email: s.email, phone: s.phone,
          address: s.address, city: s.city, state: s.state, zip: s.zip,
          creditLimit: s.creditLimit, paymentTerms: s.paymentTerms,
        },
      });
      createdShippers[s.id] = shipper.id;
    }

    // Upsert loads
    const createdLoads: string[] = [];
    for (const l of loadData) {
      const carrierId = l.carrierIdx !== null
        ? createdCarriers[carrierData[l.carrierIdx].id]
        : null;
      const shipperId = createdShippers[shipperData[l.shipperIdx].id];
      const load = await prisma.load.upsert({
        where: { loadNumber: l.loadNumber },
        update: {},
        create: {
          id: l.id, companyId, loadNumber: l.loadNumber,
          createdById: userId, carrierId, shipperId,
          dispatcherId: userId, status: l.status,
          equipmentType: l.equipmentType,
          originCity: l.originCity, originState: l.originState,
          destCity: l.destCity, destState: l.destState,
          pickupDate: l.pickupDate, deliveryDate: l.deliveryDate,
          shipperRate: l.shipperRate, carrierRate: l.carrierRate ?? null,
          miles: l.miles, weight: l.weight, commodity: l.commodity,
          hazmat: l.hazmat ?? false, pieces: l.pieces ?? null,
          bolNumber: l.bolNumber ?? null, poNumber: l.poNumber ?? null,
          proNumber: l.proNumber ?? null, notes: l.notes ?? null,
        },
      });
      createdLoads.push(load.id);
    }

    // Create events
    for (const group of eventData) {
      const loadId = createdLoads[group.loadIdx];
      for (const ev of group.events) {
        await prisma.loadEvent.create({
          data: {
            loadId, status: ev.status ?? null, eventType: ev.eventType,
            userId, location: ev.location ?? null, notes: ev.notes ?? null,
            occurredAt: daysAgo(ev.daysAgo),
          },
        });
      }
    }

    // Upsert invoices
    for (const inv of invoiceData) {
      const loadId = createdLoads[inv.loadIdx];
      const shipperId = createdShippers[shipperData[inv.shipperIdx].id];
      await prisma.invoice.upsert({
        where: { invoiceNumber: inv.invoiceNumber },
        update: {},
        create: {
          id: inv.id, companyId, invoiceNumber: inv.invoiceNumber,
          loadId, shipperId, status: inv.status,
          amount: inv.amount, tax: inv.tax,
          dueAt: inv.dueAt, paidAt: inv.paidAt ?? null, notes: inv.notes ?? null,
        },
      });
    }

    // Create payments
    for (const pmt of paymentData) {
      const carrierId = createdCarriers[carrierData[pmt.carrierIdx].id];
      await prisma.carrierPayment.create({
        data: {
          carrierId, amount: pmt.amount, method: pmt.method,
          reference: pmt.reference, paidAt: pmt.paidAt, notes: pmt.notes,
        },
      });
    }

    // Upsert documents
    const docData = generateDocuments(loadData, carrierData.length);
    for (const doc of docData) {
      const loadId = doc.loadIdx !== undefined ? createdLoads[doc.loadIdx] : null;
      const carrierId = doc.carrierIdx !== undefined
        ? createdCarriers[carrierData[doc.carrierIdx].id]
        : null;
      await prisma.document.upsert({
        where: { id: doc.id },
        update: {},
        create: {
          id: doc.id, companyId, loadId, carrierId,
          type: doc.type, name: doc.name, status: doc.status,
        },
      });
    }

    log.info("Demo data seeded successfully", { companyId });
  } catch (err) {
    log.error("Seed error", err as Error);
    return { error: "Failed to seed demo data. Some records may already exist." };
  }

  revalidatePath("/");
  return { success: true };
}

// ─── Clear demo data ──────────────────────────────────────────────────

export async function clearDemoData(): Promise<{ error?: string; success?: boolean }> {
  const auth = await getAuthContext();
  if (!auth) return { error: "Unauthorized" };

  const { companyId } = auth;

  try {
    await prisma.document.deleteMany({ where: { id: { startsWith: "demo-" }, companyId } });
    await prisma.carrierPayment.deleteMany({ where: { carrier: { id: { startsWith: "demo-" }, companyId } } });
    await prisma.invoice.deleteMany({ where: { id: { startsWith: "demo-" }, companyId } });
    await prisma.loadEvent.deleteMany({ where: { load: { id: { startsWith: "demo-" }, companyId } } });
    await prisma.load.deleteMany({ where: { id: { startsWith: "demo-" }, companyId } });
    await prisma.carrierEquipment.deleteMany({ where: { carrier: { id: { startsWith: "demo-" }, companyId } } });
    await prisma.carrier.deleteMany({ where: { id: { startsWith: "demo-" }, companyId } });
    await prisma.shipper.deleteMany({ where: { id: { startsWith: "demo-" }, companyId } });

    log.info("Demo data cleared", { companyId });
  } catch (err) {
    log.error("Clear demo error", err as Error);
    return { error: "Failed to clear demo data." };
  }

  revalidatePath("/");
  return { success: true };
}
