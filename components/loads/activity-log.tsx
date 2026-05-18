import { LoadEvent, LoadEventType, LoadStatus } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Truck, FileText, MessageSquare, ArrowRight } from "lucide-react";

const EVENT_ICON: Record<LoadEventType, React.ElementType> = {
  STATUS_CHANGE: ArrowRight,
  CHECK_CALL: MapPin,
  CARRIER_ASSIGNED: Truck,
  DOCUMENT_UPLOADED: FileText,
  NOTE: MessageSquare,
};

const EVENT_COLOR: Record<LoadEventType, string> = {
  STATUS_CHANGE: "text-primary border-primary/40 bg-primary/5",
  CHECK_CALL: "text-teal-500 border-teal-500/40 bg-teal-500/5",
  CARRIER_ASSIGNED: "text-success border-success/40 bg-success/5",
  DOCUMENT_UPLOADED: "text-muted-foreground border-border bg-muted/30",
  NOTE: "text-muted-foreground border-border bg-muted/30",
};

const STATUS_LABEL: Record<LoadStatus, string> = {
  AVAILABLE: "Available", BOOKED: "Booked", DISPATCHED: "Dispatched",
  IN_TRANSIT: "In Transit", DELIVERED: "Delivered", CANCELLED: "Cancelled", PROBLEM: "Problem",
};

interface Props {
  events: LoadEvent[];
}

export function ActivityLog({ events }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Activity</h3>
      {events.length === 0 ? (
        <p className="text-xs text-muted-foreground">No activity yet.</p>
      ) : (
        <div className="space-y-2">
          {events.map((event) => {
            const Icon = EVENT_ICON[event.eventType] ?? ArrowRight;
            const colorClass = EVENT_COLOR[event.eventType] ?? EVENT_COLOR.NOTE;
            return (
              <div key={event.id} className={`rounded-lg border p-2.5 ${colorClass}`}>
                <div className="flex items-start gap-2">
                  <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium leading-snug">
                      {event.eventType === "STATUS_CHANGE" && `→ ${event.status ? STATUS_LABEL[event.status] : "Status updated"}`}
                      {event.eventType === "CHECK_CALL" && `📍 ${event.location ?? "Location update"}`}
                      {event.eventType === "CARRIER_ASSIGNED" && "Carrier assigned"}
                      {event.eventType === "DOCUMENT_UPLOADED" && "Document uploaded"}
                      {event.eventType === "NOTE" && "Note"}
                    </p>
                    {event.notes && event.eventType !== "STATUS_CHANGE" && (
                      <p className="text-xs opacity-75 mt-0.5 leading-snug">{event.notes}</p>
                    )}
                    <p className="text-[10px] opacity-60 mt-0.5">
                      {formatDistanceToNow(new Date(event.occurredAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
