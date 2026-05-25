import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCarrier, approveCarrier, deleteCarrier } from "./carriers";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

vi.mock("@/lib/env", () => ({
  env: {
    NODE_ENV: "test",
    NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-key",
    DATABASE_URL: "postgresql://test",
  },
}));

vi.mock("@/lib/logger", () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    carrier: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  getAuthContext: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("app/actions/carriers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createCarrier", () => {
    it("creates a carrier with valid data", async () => {
      (getAuthContext as any).mockResolvedValue({ userId: "user-1", companyId: "comp-1" });

      const formData = new FormData();
      formData.append("name", "Test Carrier");
      formData.append("mcNumber", "MC-123456");
      formData.append("dotNumber", "DOT-1234567");

      const result = await createCarrier(null, formData);

      expect(result?.success).toBe(true);
      expect(prisma.carrier.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            companyId: "comp-1",
            name: "Test Carrier",
          }),
        })
      );
    });

    it("rejects missing carrier name", async () => {
      (getAuthContext as any).mockResolvedValue({ userId: "user-1", companyId: "comp-1" });

      const formData = new FormData();
      formData.append("name", "");

      const result = await createCarrier(null, formData);

      expect(result?.fieldErrors).toBeDefined();
    });

    it("returns unauthorized if not authenticated", async () => {
      (getAuthContext as any).mockResolvedValue(null);

      const result = await createCarrier(null, new FormData());

      expect(result?.error).toBe("Unauthorized");
    });
  });

  describe("approveCarrier", () => {
    it("updates carrier status to APPROVED", async () => {
      (getAuthContext as any).mockResolvedValue({ userId: "user-1", companyId: "comp-1" });

      const result = await approveCarrier("carrier-1");

      expect(result).toEqual({});
      expect(prisma.carrier.update).toHaveBeenCalledWith({
        where: { id: "carrier-1", companyId: "comp-1" },
        data: { status: "APPROVED" },
      });
    });

    it("returns unauthorized if not authenticated", async () => {
      (getAuthContext as any).mockResolvedValue(null);

      const result = await approveCarrier("carrier-1");

      expect(result?.error).toBe("Unauthorized");
    });
  });

  describe("deleteCarrier", () => {
    it("deletes a carrier", async () => {
      (getAuthContext as any).mockResolvedValue({ userId: "user-1", companyId: "comp-1" });

      const result = await deleteCarrier("carrier-1");

      expect(result).toEqual({});
      expect(prisma.carrier.delete).toHaveBeenCalledWith({
        where: { id: "carrier-1", companyId: "comp-1" },
      });
    });
  });
});
