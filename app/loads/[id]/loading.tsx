import { Header } from "@/components/layout/header";

export default function LoadDetailLoading() {
  return (
    <>
      <Header title="Loading Load..." subtitle="Fetching shipment details" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 animate-pulse rounded-lg bg-muted" />
            <div className="h-64 animate-pulse rounded-lg bg-muted" />
            <div className="h-64 animate-pulse rounded-lg bg-muted" />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="h-32 animate-pulse rounded-lg bg-muted" />
            <div className="h-48 animate-pulse rounded-lg bg-muted" />
            <div className="h-64 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      </main>
    </>
  );
}
