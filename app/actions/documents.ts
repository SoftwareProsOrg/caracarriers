"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { log } from "@/lib/logger";
import { DocumentType, DocumentStatus } from "@prisma/client";

export async function uploadDocument(
  prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean } | null> {
  const auth = await getAuthContext();
  if (!auth) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const type = formData.get("type") as DocumentType;
  const fileUrl = formData.get("fileUrl") as string;
  const filePath = formData.get("filePath") as string;
  const loadId = formData.get("loadId") as string | null;
  const carrierId = formData.get("carrierId") as string | null;

  if (!name || !type || !fileUrl || !filePath) {
    return { error: "Missing required fields" };
  }

  try {
    await prisma.document.create({
      data: {
        companyId: auth.companyId,
        loadId: loadId || null,
        carrierId: carrierId || null,
        type,
        name,
        fileUrl,
        filePath,
        status: DocumentStatus.COMPLETE,
      },
    });
  } catch (err) {
    log.error("Failed to upload document", err as Error);
    return { error: "Failed to save document record." };
  }

  revalidatePath("/documents");
  return { success: true };
}
