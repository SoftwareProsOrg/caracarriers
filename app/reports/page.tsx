import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, TrendingUp, DollarSign, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const monthlyRevenue = [
  { month: "Nov", revenue: 198000 },
  { month: "Dec", revenue: 221000 },
  { month: "Jan", revenue: 189000 },
  { month: "Feb", revenue: 243000 },
  { month: "Mar", revenue: 267000 },
  { month: "Apr", revenue: 253000 },
  { month: "May", revenue: 284500 },
];

const topLanes = [
  { origin: "Houston, TX", destination: "Atlanta, GA", loads: 38, revenue: 91200, avgRate: 2400 },
  { origin: "Chicago, IL", destination: "Dallas, TX", loads: 29, revenue: 89900, avgRate: 3100 },
  { origin: "Los Angeles, CA", destination: "Phoenix, AZ", loads: 44, revenue: 79200, avgRate: 1800 },
  { origin: "Miami, FL", destination: "Nashville, TN", loads: 22, revenue: 60500, avgRate: 2750 },
  { origin: "Denver, CO", destination: "Kansas City, MO", loads: 31, revenue: 51150, avgRate: 1650 },
];

const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));

export default function ReportsPage() {
  return (
    <>
      <Header title="Reports" subtitle="Business analytics and performance insights" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Revenue (MTD)", value: formatCurrency(284500), icon: DollarSign, color: "text-success bg-success/10" },
            { label: "Loads (MTD)", value: "52", icon: Package, color: "text-primary bg-primary/10" },
            { label: "Avg. Load Rate", value: formatCurrency(2480), icon: TrendingUp, color: "text-warning bg-warning/10" },
            { label: "Gross Margin", value: "18.4%", icon: BarChart3, color: "text-accent bg-accent/10" },
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
          {/* Revenue chart (CSS bar chart) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Revenue</CardTitle>
              <CardDescription>Last 7 months</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Top lanes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Lanes</CardTitle>
              <CardDescription>By total revenue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {topLanes.map((lane, i) => (
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
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
