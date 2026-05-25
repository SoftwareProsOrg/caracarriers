"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { COMMUNICATION_TYPES, type CommunicationType } from "@/lib/communications/types";

interface NewCommunicationDialogProps {
  defaultLoadId?: string;
}

export function NewCommunicationDialog({ defaultLoadId }: NewCommunicationDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commType, setCommType] = useState<CommunicationType>("note");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {
      type: commType,
      direction: "outbound",
    };

    const loadId = form.get("loadId") as string;
    if (loadId) body.loadId = loadId;

    const subject = form.get("subject") as string;
    if (subject) body.subject = subject;

    const bodyText = form.get("body") as string;
    if (bodyText) body.body = bodyText;

    const toAddr = form.get("toAddr") as string;
    if (toAddr) body.toAddr = toAddr;

    const fromAddr = form.get("fromAddr") as string;
    if (fromAddr) body.fromAddr = fromAddr;

    try {
      const res = await fetch("/api/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to create communication");
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const showSubject = commType === "email" || commType === "note";
  const showBody = commType !== "call";
  const showToAddr = commType === "email" || commType === "sms";
  const showFromAddr = commType === "email";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4" />New Communication</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Communication</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-4">
          {error && (
            <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">{error}</p>
          )}

          <div>
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              value={commType}
              onChange={(e) => setCommType(e.target.value as CommunicationType)}
              className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {Object.entries(COMMUNICATION_TYPES).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="loadId">Load ID (optional)</Label>
            <Input
              id="loadId"
              name="loadId"
              placeholder="Link to a load..."
              className="mt-1"
              defaultValue={defaultLoadId ?? ""}
            />
          </div>

          {showSubject && (
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" placeholder="Subject line..." className="mt-1" />
            </div>
          )}

          {showToAddr && (
            <div>
              <Label htmlFor="toAddr">To</Label>
              <Input id="toAddr" name="toAddr" placeholder={commType === "email" ? "recipient@example.com" : "+1234567890"} className="mt-1" />
            </div>
          )}

          {showFromAddr && (
            <div>
              <Label htmlFor="fromAddr">From</Label>
              <Input id="fromAddr" name="fromAddr" placeholder="your@email.com" className="mt-1" />
            </div>
          )}

          {showBody && (
            <div>
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                name="body"
                placeholder={commType === "note" ? "Write a note..." : "Type your message..."}
                className="mt-1"
                rows={4}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : `Create ${COMMUNICATION_TYPES[commType].label}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
