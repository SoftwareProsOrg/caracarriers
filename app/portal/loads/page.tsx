import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getPortalUser } from "@/lib/portal/session";

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

export default async function PortalLoadsPage() {
  const portalUser = await getPortalUser();
  if (!portalUser) redirect("/login");

  const loads = await prisma.load.findMany({
    where: { companyId: portalUser.companyId, shipperId: portalUser.shipperId },
    orderBy: { createdAt: "desc" },
    include: { carrier: { select: { name: true } } },
    take: 100,
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Loads</h1>
        <p className="text-sm text-slate-500 mt-1">
          {loads.length} load{loads.length !== 1 ? "s" : ""} total
        </p>
      </div>

      {loads.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-slate-500">No loads assigned to your account yet.</p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="divide-y divide-slate-100">
            {loads.map((load) => {
              const variant = STATUS_VARIANT[load.status] ?? "secondary";
              const label = STATUS_LABEL[load.status] ?? load.status;
              return (
                <Link
                  key={load.id}
                  href={`/portal/loads/${load.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-slate-900">{load.loadNumber}</span>
                      <Badge variant={variant}>{label}</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{load.originCity}, {load.originState}</span>
                      <span>→</span>
                      <span>{load.destCity}, {load.destState}</span>
                    </div>
                    {load.carrier && (
                      <p className="text-xs text-slate-400 mt-0.5">Carrier: {load.carrier.name}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-slate-900">{formatCurrency(Number(load.shipperRate))}</p>
                    <p className="text-xs text-slate-500">
                      {load.pickupDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    <p className="text-xs text-slate-500">
                      {load.deliveryDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
