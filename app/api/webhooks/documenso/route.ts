import { type NextRequest } from "next/server";
import { createHmac } from "crypto";
import { env } from "@/lib/env";
import { log } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

interface WebhookSigner {
  name: string;
  email: string;
  signingStatus: string;
}

interface WebhookDocument {
  id: number;
  title: string;
  status: string;
  signers?: WebhookSigner[];
}

interface DocumensoWebhookPayload {
  event: string;
  document: WebhookDocument;
  createdAt: string;
}

function verifySignature(
  body: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;

  const expected = createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  // Constant-time comparison to prevent timing attacks
  if (expected.length !== signature.length) return false;

  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function POST(request: NextRequest): Promise<Response> {
  const secret = env.DOCUMENSO_WEBHOOK_SECRET;

  if (!secret) {
    log.error("[documenso webhook] DOCUMENSO_WEBHOOK_SECRET is not set");
    return new Response("Server misconfiguration", { status: 500 });
  }

  let body: string;
  try {
    body = await request.text();
  } catch {
    return new Response("Failed to read request body", { status: 400 });
  }

  const signature = request.headers.get("x-documenso-signature");

  if (!verifySignature(body, signature, secret)) {
    log.warn("[documenso webhook] Invalid signature — request rejected");
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: DocumensoWebhookPayload;
  try {
    payload = JSON.parse(body) as DocumensoWebhookPayload;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const { event, document } = payload;
  log.info(`[documenso webhook] Received event: ${event}`, {
    documentId: document?.id,
    documentTitle: document?.title,
    documentStatus: document?.status,
  });

  if (event === "document.completed") {
    log.info(
      `[documenso webhook] Document ${document.id} completed. Signers:`,
      { signers: document.signers?.map((s) => ({
        name: s.name,
        email: s.email,
        status: s.signingStatus,
      })) ?? [] }
    );
    try {
      await prisma.document.updateMany({
        where: { documensoId: document.id },
        data: { signingStatus: "SIGNED" },
      });
      log.info(`[documenso webhook] DB updated: document ${document.id} signingStatus → SIGNED`);
    } catch (err) {
      log.error(`[documenso webhook] Failed to update DB for document ${document.id}:`, err as Error);
    }
  }

  if (event === "document.declined") {
    log.info(
      `[documenso webhook] Document ${document.id} was declined.`,
      { signers: document.signers }
    );
    try {
      await prisma.document.updateMany({
        where: { documensoId: document.id },
        data: { signingStatus: "DECLINED" },
      });
      log.info(`[documenso webhook] DB updated: document ${document.id} signingStatus → DECLINED`);
    } catch (err) {
      log.error(`[documenso webhook] Failed to update DB for document ${document.id}:`, err as Error);
    }
  }

  return new Response("OK", { status: 200 });
}
