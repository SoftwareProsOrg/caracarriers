import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, Plus, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const carriers = [
  { id: "CRR-001", name: "Martinez Trucking", mc: "MC-887421", dot: "DOT-2341872", equipment: ["Dry Van", "Flatbed"], insurance: "active", status: "approved", rating: 4.8, loads: 142 },
  { id: "CRR-002", name: "Swift Transport Co.", mc: "MC-445331", dot: "DOT-9921043", equipment: ["Dry Van", "Reefer"], insurance: "active", status: "approved", rating: 4.6, loads: 89 },
  { id: "CRR-003", name: "Pacific Haulers LLC", mc: "MC-112984", dot: "DOT-7734521", equipment: ["Flatbed"], insurance: "expiring", status: "approved", rating: 4.3, loads: 57 },
  { id: "CRR-004", name: "Rodriguez Freight", mc: "MC-993214", dot: "DOT-4451298", equipment: ["Dry Van"], insurance: "active", status: "approved", rating: 4.9, loads: 213 },
  { id: "CRR-005", name: "Mountain Freight Inc", mc: "MC-771203", dot: "DOT-6612934", equipment: ["Dry Van", "Flatbed", "Reefer"], insurance: "expired", status: "suspended", rating: 3.9, loads: 34 },
  { id: "CRR-006", name: "Lone Star Carriers", mc: "MC-558841", dot: "DOT-3312087", equipment: ["Dry Van"], insurance: "active", status: "pending", rating: 0, loads: 0 },
];

const insuranceConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string }> = {
  active: { label: "Active", icon: CheckCircle2, color: "text-success" },
  expiring: { label: "Expiring Soon", icon: AlertTriangle, color: "text-warning" },
  expired: { label: "Expired", icon: XCircle, color: "text-destructive" },
};

const statusVariant: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  approved: "success",
  pending: "warning",
  suspended: "destructive",
};

export default function CarriersPage() {
  return (
    <>
      <Header title="Carriers" subtitle="Manage your carrier network and compliance" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{carriers.length} carriers in network</p>
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add Carrier
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {carriers.map((carrier) => {
            const ins = insuranceConfig[carrier.insurance];
            return (
              <Card key={carrier.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar text-white">
                        <Truck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{carrier.name}</p>
                        <p className="text-xs text-muted-foreground">{carrier.mc}</p>
                      </div>
                    </div>
                    <Badge variant={statusVariant[carrier.status]}>{carrier.status}</Badge>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>DOT</span>
                      <span className="text-foreground font-medium">{carrier.dot}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Insurance</span>
                      <div className={`flex items-center gap-1 font-medium ${ins.color}`}>
                        <ins.icon className="h-3 w-3" />
                        {ins.label}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Loads completed</span>
                      <span className="text-foreground font-medium">{carrier.loads}</span>
                    </div>
                    {carrier.rating > 0 && (
                      <div className="flex items-center justify-between">
                        <span>Rating</span>
                        <span className="text-foreground font-medium">★ {carrier.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {carrier.equipment.map((eq) => (
                      <Badge key={eq} variant="secondary" className="text-[10px]">{eq}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </>
  );
}
