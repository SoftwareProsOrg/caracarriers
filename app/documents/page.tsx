import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Download, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";

const documents = [
  { id: "DOC-001", type: "BOL", name: "Bill of Lading - LD-4818", load: "LD-4818", status: "complete", date: "2026-05-14" },
  { id: "DOC-002", type: "POD", name: "Proof of Delivery - LD-4815", load: "LD-4815", status: "missing", date: "2026-05-12" },
  { id: "DOC-003", type: "Rate Con", name: "Rate Confirmation - LD-4821", load: "LD-4821", status: "complete", date: "2026-05-14" },
  { id: "DOC-004", type: "Rate Con", name: "Rate Confirmation - LD-4820", load: "LD-4820", status: "complete", date: "2026-05-14" },
  { id: "DOC-005", type: "Insurance", name: "Carrier Insurance - Martinez Trucking", load: "—", status: "complete", date: "2026-05-01" },
  { id: "DOC-006", type: "Insurance", name: "Carrier Insurance - Pacific Haulers", load: "—", status: "expiring", date: "2026-05-25" },
  { id: "DOC-007", type: "Contract", name: "Shipper Agreement - Lone Star Foods", load: "—", status: "complete", date: "2026-01-15" },
  { id: "DOC-008", type: "POD", name: "Proof of Delivery - LD-4817", load: "LD-4817", status: "pending", date: "2026-05-14" },
];

const typeColor: Record<string, string> = {
  BOL: "text-primary bg-primary/10",
  POD: "text-success bg-success/10",
  "Rate Con": "text-warning bg-warning/10",
  Insurance: "text-accent bg-accent/10",
  Contract: "text-muted-foreground bg-muted",
};

const statusConfig: Record<string, { label: string; variant: "success" | "destructive" | "warning" | "muted" }> = {
  complete: { label: "Complete", variant: "success" },
  missing: { label: "Missing", variant: "destructive" },
  expiring: { label: "Expiring Soon", variant: "warning" },
  pending: { label: "Pending Upload", variant: "muted" },
};

export default function DocumentsPage() {
  return (
    <>
      <Header title="Documents" subtitle="BOLs, PODs, rate confirmations, and contracts" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{documents.length} documents</p>
          <Button size="sm"><Upload className="h-4 w-4" />Upload Document</Button>
        </div>
        <Card>
          <div className="divide-y divide-border">
            {documents.map((doc) => {
              const status = statusConfig[doc.status];
              return (
                <div key={doc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${typeColor[doc.type]}`}>
                    {doc.type.slice(0, 3)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{doc.name}</span>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Load: {doc.load} · {doc.date}</p>
                  </div>
                  {doc.status === "missing" ? (
                    <Button size="sm" variant="outline" className="shrink-0">
                      <Upload className="h-3.5 w-3.5" />Upload
                    </Button>
                  ) : doc.status === "complete" ? (
                    <Button size="sm" variant="ghost" className="shrink-0">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Card>
      </main>
    </>
  );
}
