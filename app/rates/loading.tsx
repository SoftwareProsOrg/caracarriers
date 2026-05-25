import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function RatesLoading() {
  return (
    <>
      <Header title="Rate Engine" subtitle="Lane pricing, market rates, and margin analysis" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-9 w-full animate-pulse rounded bg-muted" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-9 w-full animate-pulse rounded bg-muted" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-9 w-full animate-pulse rounded bg-muted" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-9 w-full animate-pulse rounded bg-muted" />
                </div>
              </div>
              <div className="h-9 w-full animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-7 w-20 animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4 px-4 py-3">
                    <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-40 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                    <div className="ml-auto h-3 w-16 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-12 animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
