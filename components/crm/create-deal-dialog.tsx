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
import { PIPELINE_STAGES } from "@/lib/crm/pipeline";

export function CreateDealDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {
      name: form.get("name"),
      stage: form.get("stage"),
      probability: parseInt(form.get("probability") as string, 10) || 0,
    };

    const value = form.get("value") as string;
    if (value) body.value = parseFloat(value);

    const expectedCloseDate = form.get("expectedCloseDate") as string;
    if (expectedCloseDate) body.expectedCloseDate = expectedCloseDate;

    const assignedTo = form.get("assignedTo") as string;
    if (assignedTo) body.assignedTo = assignedTo;

    const notes = form.get("notes") as string;
    if (notes) body.notes = notes;

    try {
      const res = await fetch("/api/crm/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to create deal");
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4" />New Deal</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Deal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-4">
          {error && (
            <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">{error}</p>
          )}

          <div>
            <Label htmlFor="name">Deal Name *</Label>
            <Input id="name" name="name" placeholder="Acme Corp - Chicago to Atlanta" className="mt-1" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="value">Value ($)</Label>
              <Input id="value" name="value" type="number" step="0.01" placeholder="5000.00" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="probability">Probability (%)</Label>
              <Input id="probability" name="probability" type="number" min="0" max="100" defaultValue="10" className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="stage">Stage *</Label>
              <select
                id="stage"
                name="stage"
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                {PIPELINE_STAGES.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="expectedCloseDate">Expected Close</Label>
              <Input id="expectedCloseDate" name="expectedCloseDate" type="date" className="mt-1" />
            </div>
          </div>

          <div>
            <Label htmlFor="assignedTo">Assigned To</Label>
            <Input id="assignedTo" name="assignedTo" placeholder="Sales rep name" className="mt-1" />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Deal details..." className="mt-1" rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "Create Deal"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
