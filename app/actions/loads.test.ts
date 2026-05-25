import { describe, it, expect, vi, beforeEach } from "vitest";
import { advanceStatus, assignCarrier } from "./loads";
import { prisma } from "@/lib/prisma";
import { LoadStatus, LoadEventType } from "@prisma/client";
import { getAuthContext } from "@/lib/auth";

vi.mock("@/lib/env", () => ({
  env: {
    NODE_ENV: "test",
    NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-key",
    DATABASE_URL: "postgresql://test",
    RESEND_FROM: "test@example.com",
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
    load: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    loadEvent: {
      create: vi.fn(),
    },
    invoice: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  getAuthContext: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("app/actions/loads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("advanceStatus", () => {
    it("updates load status and creates a load event", async () => {
      const mockAuth = { userId: "user-1", companyId: "comp-1", authId: "auth-1" };
      (getAuthContext as any).mockResolvedValue(mockAuth);

      const result = await advanceStatus("load-1", LoadStatus.IN_TRANSIT);

      expect(result.success).toBe(true);
      expect(prisma.load.update).toHaveBeenCalledWith({
        where: { id: "load-1", companyId: "comp-1" },
        data: { status: LoadStatus.IN_TRANSIT },
      });
    });

    it("auto-drafts an invoice when status is changed to DELIVERED and shipperId exists", async () => {
      const mockAuth = { userId: "user-1", companyId: "comp-1", authId: "auth-1" };
      (getAuthContext as any).mockResolvedValue(mockAuth);
      
      (prisma.load.findUnique as any).mockResolvedValue({
        id: "load-1",
        shipperId: "shipper-1",
        shipperRate: 1500,
        companyId: "comp-1",
        invoice: null,
      });
      (prisma.invoice.findFirst as any).mockResolvedValue({ invoiceNumber: "INV-0010" });
      (prisma.invoice.create as any).mockResolvedValue({ id: "inv-1" });

      const result = await advanceStatus("load-1", LoadStatus.DELIVERED);

      expect(result.success).toBe(true);
      expect(prisma.invoice.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          companyId: "comp-1",
          loadId: "load-1",
          shipperId: "shipper-1",
          amount: 1500,
          invoiceNumber: "INV-0011",
        }),
      }));
    });

    it("returns unauthorized error if user is not authenticated", async () => {
      (getAuthContext as any).mockResolvedValue(null);

      const result = await advanceStatus("load-1", LoadStatus.IN_TRANSIT);

      expect(result.error).toBe("Unauthorized");
    });
  });

  describe("assignCarrier", () => {
    it("assigns a carrier to a load and updates status to BOOKED", async () => {
      const mockAuth = { userId: "user-1", companyId: "comp-1", authId: "auth-1" };
      (getAuthContext as any).mockResolvedValue(mockAuth);
      
      (prisma.load.findUnique as any).mockResolvedValue({
        id: "load-1",
        status: LoadStatus.AVAILABLE,
        companyId: "comp-1",
      });

      const result = await assignCarrier("load-1", "carrier-1", 1200);

      expect(result.success).toBe(true);
      expect(prisma.load.update).toHaveBeenCalledWith({
        where: { id: "load-1", companyId: "comp-1" },
        data: { carrierId: "carrier-1", carrierRate: 1200, status: LoadStatus.BOOKED },
      });
    });
  });
});
