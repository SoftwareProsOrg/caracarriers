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
import { Banknote } from "lucide-react";
import { calculateFactorAmount } from "@/lib/accounting/factoring";

interface UnpaidInvoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  shipperName: string;
}

interface Props {
  invoices: UnpaidInvoice[];
}

export function FactoringDialog({ invoices }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [factorRate, setFactorRate] = useState("95");

  const eligible = invoices.filter(
    (i) => (selectedInvoiceId || true) && true,
  );

  const selectedInvoice = invoices.find((i) => i.id === selectedInvoiceId);
  const rateDecimal = (parseFloat(factorRate) || 95) / 100;
  const factoring = selectedInvoice ? calculateFactorAmount(selectedInvoice.amount, rateDecimal) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedInvoiceId) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/accounting/factoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: selectedInvoiceId, factorRate: rateDecimal }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Factoring failed");
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
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setError(null); setFactorRate("95"); } }}>
      <DialogTrigger asChild>
        <Button size="sm"><Banknote className="h-4 w-4" />Process Factoring</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Process Invoice for Factoring</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-4">
          {error && (
            <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">{error}</p>
          )}

          <div>
            <Label htmlFor="invoice">Unpaid Invoice *</Label>
            <select
              id="invoice"
              className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={selectedInvoiceId}
              onChange={(e) => setSelectedInvoiceId(e.target.value)}
              required
            >
              <option value="">Select invoice...</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} — {inv.shipperName} (${inv.amount.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="factorRate">Factor Rate (%)</Label>
            <Input
              id="factorRate"
              type="number"
              min="50"
              max="99"
              step="0.5"
              value={factorRate}
              onChange={(e) => setFactorRate(e.target.value)}
              className="mt-1"
            />
          </div>

          {factoring && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Invoice Amount</span>
                <span className="font-medium">${selectedInvoice!.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Advance Amount ({(rateDecimal * 100).toFixed(0)}%)</span>
                <span className="font-medium text-green-600">${factoring.advanceAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Factor Fee</span>
                <span className="font-medium text-red-600">-${factoring.factorFee.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-sm">
                <span className="font-semibold">Net to You</span>
                <span className="font-bold">${factoring.netToYou.toFixed(2)}</span>
              </div>
            </div>
          )}

          {invoices.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-3">
              No unpaid invoices available for factoring.
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting || invoices.length === 0}>
              {submitting ? "Processing..." : "Submit for Factoring"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
