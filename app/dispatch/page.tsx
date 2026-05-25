import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation, MapPin, Phone } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { LoadStatus } from "@prisma/client";

export default async function DispatchPage() {
  const auth = await getAuthContext();

  const loads = auth
    ? await prisma.load.findMany({
        where: {
          companyId: auth.companyId,
          status: { in: [LoadStatus.IN_TRANSIT, LoadStatus.DISPATCHED] },
        },
        orderBy: { pickupDate: "asc" },
        include: {
          carrier: { select: { name: true, phone: true } },
        },
        take: 100,
      })
    : [];

  return (
    <>
      <Header title="Dispatch Board" subtitle="Real-time load tracking and carrier communication" />
      <main className="flex-1 overflow-y-auto p-6">
        {loads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground">No active loads in transit or dispatched.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {loads.map((load) => (
              <Card key={load.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{load.loadNumber}</span>
                        <Badge variant={load.status === LoadStatus.IN_TRANSIT ? "info" : "warning"}>
                          {load.status === LoadStatus.IN_TRANSIT ? "In Transit" : "Dispatched"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {load.originCity}, {load.originState} → {load.destCity}, {load.destState}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatCurrency(Number(load.shipperRate))}</p>
                      {load.eta && (
                        <p className="text-xs text-muted-foreground">ETA: {load.eta.toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Navigation className="h-4 w-4 text-muted-foreground" />
                      <span>{load.carrier ? load.carrier.name : <span className="text-warning font-medium">No carrier</span>}</span>
                    </div>
                    {load.carrier?.phone && (
                      <a href={`tel:${load.carrier.phone}`} className="flex items-center gap-1 text-sm text-primary hover:underline ml-auto">
                        <Phone className="h-3.5 w-3.5" />
                        {load.carrier.phone}
                      </a>
                    )}
                  </div>

                  {load.currentLocation && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Last known: {load.currentLocation}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
