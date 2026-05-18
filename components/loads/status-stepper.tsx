"use client";

import { useTransition } from "react";
import { LoadStatus } from "@prisma/client";
import { advanceStatus } from "@/app/actions/loads";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const PIPELINE: LoadStatus[] = [
  LoadStatus.AVAILABLE,
  LoadStatus.BOOKED,
  LoadStatus.DISPATCHED,
  LoadStatus.IN_TRANSIT,
  LoadStatus.DELIVERED,
];

const LABEL: Record<LoadStatus, string> = {
  AVAILABLE: "Available",
  BOOKED: "Booked",
  DISPATCHED: "Dispatched",
  IN_TRANSIT: "In Transit",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  PROBLEM: "Problem",
};

interface Props {
  currentStatus: LoadStatus;
  loadId: string;
}

export function StatusStepper({ currentStatus, loadId }: Props) {
  const [isPending, startTransition] = useTransition();
  const currentIdx = PIPELINE.indexOf(currentStatus);
  const isTerminal = currentStatus === LoadStatus.CANCELLED || currentStatus === LoadStatus.PROBLEM;

  function advance() {
    if (currentIdx < PIPELINE.length - 1) {
      startTransition(async () => {
        await advanceStatus(loadId, PIPELINE[currentIdx + 1]);
      });
    }
  }

  function markProblem() {
    startTransition(async () => {
      await advanceStatus(loadId, LoadStatus.PROBLEM);
    });
  }

  function markCancelled() {
    startTransition(async () => {
      await advanceStatus(loadId, LoadStatus.CANCELLED);
    });
  }

  return (
    <div className="flex items-center gap-2 border-b border-border bg-card/50 px-6 py-3 shrink-0 overflow-x-auto">
      {PIPELINE.map((step, idx) => {
        const isDone = PIPELINE.indexOf(currentStatus) > idx || currentStatus === LoadStatus.DELIVERED;
        const active = step === currentStatus && !isTerminal;

        return (
          <div key={step} className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              {isDone ? (
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
              ) : active ? (
                <div className="h-4 w-4 rounded-full border-2 border-primary bg-primary/20 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              )}
              <span className={cn(
                "text-xs font-medium",
                isDone && "text-success",
                active && "text-primary font-semibold",
                !isDone && !active && "text-muted-foreground/60",
              )}>
                {LABEL[step]}
              </span>
            </div>
            {idx < PIPELINE.length - 1 && (
              <div className={cn(
                "h-px w-8 shrink-0",
                isDone ? "bg-success" : "bg-border",
              )} />
            )}
          </div>
        );
      })}

      {isTerminal ? (
        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-xs font-semibold text-destructive">{LABEL[currentStatus]}</span>
        </div>
      ) : (
        <div className="ml-auto flex items-center gap-2 shrink-0">
          {currentIdx < PIPELINE.length - 1 && (
            <Button size="sm" disabled={isPending} onClick={advance}>
              {isPending ? "Updating..." : `Mark ${LABEL[PIPELINE[currentIdx + 1]]}`}
            </Button>
          )}
          <Button size="sm" variant="outline" disabled={isPending} onClick={markProblem}
            className="text-destructive border-destructive/40 hover:bg-destructive/10">
            Problem
          </Button>
          {currentStatus !== LoadStatus.DELIVERED && (
            <Button size="sm" variant="outline" disabled={isPending} onClick={markCancelled}
              className="text-destructive border-destructive/40 hover:bg-destructive/10">
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
