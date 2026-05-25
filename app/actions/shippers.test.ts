import { describe, it, expect, vi, beforeEach } from "vitest";
import { createShipper, deleteShipper } from "./shippers";
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
    shipper: {
      create: vi.fn(),
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

describe("app/actions/shippers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createShipper", () => {
    it("creates a shipper with valid data", async () => {
      (getAuthContext as any).mockResolvedValue({ userId: "user-1", companyId: "comp-1" });

      const formData = new FormData();
      formData.append("name", "Test Shipper");
      formData.append("contactName", "John Doe");
      formData.append("email", "john@example.com");

      const result = await createShipper(null, formData);

      expect(result?.success).toBe(true);
      expect(prisma.shipper.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            companyId: "comp-1",
            name: "Test Shipper",
          }),
        })
      );
    });

    it("rejects missing shipper name", async () => {
      (getAuthContext as any).mockResolvedValue({ userId: "user-1", companyId: "comp-1" });

      const formData = new FormData();
      formData.append("name", "");

      const result = await createShipper(null, formData);

      expect(result?.fieldErrors).toBeDefined();
    });

    it("returns unauthorized if not authenticated", async () => {
      (getAuthContext as any).mockResolvedValue(null);

      const result = await createShipper(null, new FormData());

      expect(result?.error).toBe("Unauthorized");
    });
  });

  describe("deleteShipper", () => {
    it("deletes a shipper", async () => {
      (getAuthContext as any).mockResolvedValue({ userId: "user-1", companyId: "comp-1" });

      const result = await deleteShipper("shipper-1");

      expect(result).toEqual({});
      expect(prisma.shipper.delete).toHaveBeenCalledWith({
        where: { id: "shipper-1", companyId: "comp-1" },
      });
    });
  });
});
