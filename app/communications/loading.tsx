export default function CommunicationsLoading() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
        <div>
          <div className="h-5 w-36 animate-pulse rounded bg-muted" />
          <div className="mt-1 h-3 w-52 animate-pulse rounded bg-muted" />
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-48 animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-40 animate-pulse rounded-md bg-muted" />
          <div className="ml-auto h-9 w-40 animate-pulse rounded-md bg-muted" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </main>
    </div>
  );
}
