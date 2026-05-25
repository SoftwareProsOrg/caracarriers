import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { log } from "@/lib/logger";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, permissions } = body;

    const existing = await prisma.apiKey.findFirst({
      where: { id, companyId: auth.companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (permissions !== undefined) {
      const valid = ["read", "write", "admin"];
      if (!valid.includes(permissions)) {
        return NextResponse.json({ error: "Invalid permissions" }, { status: 400 });
      }
      updateData.permissions = permissions;
    }

    const updated = await prisma.apiKey.update({
      where: { id },
      data: updateData,
    });

    log.info("API key updated", {
      keyId: id,
      updates: Object.keys(updateData),
      companyId: auth.companyId,
    });

    return NextResponse.json(updated);
  } catch (err) {
    log.error("Error updating API key", err as Error);
    return NextResponse.json({ error: "Failed to update API key" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.apiKey.findFirst({
      where: { id, companyId: auth.companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    await prisma.apiKey.update({
      where: { id },
      data: { isActive: false },
    });

    log.info("API key deactivated", { keyId: id, companyId: auth.companyId });

    return NextResponse.json({ success: true });
  } catch (err) {
    log.error("Error deleting API key", err as Error);
    return NextResponse.json({ error: "Failed to delete API key" }, { status: 500 });
  }
}
