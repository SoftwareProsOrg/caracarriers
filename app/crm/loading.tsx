import { Header } from "@/components/layout/header";

export default function CrmLoading() {
  return (
    <>
      <Header title="CRM" subtitle="Manage leads, deals, and sales pipeline" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-5 w-24 animate-pulse rounded bg-muted" />
          <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>

        <div className="grid grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-10 animate-pulse rounded bg-muted" />
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-28 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
