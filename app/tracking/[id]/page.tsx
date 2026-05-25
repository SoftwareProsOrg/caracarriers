import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Truck, Navigation } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { TrackingTimeline } from "@/components/tracking/tracking-timeline";
import { UpdateLocationDialog } from "@/components/tracking/update-location-dialog";

const STATUS_LABEL: Record<string, string> = {
  IN_TRANSIT: "In Transit",
  DISPATCHED: "Dispatched",
};

const STATUS_VARIANT: Record<string, "info" | "warning"> = {
  IN_TRANSIT: "info",
  DISPATCHED: "warning",
};

export default async function TrackingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await getAuthContext();
  const { id } = await params;

  const load = auth
    ? await prisma.load.findFirst({
        where: { id, companyId: auth.companyId },
        include: {
          carrier: { select: { name: true, phone: true, mcNumber: true } },
          shipper: { select: { name: true } },
          trackingEvents: {
            orderBy: { recordedAt: "desc" },
            take: 50,
          },
        },
      })
    : null;

  if (!load) notFound();

  const events = load.trackingEvents.map((e) => ({
    id: e.id,
    latitude: e.latitude,
    longitude: e.longitude,
    speed: e.speed,
    heading: e.heading,
    locationName: e.locationName,
    recordedAt: e.recordedAt.toISOString(),
    source: e.source,
  }));

  const variant = STATUS_VARIANT[load.status] ?? "info";
  const label = STATUS_LABEL[load.status] ?? load.status;

  return (
    <>
      <Header title={`Load ${load.loadNumber}`} subtitle="Real-time tracking detail" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4">
          <Link
            href="/tracking"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tracking
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold">{load.loadNumber}</h2>
                    <Badge variant={variant}>{label}</Badge>
                  </div>
                  <UpdateLocationDialog loadId={load.id} />
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {load.originCity}, {load.originState} → {load.destCity}, {load.destState}
                </div>
                {load.currentLocation && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last known: {load.currentLocation}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 rounded-lg bg-muted text-muted-foreground text-sm">
                  <div className="flex flex-col items-center gap-2">
                    <MapPin className="h-8 w-8" />
                    <span>Map Integration</span>
                    <span className="text-xs">Connect Google Maps / Mapbox</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tracking Events</CardTitle>
              </CardHeader>
              <CardContent>
                <TrackingTimeline events={events} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Load Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Route</p>
                  <p className="text-sm font-medium">
                    {load.originCity}, {load.originState}
                  </p>
                  <p className="text-sm text-muted-foreground">→</p>
                  <p className="text-sm font-medium">
                    {load.destCity}, {load.destState}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Badge variant={variant}>{label}</Badge>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Carrier</p>
                  {load.carrier ? (
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{load.carrier.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-warning font-medium">No carrier assigned</span>
                  )}
                  {load.carrier?.mcNumber && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      MC#{load.carrier.mcNumber}
                    </p>
                  )}
                </div>

                {load.shipper && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Shipper</p>
                    <p className="text-sm font-medium">{load.shipper.name}</p>
                  </div>
                )}

                {load.eta && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Estimated Arrival</p>
                    <div className="flex items-center gap-1">
                      <Navigation className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        {load.eta.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Pickup</p>
                  <p className="text-sm">
                    {load.pickupDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Delivery</p>
                  <p className="text-sm">
                    {load.deliveryDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
