import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { CreateLoadDialog } from "@/components/loads/create-load-dialog";

const STATUS_LABEL: Record<string, string> = {
  IN_TRANSIT: "In Transit",
  DISPATCHED: "Dispatched",
  AVAILABLE: "Available",
  DELIVERED: "Delivered",
  BOOKED: "Booked",
  CANCELLED: "Cancelled",
  PROBLEM: "Problem",
};

const STATUS_VARIANT: Record<string, "success" | "info" | "warning" | "muted" | "destructive"> = {
  IN_TRANSIT: "info",
  DISPATCHED: "warning",
  AVAILABLE: "success",
  DELIVERED: "muted",
  BOOKED: "info",
  CANCELLED: "destructive",
  PROBLEM: "destructive",
};

export default async function LoadsPage() {
  const auth = await getAuthContext();

  const loads = auth
    ? await prisma.load.findMany({
        where: { companyId: auth.companyId },
        orderBy: { createdAt: "desc" },
        include: { carrier: { select: { name: true } } },
        take: 100,
      })
    : [];

  return (
    <>
      <Header title="Active Loads" subtitle="Track and manage all your freight loads" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{loads.length} load{loads.length !== 1 ? "s" : ""} total</p>
          <CreateLoadDialog />
        </div>

        {loads.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground mb-3">No loads yet.</p>
              <CreateLoadDialog />
            </div>
          </Card>
        ) : (
          <Card>
            <div className="divide-y divide-border">
              {loads.map((load) => {
                const variant = STATUS_VARIANT[load.status] ?? "secondary";
                const label = STATUS_LABEL[load.status] ?? load.status;
                return (
                  <Link
                    key={load.id}
                    href={`/loads/${load.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{load.loadNumber}</span>
                        <Badge variant={variant}>{label}</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{load.originCity}, {load.originState}</span>
                        <span>→</span>
                        <span>{load.destCity}, {load.destState}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {load.carrier ? load.carrier.name : <span className="text-warning font-medium">No carrier assigned</span>}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold">{formatCurrency(Number(load.shipperRate))}</p>
                      <p className="text-xs text-muted-foreground">Pickup: {load.pickupDate.toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">Delivery: {load.deliveryDate.toLocaleDateString()}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>
        )}
      </main>
    </>
  );
}
