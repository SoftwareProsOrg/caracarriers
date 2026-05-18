import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { LoadStatus, CarrierStatus } from "@prisma/client";
import Link from "next/link";
import { ArrowLeft, FileText, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusStepper } from "@/components/loads/status-stepper";
import { CarrierSearchDialog } from "@/components/loads/carrier-search-dialog";
import { CheckCallForm } from "@/components/loads/check-call-form";
import { ActivityLog } from "@/components/loads/activity-log";
import { FinancialsBlock } from "@/components/loads/financials-block";
import { EditLoadDialog } from "@/components/loads/edit-load-dialog";
import { DocumentList } from "@/components/loads/document-list";

const STATUS_LABEL: Record<string, string> = {
  IN_TRANSIT: "In Transit", DISPATCHED: "Dispatched", AVAILABLE: "Available",
  DELIVERED: "Delivered", BOOKED: "Booked", CANCELLED: "Cancelled", PROBLEM: "Problem",
};

const STATUS_VARIANT: Record<string, "success" | "info" | "warning" | "muted" | "destructive"> = {
  IN_TRANSIT: "info", DISPATCHED: "warning", AVAILABLE: "success",
  DELIVERED: "muted", BOOKED: "info", CANCELLED: "destructive", PROBLEM: "destructive",
};

const EQUIPMENT_LABEL: Record<string, string> = {
  DRY_VAN: "Dry Van", FLATBED: "Flatbed", REEFER: "Reefer", STEP_DECK: "Step Deck",
  LOWBOY: "Lowboy", TANKER: "Tanker", BOX_TRUCK: "Box Truck", POWER_ONLY: "Power Only", OTHER: "Other",
};

export default async function LoadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await getAuthContext();
  if (!auth) notFound();

  const [load, carriers, shippers] = await Promise.all([
    prisma.load.findUnique({
      where: { id, companyId: auth.companyId },
      include: {
        carrier: { include: { equipment: true } },
        shipper: true,
        events: { orderBy: { occurredAt: "desc" }, take: 50 },
        documents: { orderBy: { createdAt: "desc" } },
        invoice: { select: { id: true, status: true, invoiceNumber: true } },
      },
    }),
    prisma.carrier.findMany({
      where: { companyId: auth.companyId, status: CarrierStatus.APPROVED },
      include: { equipment: true },
      orderBy: { name: "asc" },
    }),
    prisma.shipper.findMany({
      where: { companyId: auth.companyId, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!load) notFound();

  const margin =
    load.carrierRate
      ? Number(load.shipperRate) - Number(load.carrierRate) - Number(load.fuelSurcharge ?? 0)
      : null;
  const marginPct = margin !== null ? (margin / Number(load.shipperRate)) * 100 : null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-6 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/loads"><ArrowLeft className="h-4 w-4 mr-1" />Loads</Link>
          </Button>
          <div className="h-4 w-px bg-border" />
          <span className="font-semibold">{load.loadNumber}</span>
          <Badge variant={STATUS_VARIANT[load.status] ?? "secondary"}>
            {STATUS_LABEL[load.status] ?? load.status}
          </Badge>
          <span className="text-sm text-muted-foreground hidden md:inline">
            {load.originCity}, {load.originState} → {load.destCity}, {load.destState}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={`/api/loads/${load.id}/rate-confirmation`} target="_blank" rel="noopener noreferrer">
              <FileText className="h-4 w-4 mr-1" />Rate Con
            </a>
          </Button>
          {load.invoice ? (
            <Button variant="outline" size="sm" asChild>
              <Link href="/invoicing"><Receipt className="h-4 w-4 mr-1" />{load.invoice.invoiceNumber}</Link>
            </Button>
          ) : null}
          <EditLoadDialog load={load} shippers={shippers} />
        </div>
      </div>

      {/* Status stepper */}
      <StatusStepper currentStatus={load.status} loadId={load.id} />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main column */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Route & Cargo */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Route & Cargo</h3>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-4">
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Pickup</p>
                <p className="font-semibold">{load.originCity}, {load.originState} {load.originZip}</p>
                {load.originAddress && <p className="text-xs text-muted-foreground">{load.originAddress}</p>}
                <p className="text-sm text-primary mt-1">
                  {load.pickupDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  {load.pickupWindow ? ` · ${load.pickupWindow}` : ""}
                </p>
              </div>
              <span className="text-2xl text-muted-foreground">→</span>
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Delivery</p>
                <p className="font-semibold">{load.destCity}, {load.destState} {load.destZip}</p>
                {load.destAddress && <p className="text-xs text-muted-foreground">{load.destAddress}</p>}
                <p className="text-sm text-primary mt-1">
                  {load.deliveryDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  {load.deliveryWindow ? ` · ${load.deliveryWindow}` : ""}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-md bg-muted px-2 py-1">{EQUIPMENT_LABEL[load.equipmentType] ?? load.equipmentType}</span>
              {load.commodity && <span className="rounded-md bg-muted px-2 py-1">{load.commodity}</span>}
              {load.weight && <span className="rounded-md bg-muted px-2 py-1">{Number(load.weight).toLocaleString()} lbs</span>}
              {load.miles && <span className="rounded-md bg-muted px-2 py-1">{load.miles.toLocaleString()} mi</span>}
              {load.bolNumber && <span className="rounded-md bg-muted px-2 py-1">BOL: {load.bolNumber}</span>}
              {load.poNumber && <span className="rounded-md bg-muted px-2 py-1">PO: {load.poNumber}</span>}
              {load.hazmat && <span className="rounded-md bg-destructive/10 text-destructive px-2 py-1">HAZMAT</span>}
            </div>
          </div>

          {/* Carrier */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Carrier</h3>
              <CarrierSearchDialog
                loadId={load.id}
                equipmentType={load.equipmentType}
                currentCarrierId={load.carrierId}
                carriers={carriers}
              />
            </div>
            {load.carrier ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Carrier</p>
                  <p className="font-semibold">{load.carrier.name}</p>
                  {load.carrier.mcNumber && <p className="text-xs text-muted-foreground">MC-{load.carrier.mcNumber}</p>}
                  {load.carrier.phone && (
                    <a href={`tel:${load.carrier.phone}`} className="text-sm text-primary hover:underline block mt-1">
                      {load.carrier.phone}
                    </a>
                  )}
                  {load.carrier.email && <p className="text-xs text-muted-foreground">{load.carrier.email}</p>}
                  <div className="mt-2 flex gap-1 flex-wrap">
                    <Badge variant={load.carrier.insuranceStatus === "ACTIVE" ? "success" : "destructive"} className="text-[10px]">
                      Ins. {load.carrier.insuranceStatus}
                    </Badge>
                    {load.carrier.rating && (
                      <Badge variant="outline" className="text-[10px]">★ {Number(load.carrier.rating).toFixed(1)}</Badge>
                    )}
                  </div>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Tracking</p>
                  {load.currentLocation ? (
                    <p className="text-sm font-medium text-primary">📍 {load.currentLocation}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No location logged</p>
                  )}
                  {load.eta && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ETA: {load.eta.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No carrier assigned yet.</p>
            )}
          </div>

          {/* Financials */}
          <FinancialsBlock
            shipperRate={Number(load.shipperRate)}
            carrierRate={load.carrierRate ? Number(load.carrierRate) : null}
            fuelSurcharge={load.fuelSurcharge ? Number(load.fuelSurcharge) : null}
            margin={margin}
            marginPct={marginPct}
          />

          {/* Documents */}
          <DocumentList
            loadId={load.id}
            companyId={auth.companyId}
            documents={load.documents}
          />
        </div>

        {/* Right sidebar */}
        <div className="w-80 shrink-0 border-l border-border flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <CheckCallForm loadId={load.id} />
            <ActivityLog events={load.events} />
            {load.notes && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Notes</h3>
                <p className="text-sm text-foreground whitespace-pre-wrap">{load.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

