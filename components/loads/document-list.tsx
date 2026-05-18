"use client";

import { useState, useRef, useTransition } from "react";
import { Document, DocumentType } from "@prisma/client";
import { recordDocument } from "@/app/actions/loads";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileText, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const DOC_TYPES: { type: DocumentType; label: string }[] = [
  { type: DocumentType.RATE_CONFIRMATION, label: "Rate Confirmation" },
  { type: DocumentType.BOL, label: "Bill of Lading" },
  { type: DocumentType.POD, label: "Proof of Delivery" },
];

interface Props {
  loadId: string;
  companyId: string;
  documents: Document[];
}

export function DocumentList({ loadId, companyId, documents }: Props) {
  const [uploading, setUploading] = useState<DocumentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingType, setPendingType] = useState<DocumentType | null>(null);

  function findDoc(type: DocumentType) {
    return documents.find((d) => d.type === type) ?? null;
  }

  function triggerUpload(type: DocumentType) {
    setPendingType(type);
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !pendingType) return;
    e.target.value = "";
    setError(null);
    setUploading(pendingType);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "pdf";
      const path = `${companyId}/${loadId}/${pendingType}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("load-documents")
        .upload(path, file, { upsert: true });

      if (uploadError) throw new Error(uploadError.message);

      const { data: urlData } = await supabase.storage
        .from("load-documents")
        .createSignedUrl(path, 60 * 60 * 24 * 7);

      startTransition(async () => {
        const result = await recordDocument(
          loadId,
          pendingType,
          file.name,
          urlData?.signedUrl ?? "",
          path
        );
        if (result.error) setError(result.error);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
      setPendingType(null);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-1.5">
        <FileText className="h-4 w-4" />Documents
      </h3>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="space-y-2">
        {DOC_TYPES.map(({ type, label }) => {
          const doc = findDoc(type);
          const isUploading = uploading === type;
          return (
            <div
              key={type}
              className={cn(
                "flex items-center justify-between rounded-lg border p-3",
                doc ? "border-border bg-muted/20" : "border-dashed border-border/60 bg-muted/5"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                {doc ? (
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{label}</p>
                  {doc && <p className="text-xs text-muted-foreground truncate">{doc.name}</p>}
                  {!doc && <p className="text-xs text-muted-foreground">Awaiting upload</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                {doc?.fileUrl && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUploading || isPending}
                  onClick={() => triggerUpload(type)}
                >
                  <Upload className="h-3.5 w-3.5 mr-1" />
                  {isUploading ? "Uploading..." : doc ? "Replace" : "Upload"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </div>
  );
}
