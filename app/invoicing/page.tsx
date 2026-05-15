import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { InvoiceStatus } from "@prisma/client";
import { CreateInvoiceButton } from "@/components/invoices/create-invoice-button";

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "destructive" | "info" | "muted" | "warning" }> = {
  PAID: { label: "Paid", variant: "success" },
  OVERDUE: { label: "Overdue", variant: "destructive" },
  SENT: { label: "Sent", variant: "info" },
  DRAFT: { label: "Draft", variant: "muted" },
  CANCELLED: { label: "Cancelled", variant: "muted" },
  VOID: { label: "Void", variant: "muted" },
};

export default async function InvoicingPage() {
  const auth = await getAuthContext();

  const invoices = auth
    ? await prisma.invoice.findMany({
        where: { companyId: auth.companyId },
        orderBy: { createdAt: "desc" },
        include: {
          shipper: { select: { name: true } },
          load: { select: { loadNumber: true } },
        },
      })
    : [];

  const shippers = auth
    ? await prisma.shipper.findMany({ where: { companyId: auth.companyId }, select: { id: true, name: true } })
    : [];

  const paid = invoices.filter((i) => i.status === InvoiceStatus.PAID).reduce((s, i) => s + Number(i.amount), 0);
  const outstanding = invoices.filter((i) => i.status !== InvoiceStatus.PAID && i.status !== InvoiceStatus.CANCELLED && i.status !== InvoiceStatus.VOID).reduce((s, i) => s + Number(i.amount), 0);
  const overdue = invoices.filter((i) => i.status === InvoiceStatus.OVERDUE).reduce((s, i) => s + Number(i.amount), 0);

  return (
    <>
      <Header title="Invoicing" subtitle="Manage shipper invoices and payments" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Paid (MTD)</p><p className="text-xl font-bold text-success">{formatCurrency(paid)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Outstanding</p><p className="text-xl font-bold text-warning">{formatCurrency(outstanding)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Overdue</p><p className="text-xl font-bold text-destructive">{formatCurrency(overdue)}</p></CardContent></Card>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{invoices.length} invoice{invoices.length !== 1 ? "s" : ""}</p>
          <CreateInvoiceButton shippers={shippers} />
        </div>

        {invoices.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground mb-3">No invoices yet.</p>
              <CreateInvoiceButton shippers={shippers} />
            </div>
          </Card>
        ) : (
          <Card>
            <div className="divide-y divide-border">
              {invoices.map((inv) => {
                const status = STATUS_CONFIG[inv.status] ?? { label: inv.status, variant: "secondary" as const };
                return (
                  <div key={inv.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors cursor-pointer">
                    <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{inv.invoiceNumber}</span>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{inv.shipper.name}{inv.load ? ` · ${inv.load.loadNumber}` : ""}</p>
                      <p className="text-xs text-muted-foreground">
                        Issued {inv.issuedAt.toLocaleDateString()} · Due {inv.dueAt.toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-bold shrink-0">{formatCurrency(Number(inv.amount))}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </main>
    </>
  );
}
