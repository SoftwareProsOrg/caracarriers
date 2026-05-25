"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { COMMUNICATION_TYPES, type CommunicationDirection } from "@/lib/communications/types";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

interface CommunicationItemProps {
  id: string;
  type: string;
  direction: string;
  subject: string | null;
  body: string | null;
  fromAddr: string | null;
  toAddr: string | null;
  createdAt: Date;
  loadId: string | null;
  loadNumber: string | null;
  userFirstName?: string | null;
  userLastName?: string | null;
}

const DIRECTION_LABEL: Record<string, string> = {
  inbound: "Inbound",
  outbound: "Outbound",
};

const DIRECTION_VARIANT: Record<string, "outline" | "secondary"> = {
  inbound: "outline",
  outbound: "secondary",
};

export function CommunicationItem({
  id,
  type,
  direction,
  subject,
  body,
  fromAddr,
  toAddr,
  createdAt,
  loadId,
  loadNumber,
  userFirstName,
  userLastName,
}: CommunicationItemProps) {
  const [expanded, setExpanded] = useState(false);
  const config = COMMUNICATION_TYPES[type as keyof typeof COMMUNICATION_TYPES];
  const Icon = config?.icon ?? COMMUNICATION_TYPES.note.icon;

  return (
    <div
      className="group rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/5 cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", config?.bg ?? "bg-gray-100")}>
          <Icon className={cn("h-4 w-4", config?.color ?? "text-gray-600")} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {subject ? (
                  <span className="truncate text-sm font-semibold text-foreground">{subject}</span>
                ) : (
                  <span className="text-sm font-medium text-muted-foreground italic">No subject</span>
                )}
                <Badge variant={DIRECTION_VARIANT[direction] ?? "outline"} className="shrink-0 text-[10px]">
                  {DIRECTION_LABEL[direction] ?? direction}
                </Badge>
              </div>
              {body && !expanded && (
                <p className="mt-1 truncate text-xs text-muted-foreground">{body}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDateTime(createdAt)}
              </span>
              {expanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            {(userFirstName || userLastName) && (
              <span>{userFirstName} {userLastName}</span>
            )}
            {fromAddr && <span>From: {fromAddr}</span>}
            {toAddr && <span>To: {toAddr}</span>}
            {loadId && loadNumber && (
              <Link
                href={`/loads/${loadId}`}
                className="inline-flex items-center gap-1 text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3" />
                {loadNumber}
              </Link>
            )}
          </div>

          {expanded && body && (
            <div className="mt-3 rounded-lg bg-muted/30 p-3">
              <p className="whitespace-pre-wrap text-sm text-foreground">{body}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
