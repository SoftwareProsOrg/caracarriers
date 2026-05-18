"use client";

import { useState, useTransition } from "react";
import { addCheckCall } from "@/app/actions/loads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";

export function CheckCallForm({ loadId }: { loadId: string }) {
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit() {
    if (!location.trim()) { setError("Location is required"); return; }
    setError(null);
    startTransition(async () => {
      const result = await addCheckCall(loadId, location.trim(), notes.trim());
      if (result.error) {
        setError(result.error);
      } else {
        setLocation("");
        setNotes("");
      }
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <MapPin className="h-3.5 w-3.5" />Check Call
      </h3>
      <div className="space-y-2">
        <div>
          <Label htmlFor="location" className="text-xs">Driver Location</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Memphis, TN"
            className="mt-1 h-8 text-sm"
          />
        </div>
        <div>
          <Label htmlFor="callNotes" className="text-xs">Note (optional)</Label>
          <Input
            id="callNotes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="On time, ETA confirmed..."
            className="mt-1 h-8 text-sm"
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button size="sm" className="w-full" onClick={submit} disabled={isPending}>
          {isPending ? "Logging..." : "Log Check Call"}
        </Button>
      </div>
    </div>
  );
}
