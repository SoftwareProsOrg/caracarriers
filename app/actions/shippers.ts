"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

const createShipperSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  contactName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  creditLimit: z.string().optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
});

export type ShipperActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
} | null;

export async function createShipper(prevState: ShipperActionState, formData: FormData): Promise<ShipperActionState> {
  const auth = await getAuthContext();
  if (!auth) return { error: "Unauthorized" };

  const raw = Object.fromEntries(formData.entries());
  const result = createShipperSchema.safeParse(raw);
  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const d = result.data;
  try {
    await prisma.shipper.create({
      data: {
        companyId: auth.companyId,
        name: d.name,
        contactName: d.contactName || null,
        email: d.email || null,
        phone: d.phone || null,
        address: d.address || null,
        city: d.city || null,
        state: d.state || null,
        zip: d.zip || null,
        creditLimit: d.creditLimit ? parseFloat(d.creditLimit) : null,
        paymentTerms: d.paymentTerms ? parseInt(d.paymentTerms) : 30,
        notes: d.notes || null,
      },
    });
  } catch {
    return { error: "Failed to add shipper. Please try again." };
  }

  revalidatePath("/shippers");
  return { success: true };
}

export async function deleteShipper(shipperId: string): Promise<{ error?: string }> {
  const auth = await getAuthContext();
  if (!auth) return { error: "Unauthorized" };

  try {
    await prisma.shipper.delete({
      where: { id: shipperId, companyId: auth.companyId },
    });
  } catch {
    return { error: "Failed to delete shipper." };
  }

  revalidatePath("/shippers");
  return {};
}
