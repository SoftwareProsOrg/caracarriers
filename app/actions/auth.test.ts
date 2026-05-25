import { describe, it, expect, vi, beforeEach } from "vitest";
import { signup } from "./auth";

vi.mock("@/lib/env", () => ({
  env: {
    NODE_ENV: "test",
    NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-key",
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
    company: { create: vi.fn() },
    user: { create: vi.fn() },
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: vi.fn(),
    },
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("app/actions/auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("signup", () => {
    it("restricts registration to @caracarriers.com addresses", async () => {
      const formData = new FormData();
      formData.append("firstName", "John");
      formData.append("lastName", "Doe");
      formData.append("company", "Test Co");
      formData.append("email", "john@gmail.com");
      formData.append("password", "password123");

      const result = await signup(null, formData);

      expect(result?.error).toContain("restricted to @caracarriers.com");
    });
  });
});
