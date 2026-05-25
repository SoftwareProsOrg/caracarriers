import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Phone, Mail } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { CreateShipperDialog } from "@/components/shippers/create-shipper-dialog";

export default async function ShippersPage() {
  const auth = await getAuthContext();

  const shippers = auth
    ? await prisma.shipper.findMany({
        where: { companyId: auth.companyId },
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { loads: true } },
          invoices: { select: { amount: true, status: true } },
        },
        take: 100,
      })
    : [];

  return (
    <>
      <Header title="Shippers" subtitle="Manage your customer relationships" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{shippers.length} shipper{shippers.length !== 1 ? "s" : ""} total</p>
          <CreateShipperDialog />
        </div>

        {shippers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground mb-3">No shippers yet.</p>
            <CreateShipperDialog />
          </div>
        ) : (
          <div className="space-y-3">
            {shippers.map((shipper) => {
              const totalRevenue = shipper.invoices
                .filter((i) => i.status === "PAID")
                .reduce((sum, i) => sum + Number(i.amount), 0);

              return (
                <Card key={shipper.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{shipper.name}</p>
                        <Badge variant={shipper.isActive ? "success" : "secondary"}>
                          {shipper.isActive ? "active" : "inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {shipper.contactName ? `${shipper.contactName} · ` : ""}{shipper.city && shipper.state ? `${shipper.city}, ${shipper.state}` : ""}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        {shipper.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{shipper.phone}</span>}
                        {shipper.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{shipper.email}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <p className="font-bold text-base">{formatCurrency(totalRevenue)}</p>
                      <p className="text-xs text-muted-foreground">{shipper._count.loads} load{shipper._count.loads !== 1 ? "s" : ""}</p>
                      {shipper.creditLimit && (
                        <p className="text-xs text-muted-foreground">Credit: {formatCurrency(Number(shipper.creditLimit))}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
