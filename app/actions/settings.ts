"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { log } from "@/lib/logger";

const updateCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  mcNumber: z.string().optional(),
  dotNumber: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().optional(),
});

export type UpdateCompanyState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
} | null;

export async function updateCompany(prevState: UpdateCompanyState, formData: FormData): Promise<UpdateCompanyState> {
  const auth = await getAuthContext();
  if (!auth) return { error: "Unauthorized" };

  const raw = Object.fromEntries(formData.entries());
  const result = updateCompanySchema.safeParse(raw);
  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const d = result.data;
  try {
    await prisma.company.update({
      where: { id: auth.companyId },
      data: {
        name: d.name,
        mcNumber: d.mcNumber || null,
        dotNumber: d.dotNumber || null,
        phone: d.phone || null,
        address: d.address || null,
        city: d.city || null,
        state: d.state || null,
        zip: d.zip || null,
        email: d.email || null,
        website: d.website || null,
      },
    });
  } catch (err) {
    log.error("Update company error", err as Error);
    return { error: "Failed to update company profile." };
  }

  revalidatePath("/settings");
  return { success: true };
}
