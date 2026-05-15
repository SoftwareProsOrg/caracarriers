import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const invoices = [
  { id: "INV-0291", shipper: "Lone Star Foods", load: "LD-4818", amount: 2750, status: "paid", issued: "2026-05-12", due: "2026-05-26" },
  { id: "INV-0290", shipper: "Acme Manufacturing", load: "LD-4815", amount: 3400, status: "overdue", issued: "2026-04-28", due: "2026-05-12" },
  { id: "INV-0289", shipper: "Gulf Coast Distributors", load: "LD-4812", amount: 1950, status: "sent", issued: "2026-05-10", due: "2026-05-24" },
  { id: "INV-0288", shipper: "Lone Star Foods", load: "LD-4809", amount: 4200, status: "overdue", issued: "2026-04-25", due: "2026-05-09" },
  { id: "INV-0287", shipper: "Western Industrial", load: "LD-4806", amount: 2100, status: "paid", issued: "2026-05-08", due: "2026-05-22" },
  { id: "INV-0286", shipper: "Coastal Exports", load: "LD-4803", amount: 1600, status: "draft", issued: "2026-05-14", due: "2026-05-28" },
];

const statusConfig: Record<string, { label: string; variant: "success" | "destructive" | "info" | "secondary" | "muted" }> = {
  paid: { label: "Paid", variant: "success" },
  overdue: { label: "Overdue", variant: "destructive" },
  sent: { label: "Sent", variant: "info" },
  draft: { label: "Draft", variant: "muted" },
};

const totals = {
  paid: invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0),
  outstanding: invoices.filter(i => i.status !== "paid").reduce((s, i) => s + i.amount, 0),
  overdue: invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.amount, 0),
};

export default function InvoicingPage() {
  return (
    <>
      <Header title="Invoicing" subtitle="Manage shipper invoices and payments" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Paid (MTD)</p><p className="text-xl font-bold text-success">{formatCurrency(totals.paid)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Outstanding</p><p className="text-xl font-bold text-warning">{formatCurrency(totals.outstanding)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Overdue</p><p className="text-xl font-bold text-destructive">{formatCurrency(totals.overdue)}</p></CardContent></Card>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{invoices.length} invoices</p>
          <Button size="sm"><Plus className="h-4 w-4" />New Invoice</Button>
        </div>

        <Card>
          <div className="divide-y divide-border">
            {invoices.map((inv) => {
              const status = statusConfig[inv.status];
              return (
                <div key={inv.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors cursor-pointer">
                  <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{inv.id}</span>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{inv.shipper} · {inv.load}</p>
                    <p className="text-xs text-muted-foreground">Issued {inv.issued} · Due {inv.due}</p>
                  </div>
                  <p className="font-bold shrink-0">{formatCurrency(inv.amount)}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </main>
    </>
  );
}
