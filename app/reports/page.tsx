import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, TrendingUp, DollarSign, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

export default async function ReportsPage() {
  const auth = await getAuthContext();

  let monthlyRevenue: { month: string; revenue: number }[] = [];
  let topLanes: { origin: string; destination: string; loads: number; revenue: number; avgRate: number }[] = [];
  let mtdRevenue = 0;
  let mtdLoads = 0;
  let avgLoadRate = 0;
  let avgMargin = 0;

  if (auth) {
    const { companyId } = auth;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    // Monthly revenue from paid invoices (last 7 months)
    const paidInvoices = await prisma.invoice.findMany({
      where: {
        companyId,
        status: "PAID",
        paidAt: { gte: sixMonthsAgo },
      },
      select: { amount: true, paidAt: true },
    });

    const monthMap = new Map<string, number>();
    for (const inv of paidInvoices) {
      if (!inv.paidAt) continue;
      const key = inv.paidAt.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      monthMap.set(key, (monthMap.get(key) ?? 0) + Number(inv.amount));
    }

    const allMonths: Date[] = [];
    for (let d = new Date(sixMonthsAgo); d <= now; d.setMonth(d.getMonth() + 1)) {
      allMonths.push(new Date(d));
    }
    monthlyRevenue = allMonths.map((d) => {
      const key = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      return { month: key.split(" ")[0], revenue: monthMap.get(key) ?? 0 };
    });

    // Top lanes by revenue
    const loads = await prisma.load.findMany({
      where: { companyId },
      select: {
        originCity: true,
        originState: true,
        destCity: true,
        destState: true,
        shipperRate: true,
        miles: true,
      },
    });

    const laneMap = new Map<string, { loads: number; revenue: number; rates: number[] }>();
    for (const l of loads) {
      const key = `${l.originCity}, ${l.originState}|${l.destCity}, ${l.destState}`;
      const existing = laneMap.get(key) ?? { loads: 0, revenue: 0, rates: [] };
      existing.loads++;
      existing.revenue += Number(l.shipperRate);
      existing.rates.push(Number(l.shipperRate));
      laneMap.set(key, existing);
    }

    topLanes = Array.from(laneMap.entries())
      .map(([key, val]) => {
        const [origin, destination] = key.split("|");
        return {
          origin,
          destination,
          loads: val.loads,
          revenue: val.revenue,
          avgRate: Math.round(val.revenue / val.loads),
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Summary metrics
    const mtdRevenueAgg = await prisma.invoice.aggregate({
      where: { companyId, status: "PAID", paidAt: { gte: startOfMonth } },
      _sum: { amount: true },
    });
    mtdRevenue = Number(mtdRevenueAgg._sum.amount ?? 0);

    const mtdLoadsAgg = await prisma.load.count({
      where: { companyId, createdAt: { gte: startOfMonth } },
    });
    mtdLoads = mtdLoadsAgg;

    const allRates = await prisma.load.findMany({
      where: { companyId },
      select: { shipperRate: true, carrierRate: true, fuelSurcharge: true },
    });

    if (allRates.length > 0) {
      const totalRate = allRates.reduce((sum, l) => sum + Number(l.shipperRate), 0);
      avgLoadRate = Math.round(totalRate / allRates.length);

      const margins = allRates
        .filter((l) => l.carrierRate)
        .map((l) => {
          const margin = Number(l.shipperRate) - Number(l.carrierRate!) - Number(l.fuelSurcharge ?? 0);
          return (margin / Number(l.shipperRate)) * 100;
        });
      avgMargin = margins.length > 0 ? Math.round((margins.reduce((a, b) => a + b, 0) / margins.length) * 10) / 10 : 0;
    }
  }

  const maxRevenue = monthlyRevenue.length > 0 ? Math.max(...monthlyRevenue.map((m) => m.revenue)) : 0;

  return (
    <>
      <Header title="Reports" subtitle="Business analytics and performance insights" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {!auth && (
          <div className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
            Sign in to see your live data.
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Revenue (MTD)", value: formatCurrency(mtdRevenue), icon: DollarSign, color: "text-success bg-success/10" },
            { label: "Loads (MTD)", value: String(mtdLoads), icon: Package, color: "text-primary bg-primary/10" },
            { label: "Avg. Load Rate", value: formatCurrency(avgLoadRate), icon: TrendingUp, color: "text-warning bg-warning/10" },
            { label: "Gross Margin", value: `${avgMargin}%`, icon: BarChart3, color: "text-accent bg-accent/10" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`rounded-lg p-2 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Revenue</CardTitle>
              <CardDescription>Last 7 months</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyRevenue.length === 0 || maxRevenue === 0 ? (
                <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
                  No paid invoice data yet.
                </div>
              ) : (
                <>
                  <div className="flex items-end gap-3 h-40">
                    {monthlyRevenue.map((m) => (
                      <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t bg-primary transition-all"
                          style={{ height: `${(m.revenue / maxRevenue) * 100}%` }}
                        />
                        <p className="text-xs text-muted-foreground">{m.month}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                    <span>$0</span>
                    <span>{formatCurrency(maxRevenue)}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Lanes</CardTitle>
              <CardDescription>By total revenue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {topLanes.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
                  No load data yet.
                </div>
              ) : (
                topLanes.map((lane, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium truncate">{lane.origin} → {lane.destination}</span>
                      <span className="font-bold shrink-0 ml-2">{formatCurrency(lane.revenue)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(lane.revenue / topLanes[0].revenue) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{lane.loads} loads</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
