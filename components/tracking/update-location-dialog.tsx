"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";

interface UpdateLocationDialogProps {
  loadId: string;
}

export function UpdateLocationDialog({ loadId }: UpdateLocationDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationName, setLocationName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!latitude || !longitude) {
      setError("Latitude and longitude are required");
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setError("Invalid coordinates");
      return;
    }

    if (lat < -90 || lat > 90) {
      setError("Latitude must be between -90 and 90");
      return;
    }

    if (lng < -180 || lng > 180) {
      setError("Longitude must be between -180 and 180");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/tracking/${loadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude,
          longitude,
          locationName: locationName || null,
          source: "manual",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update location");
      }

      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update location");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <MapPin className="h-4 w-4" />
          Update Location
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Location</DialogTitle>
          <DialogDescription>
            Manually add a tracking event for this load.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                placeholder="41.8781"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                type="number"
                step="any"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                placeholder="-87.6298"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                type="number"
                step="any"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationName">Location Name (optional)</Label>
            <Input
              id="locationName"
              placeholder="Chicago, IL"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? "Updating..." : "Update Location"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
