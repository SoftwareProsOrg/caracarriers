import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";

export default function LoadsLoading() {
  return (
    <>
      <Header title="Active Loads" subtitle="Track and manage all your freight loads" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-9 w-32 animate-pulse rounded bg-muted" />
        </div>

        <Card>
          <div className="divide-y divide-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-48 animate-pulse rounded bg-muted" />
                </div>
                <div className="text-right shrink-0 space-y-2">
                  <div className="ml-auto h-4 w-20 animate-pulse rounded bg-muted" />
                  <div className="ml-auto h-3 w-24 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </>
  );
}
