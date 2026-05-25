"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, DollarSign } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getStageConfig } from "@/lib/crm/pipeline";
import type { DealWithPayload } from "@/lib/crm/pipeline";
import { cn } from "@/lib/utils";

interface DealCardProps {
  deal: DealWithPayload;
}

export function DealCard({ deal }: DealCardProps) {
  const stage = getStageConfig(deal.stage);

  return (
    <Card className={cn("border-t-2 hover:shadow-md transition-shadow", stage.borderColor)}>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-sm leading-tight line-clamp-2">{deal.name}</p>
          <Badge variant={stage.badgeVariant} className="shrink-0 text-[10px] px-1.5 py-0">
            {deal.probability}%
          </Badge>
        </div>

        {deal.value != null && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5 shrink-0" />
            <span className="font-semibold text-foreground">{formatCurrency(deal.value)}</span>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {deal.assignedTo && (
            <span className="flex items-center gap-1 truncate">
              <User className="h-3 w-3 shrink-0" />
              <span className="truncate">{deal.assignedTo}</span>
            </span>
          )}
          {deal.expectedCloseDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3 shrink-0" />
              <span>{formatDate(deal.expectedCloseDate)}</span>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
