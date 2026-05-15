"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { InvoiceStatus } from "@prisma/client";

const createInvoiceSchema = z.object({
  shipperId: z.string().min(1, "Shipper is required"),
  loadId: z.string().optional(),
  amount: z.string().min(1, "Amount is required"),
  dueAt: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
});

export type InvoiceActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
} | null;

async function nextInvoiceNumber(companyId: string): Promise<string> {
  const count = await prisma.invoice.count({ where: { companyId } });
  return `INV-${String(count + 1).padStart(4, "0")}`;
}

export async function createInvoice(prevState: InvoiceActionState, formData: FormData): Promise<InvoiceActionState> {
  const auth = await getAuthContext();
  if (!auth) return { error: "Unauthorized" };

  const raw = Object.fromEntries(formData.entries());
  const result = createInvoiceSchema.safeParse(raw);
  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const d = result.data;
  try {
    const invoiceNumber = await nextInvoiceNumber(auth.companyId);
    await prisma.invoice.create({
      data: {
        companyId: auth.companyId,
        invoiceNumber,
        shipperId: d.shipperId,
        loadId: d.loadId || null,
        amount: parseFloat(d.amount),
        dueAt: new Date(d.dueAt),
        status: InvoiceStatus.DRAFT,
        notes: d.notes || null,
      },
    });
  } catch {
    return { error: "Failed to create invoice. Please try again." };
  }

  revalidatePath("/invoicing");
  return { success: true };
}

export async function markInvoicePaid(invoiceId: string): Promise<{ error?: string }> {
  const auth = await getAuthContext();
  if (!auth) return { error: "Unauthorized" };

  try {
    await prisma.invoice.update({
      where: { id: invoiceId, companyId: auth.companyId },
      data: { status: InvoiceStatus.PAID, paidAt: new Date() },
    });
  } catch {
    return { error: "Failed to mark invoice as paid." };
  }

  revalidatePath("/invoicing");
  revalidatePath("/dashboard");
  return {};
}

export async function sendInvoice(invoiceId: string): Promise<{ error?: string }> {
  const auth = await getAuthContext();
  if (!auth) return { error: "Unauthorized" };

  try {
    await prisma.invoice.update({
      where: { id: invoiceId, companyId: auth.companyId },
      data: { status: InvoiceStatus.SENT },
    });
  } catch {
    return { error: "Failed to send invoice." };
  }

  revalidatePath("/invoicing");
  return {};
}

export async function deleteInvoice(invoiceId: string): Promise<{ error?: string }> {
  const auth = await getAuthContext();
  if (!auth) return { error: "Unauthorized" };

  try {
    await prisma.invoice.delete({
      where: { id: invoiceId, companyId: auth.companyId },
    });
  } catch {
    return { error: "Failed to delete invoice." };
  }

  revalidatePath("/invoicing");
  return {};
}
