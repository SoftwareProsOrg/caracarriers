import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { log } from "@/lib/logger";
import { generateApiKey, hashApiKey, maskApiKey } from "@/lib/api-keys";

export async function GET() {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const keys = await prisma.apiKey.findMany({
      where: { companyId: auth.companyId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        key: true,
        permissions: true,
        lastUsedAt: true,
        expiresAt: true,
        isActive: true,
        createdAt: true,
      },
      take: 100,
    });

    const masked = keys.map((k) => ({
      ...k,
      maskedKey: maskApiKey(k.key),
    }));

    return NextResponse.json(masked);
  } catch (err) {
    log.error("Error fetching API keys", err as Error);
    return NextResponse.json({ error: "Failed to fetch API keys" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, permissions, expiresInDays } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const validPermissions = ["read", "write", "admin"];
    const perms = validPermissions.includes(permissions) ? permissions : "read";

    const rawKey = generateApiKey();
    const hashedKey = hashApiKey(rawKey);

    let expiresAt: Date | undefined;
    if (expiresInDays && typeof expiresInDays === "number") {
      expiresAt = new Date(Date.now() + expiresInDays * 86400000);
    }

    const apiKey = await prisma.apiKey.create({
      data: {
        companyId: auth.companyId,
        name,
        key: hashedKey,
        permissions: perms,
        expiresAt,
      },
    });

    log.info("API key created", {
      keyId: apiKey.id,
      name,
      companyId: auth.companyId,
    });

    return NextResponse.json(
      {
        id: apiKey.id,
        name: apiKey.name,
        key: rawKey,
        maskedKey: maskApiKey(rawKey),
        permissions: apiKey.permissions,
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt,
        warning: "Save this key securely. It will not be shown again.",
      },
      { status: 201 }
    );
  } catch (err) {
    log.error("Error creating API key", err as Error);
    return NextResponse.json({ error: "Failed to create API key" }, { status: 500 });
  }
}
