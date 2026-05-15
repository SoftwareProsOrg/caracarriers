import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Download, PenLine } from "lucide-react";
import { SendSignatureDialog } from "@/components/documents/send-signature-dialog";

// Mock document data — replace with DB query once Prisma is configured
const documents = [
  {
    id: "DOC-001",
    documensoId: 1,
    type: "BOL",
    name: "Bill of Lading - LD-4818",
    load: "LD-4818",
    status: "complete",
    signingStatus: "signed",
    date: "2026-05-14",
  },
  {
    id: "DOC-002",
    documensoId: 2,
    type: "POD",
    name: "Proof of Delivery - LD-4815",
    load: "LD-4815",
    status: "missing",
    signingStatus: null,
    date: "2026-05-12",
  },
  {
    id: "DOC-003",
    documensoId: 3,
    type: "Rate Con",
    name: "Rate Confirmation - LD-4821",
    load: "LD-4821",
    status: "complete",
    signingStatus: "pending",
    date: "2026-05-14",
  },
  {
    id: "DOC-004",
    documensoId: 4,
    type: "Rate Con",
    name: "Rate Confirmation - LD-4820",
    load: "LD-4820",
    status: "complete",
    signingStatus: "signed",
    date: "2026-05-14",
  },
  {
    id: "DOC-005",
    documensoId: 5,
    type: "Insurance",
    name: "Carrier Insurance - Martinez Trucking",
    load: "—",
    status: "complete",
    signingStatus: null,
    date: "2026-05-01",
  },
  {
    id: "DOC-006",
    documensoId: 6,
    type: "Insurance",
    name: "Carrier Insurance - Pacific Haulers",
    load: "—",
    status: "expiring",
    signingStatus: null,
    date: "2026-05-25",
  },
  {
    id: "DOC-007",
    documensoId: 7,
    type: "Contract",
    name: "Shipper Agreement - Lone Star Foods",
    load: "—",
    status: "complete",
    signingStatus: "signed",
    date: "2026-01-15",
  },
  {
    id: "DOC-008",
    documensoId: 8,
    type: "POD",
    name: "Proof of Delivery - LD-4817",
    load: "LD-4817",
    status: "pending",
    signingStatus: "declined",
    date: "2026-05-14",
  },
];

const typeColor: Record<string, string> = {
  BOL: "text-primary bg-primary/10",
  POD: "text-success bg-success/10",
  "Rate Con": "text-warning bg-warning/10",
  Insurance: "text-accent bg-accent/10",
  Contract: "text-muted-foreground bg-muted",
};

const statusConfig: Record<
  string,
  { label: string; variant: "success" | "destructive" | "warning" | "muted" }
> = {
  complete: { label: "Complete", variant: "success" },
  missing: { label: "Missing", variant: "destructive" },
  expiring: { label: "Expiring Soon", variant: "warning" },
  pending: { label: "Pending Upload", variant: "muted" },
};

const signingStatusConfig: Record<
  string,
  { label: string; variant: "success" | "destructive" | "warning" | "muted" | "info" }
> = {
  signed: { label: "Signed", variant: "success" },
  pending: { label: "Awaiting Signature", variant: "warning" },
  declined: { label: "Declined", variant: "destructive" },
  draft: { label: "Draft", variant: "muted" },
};

export default function DocumentsPage() {
  return (
    <>
      <Header
        title="Documents"
        subtitle="BOLs, PODs, rate confirmations, and contracts"
      />
      <main className="flex-1 overflow-y-auto p-6">
        {/* Upload & Send flow */}
        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Upload & Send for Signature</p>
              <p className="text-xs text-muted-foreground">
                Upload a PDF document and send it to carriers, shippers, or drivers for e-signature via Documenso.
              </p>
            </div>
            <Button size="sm" variant="outline">
              <Upload className="h-4 w-4" />
              Upload PDF
            </Button>
          </div>
        </div>

        {/* Document list */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {documents.length} documents
          </p>
          <Button size="sm">
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        </div>
        <Card>
          <div className="divide-y divide-border">
            {documents.map((doc) => {
              const status = statusConfig[doc.status];
              const signing = doc.signingStatus
                ? signingStatusConfig[doc.signingStatus]
                : null;
              return (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${typeColor[doc.type]}`}
                  >
                    {doc.type.slice(0, 3)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{doc.name}</span>
                      <Badge variant={status.variant}>{status.label}</Badge>
                      {signing && (
                        <Badge variant={signing.variant}>{signing.label}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Load: {doc.load} · {doc.date}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {/* Send for Signature */}
                    {doc.status !== "missing" && (
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

                    {doc.status === "missing" ? (
                      <Button size="sm" variant="outline">
                        <Upload className="h-3.5 w-3.5" />
                        Upload
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </main>
    </>
  );
}
