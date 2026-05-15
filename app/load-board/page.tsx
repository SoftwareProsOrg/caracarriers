import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { LoadStatus } from "@prisma/client";
import { CreateLoadDialog } from "@/components/loads/create-load-dialog";

const EQUIPMENT_LABEL: Record<string, string> = {
  DRY_VAN: "Dry Van",
  FLATBED: "Flatbed",
  REEFER: "Reefer",
  STEP_DECK: "Step Deck",
  LOWBOY: "Lowboy",
  TANKER: "Tanker",
  BOX_TRUCK: "Box Truck",
  POWER_ONLY: "Power Only",
  OTHER: "Other",
};

export default async function LoadBoardPage() {
  const auth = await getAuthContext();

  const loads = auth
    ? await prisma.load.findMany({
        where: { companyId: auth.companyId, status: LoadStatus.AVAILABLE },
        orderBy: { pickupDate: "asc" },
      })
    : [];

  return (
    <>
      <Header title="Load Board" subtitle="Post and find available freight" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{loads.length} load{loads.length !== 1 ? "s" : ""} available</p>
          <CreateLoadDialog />
        </div>

        {loads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground mb-3">No available loads posted.</p>
            <CreateLoadDialog />
          </div>
        ) : (
          <div className="space-y-3">
            {loads.map((load) => (
              <Card key={load.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{load.loadNumber}</span>
                      <Badge variant="secondary">{EQUIPMENT_LABEL[load.equipmentType] ?? load.equipmentType}</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {load.originCity}, {load.originState} → {load.destCity}, {load.destState}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {load.weight ? `${Number(load.weight).toLocaleString()} lbs · ` : ""}
                      {load.miles ? `${load.miles} mi · ` : ""}
                      Pickup {load.pickupDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold">{formatCurrency(Number(load.shipperRate))}</p>
                    {load.miles && (
                      <p className="text-xs text-muted-foreground">{(Number(load.shipperRate) / load.miles).toFixed(2)}/mi</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
