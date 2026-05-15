"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import {
  LoadStatus, CarrierStatus, InsuranceStatus, AuthorityStatus,
  EquipmentType, InvoiceStatus, DocumentType, DocumentStatus,
} from "@prisma/client";

export async function seedDemoData(): Promise<{ error?: string; success?: boolean }> {
  const auth = await getAuthContext();
  if (!auth) return { error: "Unauthorized" };

  const { companyId, userId } = auth;

  try {
    // Carriers
    const carrier1 = await prisma.carrier.upsert({
      where: { id: "demo-carrier-001" },
      update: {},
      create: {
        id: "demo-carrier-001",
        companyId,
        name: "Martinez Trucking LLC",
        mcNumber: "MC-887421",
        dotNumber: "DOT-2341872",
        email: "dispatch@martineztrucking.com",
        phone: "(832) 555-0192",
        city: "Houston",
        state: "TX",
        status: CarrierStatus.APPROVED,
        insuranceStatus: InsuranceStatus.ACTIVE,
        authorityStatus: AuthorityStatus.ACTIVE,
        rating: 4.8,
        equipment: {
          create: [
            { type: EquipmentType.DRY_VAN },
            { type: EquipmentType.FLATBED },
          ],
        },
      },
    });

    const carrier2 = await prisma.carrier.upsert({
      where: { id: "demo-carrier-002" },
      update: {},
      create: {
        id: "demo-carrier-002",
        companyId,
        name: "Swift Transport Co.",
        mcNumber: "MC-445331",
        dotNumber: "DOT-9921043",
        email: "ops@swifttransport.com",
        phone: "(312) 555-0284",
        city: "Chicago",
        state: "IL",
        status: CarrierStatus.APPROVED,
        insuranceStatus: InsuranceStatus.ACTIVE,
        authorityStatus: AuthorityStatus.ACTIVE,
        rating: 4.6,
        equipment: { create: [{ type: EquipmentType.DRY_VAN }, { type: EquipmentType.REEFER }] },
      },
    });

    const carrier3 = await prisma.carrier.upsert({
      where: { id: "demo-carrier-003" },
      update: {},
      create: {
        id: "demo-carrier-003",
        companyId,
        name: "Pacific Haulers LLC",
        mcNumber: "MC-112984",
        dotNumber: "DOT-7734521",
        phone: "(206) 555-0451",
        city: "Seattle",
        state: "WA",
        status: CarrierStatus.APPROVED,
        insuranceStatus: InsuranceStatus.EXPIRING_SOON,
        insuranceExpiry: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        authorityStatus: AuthorityStatus.ACTIVE,
        rating: 4.3,
        equipment: { create: [{ type: EquipmentType.FLATBED }] },
      },
    });

    await prisma.carrier.upsert({
      where: { id: "demo-carrier-004" },
      update: {},
      create: {
        id: "demo-carrier-004",
        companyId,
        name: "Lone Star Carriers",
        mcNumber: "MC-558841",
        dotNumber: "DOT-3312087",
        phone: "(214) 555-0118",
        city: "Dallas",
        state: "TX",
        status: CarrierStatus.PENDING,
        insuranceStatus: InsuranceStatus.ACTIVE,
        authorityStatus: AuthorityStatus.ACTIVE,
        equipment: { create: [{ type: EquipmentType.DRY_VAN }] },
      },
    });

    // Shippers
    const shipper1 = await prisma.shipper.upsert({
      where: { id: "demo-shipper-001" },
      update: {},
      create: {
        id: "demo-shipper-001",
        companyId,
        name: "Acme Manufacturing",
        contactName: "Sarah Johnson",
        email: "s.johnson@acmemfg.com",
        phone: "(713) 555-0182",
        city: "Houston",
        state: "TX",
        creditLimit: 50000,
        paymentTerms: 30,
      },
    });

    const shipper2 = await prisma.shipper.upsert({
      where: { id: "demo-shipper-002" },
      update: {},
      create: {
        id: "demo-shipper-002",
        companyId,
        name: "Lone Star Foods",
        contactName: "Maria Garcia",
        email: "mgarcia@lsfoods.com",
        phone: "(214) 555-0391",
        city: "Dallas",
        state: "TX",
        creditLimit: 75000,
        paymentTerms: 30,
      },
    });

    await prisma.shipper.upsert({
      where: { id: "demo-shipper-003" },
      update: {},
      create: {
        id: "demo-shipper-003",
        companyId,
        name: "Gulf Coast Distributors",
        contactName: "Tom Reynolds",
        email: "treynolds@gcdist.com",
        phone: "(832) 555-0247",
        city: "Beaumont",
        state: "TX",
        creditLimit: 30000,
        paymentTerms: 30,
      },
    });

    // Loads
    const load1 = await prisma.load.upsert({
      where: { loadNumber: "LD-0001" },
      update: {},
      create: {
        id: "demo-load-001",
        companyId,
        loadNumber: "LD-0001",
        createdById: userId,
        carrierId: carrier1.id,
        shipperId: shipper1.id,
        dispatcherId: userId,
        status: LoadStatus.IN_TRANSIT,
        equipmentType: EquipmentType.DRY_VAN,
        originCity: "Houston",
        originState: "TX",
        destCity: "Atlanta",
        destState: "GA",
        pickupDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        deliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        shipperRate: 2400,
        carrierRate: 1900,
        miles: 791,
        weight: 42000,
        commodity: "General freight",
      },
    });

    const load2 = await prisma.load.upsert({
      where: { loadNumber: "LD-0002" },
      update: {},
      create: {
        id: "demo-load-002",
        companyId,
        loadNumber: "LD-0002",
        createdById: userId,
        carrierId: carrier2.id,
        shipperId: shipper2.id,
        status: LoadStatus.DISPATCHED,
        equipmentType: EquipmentType.DRY_VAN,
        originCity: "Chicago",
        originState: "IL",
        destCity: "Dallas",
        destState: "TX",
        pickupDate: new Date(),
        deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        shipperRate: 3100,
        carrierRate: 2500,
        miles: 920,
        weight: 38500,
        commodity: "Consumer goods",
      },
    });

    await prisma.load.upsert({
      where: { loadNumber: "LD-0003" },
      update: {},
      create: {
        id: "demo-load-003",
        companyId,
        loadNumber: "LD-0003",
        createdById: userId,
        shipperId: shipper1.id,
        status: LoadStatus.AVAILABLE,
        equipmentType: EquipmentType.FLATBED,
        originCity: "Houston",
        originState: "TX",
        destCity: "Memphis",
        destState: "TN",
        pickupDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        deliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        shipperRate: 2200,
        miles: 561,
        weight: 35000,
        commodity: "Steel coils",
      },
    });

    const load4 = await prisma.load.upsert({
      where: { loadNumber: "LD-0004" },
      update: {},
      create: {
        id: "demo-load-004",
        companyId,
        loadNumber: "LD-0004",
        createdById: userId,
        carrierId: carrier3.id,
        shipperId: shipper2.id,
        status: LoadStatus.DELIVERED,
        equipmentType: EquipmentType.DRY_VAN,
        originCity: "Seattle",
        originState: "WA",
        destCity: "Portland",
        destState: "OR",
        pickupDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        deliveryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        shipperRate: 950,
        carrierRate: 750,
        miles: 174,
        weight: 40000,
        commodity: "Packaged food",
      },
    });

    // Invoices
    await prisma.invoice.upsert({
      where: { invoiceNumber: "INV-0001" },
      update: {},
      create: {
        id: "demo-invoice-001",
        companyId,
        invoiceNumber: "INV-0001",
        loadId: load4.id,
        shipperId: shipper2.id,
        status: InvoiceStatus.PAID,
        amount: 950,
        dueAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.invoice.upsert({
      where: { invoiceNumber: "INV-0002" },
      update: {},
      create: {
        id: "demo-invoice-002",
        companyId,
        invoiceNumber: "INV-0002",
        loadId: load1.id,
        shipperId: shipper1.id,
        status: InvoiceStatus.SENT,
        amount: 2400,
        dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.invoice.upsert({
      where: { invoiceNumber: "INV-0003" },
      update: {},
      create: {
        id: "demo-invoice-003",
        companyId,
        invoiceNumber: "INV-0003",
        loadId: load2.id,
        shipperId: shipper2.id,
        status: InvoiceStatus.DRAFT,
        amount: 3100,
        dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Document
    await prisma.document.upsert({
      where: { id: "demo-doc-001" },
      update: {},
      create: {
        id: "demo-doc-001",
        companyId,
        loadId: load4.id,
        type: DocumentType.BOL,
        name: "Bill of Lading - LD-0004",
        status: DocumentStatus.COMPLETE,
      },
    });

    await prisma.document.upsert({
      where: { id: "demo-doc-002" },
      update: {},
      create: {
        id: "demo-doc-002",
        companyId,
        carrierId: carrier1.id,
        type: DocumentType.INSURANCE_CERTIFICATE,
        name: "Insurance Certificate - Martinez Trucking",
        status: DocumentStatus.COMPLETE,
      },
    });
  } catch (err) {
    console.error("Seed error:", err);
    return { error: "Failed to seed demo data. Some records may already exist." };
  }

  revalidatePath("/");
  return { success: true };
}

export async function clearDemoData(): Promise<{ error?: string; success?: boolean }> {
  const auth = await getAuthContext();
  if (!auth) return { error: "Unauthorized" };

  const { companyId } = auth;

  try {
    const demoIds = [
      "demo-doc-001", "demo-doc-002",
      "demo-invoice-001", "demo-invoice-002", "demo-invoice-003",
      "demo-load-001", "demo-load-002", "demo-load-003", "demo-load-004",
      "demo-carrier-001", "demo-carrier-002", "demo-carrier-003", "demo-carrier-004",
      "demo-shipper-001", "demo-shipper-002", "demo-shipper-003",
    ];

    await prisma.document.deleteMany({ where: { id: { in: demoIds }, companyId } });
    await prisma.invoice.deleteMany({ where: { id: { in: demoIds }, companyId } });
    await prisma.load.deleteMany({ where: { id: { in: demoIds }, companyId } });
    await prisma.carrier.deleteMany({ where: { id: { in: demoIds }, companyId } });
    await prisma.shipper.deleteMany({ where: { id: { in: demoIds }, companyId } });
  } catch (err) {
    console.error("Clear demo error:", err);
    return { error: "Failed to clear demo data." };
  }

  revalidatePath("/");
  return { success: true };
}
