"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Gauge, Clock } from "lucide-react";
import { formatEta, getTimeSinceLastUpdate } from "@/lib/tracking/eta";

interface ActiveLoad {
  id: string;
  loadNumber: string;
  status: string;
  originCity: string;
  originState: string;
  destCity: string;
  destState: string;
  currentLocation: string | null;
  eta: string | null;
  carrierName: string | null;
  carrierPhone: string | null;
  latestEvent: {
    latitude: number;
    longitude: number;
    speed: number | null;
    locationName: string | null;
    recordedAt: string;
    source: string | null;
  } | null;
}

interface ActiveLoadsGridProps {
  loads: ActiveLoad[];
}

const STATUS_LABEL: Record<string, string> = {
  IN_TRANSIT: "In Transit",
  DISPATCHED: "Dispatched",
};

const STATUS_VARIANT: Record<string, "info" | "warning"> = {
  IN_TRANSIT: "info",
  DISPATCHED: "warning",
};

export function ActiveLoadsGrid({ loads }: ActiveLoadsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {loads.map((load) => {
        const variant = STATUS_VARIANT[load.status] ?? "info";
        const label = STATUS_LABEL[load.status] ?? load.status;

        const freshness = load.latestEvent
          ? getTimeSinceLastUpdate(new Date(load.latestEvent.recordedAt))
          : null;

        const freshnessDot =
          freshness?.color === "green"
            ? "bg-success"
            : freshness?.color === "yellow"
              ? "bg-warning"
              : "bg-destructive";

        return (
          <Link key={load.id} href={`/tracking/${load.id}`}>
            <Card className="h-full transition-colors hover:bg-muted/40 cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{load.loadNumber}</span>
                      <Badge variant={variant}>{label}</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {load.originCity}, {load.originState} → {load.destCity},{" "}
                        {load.destState}
                      </span>
                    </div>
                  </div>
                  {freshness && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className={`h-2 w-2 rounded-full ${freshnessDot}`} />
                      <span className="text-xs text-muted-foreground">
                        {freshness.text}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  {load.latestEvent?.locationName && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Navigation className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground truncate">
                        {load.latestEvent.locationName}
                      </span>
                    </div>
                  )}

                  {load.currentLocation && !load.latestEvent?.locationName && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Navigation className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground truncate">
                        {load.currentLocation}
                      </span>
                    </div>
                  )}

                  {load.latestEvent?.speed != null && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Gauge className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">
                        {load.latestEvent.speed.toFixed(0)} mph
                      </span>
                    </div>
                  )}

                  {load.eta && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">
                        ETA: {formatEta(new Date(load.eta))}
                      </span>
                    </div>
                  )}
                </div>

                {load.carrierName && (
                  <p className="mt-3 text-xs text-muted-foreground border-t border-border pt-2">
                    {load.carrierName}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
