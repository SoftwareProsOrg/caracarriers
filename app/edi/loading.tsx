import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";

export default function EdiLoading() {
  return (
    <>
      <Header title="EDI Connectivity" subtitle="Electronic Data Interchange with enterprise customers" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <div className="flex items-center gap-4 p-5">
                <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
                <div className="space-y-2">
                  <div className="h-7 w-12 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-9 w-44 animate-pulse rounded bg-muted" />
        </div>

        <Card>
          <div className="divide-y divide-border">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </>
  );
}
