import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navigation, MapPin, Phone } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const dispatchBoard = [
  { id: "LD-4821", origin: "Houston, TX", destination: "Atlanta, GA", carrier: "Martinez Trucking", driver: "Carlos Martinez", phone: "(832) 555-0192", status: "in_transit", rate: 2400, eta: "Today 6:00 PM", progress: 65 },
  { id: "LD-4820", origin: "Chicago, IL", destination: "Dallas, TX", carrier: "Swift Transport", driver: "John Swift", phone: "(312) 555-0284", status: "in_transit", rate: 3100, eta: "Tomorrow 2:00 PM", progress: 30 },
  { id: "LD-4817", origin: "Seattle, WA", destination: "Portland, OR", carrier: "Pacific Haulers", driver: "Mike Chen", phone: "(206) 555-0451", status: "in_transit", rate: 950, eta: "Today 3:00 PM", progress: 88 },
  { id: "LD-4816", origin: "Denver, CO", destination: "Kansas City, MO", carrier: "Mountain Freight", driver: "Sarah Lopez", phone: "(303) 555-0317", status: "dispatched", rate: 1650, eta: "Tomorrow 11:00 AM", progress: 0 },
];

export default function DispatchPage() {
  return (
    <>
      <Header title="Dispatch Board" subtitle="Real-time load tracking and driver communication" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {dispatchBoard.map((load) => (
            <Card key={load.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{load.id}</span>
                      <Badge variant={load.status === "in_transit" ? "info" : "warning"}>
                        {load.status === "in_transit" ? "In Transit" : "Dispatched"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {load.origin} → {load.destination}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(load.rate)}</p>
                    <p className="text-xs text-muted-foreground">ETA: {load.eta}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Navigation className="h-4 w-4 text-muted-foreground" />
                    <span>{load.carrier}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{load.driver}</span>
                  </div>
                  <a href={`tel:${load.phone}`} className="flex items-center gap-1 text-sm text-primary hover:underline ml-auto">
                    <Phone className="h-3.5 w-3.5" />
                    {load.phone}
                  </a>
                </div>

                {load.status === "in_transit" && (
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{load.origin}</span>
                      <span>{load.progress}% complete</span>
                      <span>{load.destination}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${load.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
