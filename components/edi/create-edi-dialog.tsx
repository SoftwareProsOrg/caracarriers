"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

const EDI_TYPE_OPTIONS = [
  { value: "204", label: "EDI 204 — Load Tender" },
  { value: "210", label: "EDI 210 — Invoice" },
  { value: "214", label: "EDI 214 — Shipment Status" },
  { value: "990", label: "EDI 990 — Response" },
];

interface ParsedPreview {
  status: string;
  data: Record<string, unknown>;
  errors?: string[];
}

export function CreateEdiDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedPreview | null>(null);

  const [ediType, setEdiType] = useState("204");
  const [direction, setDirection] = useState("outbound");
  const [rawContent, setRawContent] = useState("");
  const [partnerId, setPartnerId] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);
    setParsed(null);

    try {
      const res = await fetch("/api/edi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ediType,
          direction,
          rawContent: rawContent || null,
          partnerId: partnerId || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to create EDI document");
        return;
      }

      if (data.parsed) {
        setParsed({
          status: data.parsed.status,
          data: data.parsed.data,
          errors: data.parsed.errors,
        });
      }

      setTimeout(() => {
        setOpen(false);
        reset();
        router.refresh();
      }, 1500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function reset() {
    setEdiType("204");
    setDirection("outbound");
    setRawContent("");
    setPartnerId("");
    setParsed(null);
    setError(null);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm"><Send className="h-4 w-4" />Send EDI Document</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
        <DialogHeader>
          <DialogTitle>Send EDI Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-4">
          {error && (
            <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">{error}</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ediType">EDI Type *</Label>
              <select
                id="ediType"
                value={ediType}
                onChange={(e) => setEdiType(e.target.value)}
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {EDI_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="direction">Direction</Label>
              <select
                id="direction"
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="outbound">Outbound</option>
                <option value="inbound">Inbound</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="partnerId">Partner ID (optional)</Label>
            <Input
              id="partnerId"
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              placeholder="e.g. ACME-EDI"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="rawContent">Raw EDI Content (optional)</Label>
            <Textarea
              id="rawContent"
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              placeholder="ISA*00* ..."
              className="mt-1 font-mono text-xs"
              rows={8}
            />
          </div>

          {parsed && (
            <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3">
              <p className="text-xs font-medium text-success mb-1">
                Parsed successfully ({parsed.status})
              </p>
              <pre className="text-xs text-muted-foreground overflow-auto max-h-32">
                {JSON.stringify(parsed.data, null, 2)}
              </pre>
              {parsed.errors && parsed.errors.length > 0 && (
                <ul className="mt-1 text-xs text-warning">
                  {parsed.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { setOpen(false); reset(); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={sending}>
              {sending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
              ) : (
                <><Send className="h-4 w-4" /> Send</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
