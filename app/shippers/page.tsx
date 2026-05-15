import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Plus, Phone, Mail } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const shippers = [
  { id: "SHP-001", company: "Acme Manufacturing", contact: "Sarah Johnson", phone: "(713) 555-0182", email: "s.johnson@acmemfg.com", city: "Houston, TX", loads: 38, revenue: 94500, status: "active", creditLimit: 50000 },
  { id: "SHP-002", company: "Gulf Coast Distributors", contact: "Tom Reynolds", phone: "(832) 555-0247", email: "treynolds@gcdist.com", city: "Beaumont, TX", loads: 22, revenue: 55200, status: "active", creditLimit: 30000 },
  { id: "SHP-003", company: "Lone Star Foods", contact: "Maria Garcia", phone: "(214) 555-0391", email: "mgarcia@lsfoods.com", city: "Dallas, TX", loads: 61, revenue: 148000, status: "active", creditLimit: 75000 },
  { id: "SHP-004", company: "Western Industrial Supply", contact: "James Park", phone: "(602) 555-0118", email: "jpark@westernind.com", city: "Phoenix, AZ", loads: 15, revenue: 31800, status: "active", creditLimit: 25000 },
  { id: "SHP-005", company: "Coastal Exports LLC", contact: "David Chen", phone: "(305) 555-0472", email: "dchen@coastalexports.com", city: "Miami, FL", loads: 8, revenue: 19200, status: "new", creditLimit: 15000 },
];

export default function ShippersPage() {
  return (
    <>
      <Header title="Shippers" subtitle="Manage your customer relationships" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{shippers.length} shippers total</p>
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add Shipper
          </Button>
        </div>

        <div className="space-y-3">
          {shippers.map((shipper) => (
            <Card key={shipper.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{shipper.company}</p>
                    <Badge variant={shipper.status === "active" ? "success" : "secondary"}>{shipper.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{shipper.contact} · {shipper.city}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{shipper.phone}</span>
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{shipper.email}</span>
                  </div>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <p className="font-bold text-base">{formatCurrency(shipper.revenue)}</p>
                  <p className="text-xs text-muted-foreground">{shipper.loads} loads</p>
                  <p className="text-xs text-muted-foreground">Credit: {formatCurrency(shipper.creditLimit)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
