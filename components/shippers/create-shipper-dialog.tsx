"use client";

import { useActionState, useEffect, useState } from "react";
import { createShipper } from "@/app/actions/shippers";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

export function CreateShipperDialog() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createShipper, null);

  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4" />Add Shipper</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Shipper</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4 p-6 pt-4">
          {state?.error && (
            <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">{state.error}</p>
          )}

          <div>
            <Label htmlFor="name">Company Name *</Label>
            <Input id="name" name="name" placeholder="Acme Manufacturing" className="mt-1" />
            {state?.fieldErrors?.name && <p className="text-xs text-destructive mt-1">{state.fieldErrors.name[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="contactName">Contact Name</Label>
              <Input id="contactName" name="contactName" placeholder="Sarah Johnson" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" placeholder="(713) 555-0182" className="mt-1" />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="contact@company.com" className="mt-1" />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" placeholder="1234 Industrial Blvd" className="mt-1" />
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="creditLimit">Credit Limit ($)</Label>
              <Input id="creditLimit" name="creditLimit" type="number" step="0.01" placeholder="50000" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="paymentTerms">Payment Terms (days)</Label>
              <Input id="paymentTerms" name="paymentTerms" type="number" placeholder="30" defaultValue="30" className="mt-1" />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Special billing instructions..." className="mt-1" rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Adding..." : "Add Shipper"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
