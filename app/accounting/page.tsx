import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  DollarSign, ArrowUpRight, ArrowDownRight, Wallet,
  RefreshCw, Banknote, FileText, Truck, CheckCircle2, Landmark,
} from "lucide-react";
import { QuickBooksSyncDialog } from "@/components/accounting/quickbooks-sync-dialog";
import { FactoringDialog } from "@/components/accounting/factoring-dialog";
import { AccessorialChargeDialog } from "@/components/accounting/accessorial-charge-dialog";

const INVOICE_STATUS_STYLES: Record<string, { label: string; variant: "success" | "destructive" | "info" | "muted" | "warning" }> = {
  PAID: { label: "Paid", variant: "success" },
  OVERDUE: { label: "Overdue", variant: "destructive" },
  SENT: { label: "Sent", variant: "info" },
  DRAFT: { label: "Draft", variant: "muted" },
  CANCELLED: { label: "Cancelled", variant: "muted" },
  VOID: { label: "Void", variant: "muted" },
};

export default async function AccountingPage() {
  const auth = await getAuthContext();
  if (!auth) {
    return (
      <>
        <Header title="Accounting" subtitle="Financial automation and integrations" />
        <main className="flex-1 overflow-y-auto p-6">
          <Card>
            <CardContent className="flex items-center justify-center h-48 text-muted-foreground">
              Sign in to view accounting data.
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  const [invoices, carrierPayments, loads] = await Promise.all([
    prisma.invoice.findMany({
      where: { companyId: auth.companyId },
      orderBy: { createdAt: "desc" },
      include: { shipper: { select: { name: true } } },
      take: 50,
    }),
    prisma.carrierPayment.findMany({
      where: { carrier: { companyId: auth.companyId } },
      orderBy: { paidAt: "desc" },
      include: { carrier: { select: { name: true } } },
      take: 50,
    }),
    prisma.load.findMany({
      where: { companyId: auth.companyId, status: { not: "CANCELLED" } },
      select: { id: true, loadNumber: true, equipmentType: true, weight: true, pieces: true, carrierRate: true },
    }),
  ]);

  const outstandingAR = invoices
    .filter((i) => i.status === "SENT" || i.status === "OVERDUE")
    .reduce((s, i) => s + Number(i.amount), 0);

  const totalAR = invoices
    .filter((i) => i.status !== "CANCELLED" && i.status !== "VOID")
    .reduce((s, i) => s + Number(i.amount), 0);

  const totalAP = loads.reduce((s, l) => s + Number(l.carrierRate ?? 0), 0);

  const netFloat = totalAR - totalAP;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const paidThisMonth = invoices
    .filter((i) => i.status === "PAID" && i.paidAt && i.paidAt >= startOfMonth)
    .reduce((s, i) => s + Number(i.amount), 0);

  const recentTransactions: {
    id: string;
    type: "invoice" | "payment";
    reference: string;
    counterparty: string;
    amount: number;
    date: Date;
    status?: string;
  }[] = [
    ...invoices.slice(0, 25).map((i) => ({
      id: i.id,
      type: "invoice" as const,
      reference: i.invoiceNumber,
      counterparty: i.shipper.name,
      amount: Number(i.amount),
      date: i.createdAt,
      status: i.status,
    })),
    ...carrierPayments.slice(0, 25).map((p) => ({
      id: p.id,
      type: "payment" as const,
      reference: p.reference ?? p.carrier.name,
      counterparty: p.carrier.name,
      amount: Number(p.amount),
      date: p.paidAt,
      status: p.method,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);

  const factoringInvoices = invoices
    .filter((i) => (i.status === "SENT" || i.status === "OVERDUE") && Number(i.amount) > 0)
    .map((i) => ({
      id: i.id,
      invoiceNumber: i.invoiceNumber,
      amount: Number(i.amount),
      shipperName: i.shipper.name,
    }));

  const accessorialLoads = loads.map((l) => ({
      id: l.id,
      loadNumber: l.loadNumber,
      equipmentType: l.equipmentType,
      weight: l.weight ? Number(l.weight) : null,
      pieces: l.pieces ?? null,
    }));

  return (
    <>
      <Header title="Accounting" subtitle="Financial automation and integrations" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <ArrowUpRight className="h-4 w-4 text-destructive" />
                <span className="text-xs font-medium uppercase tracking-wider">Outstanding AR</span>
              </div>
              <p className="text-2xl font-bold text-destructive">{formatCurrency(outstandingAR)}</p>
              <p className="text-xs text-muted-foreground mt-1">SENT + OVERDUE invoices</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Total AR</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(totalAR)}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatCurrency(paidThisMonth)} paid this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <ArrowDownRight className="h-4 w-4 text-warning" />
                <span className="text-xs font-medium uppercase tracking-wider">Total AP</span>
              </div>
              <p className="text-2xl font-bold text-warning">{formatCurrency(totalAP)}</p>
              <p className="text-xs text-muted-foreground mt-1">Carrier payables</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Wallet className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Net Float</span>
              </div>
              <p className={`text-2xl font-bold ${netFloat >= 0 ? "text-green-600" : "text-destructive"}`}>
                {formatCurrency(netFloat)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">AR - AP</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <QuickBooksSyncDialog />
          <FactoringDialog invoices={factoringInvoices} />
          <AccessorialChargeDialog loads={accessorialLoads} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No transactions yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentTransactions.map((tx) => (
                  <div key={`${tx.type}-${tx.id}`} className="flex items-center gap-4 px-6 py-3 hover:bg-muted/40 transition-colors">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tx.type === "invoice" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                      {tx.type === "invoice" ? <FileText className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{tx.reference}</span>
                        {tx.type === "invoice" && tx.status && (
                          <Badge variant={INVOICE_STATUS_STYLES[tx.status]?.variant ?? "secondary"}>
                            {INVOICE_STATUS_STYLES[tx.status]?.label ?? tx.status}
                          </Badge>
                        )}
                        {tx.type === "payment" && (
                          <Badge variant="secondary">{tx.status}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {tx.counterparty} · {formatDate(tx.date)}
                      </p>
                    </div>
                    <p className={`font-bold shrink-0 ${tx.type === "invoice" ? "text-green-600" : "text-red-600"}`}>
                      {tx.type === "invoice" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm">QuickBooks</p>
                  <Badge variant="success" className="shrink-0 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Connected</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Sync invoices & bills</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Banknote className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm">Stripe</p>
                  <Badge variant="success" className="shrink-0 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Connected</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Accept shipper payments</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Landmark className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm">Factoring</p>
                  <Badge variant="secondary">Available</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Invoice factoring partners</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
