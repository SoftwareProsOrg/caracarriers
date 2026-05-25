"use client";

import { useActionState, useEffect, useState, startTransition } from "react";
import { createCarrier } from "@/app/actions/carriers";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

export function CreateCarrierDialog() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createCarrier, null);

  useEffect(() => {
    if (state?.success) startTransition(() => setOpen(false));
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4" />Add Carrier</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Carrier</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4 p-6 pt-4">
          {state?.error && (
            <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">{state.error}</p>
          )}

          <div>
            <Label htmlFor="name">Carrier Name *</Label>
            <Input id="name" name="name" placeholder="Martinez Trucking LLC" className="mt-1" />
            {state?.fieldErrors?.name && <p className="text-xs text-destructive mt-1">{state.fieldErrors.name[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="mcNumber">MC Number</Label>
              <Input id="mcNumber" name="mcNumber" placeholder="MC-887421" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="dotNumber">DOT Number</Label>
              <Input id="dotNumber" name="dotNumber" placeholder="DOT-2341872" className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="dispatch@carrier.com" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" placeholder="(832) 555-0192" className="mt-1" />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" placeholder="123 Truck Rd" className="mt-1" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" placeholder="Houston" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" name="state" placeholder="TX" maxLength={2} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="zip">ZIP</Label>
              <Input id="zip" name="zip" placeholder="77001" className="mt-1" />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Preferred lanes, special requirements..." className="mt-1" rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Adding..." : "Add Carrier"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
