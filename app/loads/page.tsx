import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const loads = [
  { id: "LD-4821", origin: "Houston, TX", destination: "Atlanta, GA", carrier: "Martinez Trucking", status: "in_transit", rate: 2400, pickup: "2026-05-14", delivery: "2026-05-15" },
  { id: "LD-4820", origin: "Chicago, IL", destination: "Dallas, TX", carrier: "Swift Transport", status: "dispatched", rate: 3100, pickup: "2026-05-15", delivery: "2026-05-16" },
  { id: "LD-4819", origin: "Los Angeles, CA", destination: "Phoenix, AZ", carrier: "", status: "available", rate: 1800, pickup: "2026-05-15", delivery: "2026-05-15" },
  { id: "LD-4818", origin: "Miami, FL", destination: "Nashville, TN", carrier: "Rodriguez Freight", status: "delivered", rate: 2750, pickup: "2026-05-12", delivery: "2026-05-14" },
  { id: "LD-4817", origin: "Seattle, WA", destination: "Portland, OR", carrier: "Pacific Haulers", status: "in_transit", rate: 950, pickup: "2026-05-14", delivery: "2026-05-14" },
  { id: "LD-4816", origin: "Denver, CO", destination: "Kansas City, MO", carrier: "Mountain Freight", status: "dispatched", rate: 1650, pickup: "2026-05-15", delivery: "2026-05-16" },
];

const statusConfig: Record<string, { label: string; variant: "success" | "info" | "warning" | "muted" }> = {
  in_transit: { label: "In Transit", variant: "info" },
  dispatched: { label: "Dispatched", variant: "warning" },
  available: { label: "Available", variant: "success" },
  delivered: { label: "Delivered", variant: "muted" },
};

export default function LoadsPage() {
  return (
    <>
      <Header title="Active Loads" subtitle="Track and manage all your freight loads" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{loads.length} loads total</p>
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Load
          </Button>
        </div>

        <Card>
          <div className="divide-y divide-border">
            {loads.map((load) => {
              const status = statusConfig[load.status];
              return (
                <div key={load.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors cursor-pointer">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{load.id}</span>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{load.origin}</span>
                      <span>→</span>
                      <span>{load.destination}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {load.carrier || <span className="text-warning font-medium">No carrier assigned</span>}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold">{formatCurrency(load.rate)}</p>
                    <p className="text-xs text-muted-foreground">Pickup: {load.pickup}</p>
                    <p className="text-xs text-muted-foreground">Delivery: {load.delivery}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </main>
    </>
  );
}
