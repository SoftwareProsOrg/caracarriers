import { Header } from "@/components/layout/header";

export default function GlobalLoading() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header title="Loading..." subtitle="Fetching your data" />
      <main className="flex-1 space-y-6 overflow-y-auto p-6">
        {/* KPI Skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-96 animate-pulse rounded-lg bg-muted" />
          <div className="h-96 animate-pulse rounded-lg bg-muted" />
        </div>

        {/* Status Skeleton */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </main>
    </div>
  );
}
