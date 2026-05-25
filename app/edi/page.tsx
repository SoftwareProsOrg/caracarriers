import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRightLeft, AlertCircle, Building2, Send } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { CreateEdiDialog } from "@/components/edi/create-edi-dialog";

const STATUS_VARIANT: Record<string, "info" | "success" | "destructive" | "secondary"> = {
  received: "info",
  processed: "success",
  failed: "destructive",
};

const DIRECTION_ICON: Record<string, React.ReactNode> = {
  inbound: <ArrowRightLeft className="h-3.5 w-3.5 text-primary" />,
  outbound: <Send className="h-3.5 w-3.5 text-warning" />,
};

export default async function EdiPage() {
  const auth = await getAuthContext();

  const documents = auth
    ? await prisma.ediDocument.findMany({
        where: { companyId: auth.companyId },
        orderBy: { createdAt: "desc" },
        include: {
          load: { select: { loadNumber: true } },
        },
        take: 100,
      })
    : [];

  const total = documents.length;
  const processedToday = auth
    ? await prisma.ediDocument.count({
        where: {
          companyId: auth.companyId,
          status: "processed",
          processedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      })
    : 0;
  const failed = documents.filter((d) => d.status === "failed").length;
  const partners = new Set(documents.filter((d) => d.partnerId).map((d) => d.partnerId)).size;

  return (
    <>
      <Header title="EDI Connectivity" subtitle="Electronic Data Interchange with enterprise customers" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{total}</p>
                <p className="text-xs text-muted-foreground">Total EDI Documents</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <ArrowRightLeft className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{processedToday}</p>
                <p className="text-xs text-muted-foreground">Processed Today</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{failed}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{partners}</p>
                <p className="text-xs text-muted-foreground">Active Trading Partners</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{total} document{total !== 1 ? "s" : ""}</p>
          <CreateEdiDialog />
        </div>

        {documents.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground mb-3">No EDI documents yet.</p>
              <CreateEdiDialog />
            </div>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Direction</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Load#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Partner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-6 py-3 font-mono text-xs text-muted-foreground">{doc.id.slice(0, 8)}</td>
                      <td className="px-6 py-3">
                        <span className="font-mono text-xs font-semibold">{doc.ediType}</span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1.5">
                          {DIRECTION_ICON[doc.direction] ?? null}
                          <span className="text-xs capitalize">{doc.direction}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-xs text-muted-foreground">
                        {doc.load?.loadNumber ?? <span className="italic">—</span>}
                      </td>
                      <td className="px-6 py-3 text-xs text-muted-foreground">
                        {doc.partnerId ?? <span className="italic">—</span>}
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant={STATUS_VARIANT[doc.status] ?? "secondary"} className="capitalize">
                          {doc.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-xs text-muted-foreground">
                        {doc.createdAt.toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>
    </>
  );
}
