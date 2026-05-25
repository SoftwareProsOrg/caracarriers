import { Header } from "@/components/layout/header";

export default function TrackingLoading() {
  return (
    <>
      <Header title="Tracking" subtitle="Real-time load tracking and visibility" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </main>
    </>
  );
}
