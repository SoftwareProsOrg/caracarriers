"use client";

import { Badge } from "@/components/ui/badge";
import { MapPin, Gauge } from "lucide-react";
import { getTimeSinceLastUpdate, formatEta } from "@/lib/tracking/eta";
import { formatCoordinates } from "@/lib/tracking/map";

interface TimelineEvent {
  id: string;
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  locationName: string | null;
  recordedAt: string;
  source: string | null;
}

interface TrackingTimelineProps {
  events: TimelineEvent[];
}

const SOURCE_LABEL: Record<string, string> = {
  gps: "GPS",
  eld: "ELD",
  manual: "Manual",
};

const SOURCE_VARIANT: Record<string, "default" | "info" | "warning"> = {
  gps: "default",
  eld: "info",
  manual: "warning",
};

export function TrackingTimeline({ events }: TrackingTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        No tracking events yet.
      </div>
    );
  }

  return (
    <div className="max-h-96 space-y-0 overflow-y-auto pr-2">
      {events.map((event, index) => {
        const freshness = getTimeSinceLastUpdate(new Date(event.recordedAt));
        const dotColor =
          freshness.color === "green"
            ? "bg-success"
            : freshness.color === "yellow"
              ? "bg-warning"
              : "bg-destructive";

        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="relative flex gap-4 pb-6">
            {!isLast && (
              <div className="absolute left-[7px] top-4 h-full w-px bg-border" />
            )}
            <div className={`relative mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full ${dotColor}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">
                  {event.locationName || formatCoordinates(event.latitude, event.longitude)}
                </p>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {freshness.text}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatCoordinates(event.latitude, event.longitude)}
              </p>
              <div className="mt-1 flex items-center gap-3">
                {event.speed != null && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Gauge className="h-3 w-3" />
                    {event.speed.toFixed(0)} mph
                  </span>
                )}
                <Badge
                  variant={SOURCE_VARIANT[event.source ?? "gps"] ?? "default"}
                  className="text-[10px] px-1.5 py-0"
                >
                  {SOURCE_LABEL[event.source ?? "gps"] ?? event.source}
                </Badge>
              </div>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {new Date(event.recordedAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
