"use client";

import { useActionState, useEffect, useState } from "react";
import { createLoad } from "@/app/actions/loads";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

const EQUIPMENT_TYPES = [
  { value: "DRY_VAN", label: "Dry Van" },
  { value: "FLATBED", label: "Flatbed" },
  { value: "REEFER", label: "Reefer" },
  { value: "STEP_DECK", label: "Step Deck" },
  { value: "LOWBOY", label: "Lowboy" },
  { value: "TANKER", label: "Tanker" },
  { value: "BOX_TRUCK", label: "Box Truck" },
  { value: "POWER_ONLY", label: "Power Only" },
  { value: "OTHER", label: "Other" },
];

export function CreateLoadDialog() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createLoad, null);

  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4" />New Load</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Load</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4 p-6 pt-4">
          {state?.error && (
            <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">{state.error}</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="originCity">Origin City *</Label>
              <Input id="originCity" name="originCity" placeholder="Houston" className="mt-1" />
              {state?.fieldErrors?.originCity && <p className="text-xs text-destructive mt-1">{state.fieldErrors.originCity[0]}</p>}
            </div>
            <div>
              <Label htmlFor="originState">State *</Label>
              <Input id="originState" name="originState" placeholder="TX" maxLength={2} className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="destCity">Dest City *</Label>
              <Input id="destCity" name="destCity" placeholder="Atlanta" className="mt-1" />
              {state?.fieldErrors?.destCity && <p className="text-xs text-destructive mt-1">{state.fieldErrors.destCity[0]}</p>}
            </div>
            <div>
              <Label htmlFor="destState">State *</Label>
              <Input id="destState" name="destState" placeholder="GA" maxLength={2} className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pickupDate">Pickup Date *</Label>
              <Input id="pickupDate" name="pickupDate" type="date" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="deliveryDate">Delivery Date *</Label>
              <Input id="deliveryDate" name="deliveryDate" type="date" className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="equipmentType">Equipment *</Label>
              <select
                id="equipmentType"
                name="equipmentType"
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {EQUIPMENT_TYPES.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="shipperRate">Shipper Rate ($) *</Label>
              <Input id="shipperRate" name="shipperRate" type="number" step="0.01" placeholder="2500.00" className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="commodity">Commodity</Label>
              <Input id="commodity" name="commodity" placeholder="General freight" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input id="weight" name="weight" type="number" placeholder="42000" className="mt-1" />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Any special instructions..." className="mt-1" rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Creating..." : "Create Load"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
