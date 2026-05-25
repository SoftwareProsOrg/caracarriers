import { Header } from "@/components/layout/header";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { LoadStatus } from "@prisma/client";
import { ActiveLoadsGrid } from "@/components/tracking/active-loads-grid";

export default async function TrackingPage() {
  const auth = await getAuthContext();

  const loads = auth
    ? await prisma.load.findMany({
        where: {
          companyId: auth.companyId,
          status: { in: [LoadStatus.IN_TRANSIT, LoadStatus.DISPATCHED] },
        },
        orderBy: { updatedAt: "desc" },
        include: {
          carrier: { select: { name: true, phone: true } },
          trackingEvents: {
            orderBy: { recordedAt: "desc" },
            take: 1,
          },
        },
        take: 100,
      })
    : [];

  const activeLoads = loads.map((load) => ({
    id: load.id,
    loadNumber: load.loadNumber,
    status: load.status,
    originCity: load.originCity,
    originState: load.originState,
    destCity: load.destCity,
    destState: load.destState,
    currentLocation: load.currentLocation,
    eta: load.eta?.toISOString() ?? null,
    carrierName: load.carrier?.name ?? null,
    carrierPhone: load.carrier?.phone ?? null,
    latestEvent: load.trackingEvents[0]
      ? {
          latitude: load.trackingEvents[0].latitude,
          longitude: load.trackingEvents[0].longitude,
          speed: load.trackingEvents[0].speed,
          locationName: load.trackingEvents[0].locationName,
          recordedAt: load.trackingEvents[0].recordedAt.toISOString(),
          source: load.trackingEvents[0].source,
        }
      : null,
  }));

  return (
    <>
      <Header title="Tracking" subtitle="Real-time load tracking and visibility" />
      <main className="flex-1 overflow-y-auto p-6">
        {activeLoads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground">No active loads being tracked.</p>
          </div>
        ) : (
          <ActiveLoadsGrid loads={activeLoads} />
        )}
      </main>
    </>
  );
}
