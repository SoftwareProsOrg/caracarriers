import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";

export default function ApiKeysLoading() {
  return (
    <>
      <Header title="API Keys" subtitle="Manage external API access" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-9 w-40 animate-pulse rounded bg-muted" />
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                </div>
                <div className="h-6 w-48 animate-pulse rounded bg-muted" />
                <div className="h-3 w-64 animate-pulse rounded bg-muted" />
              </div>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
