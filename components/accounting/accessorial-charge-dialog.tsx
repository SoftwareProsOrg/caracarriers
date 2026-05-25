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
import { ACCESSORIAL_CHARGES, calculateDetention, calculateLumperFee } from "@/lib/accounting/accessorials";

interface LoadItem {
  id: string;
  loadNumber: string;
  equipmentType: string;
  weight: number | null;
  pieces: number | null;
}

interface Props {
  loads: LoadItem[];
}

export function AccessorialChargeDialog({ loads }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLoadId, setSelectedLoadId] = useState("");
  const [chargeType, setChargeType] = useState("detention");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const selectedLoad = loads.find((l) => l.id === selectedLoadId);

  function suggestAmount() {
    if (chargeType === "detention" && selectedLoad?.equipmentType) {
      const suggested = calculateDetention(4, selectedLoad.equipmentType);
      setAmount(suggested.toString());
    } else if (chargeType === "lumper" && selectedLoad?.weight && selectedLoad.pieces) {
      const suggested = calculateLumperFee(selectedLoad.weight, selectedLoad.pieces);
      setAmount(suggested.toString());
    } else {
      const config = ACCESSORIAL_CHARGES.find((c) => c.type === chargeType);
      if (config && config.typicalAmount > 0) setAmount(config.typicalAmount.toString());
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedLoadId || !amount) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/accounting/accessorials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loadId: selectedLoadId,
          type: chargeType,
          amount: parseFloat(amount),
          notes: notes || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to add charge");
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

  const chargeConfig = ACCESSORIAL_CHARGES.find((c) => c.type === chargeType);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) { setError(null); setAmount(""); setNotes(""); }
        if (v && loads.length > 0) {
          setSelectedLoadId(loads[0].id);
          setChargeType("detention");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Plus className="h-4 w-4" />Accessorial Charge</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Accessorial Charge</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-4">
          {error && (
            <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">{error}</p>
          )}

          <div>
            <Label htmlFor="load">Load *</Label>
            <select
              id="load"
              className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={selectedLoadId}
              onChange={(e) => { setSelectedLoadId(e.target.value); }}
              required
            >
              <option value="">Select load...</option>
              {loads.map((l) => (
                <option key={l.id} value={l.id}>{l.loadNumber}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="chargeType">Charge Type *</Label>
            <select
              id="chargeType"
              className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={chargeType}
              onChange={(e) => { setChargeType(e.target.value); }}
              required
            >
              {ACCESSORIAL_CHARGES.map((c) => (
                <option key={c.type} value={c.type}>{c.label} — {c.description}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="amount">Amount ($) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1"
              required
            />
            {chargeConfig && chargeConfig.typicalAmount > 0 && (
              <button
                type="button"
                className="mt-1 text-xs text-muted-foreground hover:text-primary underline"
                onClick={() => {
                  if (chargeType === "detention" && selectedLoad?.equipmentType) {
                    setAmount(calculateDetention(4, selectedLoad.equipmentType).toString());
                  } else if (chargeType === "lumper" && selectedLoad?.weight && selectedLoad.pieces) {
                    setAmount(calculateLumperFee(selectedLoad.weight, selectedLoad.pieces).toString());
                  } else {
                    setAmount(chargeConfig.typicalAmount.toString());
                  }
                }}
              >
                Suggest typical amount (${chargeConfig.typicalAmount.toFixed(2)})
              </button>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes about this charge..." className="mt-1" rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting || loads.length === 0}>
              {submitting ? "Adding..." : "Add Charge"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
