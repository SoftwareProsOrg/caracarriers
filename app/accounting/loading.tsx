import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";

export default function AccountingLoading() {
  return (
    <>
      <Header title="Accounting" subtitle="Financial automation and integrations" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <div className="p-4 space-y-2">
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                <div className="h-7 w-28 animate-pulse rounded bg-muted" />
              </div>
            </Card>
          ))}
        </div>

        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 w-40 animate-pulse rounded bg-muted" />
          ))}
        </div>

        <Card>
          <div className="divide-y divide-border">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-48 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="p-4 space-y-2">
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                <div className="h-5 w-36 animate-pulse rounded bg-muted" />
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              </div>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
