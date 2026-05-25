import { describe, it, expect, vi, beforeEach } from "vitest";
import { createInvoice, markInvoicePaid, sendInvoice, deleteInvoice } from "./invoices";
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
    invoice: {
      create: vi.fn(),
      findFirst: vi.fn(),
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

describe("app/actions/invoices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createInvoice", () => {
    it("creates an invoice with valid data", async () => {
      (getAuthContext as any).mockResolvedValue({ userId: "user-1", companyId: "comp-1" });
      (prisma.invoice.findFirst as any).mockResolvedValue({ invoiceNumber: "INV-0005" });

      const formData = new FormData();
      formData.append("shipperId", "shipper-1");
      formData.append("amount", "2500");
      formData.append("dueAt", "2026-06-30");

      const result = await createInvoice(null, formData);

      expect(result?.success).toBe(true);
      expect(prisma.invoice.create).toHaveBeenCalled();
    });

    it("rejects missing shipper", async () => {
      (getAuthContext as any).mockResolvedValue({ userId: "user-1", companyId: "comp-1" });

      const formData = new FormData();
      formData.append("amount", "2500");
      formData.append("dueAt", "2026-06-30");

      const result = await createInvoice(null, formData);

      expect(result?.fieldErrors).toBeDefined();
    });

    it("returns unauthorized if not authenticated", async () => {
      (getAuthContext as any).mockResolvedValue(null);

      const result = await createInvoice(null, new FormData());

      expect(result?.error).toBe("Unauthorized");
    });
  });

  describe("markInvoicePaid", () => {
    it("marks invoice as paid", async () => {
      (getAuthContext as any).mockResolvedValue({ userId: "user-1", companyId: "comp-1" });

      const result = await markInvoicePaid("inv-1");

      expect(result).toEqual({});
      expect(prisma.invoice.update).toHaveBeenCalledWith({
        where: { id: "inv-1", companyId: "comp-1" },
        data: expect.objectContaining({ status: "PAID" }),
      });
    });
  });

  describe("sendInvoice", () => {
    it("marks invoice as sent", async () => {
      (getAuthContext as any).mockResolvedValue({ userId: "user-1", companyId: "comp-1" });

      const result = await sendInvoice("inv-1");

      expect(result).toEqual({});
      expect(prisma.invoice.update).toHaveBeenCalledWith({
        where: { id: "inv-1", companyId: "comp-1" },
        data: { status: "SENT" },
      });
    });
  });

  describe("deleteInvoice", () => {
    it("deletes an invoice", async () => {
      (getAuthContext as any).mockResolvedValue({ userId: "user-1", companyId: "comp-1" });

      const result = await deleteInvoice("inv-1");

      expect(result).toEqual({});
      expect(prisma.invoice.delete).toHaveBeenCalledWith({
        where: { id: "inv-1", companyId: "comp-1" },
      });
    });
  });
});
