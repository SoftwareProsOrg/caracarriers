import {
  Package,
  Truck,
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { formatCurrency } from "@/lib/utils";

const kpis = [
  {
    label: "Active Loads",
    value: "47",
    change: "+8 from yesterday",
    trend: "up",
    icon: Package,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Available Carriers",
    value: "312",
    change: "+24 this week",
    trend: "up",
    icon: Truck,
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    label: "Revenue (MTD)",
    value: formatCurrency(284500),
    change: "+12.4% vs last month",
    trend: "up",
    icon: DollarSign,
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    label: "Open Invoices",
    value: formatCurrency(91200),
    change: "14 invoices pending",
    trend: "neutral",
    icon: FileText,
    color: "text-warning",
    bg: "bg-warning/10",
  },
];

const recentLoads = [
  {
    id: "LD-4821",
    origin: "Houston, TX",
    destination: "Atlanta, GA",
    carrier: "Martinez Trucking",
    status: "in_transit",
    rate: 2400,
    eta: "Today 6:00 PM",
  },
  {
    id: "LD-4820",
    origin: "Chicago, IL",
    destination: "Dallas, TX",
    carrier: "Swift Transport",
    status: "dispatched",
    rate: 3100,
    eta: "Tomorrow 2:00 PM",
  },
  {
    id: "LD-4819",
    origin: "Los Angeles, CA",
    destination: "Phoenix, AZ",
    carrier: "Pending",
    status: "available",
    rate: 1800,
    eta: "—",
  },
  {
    id: "LD-4818",
    origin: "Miami, FL",
    destination: "Nashville, TN",
    carrier: "Rodriguez Freight",
    status: "delivered",
    rate: 2750,
    eta: "Delivered",
  },
  {
    id: "LD-4817",
    origin: "Seattle, WA",
    destination: "Portland, OR",
    carrier: "Pacific Haulers",
    status: "in_transit",
    rate: 950,
    eta: "Today 3:00 PM",
  },
];

const alerts = [
  { type: "warning", message: "3 carrier insurance policies expiring in 7 days", icon: AlertTriangle },
  { type: "info", message: "LD-4815 — POD not received, delivered 2 days ago", icon: Clock },
  { type: "warning", message: "Invoice INV-0284 overdue by 15 days — $4,200", icon: AlertTriangle },
  { type: "success", message: "Carrier TRL-8821 MC verification approved", icon: CheckCircle2 },
];

const statusConfig: Record<string, { label: string; variant: "success" | "info" | "warning" | "muted" | "secondary" }> = {
  in_transit: { label: "In Transit", variant: "info" },
  dispatched: { label: "Dispatched", variant: "warning" },
  available: { label: "Available", variant: "success" },
  delivered: { label: "Delivered", variant: "muted" },
};

export default function DashboardPage() {
  return (
    <>
      <Header
        title="Dashboard"
        subtitle={new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{kpi.value}</p>
                    <div className="mt-1 flex items-center gap-1">
                      {kpi.trend === "up" ? (
                        <TrendingUp className="h-3 w-3 text-success" />
                      ) : kpi.trend === "down" ? (
                        <TrendingDown className="h-3 w-3 text-destructive" />
                      ) : null}
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
          {/* Recent Loads */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-base">Recent Loads</CardTitle>
                <CardDescription>Latest load activity across your board</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/loads">View All</a>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentLoads.map((load) => {
                  const status = statusConfig[load.status];
                  return (
                    <div key={load.id} className="flex items-center gap-4 px-6 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{load.id}</span>
                          <Badge variant={status.variant} className="text-[10px]">
                            {status.label}
                          </Badge>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{load.origin}</span>
                          <span>→</span>
                          <span>{load.destination}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {load.carrier === "Pending" ? (
                            <span className="text-warning font-medium">No carrier assigned</span>
                          ) : (
                            load.carrier
                          )}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold">{formatCurrency(load.rate)}</p>
                        <p className="text-xs text-muted-foreground">{load.eta}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Alerts & Notifications */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Alerts</CardTitle>
              <CardDescription>Items requiring your attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 rounded-lg p-3 ${
                    alert.type === "warning"
                      ? "bg-warning/10"
                      : alert.type === "success"
                      ? "bg-success/10"
                      : "bg-primary/10"
                  }`}
                >
                  <alert.icon
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      alert.type === "warning"
                        ? "text-warning"
                        : alert.type === "success"
                        ? "text-success"
                        : "text-primary"
                    }`}
                  />
                  <p className="text-xs leading-relaxed text-foreground">{alert.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Bottom row: Load Status Summary */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "In Transit", count: 18, color: "bg-primary" },
            { label: "Dispatched", count: 11, color: "bg-warning" },
            { label: "Available", count: 9, color: "bg-success" },
            { label: "Delivered Today", count: 14, color: "bg-muted-foreground" },
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
