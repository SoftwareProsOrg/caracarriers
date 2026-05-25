import { describe, it, expect } from "vitest";
import { formatCurrency, cn } from "./utils";

describe("lib/utils", () => {
  describe("formatCurrency", () => {
    it("formats numbers as USD currency", () => {
      expect(formatCurrency(1234.56)).toBe("$1,234.56");
      expect(formatCurrency(0)).toBe("$0.00");
    });
  });

  describe("cn", () => {
    it("merges tailwind classes correctly", () => {
      expect(cn("px-2 py-2", "p-4")).toBe("p-4");
      expect(cn("text-red-500", "bg-blue-500")).toBe("text-red-500 bg-blue-500");
    });
  });
});
