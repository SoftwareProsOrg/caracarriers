import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, AlertTriangle, XCircle, ExternalLink } from "lucide-react";

const complianceItems = [
  { carrier: "Martinez Trucking", mc: "MC-887421", dot: "DOT-2341872", insurance: { status: "active", expiry: "2027-03-15" }, authority: "active", safetyRating: "Satisfactory", lastAudit: "2025-11-20" },
  { carrier: "Swift Transport Co.", mc: "MC-445331", dot: "DOT-9921043", insurance: { status: "active", expiry: "2026-09-30" }, authority: "active", safetyRating: "Satisfactory", lastAudit: "2025-08-14" },
  { carrier: "Pacific Haulers LLC", mc: "MC-112984", dot: "DOT-7734521", insurance: { status: "expiring", expiry: "2026-05-25" }, authority: "active", safetyRating: "Conditional", lastAudit: "2025-06-01" },
  { carrier: "Rodriguez Freight", mc: "MC-993214", dot: "DOT-4451298", insurance: { status: "active", expiry: "2027-01-10" }, authority: "active", safetyRating: "Satisfactory", lastAudit: "2026-01-18" },
  { carrier: "Mountain Freight Inc", mc: "MC-771203", dot: "DOT-6612934", insurance: { status: "expired", expiry: "2026-04-30" }, authority: "suspended", safetyRating: "Conditional", lastAudit: "2025-03-22" },
];

const insConfig: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  active: { icon: CheckCircle2, color: "text-success", label: "Active" },
  expiring: { icon: AlertTriangle, color: "text-warning", label: "Expiring" },
  expired: { icon: XCircle, color: "text-destructive", label: "Expired" },
};

const ratingVariant: Record<string, "success" | "warning" | "destructive"> = {
  Satisfactory: "success",
  Conditional: "warning",
  Unsatisfactory: "destructive",
};

export default function CompliancePage() {
  return (
    <>
      <Header title="Compliance" subtitle="Carrier authority, insurance, and safety ratings" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 grid grid-cols-3 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-success" />
            <div><p className="text-xl font-bold">3</p><p className="text-xs text-muted-foreground">Fully Compliant</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-warning" />
            <div><p className="text-xl font-bold">1</p><p className="text-xs text-muted-foreground">Action Needed</p></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-destructive" />
            <div><p className="text-xl font-bold">1</p><p className="text-xs text-muted-foreground">Non-Compliant</p></div>
          </CardContent></Card>
        </div>

        <Card>
          <div className="divide-y divide-border">
            {complianceItems.map((item) => {
              const ins = insConfig[item.insurance.status];
              return (
                <div key={item.mc} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{item.carrier}</p>
                        <Badge variant={ratingVariant[item.safetyRating]}>{item.safetyRating}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.mc} · {item.dot}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-3.5 w-3.5" />FMCSA
                    </Button>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Insurance</p>
                      <div className={`flex items-center gap-1 font-medium ${ins.color}`}>
                        <ins.icon className="h-3.5 w-3.5" />{ins.label}
                      </div>
                      <p className="text-xs text-muted-foreground">Exp. {item.insurance.expiry}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Authority</p>
                      <Badge variant={item.authority === "active" ? "success" : "destructive"}>{item.authority}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Last Audit</p>
                      <p className="text-sm">{item.lastAudit}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </main>
    </>
  );
}
