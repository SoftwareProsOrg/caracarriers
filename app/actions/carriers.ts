"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { CarrierStatus, AuthorityStatus, InsuranceStatus } from "@prisma/client";

const createCarrierSchema = z.object({
  name: z.string().min(1, "Carrier name is required"),
  mcNumber: z.string().optional(),
  dotNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  notes: z.string().optional(),
});

export type CarrierActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
} | null;

export async function createCarrier(prevState: CarrierActionState, formData: FormData): Promise<CarrierActionState> {
  const auth = await getAuthContext();
  if (!auth) return { error: "Unauthorized" };

  const raw = Object.fromEntries(formData.entries());
  const result = createCarrierSchema.safeParse(raw);
  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const d = result.data;
  try {
    await prisma.carrier.create({
      data: {
        companyId: auth.companyId,
        name: d.name,
        mcNumber: d.mcNumber || null,
        dotNumber: d.dotNumber || null,
        email: d.email || null,
        phone: d.phone || null,
        address: d.address || null,
        city: d.city || null,
        state: d.state || null,
        zip: d.zip || null,
        notes: d.notes || null,
        status: CarrierStatus.PENDING,
        insuranceStatus: InsuranceStatus.ACTIVE,
        authorityStatus: AuthorityStatus.ACTIVE,
      },
    });
  } catch {
    return { error: "Failed to add carrier. Please try again." };
  }

  revalidatePath("/carriers");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function approveCarrier(carrierId: string): Promise<{ error?: string }> {
  const auth = await getAuthContext();
  if (!auth) return { error: "Unauthorized" };

  try {
    await prisma.carrier.update({
      where: { id: carrierId, companyId: auth.companyId },
      data: { status: CarrierStatus.APPROVED },
    });
  } catch {
    return { error: "Failed to approve carrier." };
  }

  revalidatePath("/carriers");
  return {};
}

export async function deleteCarrier(carrierId: string): Promise<{ error?: string }> {
  const auth = await getAuthContext();
  if (!auth) return { error: "Unauthorized" };

  try {
    await prisma.carrier.delete({
      where: { id: carrierId, companyId: auth.companyId },
    });
  } catch {
    return { error: "Failed to delete carrier." };
  }

  revalidatePath("/carriers");
  return {};
}
