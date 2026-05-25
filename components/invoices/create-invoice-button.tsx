"use client";

import { useActionState, useEffect, useState, startTransition } from "react";
import { createInvoice } from "@/app/actions/invoices";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

interface Props {
  shippers: { id: string; name: string }[];
}

export function CreateInvoiceButton({ shippers }: Props) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createInvoice, null);

  useEffect(() => {
    if (state?.success) startTransition(() => setOpen(false));
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4" />New Invoice</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4 p-6 pt-4">
          {state?.error && (
            <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">{state.error}</p>
          )}

          <div>
            <Label htmlFor="shipperId">Shipper *</Label>
            <select
              id="shipperId"
              name="shipperId"
              className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select a shipper...</option>
              {shippers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {state?.fieldErrors?.shipperId && <p className="text-xs text-destructive mt-1">{state.fieldErrors.shipperId[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="amount">Amount ($) *</Label>
              <Input id="amount" name="amount" type="number" step="0.01" placeholder="2500.00" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="dueAt">Due Date *</Label>
              <Input id="dueAt" name="dueAt" type="date" className="mt-1" />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Invoice notes..." className="mt-1" rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending || shippers.length === 0}>
              {pending ? "Creating..." : "Create Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
