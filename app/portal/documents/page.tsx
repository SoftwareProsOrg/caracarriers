import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getPortalUser } from "@/lib/portal/session";

const TYPE_SHORT: Record<string, string> = {
  BOL: "BOL",
  POD: "POD",
  RATE_CONFIRMATION: "RC",
  INSURANCE_CERTIFICATE: "INS",
  CONTRACT: "CON",
  CARRIER_PACKET: "PKT",
  W9: "W9",
  OTHER: "OTH",
};

const TYPE_COLOR: Record<string, string> = {
  BOL: "text-blue-600 bg-blue-50",
  POD: "text-emerald-600 bg-emerald-50",
  RATE_CONFIRMATION: "text-amber-600 bg-amber-50",
  INSURANCE_CERTIFICATE: "text-violet-600 bg-violet-50",
  CONTRACT: "text-slate-600 bg-slate-100",
  CARRIER_PACKET: "text-blue-600 bg-blue-50",
  W9: "text-emerald-600 bg-emerald-50",
  OTHER: "text-slate-600 bg-slate-100",
};

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "destructive" | "warning" | "muted" }> = {
  COMPLETE: { label: "Complete", variant: "success" },
  MISSING: { label: "Missing", variant: "destructive" },
  EXPIRING_SOON: { label: "Expiring Soon", variant: "warning" },
  PENDING_UPLOAD: { label: "Pending Upload", variant: "muted" },
  EXPIRED: { label: "Expired", variant: "destructive" },
};

export default async function PortalDocumentsPage() {
  const portalUser = await getPortalUser();
  if (!portalUser) redirect("/login");

  const { companyId, shipperId } = portalUser;

  const shipperLoadIds = await prisma.load.findMany({
    where: { companyId, shipperId },
    select: { id: true },
  });

  const loadIdSet = shipperLoadIds.map((l) => l.id);

  const documents = loadIdSet.length > 0
    ? await prisma.document.findMany({
        where: { companyId, loadId: { in: loadIdSet } },
        orderBy: { createdAt: "desc" },
        include: { load: { select: { loadNumber: true } } },
        take: 100,
      })
    : [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
        <p className="text-sm text-slate-500 mt-1">
          {documents.length} document{documents.length !== 1 ? "s" : ""} across your shipments
        </p>
      </div>

      {documents.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-slate-500">No documents available yet.</p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="divide-y divide-slate-100">
            {documents.map((doc) => {
              const status = STATUS_CONFIG[doc.status] ?? { label: doc.status, variant: "muted" as const };
              return (
                <div key={doc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${TYPE_COLOR[doc.type] ?? "text-slate-600 bg-slate-100"}`}>
                    {TYPE_SHORT[doc.type] ?? "DOC"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-slate-900">{doc.name}</span>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      {doc.load ? `Load: ${doc.load.loadNumber}` : "General"}{" "}
                      &middot; {doc.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  {doc.fileUrl && (
                    <Button size="sm" variant="ghost" asChild>
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
