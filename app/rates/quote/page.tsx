import { Header } from "@/components/layout/header";
import { QuoteCalculator } from "@/components/rates/quote-calculator";

export default function QuotePage() {
  return (
    <>
      <Header title="Quick Quote" subtitle="Build a spot quote with margin and fuel surcharge analysis" />
      <main className="flex-1 overflow-y-auto p-6">
        <QuoteCalculator />
      </main>
    </>
  );
}
