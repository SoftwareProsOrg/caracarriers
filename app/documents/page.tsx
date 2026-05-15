import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Download, PenLine } from "lucide-react";
import { SendSignatureDialog } from "@/components/documents/send-signature-dialog";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

const TYPE_COLOR: Record<string, string> = {
  BOL: "text-primary bg-primary/10",
  POD: "text-success bg-success/10",
  RATE_CONFIRMATION: "text-warning bg-warning/10",
  INSURANCE_CERTIFICATE: "text-accent bg-accent/10",
  CONTRACT: "text-muted-foreground bg-muted",
  CARRIER_PACKET: "text-primary bg-primary/10",
  W9: "text-success bg-success/10",
  OTHER: "text-muted-foreground bg-muted",
};

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

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "destructive" | "warning" | "muted" }> = {
  COMPLETE: { label: "Complete", variant: "success" },
  MISSING: { label: "Missing", variant: "destructive" },
  EXPIRING_SOON: { label: "Expiring Soon", variant: "warning" },
  PENDING_UPLOAD: { label: "Pending Upload", variant: "muted" },
  EXPIRED: { label: "Expired", variant: "destructive" },
};

const SIGNING_CONFIG: Record<string, { label: string; variant: "success" | "destructive" | "warning" | "muted" | "info" }> = {
  SIGNED: { label: "Signed", variant: "success" },
  PENDING: { label: "Awaiting Signature", variant: "warning" },
  DECLINED: { label: "Declined", variant: "destructive" },
  DRAFT: { label: "Draft", variant: "muted" },
  EXPIRED: { label: "Expired", variant: "muted" },
};

export default async function DocumentsPage() {
  const auth = await getAuthContext();

  const documents = auth
    ? await prisma.document.findMany({
        where: { companyId: auth.companyId },
        orderBy: { createdAt: "desc" },
        include: {
          load: { select: { loadNumber: true } },
          carrier: { select: { name: true } },
        },
      })
    : [];

  return (
    <>
      <Header title="Documents" subtitle="BOLs, PODs, rate confirmations, and contracts" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Upload & Send for Signature</p>
              <p className="text-xs text-muted-foreground">
                Upload a PDF and send it for e-signature via Documenso.
              </p>
            </div>
            <Button size="sm" variant="outline">
              <Upload className="h-4 w-4" />
              Upload PDF
            </Button>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{documents.length} document{documents.length !== 1 ? "s" : ""}</p>
          <Button size="sm">
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        </div>

        {documents.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground">No documents yet. Upload your first document.</p>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="divide-y divide-border">
              {documents.map((doc) => {
                const status = STATUS_CONFIG[doc.status] ?? { label: doc.status, variant: "muted" as const };
                const signing = doc.signingStatus ? SIGNING_CONFIG[doc.signingStatus] : null;
                return (
                  <div key={doc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${TYPE_COLOR[doc.type] ?? "text-muted-foreground bg-muted"}`}>
                      {TYPE_SHORT[doc.type] ?? "DOC"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{doc.name}</span>
                        <Badge variant={status.variant}>{status.label}</Badge>
                        {signing && <Badge variant={signing.variant}>{signing.label}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {doc.load ? `Load: ${doc.load.loadNumber}` : doc.carrier ? `Carrier: ${doc.carrier.name}` : "General"}{" "}
                        · {doc.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {doc.status !== "MISSING" && doc.documensoId && (
                        <SendSignatureDialog
                          documentId={doc.documensoId}
                          documentName={doc.name}
                          trigger={
                            <Button size="sm" variant="outline">
                              <PenLine className="h-3.5 w-3.5" />
                              Sign
                            </Button>
                          }
                        />
                      )}
                      {doc.status === "MISSING" ? (
                        <Button size="sm" variant="outline">
                          <Upload className="h-3.5 w-3.5" />
                          Upload
                        </Button>
                      ) : doc.fileUrl ? (
                        <Button size="sm" variant="ghost" asChild>
                          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      ) : null}
                    </div>
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
