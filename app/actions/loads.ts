"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { EquipmentType, LoadStatus } from "@prisma/client";

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
