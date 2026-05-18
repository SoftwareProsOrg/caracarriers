"use client";

import { useState, useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { EquipmentType } from "@prisma/client";
import { updateLoad } from "@/app/actions/loads";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";

const schema = z.object({
  originCity: z.string().min(1, "Required"),
  originState: z.string().min(1, "Required"),
  originAddress: z.string().optional(),
  originZip: z.string().optional(),
  destCity: z.string().min(1, "Required"),
  destState: z.string().min(1, "Required"),
  destAddress: z.string().optional(),
  destZip: z.string().optional(),
  pickupDate: z.string().min(1, "Required"),
  pickupWindow: z.string().optional(),
  deliveryDate: z.string().min(1, "Required"),
  deliveryWindow: z.string().optional(),
  equipmentType: z.nativeEnum(EquipmentType),
  shipperId: z.string().optional(),
  shipperRate: z.coerce.number().positive("Must be positive"),
  carrierRate: z.coerce.number().optional(),
  fuelSurcharge: z.coerce.number().optional(),
  miles: z.coerce.number().int().optional(),
  commodity: z.string().optional(),
  weight: z.coerce.number().optional(),
  bolNumber: z.string().optional(),
  poNumber: z.string().optional(),
  proNumber: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const EQUIPMENT_TYPES = [
  { value: "DRY_VAN", label: "Dry Van" }, { value: "FLATBED", label: "Flatbed" },
  { value: "REEFER", label: "Reefer" }, { value: "STEP_DECK", label: "Step Deck" },
  { value: "LOWBOY", label: "Lowboy" }, { value: "TANKER", label: "Tanker" },
  { value: "BOX_TRUCK", label: "Box Truck" }, { value: "POWER_ONLY", label: "Power Only" },
  { value: "OTHER", label: "Other" },
];

function toDateInput(d: Date) {
  return new Date(d).toISOString().split("T")[0];
}

interface LoadShape {
  id: string;
  originCity: string; originState: string; originAddress: string | null; originZip: string | null;
  destCity: string; destState: string; destAddress: string | null; destZip: string | null;
  pickupDate: Date; pickupWindow: string | null;
  deliveryDate: Date; deliveryWindow: string | null;
  equipmentType: EquipmentType;
  shipperId: string | null;
  shipperRate: unknown; carrierRate: unknown; fuelSurcharge: unknown;
  miles: number | null;
  commodity: string | null; weight: unknown;
  bolNumber: string | null; poNumber: string | null; proNumber: string | null;
  notes: string | null;
}

interface Props {
  load: LoadShape;
  shippers: { id: string; name: string }[];
}

export function EditLoadDialog({ load, shippers }: Props) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: standardSchemaResolver(schema) as unknown as Resolver<FormValues>,
    defaultValues: {
      originCity: load.originCity, originState: load.originState,
      originAddress: load.originAddress ?? "", originZip: load.originZip ?? "",
      destCity: load.destCity, destState: load.destState,
      destAddress: load.destAddress ?? "", destZip: load.destZip ?? "",
      pickupDate: toDateInput(load.pickupDate), pickupWindow: load.pickupWindow ?? "",
      deliveryDate: toDateInput(load.deliveryDate), deliveryWindow: load.deliveryWindow ?? "",
      equipmentType: load.equipmentType,
      shipperId: load.shipperId ?? "",
      shipperRate: Number(load.shipperRate),
      carrierRate: load.carrierRate ? Number(load.carrierRate) : undefined,
      fuelSurcharge: load.fuelSurcharge ? Number(load.fuelSurcharge) : undefined,
      miles: load.miles ?? undefined,
      commodity: load.commodity ?? "",
      weight: load.weight ? Number(load.weight) : undefined,
      bolNumber: load.bolNumber ?? "", poNumber: load.poNumber ?? "", proNumber: load.proNumber ?? "",
      notes: load.notes ?? "",
    },
  });

  function onSubmit(values: FormValues) {
    setServerError(null);
    startTransition(async () => {
      const result = await updateLoad(load.id, values);
      if (result.error) {
        setServerError(result.error);
      } else {
        setOpen(false);
      }
    });
  }

  const err = form.formState.errors;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Pencil className="h-4 w-4 mr-1" />Edit Load</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Load</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 pt-2 space-y-4">
          {serverError && (
            <p className="text-sm text-destructive bg-destructive/10 rounded px-3 py-2">{serverError}</p>
          )}

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Origin</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="originCity">City *</Label>
                <Input id="originCity" {...form.register("originCity")} className="mt-1" />
                {err.originCity && <p className="text-xs text-destructive mt-1">{err.originCity.message}</p>}
              </div>
              <div>
                <Label htmlFor="originState">State *</Label>
                <Input id="originState" {...form.register("originState")} maxLength={2} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="originAddress">Address</Label>
                <Input id="originAddress" {...form.register("originAddress")} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="originZip">Zip</Label>
                <Input id="originZip" {...form.register("originZip")} className="mt-1" />
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Destination</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="destCity">City *</Label>
                <Input id="destCity" {...form.register("destCity")} className="mt-1" />
                {err.destCity && <p className="text-xs text-destructive mt-1">{err.destCity.message}</p>}
              </div>
              <div>
                <Label htmlFor="destState">State *</Label>
                <Input id="destState" {...form.register("destState")} maxLength={2} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="destAddress">Address</Label>
                <Input id="destAddress" {...form.register("destAddress")} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="destZip">Zip</Label>
                <Input id="destZip" {...form.register("destZip")} className="mt-1" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pickupDate">Pickup Date *</Label>
              <Input id="pickupDate" type="date" {...form.register("pickupDate")} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="pickupWindow">Pickup Window</Label>
              <Input id="pickupWindow" {...form.register("pickupWindow")} placeholder="08:00–12:00" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="deliveryDate">Delivery Date *</Label>
              <Input id="deliveryDate" type="date" {...form.register("deliveryDate")} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="deliveryWindow">Delivery Window</Label>
              <Input id="deliveryWindow" {...form.register("deliveryWindow")} placeholder="06:00–10:00" className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="equipmentType">Equipment *</Label>
              <select
                id="equipmentType"
                {...form.register("equipmentType")}
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {EQUIPMENT_TYPES.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="shipperId">Shipper</Label>
              <select
                id="shipperId"
                {...form.register("shipperId")}
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">— None —</option>
                {shippers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Financials</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <Label htmlFor="shipperRate">Shipper Rate ($) *</Label>
                <Input id="shipperRate" type="number" step="0.01" {...form.register("shipperRate")} className="mt-1" />
                {err.shipperRate && <p className="text-xs text-destructive mt-1">{err.shipperRate.message}</p>}
              </div>
              <div>
                <Label htmlFor="carrierRate">Carrier Rate ($)</Label>
                <Input id="carrierRate" type="number" step="0.01" {...form.register("carrierRate")} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="fuelSurcharge">Fuel Surcharge ($)</Label>
                <Input id="fuelSurcharge" type="number" step="0.01" {...form.register("fuelSurcharge")} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="miles">Miles</Label>
                <Input id="miles" type="number" {...form.register("miles")} className="mt-1" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="commodity">Commodity</Label>
              <Input id="commodity" {...form.register("commodity")} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input id="weight" type="number" {...form.register("weight")} className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="bolNumber">BOL #</Label>
              <Input id="bolNumber" {...form.register("bolNumber")} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="poNumber">PO #</Label>
              <Input id="poNumber" {...form.register("poNumber")} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="proNumber">PRO #</Label>
              <Input id="proNumber" {...form.register("proNumber")} className="mt-1" />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              {...form.register("notes")}
              rows={2}
              placeholder="Special instructions..."
              className="mt-1 flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
