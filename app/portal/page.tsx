import { redirect } from "next/navigation";
import {
  Package, TrendingUp, DollarSign, CheckCircle2, MapPin,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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

export default async function PortalDashboardPage() {
  const portalUser = await getPortalUser();
  if (!portalUser) redirect("/login");

  const { shipperId, companyId, shipper } = portalUser;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [activeLoadsCount, deliveredThisMonth, totalSpendResult, recentLoads] = await Promise.all([
    prisma.load.count({
      where: {
        companyId,
        shipperId,
        status: { in: ["IN_TRANSIT", "DISPATCHED", "BOOKED"] as any },
      },
    }),
    prisma.load.count({
      where: {
        companyId,
        shipperId,
        status: "DELIVERED" as any,
        deliveryDate: { gte: startOfMonth },
      },
    }),
    prisma.load.aggregate({
      where: { companyId, shipperId, status: "DELIVERED" as any },
      _sum: { shipperRate: true },
    }),
    prisma.load.findMany({
      where: { companyId, shipperId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { carrier: { select: { name: true } } },
    }),
  ]);

  const kpis = [
    {
      label: "Active Loads",
      value: activeLoadsCount,
      subtitle: "In transit, dispatched & booked",
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Delivered This Month",
      value: deliveredThisMonth,
      subtitle: "Completed shipments since start of month",
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Total Spend",
      value: formatCurrency(Number(totalSpendResult._sum.shipperRate ?? 0)),
      subtitle: "MTD from delivered loads",
      icon: DollarSign,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {shipper.name}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {shipper.city}{shipper.city && shipper.state ? ", " : ""}{shipper.state} &middot;{" "}
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{kpi.value}</p>
                  <div className="mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-slate-400" />
                    <p className="text-xs text-slate-500">{kpi.subtitle}</p>
                  </div>
                </div>
                <div className={`rounded-lg p-2.5 ${kpi.bg}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Recent Loads</CardTitle>
            <CardDescription>Your latest shipments</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/portal/loads">View All</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {recentLoads.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-slate-500">
              No loads yet. Check back once shipments are assigned to your account.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentLoads.map((load) => (
                <Link
                  key={load.id}
                  href={`/portal/loads/${load.id}`}
                  className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{load.loadNumber}</span>
                      <Badge variant={STATUS_VARIANT[load.status] ?? "secondary"} className="text-[10px]">
                        {STATUS_LABEL[load.status] ?? load.status}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3" />
                      <span>{load.originCity}, {load.originState}</span>
                      <span>→</span>
                      <span>{load.destCity}, {load.destState}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(Number(load.shipperRate))}</p>
                    <p className="text-xs text-slate-500">
                      {load.pickupDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {" - "}
                      {load.deliveryDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
