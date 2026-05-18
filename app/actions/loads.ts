"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { EquipmentType, LoadStatus, LoadEventType, DocumentType, DocumentStatus } from "@prisma/client";

const createLoadSchema = z.object({
  originCity: z.string().min(1, "Origin city is required"),
  originState: z.string().min(1, "Origin state is required"),
  originAddress: z.string().optional(),
  originZip: z.string().optional(),
  destCity: z.string().min(1, "Destination city is required"),
  destState: z.string().min(1, "Destination state is required"),
  destAddress: z.string().optional(),
  destZip: z.string().optional(),
  pickupDate: z.string().min(1, "Pickup date is required"),
  deliveryDate: z.string().min(1, "Delivery date is required"),
  equipmentType: z.nativeEnum(EquipmentType),
  shipperRate: z.string().min(1, "Shipper rate is required"),
  commodity: z.string().optional(),
  weight: z.string().optional(),
  notes: z.string().optional(),
});

export type LoadActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
} | null;

async function nextLoadNumber(companyId: string): Promise<string> {
  const count = await prisma.load.count({ where: { companyId } });
  return `LD-${String(count + 1).padStart(4, "0")}`;
}

export async function createLoad(prevState: LoadActionState, formData: FormData): Promise<LoadActionState> {
  const auth = await getAuthContext();
  if (!auth) return { error: "Unauthorized" };

  const raw = Object.fromEntries(formData.entries());
  const result = createLoadSchema.safeParse(raw);
  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const d = result.data;
  try {
    const loadNumber = await nextLoadNumber(auth.companyId);
    await prisma.load.create({
      data: {
        companyId: auth.companyId,
        loadNumber,
        createdById: auth.userId,
        status: LoadStatus.AVAILABLE,
        equipmentType: d.equipmentType,
        originCity: d.originCity,
        originState: d.originState,
        originAddress: d.originAddress || null,
        originZip: d.originZip || null,
        destCity: d.destCity,
        destState: d.destState,
        destAddress: d.destAddress || null,
        destZip: d.destZip || null,
        pickupDate: new Date(d.pickupDate),
        deliveryDate: new Date(d.deliveryDate),
        shipperRate: parseFloat(d.shipperRate),
        commodity: d.commodity || null,
        weight: d.weight ? parseFloat(d.weight) : null,
        notes: d.notes || null,
      },
    });
  } catch {
    return { error: "Failed to create load. Please try again." };
  }

  revalidatePath("/loads");
  revalidatePath("/load-board");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateLoadStatus(loadId: string, status: LoadStatus): Promise<{ error?: string }> {
  const auth = await getAuthContext();
  if (!auth) return { error: "Unauthorized" };

  try {
    await prisma.load.update({
      where: { id: loadId, companyId: auth.companyId },
      data: { status },
    });
    await prisma.loadEvent.create({
      data: { loadId, status },
    });
  } catch {
    return { error: "Failed to update status." };
  }

  revalidatePath("/loads");
  revalidatePath("/dispatch");
  revalidatePath("/dashboard");
  return {};
}

export async function deleteLoad(loadId: string): Promise<{ error?: string }> {
  const auth = await getAuthContext();
  if (!auth) return { error: "Unauthorized" };

  try {
    await prisma.load.delete({
      where: { id: loadId, companyId: auth.companyId },
    });
  } catch {
    return { error: "Failed to delete load." };
  }

  revalidatePath("/loads");
  revalidatePath("/dashboard");
  return {};
}

// ─── updateLoad ───────────────────────────────────────────────────────────────

const updateLoadSchema = z.object({
  originCity: z.string().min(1),
  originState: z.string().min(1),
  originAddress: z.string().optional(),
  originZip: z.string().optional(),
  destCity: z.string().min(1),
  destState: z.string().min(1),
  destAddress: z.string().optional(),
  destZip: z.string().optional(),
  pickupDate: z.string().min(1),
  pickupWindow: z.string().optional(),
  deliveryDate: z.string().min(1),
  deliveryWindow: z.string().optional(),
  equipmentType: z.nativeEnum(EquipmentType),
  shipperId: z.string().optional(),
  shipperRate: z.coerce.number().positive(),
  carrierRate: z.coerce.number().optional(),
  fuelSurcharge: z.coerce.number().optional(),
  miles: z.coerce.number().int().optional(),
  commodity: z.string().optional(),
  weight: z.coerce.number().optional(),
  bolNumber: z.string().optional(),
  poNumber: z.string().optional(),
  proNumber: z.string().optional(),
  notes: z.string().optional(),
});

export async function updateLoad(
  loadId: string,
  data: z.infer<typeof updateLoadSchema>
): Promise<{ error?: string; success?: boolean }> {
  const auth = await getAuthContext();
  if (!auth) return { error: "Unauthorized" };

  const result = updateLoadSchema.safeParse(data);
  if (!result.success) return { error: "Invalid data" };

  const d = result.data;
  try {
    await prisma.load.update({
      where: { id: loadId, companyId: auth.companyId },
      data: {
        originCity: d.originCity,
        originState: d.originState,
        originAddress: d.originAddress || null,
        originZip: d.originZip || null,
        destCity: d.destCity,
        destState: d.destState,
        destAddress: d.destAddress || null,
        destZip: d.destZip || null,
        pickupDate: new Date(d.pickupDate),
        pickupWindow: d.pickupWindow || null,
        deliveryDate: new Date(d.deliveryDate),
        deliveryWindow: d.deliveryWindow || null,
        equipmentType: d.equipmentType,
        shipperId: d.shipperId || null,
        shipperRate: d.shipperRate,
        carrierRate: d.carrierRate ?? null,
        fuelSurcharge: d.fuelSurcharge ?? null,
        miles: d.miles ?? null,
        commodity: d.commodity || null,
        weight: d.weight ?? null,
        bolNumber: d.bolNumber || null,
        poNumber: d.poNumber || null,
        proNumber: d.proNumber || null,
        notes: d.notes || null,
      },
    });
  } catch {
    return { error: "Failed to update load." };
  }

  revalidatePath(`/loads/${loadId}`);
  revalidatePath("/loads");
  revalidatePath("/dashboard");
  return { success: true };
}

// ─── advanceStatus ────────────────────────────────────────────────────────────

const STATUS_ORDER: LoadStatus[] = [
  LoadStatus.AVAILABLE,
  LoadStatus.BOOKED,
  LoadStatus.DISPATCHED,
  LoadStatus.IN_TRANSIT,
  LoadStatus.DELIVERED,
];

export async function advanceStatus(
  loadId: string,
  newStatus: LoadStatus
): Promise<{ error?: string; success?: boolean }> {
  const auth = await getAuthContext();
  if (!auth) return { error: "Unauthorized" };

  const allowed = [...STATUS_ORDER, LoadStatus.CANCELLED, LoadStatus.PROBLEM];
  if (!allowed.includes(newStatus)) return { error: "Invalid status" };

  try {
    await prisma.load.update({
      where: { id: loadId, companyId: auth.companyId },
      data: { status: newStatus },
    });
    await prisma.loadEvent.create({
      data: {
        loadId,
        status: newStatus,
        eventType: LoadEventType.STATUS_CHANGE,
        userId: auth.userId,
      },
    });

    // Auto-draft invoice when delivered
    if (newStatus === LoadStatus.DELIVERED) {
      const load = await prisma.load.findUnique({
        where: { id: loadId },
        select: { shipperId: true, shipperRate: true, companyId: true, invoice: { select: { id: true } } },
      });
      if (load?.shipperId && !load.invoice) {
        const count = await prisma.invoice.count({ where: { companyId: auth.companyId } });
        const invoiceNumber = `INV-${String(count + 1).padStart(4, "0")}`;
        const dueAt = new Date();
        dueAt.setDate(dueAt.getDate() + 30);
        await prisma.invoice.create({
          data: {
            companyId: auth.companyId,
            invoiceNumber,
            loadId,
            shipperId: load.shipperId,
            amount: load.shipperRate,
            dueAt,
          },
        });
        revalidatePath("/invoicing");
      }
    }
  } catch {
    return { error: "Failed to update status." };
  }

  revalidatePath(`/loads/${loadId}`);
  revalidatePath("/loads");
  revalidatePath("/dispatch");
  revalidatePath("/dashboard");
  return { success: true };
}

// ─── assignCarrier ────────────────────────────────────────────────────────────

export async function assignCarrier(
  loadId: string,
  carrierId: string,
  carrierRate: number
): Promise<{ error?: string; success?: boolean; emailSent?: boolean }> {
  const auth = await getAuthContext();
  if (!auth) return { error: "Unauthorized" };

  try {
    const load = await prisma.load.findUnique({
      where: { id: loadId, companyId: auth.companyId },
      select: { status: true },
    });
    if (!load) return { error: "Load not found" };

    const newStatus =
      load.status === LoadStatus.AVAILABLE ? LoadStatus.BOOKED : load.status;

    await prisma.load.update({
      where: { id: loadId, companyId: auth.companyId },
      data: { carrierId, carrierRate, status: newStatus },
    });

    await prisma.loadEvent.create({
      data: {
        loadId,
        status: newStatus,
        eventType: LoadEventType.CARRIER_ASSIGNED,
        userId: auth.userId,
        notes: `Carrier assigned at $${carrierRate.toFixed(2)}`,
      },
    });

    if (newStatus !== load.status) {
      await prisma.loadEvent.create({
        data: {
          loadId,
          status: newStatus,
          eventType: LoadEventType.STATUS_CHANGE,
          userId: auth.userId,
        },
      });
    }
  } catch {
    return { error: "Failed to assign carrier." };
  }

  // Send rate confirmation email — best-effort, non-fatal
  let emailSent = false;
  try {
    const { sendRateConfirmationEmail } = await import("@/lib/email/rate-confirmation");
    emailSent = await sendRateConfirmationEmail(loadId);
  } catch {
    // email failure is non-fatal
  }

  revalidatePath(`/loads/${loadId}`);
  revalidatePath("/loads");
  revalidatePath("/dispatch");
  revalidatePath("/dashboard");
  return { success: true, emailSent };
}

// ─── addCheckCall ─────────────────────────────────────────────────────────────

export async function addCheckCall(
  loadId: string,
  location: string,
  notes: string
): Promise<{ error?: string; success?: boolean }> {
  const auth = await getAuthContext();
  if (!auth) return { error: "Unauthorized" };

  try {
    const load = await prisma.load.findUnique({
      where: { id: loadId, companyId: auth.companyId },
      select: { id: true },
    });
    if (!load) return { error: "Load not found" };

    await prisma.$transaction([
      prisma.loadEvent.create({
        data: {
          loadId,
          eventType: LoadEventType.CHECK_CALL,
          userId: auth.userId,
          location,
          notes: notes || null,
        },
      }),
      prisma.load.update({
        where: { id: loadId },
        data: { currentLocation: location },
      }),
    ]);
  } catch {
    return { error: "Failed to log check call." };
  }

  revalidatePath(`/loads/${loadId}`);
  return { success: true };
}

// ─── addNote ──────────────────────────────────────────────────────────────────

export async function addNote(
  loadId: string,
  notes: string
): Promise<{ error?: string; success?: boolean }> {
  const auth = await getAuthContext();
  if (!auth) return { error: "Unauthorized" };

  try {
    const load = await prisma.load.findUnique({
      where: { id: loadId, companyId: auth.companyId },
      select: { id: true },
    });
    if (!load) return { error: "Load not found" };

    await prisma.loadEvent.create({
      data: {
        loadId,
        eventType: LoadEventType.NOTE,
        userId: auth.userId,
        notes,
      },
    });
  } catch {
    return { error: "Failed to add note." };
  }

  revalidatePath(`/loads/${loadId}`);
  return { success: true };
}

// ─── recordDocument ───────────────────────────────────────────────────────────

export async function recordDocument(
  loadId: string,
  type: DocumentType,
  name: string,
  fileUrl: string,
  filePath: string
): Promise<{ error?: string; success?: boolean }> {
  const auth = await getAuthContext();
  if (!auth) return { error: "Unauthorized" };

  try {
    const load = await prisma.load.findUnique({
      where: { id: loadId, companyId: auth.companyId },
      select: { id: true },
    });
    if (!load) return { error: "Load not found" };

    // Upsert: one document record per type per load
    const existing = await prisma.document.findFirst({
      where: { loadId, type, companyId: auth.companyId },
    });

    if (existing) {
      await prisma.document.update({
        where: { id: existing.id },
        data: { fileUrl, filePath, name, status: DocumentStatus.COMPLETE },
      });
    } else {
      await prisma.document.create({
        data: {
          companyId: auth.companyId,
          loadId,
          type,
          name,
          fileUrl,
          filePath,
          status: DocumentStatus.COMPLETE,
        },
      });
    }

    await prisma.loadEvent.create({
      data: {
        loadId,
        eventType: LoadEventType.DOCUMENT_UPLOADED,
        userId: auth.userId,
        notes: `${type.replace(/_/g, " ")} uploaded`,
      },
    });
  } catch {
    return { error: "Failed to record document." };
  }

  revalidatePath(`/loads/${loadId}`);
  return { success: true };
}
