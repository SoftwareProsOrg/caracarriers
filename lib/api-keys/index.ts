import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";

const KEY_PREFIX = "sk_";
const KEY_LENGTH = 48;

export function generateApiKey(): string {
  const random = randomBytes(KEY_LENGTH).toString("base64url");
  return `${KEY_PREFIX}${random}`;
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function maskApiKey(key: string): string {
  if (key.length <= 8) return "sk-...";
  const prefix = key.startsWith("sk_") ? "sk_" : key.slice(0, 3);
  const lastFour = key.slice(-4);
  return `${prefix}...${lastFour}`;
}

export async function validateApiKey(key: string): Promise<{
  valid: boolean;
  companyId?: string;
  permissions?: string;
  keyId?: string;
}> {
  const hashed = hashApiKey(key);

  const record = await prisma.apiKey.findUnique({
    where: { key: hashed },
    select: {
      id: true,
      companyId: true,
      permissions: true,
      isActive: true,
      expiresAt: true,
    },
  });

  if (!record) return { valid: false };
  if (!record.isActive) return { valid: false };
  if (record.expiresAt && record.expiresAt < new Date()) return { valid: false };

  await prisma.apiKey.update({
    where: { id: record.id },
    data: { lastUsedAt: new Date() },
  });

  return {
    valid: true,
    companyId: record.companyId,
    permissions: record.permissions,
    keyId: record.id,
  };
}
