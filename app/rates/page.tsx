import { Header } from "@/components/layout/header";
import { LaneSearch } from "@/components/rates/lane-search";

export default function RatesPage() {
  return (
    <>
      <Header title="Rate Engine" subtitle="Lane pricing, market rates, and margin analysis" />
      <main className="flex-1 overflow-y-auto p-6">
        <LaneSearch />
      </main>
    </>
  );
}
