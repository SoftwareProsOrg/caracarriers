"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DocumentType } from "@prisma/client";

const DOC_TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: "BOL", label: "Bill of Lading" },
  { value: "POD", label: "Proof of Delivery" },
  { value: "RATE_CONFIRMATION", label: "Rate Confirmation" },
  { value: "INSURANCE_CERTIFICATE", label: "Insurance Certificate" },
  { value: "CONTRACT", label: "Contract" },
  { value: "CARRIER_PACKET", label: "Carrier Packet" },
  { value: "W9", label: "W-9" },
  { value: "OTHER", label: "Other" },
];

const schema = z.object({
  name: z.string().min(1, "Document name is required"),
  type: z.nativeEnum(DocumentType),
});

type FormValues = z.infer<typeof schema>;

interface UploadDocumentDialogProps {
  companyId: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function UploadDocumentDialog({
  companyId,
  trigger,
  onSuccess,
}: UploadDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      type: DocumentType.OTHER,
    },
  });

  async function onSubmit(values: FormValues) {
    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = createClient();
      const ext = selectedFile.name.split(".").pop() ?? "pdf";
      const path = `${companyId}/standalone/${values.type}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("load-documents")
        .upload(path, selectedFile, { upsert: true });

      if (uploadError) throw new Error(uploadError.message);

      const { data: urlData } = await supabase.storage
        .from("load-documents")
        .createSignedUrl(path, 60 * 60 * 24 * 365);

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("type", values.type);
      formData.append("fileUrl", urlData?.signedUrl ?? "");
      formData.append("filePath", path);

      const { uploadDocument } = await import("@/app/actions/documents");
      const result = await uploadDocument(null, formData);

      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        reset();
        setSelectedFile(null);
        onSuccess?.();
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (!open) {
    return (
      <>
        {trigger ? (
          <div onClick={() => setOpen(true)}>{trigger}</div>
        ) : (
          <Button size="sm" onClick={() => setOpen(true)}>
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        )}
      </>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-card-foreground">Upload Document</h3>
          <button
            type="button"
            onClick={() => { setOpen(false); setError(null); setSuccess(false); reset(); setSelectedFile(null); }}
            className="text-muted-foreground hover:text-foreground text-lg leading-none"
            disabled={uploading}
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2.5 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success mb-4">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            Document uploaded successfully.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Document Name</Label>
            <Input
              id="name"
              placeholder="e.g. Signed Contract - Acme"
              disabled={uploading}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="type">Document Type</Label>
            <select
              id="type"
              disabled={uploading}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              {...register("type")}
            >
              {DOC_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="text-xs text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>File</Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border p-4 text-sm text-muted-foreground hover:border-primary/50 transition-colors"
            >
              {selectedFile ? (
                <span className="font-medium text-foreground">{selectedFile.name}</span>
              ) : (
                <span>Click to select a file (PDF, JPG, PNG, DOC)</span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => { setOpen(false); setError(null); setSuccess(false); reset(); setSelectedFile(null); }}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={uploading || !selectedFile}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
