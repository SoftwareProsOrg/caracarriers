"use server";

import { sendDocument, type SignerRole } from "@/lib/documenso";

export interface SendForSignatureInput {
  documentId: number;
  signerName: string;
  signerEmail: string;
  signerRole: SignerRole;
}

export interface SendForSignatureResult {
  success: boolean;
  error?: string;
}

export async function sendForSignature(
  input: SendForSignatureInput
): Promise<SendForSignatureResult> {
  const { documentId, signerName, signerEmail, signerRole } = input;

  try {
    await sendDocument(documentId, [
      { name: signerName, email: signerEmail, role: signerRole },
    ]);

    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    console.error("[sendForSignature] error:", message);
    return { success: false, error: message };
  }
}
