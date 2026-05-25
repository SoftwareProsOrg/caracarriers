import {
  Package, Truck, DollarSign, FileText, TrendingUp,
  AlertTriangle, CheckCircle2, Clock, MapPin,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { LoadStatus, InvoiceStatus } from "@prisma/client";

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
  BOOKED: "secondary" as never,
  CANCELLED: "destructive",
  PROBLEM: "destructive",
};

export default async function DashboardPage() {
  const auth = await getAuthContext();

  let kpiData = { activeLoads: 0, availableCarriers: 0, mtdRevenue: 0, openInvoicesTotal: 0, openInvoicesCount: 0 };
  let recentLoads: Array<{
    id: string; loadNumber: string; originCity: string; originState: string;
    destCity: string; destState: string; status: LoadStatus;
    shipperRate: number; carrier: { name: string } | null; eta: Date | null;
  }> = [];
  let statusCounts = { inTransit: 0, dispatched: 0, available: 0, deliveredToday: 0 };
  let expiringInsurance = 0;

  if (auth) {
    const { companyId } = auth;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      activeLoadsCount,
      approvedCarriersCount,
      mtdRevenueResult,
      openInvoicesResult,
      recentLoadsData,
      inTransitCount,
      dispatchedCount,
      availableCount,
      deliveredTodayCount,
      expiringCount,
    ] = await Promise.all([
      prisma.load.count({ where: { companyId, status: { in: [LoadStatus.IN_TRANSIT, LoadStatus.DISPATCHED, LoadStatus.BOOKED] } } }),
      prisma.carrier.count({ where: { companyId, status: "APPROVED" } }),
      prisma.invoice.aggregate({ where: { companyId, status: InvoiceStatus.PAID, paidAt: { gte: startOfMonth } }, _sum: { amount: true } }),
      prisma.invoice.aggregate({ where: { companyId, status: { in: [InvoiceStatus.SENT, InvoiceStatus.OVERDUE] } }, _sum: { amount: true }, _count: true }),
      prisma.load.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { carrier: { select: { name: true } } },
      }),
      prisma.load.count({ where: { companyId, status: LoadStatus.IN_TRANSIT } }),
      prisma.load.count({ where: { companyId, status: LoadStatus.DISPATCHED } }),
      prisma.load.count({ where: { companyId, status: LoadStatus.AVAILABLE } }),
      prisma.load.count({ where: { companyId, status: LoadStatus.DELIVERED, updatedAt: { gte: startOfToday } } }),
      prisma.carrier.count({ where: { companyId, insuranceExpiry: { lte: sevenDaysOut, gte: now } } }),
    ]);

    kpiData = {
      activeLoads: activeLoadsCount,
      availableCarriers: approvedCarriersCount,
      mtdRevenue: Number(mtdRevenueResult._sum.amount ?? 0),
      openInvoicesTotal: Number(openInvoicesResult._sum.amount ?? 0),
      openInvoicesCount: openInvoicesResult._count,
    };

    recentLoads = recentLoadsData.map((l) => ({
      id: l.id,
      loadNumber: l.loadNumber,
      originCity: l.originCity,
      originState: l.originState,
      destCity: l.destCity,
      destState: l.destState,
      status: l.status,
      shipperRate: Number(l.shipperRate),
      carrier: l.carrier,
      eta: l.eta,
    }));

    statusCounts = { inTransit: inTransitCount, dispatched: dispatchedCount, available: availableCount, deliveredToday: deliveredTodayCount };
    expiringInsurance = expiringCount;
  }

  const kpis = [
    { label: "Active Loads", value: kpiData.activeLoads, change: "In transit, dispatched & booked", icon: Package, color: "text-primary", bg: "bg-primary/10" },
    { label: "Approved Carriers", value: kpiData.availableCarriers, change: "Vetted & ready to haul", icon: Truck, color: "text-success", bg: "bg-success/10" },
    { label: "Revenue (MTD)", value: formatCurrency(kpiData.mtdRevenue), change: "Month-to-date from paid invoices", icon: DollarSign, color: "text-success", bg: "bg-success/10" },
    { label: "Open Invoices", value: formatCurrency(kpiData.openInvoicesTotal), change: `${kpiData.openInvoicesCount} invoice${kpiData.openInvoicesCount !== 1 ? "s" : ""} pending`, icon: FileText, color: "text-warning", bg: "bg-warning/10" },
  ];

  return (
    <>
      <Header
        title="Dashboard"
        subtitle={new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
      />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {!auth && (
          <div className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
            Sign in to see your live data.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{kpi.value}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{kpi.change}</p>
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-base">Recent Loads</CardTitle>
                <CardDescription>Latest activity across your board</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/loads">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {recentLoads.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                  No loads yet. <Link href="/loads" className="text-primary hover:underline">Create your first load.</Link>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentLoads.map((load) => (
                    <div key={load.id} className="flex items-center gap-4 px-6 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{load.loadNumber}</span>
                          <Badge variant={STATUS_VARIANT[load.status] ?? "secondary"} className="text-[10px]">
                            {STATUS_LABEL[load.status] ?? load.status}
                          </Badge>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{load.originCity}, {load.originState}</span>
                          <span>→</span>
                          <span>{load.destCity}, {load.destState}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {load.carrier ? load.carrier.name : <span className="text-warning font-medium">No carrier assigned</span>}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold">{formatCurrency(load.shipperRate)}</p>
                        {load.eta && <p className="text-xs text-muted-foreground">ETA {load.eta.toLocaleDateString()}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Alerts</CardTitle>
              <CardDescription>Items requiring attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {expiringInsurance > 0 && (
                <div className="flex items-start gap-3 rounded-lg p-3 bg-warning/10">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <p className="text-xs leading-relaxed">{expiringInsurance} carrier insurance {expiringInsurance === 1 ? "policy" : "policies"} expiring in 7 days</p>
                </div>
              )}
              {kpiData.openInvoicesCount > 0 && (
                <div className="flex items-start gap-3 rounded-lg p-3 bg-primary/10">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-xs leading-relaxed">{kpiData.openInvoicesCount} open invoice{kpiData.openInvoicesCount !== 1 ? "s" : ""} totaling {formatCurrency(kpiData.openInvoicesTotal)}</p>
                </div>
              )}
              {expiringInsurance === 0 && kpiData.openInvoicesCount === 0 && (
                <div className="flex items-start gap-3 rounded-lg p-3 bg-success/10">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <p className="text-xs leading-relaxed">All clear — no urgent items</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "In Transit", count: statusCounts.inTransit, color: "bg-primary" },
            { label: "Dispatched", count: statusCounts.dispatched, color: "bg-warning" },
            { label: "Available", count: statusCounts.available, color: "bg-success" },
            { label: "Delivered Today", count: statusCounts.deliveredToday, color: "bg-muted-foreground" },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                <div>
                  <p className="text-xl font-bold">{item.count}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
