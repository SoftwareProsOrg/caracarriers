import { Header } from "@/components/layout/header";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { getDateGroup } from "@/lib/communications/types";
import { CommunicationItem } from "@/components/communications/communication-item";
import { NewCommunicationDialog } from "@/components/communications/new-communication-dialog";
import { CommunicationFiltersWrapper } from "./filters-wrapper";

interface PageProps {
  searchParams: Promise<{
    type?: string;
    search?: string;
    load?: string;
  }>;
}

export default async function CommunicationsPage({ searchParams }: PageProps) {
  const auth = await getAuthContext();
  const { type, search, load } = await searchParams;

  if (!auth) {
    return (
      <>
        <Header title="Communications" subtitle="All load communications and messages" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="rounded-lg border border-muted bg-card p-8 text-center text-sm text-muted-foreground">
            Sign in to view communications.
          </div>
        </main>
      </>
    );
  }

  const where: Record<string, unknown> = { companyId: auth.companyId };

  if (type && type !== "") {
    where.type = type;
  }

  if (load && load.trim()) {
    where.load = { loadNumber: { contains: load.trim(), mode: "insensitive" } };
  }

  if (search && search.trim()) {
    where.OR = [
      { subject: { contains: search.trim(), mode: "insensitive" } },
      { body: { contains: search.trim(), mode: "insensitive" } },
    ];
  }

  const communications = await prisma.communication.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      load: { select: { id: true, loadNumber: true } },
    },
  });

  const grouped: Record<string, typeof communications> = {};
  for (const comm of communications) {
    const group = getDateGroup(new Date(comm.createdAt));
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(comm);
  }

  const groupOrder = ["Today", "Yesterday", "This Week", "Older"];

  return (
    <>
      <Header title="Communications" subtitle="All load communications and messages" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CommunicationFiltersWrapper
            defaultType={type ?? ""}
            defaultSearch={search ?? ""}
            defaultLoad={load ?? ""}
          />
          <NewCommunicationDialog />
        </div>

        <p className="text-sm text-muted-foreground">
          {communications.length} communication{communications.length !== 1 ? "s" : ""}
        </p>

        {communications.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">No communications found.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupOrder.map((group) => {
              const items = grouped[group];
              if (!items || items.length === 0) return null;
              return (
                <section key={group}>
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {group} ({items.length})
                  </h2>
                  <div className="space-y-2">
                    {items.map((comm) => (
                      <CommunicationItem
                        key={comm.id}
                        id={comm.id}
                        type={comm.type}
                        direction={comm.direction}
                        subject={comm.subject}
                        body={comm.body}
                        fromAddr={comm.fromAddr}
                        toAddr={comm.toAddr}
                        createdAt={comm.createdAt}
                        loadId={comm.load?.id ?? null}
                        loadNumber={comm.load?.loadNumber ?? null}
                        userFirstName={null}
                        userLastName={null}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
