"use client";

import { useState, useTransition, useMemo } from "react";
import { EquipmentType, InsuranceStatus } from "@prisma/client";
import { assignCarrier } from "@/app/actions/loads";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Truck, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type CarrierOption = {
  id: string;
  name: string;
  mcNumber: string | null;
  phone: string | null;
  email: string | null;
  rating: unknown;
  insuranceStatus: InsuranceStatus;
  insuranceExpiry: Date | null;
  equipment: { type: EquipmentType }[];
};

interface Props {
  loadId: string;
  equipmentType: EquipmentType;
  currentCarrierId: string | null;
  carriers: CarrierOption[];
}

export function CarrierSearchDialog({ loadId, equipmentType, currentCarrierId, carriers }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [carrierRate, setCarrierRate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return carriers
      .filter((c) => {
        if (!q) return true;
        return (
          c.name.toLowerCase().includes(q) ||
          (c.mcNumber?.toLowerCase().includes(q) ?? false)
        );
      })
      .sort((a, b) => {
        const aMatch = a.equipment.some((e) => e.type === equipmentType) ? 1 : 0;
        const bMatch = b.equipment.some((e) => e.type === equipmentType) ? 1 : 0;
        if (bMatch !== aMatch) return bMatch - aMatch;
        const aIns = a.insuranceStatus === InsuranceStatus.ACTIVE ? 1 : 0;
        const bIns = b.insuranceStatus === InsuranceStatus.ACTIVE ? 1 : 0;
        if (bIns !== aIns) return bIns - aIns;
        return (Number(b.rating) ?? 0) - (Number(a.rating) ?? 0);
      });
  }, [carriers, query, equipmentType]);

  function handleAssign() {
    if (!selectedId) { setError("Select a carrier first"); return; }
    const rate = parseFloat(carrierRate);
    if (!carrierRate || isNaN(rate) || rate <= 0) { setError("Enter a valid carrier rate"); return; }
    setError(null);

    startTransition(async () => {
      const result = await assignCarrier(loadId, selectedId, rate);
      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setQuery("");
        setSelectedId(null);
        setCarrierRate("");
      }
    });
  }

  function handleOpenChange(v: boolean) {
    setOpen(v);
    if (!v) { setQuery(""); setSelectedId(null); setCarrierRate(""); setError(null); }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant={currentCarrierId ? "outline" : "default"}>
          <Truck className="h-4 w-4 mr-1" />
          {currentCarrierId ? "Reassign Carrier" : "Assign Carrier"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Assign Carrier</DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or MC#..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1 rounded-lg border border-border">
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No approved carriers found.</p>
            )}
            {filtered.map((c) => {
              const equip = c.equipment.some((e) => e.type === equipmentType);
              const isSelected = c.id === selectedId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors",
                    isSelected && "bg-primary/10 border-l-2 border-primary",
                    c.id === currentCarrierId && "opacity-50",
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{c.name}</span>
                      {c.mcNumber && <span className="text-xs text-muted-foreground">MC-{c.mcNumber}</span>}
                      {equip && (
                        <Badge variant="success" className="text-[10px]">Equipment match</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={c.insuranceStatus === InsuranceStatus.ACTIVE ? "success" : "destructive"}
                        className="text-[10px]"
                      >
                        {c.insuranceStatus === InsuranceStatus.ACTIVE ? (
                          <><CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />Ins. OK</>
                        ) : (
                          <><AlertTriangle className="h-2.5 w-2.5 mr-0.5" />Ins. {c.insuranceStatus}</>
                        )}
                      </Badge>
                      {c.rating != null && <span className="text-xs text-muted-foreground">★ {Number(c.rating).toFixed(1)}</span>}
                      {c.phone && <span className="text-xs text-muted-foreground">{c.phone}</span>}
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>

          {selectedId && (
            <div>
              <Label htmlFor="carrierRate">Carrier Rate ($)</Label>
              <Input
                id="carrierRate"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 2400.00"
                value={carrierRate}
                onChange={(e) => setCarrierRate(e.target.value)}
                className="mt-1"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-1">
                Rate confirmation will be emailed to the carrier automatically if they have an email on file.
              </p>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAssign} disabled={isPending || !selectedId}>
            {isPending ? "Assigning..." : "Confirm Assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
