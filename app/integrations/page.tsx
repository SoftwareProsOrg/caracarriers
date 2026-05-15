import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Puzzle, CheckCircle2, Link2 } from "lucide-react";

const integrations = [
  { name: "DAT Freight & Analytics", category: "Load Board", description: "Access the largest freight marketplace. Post loads and find carriers.", status: "available" },
  { name: "Truckstop.com", category: "Load Board", description: "Search available trucks and post freight across North America.", status: "available" },
  { name: "McLeod Software", category: "TMS", description: "Import historical load data and carrier records from McLeod TMS.", status: "available" },
  { name: "Samsara", category: "ELD / Tracking", description: "Real-time GPS tracking and ELD compliance data from Samsara.", status: "available" },
  { name: "KeepTruckin (Motive)", category: "ELD / Tracking", description: "Connect driver ELD data for compliance and live tracking.", status: "available" },
  { name: "QuickBooks", category: "Accounting", description: "Sync invoices, payments, and carrier settlements with QuickBooks.", status: "connected" },
  { name: "Stripe", category: "Payments", description: "Accept online payments from shippers via credit card or ACH.", status: "connected" },
  { name: "Twilio", category: "Communication", description: "Send automated SMS updates to drivers and shippers.", status: "connected" },
  { name: "Relay Payments", category: "Payments", description: "Instant carrier payments and fuel card management.", status: "available" },
  { name: "FMCSA", category: "Compliance", description: "Real-time carrier safety data and authority verification.", status: "connected" },
];

const categoryColor: Record<string, string> = {
  "Load Board": "bg-primary/10 text-primary",
  "TMS": "bg-accent/10 text-accent",
  "ELD / Tracking": "bg-success/10 text-success",
  "Accounting": "bg-warning/10 text-warning",
  "Payments": "bg-primary/10 text-primary",
  "Communication": "bg-muted text-muted-foreground",
  "Compliance": "bg-success/10 text-success",
};

export default function IntegrationsPage() {
  return (
    <>
      <Header title="Integrations" subtitle="Connect 3rd party platforms and import your existing data" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            CaraCarriers is built to run as a standalone platform. These integrations are optional — use them to migrate data from existing systems or connect tools your team already relies on.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {integrations.map((integration) => (
            <Card key={integration.name} className="flex flex-col">
              <CardContent className="flex flex-col flex-1 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Puzzle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  {integration.status === "connected" ? (
                    <Badge variant="success" className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Available</Badge>
                  )}
                </div>
                <p className="font-semibold text-sm">{integration.name}</p>
                <span className={`mt-1 mb-2 inline-block rounded px-2 py-0.5 text-[10px] font-medium w-fit ${categoryColor[integration.category]}`}>
                  {integration.category}
                </span>
                <p className="text-xs text-muted-foreground flex-1">{integration.description}</p>
                <div className="mt-4">
                  {integration.status === "connected" ? (
                    <Button variant="outline" size="sm" className="w-full">Manage</Button>
                  ) : (
                    <Button size="sm" className="w-full">
                      <Link2 className="h-4 w-4" />Connect
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
