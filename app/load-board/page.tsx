import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Package, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const availableLoads = [
  { id: "LD-4819", origin: "Los Angeles, CA", destination: "Phoenix, AZ", equipment: "Dry Van", weight: "42,000 lbs", rate: 1800, pickup: "2026-05-15", miles: 372 },
  { id: "LD-4822", origin: "Dallas, TX", destination: "Memphis, TN", equipment: "Flatbed", weight: "38,500 lbs", rate: 2200, pickup: "2026-05-16", miles: 451 },
  { id: "LD-4823", origin: "Atlanta, GA", destination: "Charlotte, NC", equipment: "Dry Van", weight: "44,000 lbs", rate: 1450, pickup: "2026-05-15", miles: 245 },
  { id: "LD-4824", origin: "Kansas City, MO", destination: "St. Louis, MO", equipment: "Reefer", weight: "35,000 lbs", rate: 980, pickup: "2026-05-16", miles: 248 },
  { id: "LD-4825", origin: "Phoenix, AZ", destination: "Las Vegas, NV", equipment: "Dry Van", weight: "40,000 lbs", rate: 1100, pickup: "2026-05-15", miles: 297 },
];

export default function LoadBoardPage() {
  return (
    <>
      <Header title="Load Board" subtitle="Post and find available freight" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{availableLoads.length} loads available</p>
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Post Load
          </Button>
        </div>
        <div className="space-y-3">
          {availableLoads.map((load) => (
            <Card key={load.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{load.id}</span>
                    <Badge variant="secondary">{load.equipment}</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {load.origin} → {load.destination}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{load.weight} · {load.miles} mi · Pickup {load.pickup}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold">{formatCurrency(load.rate)}</p>
                  <p className="text-xs text-muted-foreground">{(load.rate / load.miles).toFixed(2)}/mi</p>
                  <Button size="sm" className="mt-2">Assign Carrier</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
