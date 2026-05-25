import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getPortalUser } from "@/lib/portal/session";
import { InvoiceStatus } from "@prisma/client";

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "destructive" | "info" | "muted" | "warning" }> = {
  PAID: { label: "Paid", variant: "success" },
  OVERDUE: { label: "Overdue", variant: "destructive" },
  SENT: { label: "Sent", variant: "info" },
  DRAFT: { label: "Draft", variant: "muted" },
  CANCELLED: { label: "Cancelled", variant: "muted" },
  VOID: { label: "Void", variant: "muted" },
};

export default async function PortalInvoicesPage() {
  const portalUser = await getPortalUser();
  if (!portalUser) redirect("/login");

  const { companyId, shipperId } = portalUser;

  const invoices = await prisma.invoice.findMany({
    where: { companyId, shipperId },
    orderBy: { createdAt: "desc" },
    include: { load: { select: { loadNumber: true } } },
    take: 100,
  });

  const paid = invoices
    .filter((i) => i.status === InvoiceStatus.PAID)
    .reduce((s, i) => s + Number(i.amount), 0);
  const outstanding = invoices
    .filter((i) => i.status !== InvoiceStatus.PAID && i.status !== InvoiceStatus.CANCELLED && i.status !== InvoiceStatus.VOID)
    .reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
        <p className="text-sm text-slate-500 mt-1">
          {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Total Paid</p>
            <p className="text-xl font-bold text-emerald-600">{formatCurrency(paid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Outstanding</p>
            <p className="text-xl font-bold text-amber-600">{formatCurrency(outstanding)}</p>
          </CardContent>
        </Card>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-slate-500">No invoices yet.</p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="divide-y divide-slate-100">
            {invoices.map((inv) => {
              const status = STATUS_CONFIG[inv.status] ?? { label: inv.status, variant: "secondary" as const };
              return (
                <div
                  key={inv.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <FileText className="h-5 w-5 shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900">{inv.invoiceNumber}</span>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    {inv.load && (
                      <p className="text-xs text-slate-500">{inv.load.loadNumber}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>Issued {inv.issuedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      <span>&middot;</span>
                      <span>Due {inv.dueAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      {inv.paidAt && (
                        <>
                          <span>&middot;</span>
                          <span className="text-emerald-600">Paid {inv.paidAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="font-bold text-slate-900 shrink-0">{formatCurrency(Number(inv.amount))}</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
