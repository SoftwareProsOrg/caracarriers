import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { CreateCarrierDialog } from "@/components/carriers/create-carrier-dialog";

const insuranceConfig = {
  ACTIVE: { label: "Active", icon: CheckCircle2, color: "text-success" },
  EXPIRING_SOON: { label: "Expiring Soon", icon: AlertTriangle, color: "text-warning" },
  EXPIRED: { label: "Expired", icon: XCircle, color: "text-destructive" },
} as const;

const statusVariant: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  APPROVED: "success",
  PENDING: "warning",
  SUSPENDED: "destructive",
  REJECTED: "destructive",
};

export default async function CarriersPage() {
  const auth = await getAuthContext();

  const carriers = auth
    ? await prisma.carrier.findMany({
        where: { companyId: auth.companyId },
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { loads: true } },
          equipment: true,
        },
      })
    : [];

  return (
    <>
      <Header title="Carriers" subtitle="Manage your carrier network and compliance" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{carriers.length} carrier{carriers.length !== 1 ? "s" : ""} in network</p>
          <CreateCarrierDialog />
        </div>

        {carriers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground mb-3">No carriers yet.</p>
            <CreateCarrierDialog />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {carriers.map((carrier) => {
              const ins = insuranceConfig[carrier.insuranceStatus] ?? insuranceConfig.ACTIVE;
              const InsIcon = ins.icon;
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
                          <p className="text-xs text-muted-foreground">{carrier.mcNumber ?? "No MC#"}</p>
                        </div>
                      </div>
                      <Badge variant={statusVariant[carrier.status] ?? "secondary"} className="capitalize">
                        {carrier.status.toLowerCase()}
                      </Badge>
                    </div>

                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      {carrier.dotNumber && (
                        <div className="flex items-center justify-between">
                          <span>DOT</span>
                          <span className="text-foreground font-medium">{carrier.dotNumber}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span>Insurance</span>
                        <div className={`flex items-center gap-1 font-medium ${ins.color}`}>
                          <InsIcon className="h-3 w-3" />
                          {ins.label}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Loads completed</span>
                        <span className="text-foreground font-medium">{carrier._count.loads}</span>
                      </div>
                      {carrier.rating && (
                        <div className="flex items-center justify-between">
                          <span>Rating</span>
                          <span className="text-foreground font-medium">★ {Number(carrier.rating).toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {carrier.equipment.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {carrier.equipment.map((eq) => (
                          <Badge key={eq.id} variant="secondary" className="text-[10px]">
                            {eq.type.replace(/_/g, " ")}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
