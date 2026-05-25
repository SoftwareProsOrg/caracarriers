import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, MessageSquare, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getPortalUser } from "@/lib/portal/session";

const STATUS_LABEL: Record<string, string> = {
  IN_TRANSIT: "In Transit",
  DISPATCHED: "Dispatched",
  AVAILABLE: "Available",
  DELIVERED: "Delivered",
  BOOKED: "Booked",
  CANCELLED: "Cancelled",
  PROBLEM: "Problem",
};

const STATUS_VARIANT: Record<string, "success" | "info" | "warning" | "muted" | "destructive"> = {
  IN_TRANSIT: "info",
  DISPATCHED: "warning",
  AVAILABLE: "success",
  DELIVERED: "muted",
  BOOKED: "info",
  CANCELLED: "destructive",
  PROBLEM: "destructive",
};

const EQUIPMENT_LABEL: Record<string, string> = {
  DRY_VAN: "Dry Van",
  FLATBED: "Flatbed",
  REEFER: "Reefer",
  STEP_DECK: "Step Deck",
  LOWBOY: "Lowboy",
  TANKER: "Tanker",
  BOX_TRUCK: "Box Truck",
  POWER_ONLY: "Power Only",
  OTHER: "Other",
};

export default async function PortalLoadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const portalUser = await getPortalUser();
  if (!portalUser) redirect("/login");

  const load = await prisma.load.findUnique({
    where: { id, companyId: portalUser.companyId, shipperId: portalUser.shipperId },
    include: {
      carrier: { select: { name: true, mcNumber: true, phone: true } },
      documents: { orderBy: { createdAt: "desc" } },
      trackingEvents: { orderBy: { recordedAt: "desc" }, take: 20 },
      communications: {
        where: { companyId: portalUser.companyId },
        orderBy: { createdAt: "desc" },
        take: 30,
      },
    },
  });

  if (!load) notFound();

  const downloadableDocs = load.documents.filter((d) => d.fileUrl);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/portal/loads"><ArrowLeft className="h-4 w-4 mr-1" />Back</Link>
        </Button>
        <div className="h-4 w-px bg-slate-200" />
        <span className="font-semibold text-slate-900">{load.loadNumber}</span>
        <Badge variant={STATUS_VARIANT[load.status] ?? "secondary"}>
          {STATUS_LABEL[load.status] ?? load.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shipment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-[10px] font-bold text-blue-600 uppercase">Pickup</p>
                  <p className="font-semibold text-slate-900">{load.originCity}, {load.originState}</p>
                  {load.originAddress && <p className="text-xs text-slate-500">{load.originAddress}</p>}
                  <p className="text-sm text-blue-600 mt-1">
                    {load.pickupDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    {load.pickupWindow ? ` · ${load.pickupWindow}` : ""}
                  </p>
                </div>
                <span className="text-2xl text-slate-300">→</span>
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-[10px] font-bold text-blue-600 uppercase">Delivery</p>
                  <p className="font-semibold text-slate-900">{load.destCity}, {load.destState}</p>
                  {load.destAddress && <p className="text-xs text-slate-500">{load.destAddress}</p>}
                  <p className="text-sm text-blue-600 mt-1">
                    {load.deliveryDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    {load.deliveryWindow ? ` · ${load.deliveryWindow}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-sm">
                <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">
                  {EQUIPMENT_LABEL[load.equipmentType] ?? load.equipmentType}
                </span>
                {load.commodity && (
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">{load.commodity}</span>
                )}
                {load.weight && (
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">
                    {Number(load.weight).toLocaleString()} lbs
                  </span>
                )}
                {load.miles && (
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">
                    {load.miles.toLocaleString()} mi
                  </span>
                )}
                {load.bolNumber && (
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">BOL: {load.bolNumber}</span>
                )}
                {load.poNumber && (
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">PO: {load.poNumber}</span>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-sm text-slate-500">Rate</span>
                <span className="text-lg font-bold text-slate-900">{formatCurrency(Number(load.shipperRate))}</span>
              </div>
            </CardContent>
          </Card>

          {load.carrier && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Carrier</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-slate-900">{load.carrier.name}</p>
                {load.carrier.mcNumber && (
                  <p className="text-sm text-slate-500">MC-{load.carrier.mcNumber}</p>
                )}
                {load.carrier.phone && (
                  <a href={`tel:${load.carrier.phone}`} className="text-sm text-blue-600 hover:underline block mt-1">
                    {load.carrier.phone}
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {load.communications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Communications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {load.communications.map((comm) => (
                  <div key={comm.id} className="rounded-lg border border-slate-100 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-500 uppercase">
                        {comm.type} · {comm.direction}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDateTime(comm.createdAt)}
                      </span>
                    </div>
                    {comm.subject && (
                      <p className="text-sm font-medium text-slate-900">{comm.subject}</p>
                    )}
                    {comm.body && (
                      <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{comm.body}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {downloadableDocs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {downloadableDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{doc.name}</p>
                      <p className="text-xs text-slate-500">{doc.type}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={doc.fileUrl!} target="_blank" rel="noopener noreferrer">
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Download
                      </a>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Tracking Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {load.trackingEvents.length === 0 ? (
                <p className="text-sm text-slate-500">No tracking events recorded yet.</p>
              ) : (
                <div className="relative space-y-0">
                  {load.trackingEvents.map((event, idx) => (
                    <div key={event.id} className="flex gap-3 pb-4 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className={`h-2.5 w-2.5 rounded-full ring-2 ring-white ${idx === 0 ? "bg-blue-600" : "bg-slate-300"}`} />
                        {idx < load.trackingEvents.length - 1 && (
                          <div className="w-px flex-1 bg-slate-200 mt-1" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {event.locationName ?? `${event.latitude.toFixed(4)}, ${event.longitude.toFixed(4)}`}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(event.recordedAt)}
                        </div>
                        {event.speed != null && (
                          <p className="text-xs text-slate-400 mt-0.5">{event.speed.toFixed(0)} mph</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
