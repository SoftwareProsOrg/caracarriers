import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2, AlertTriangle, XCircle, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

const insConfig: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  ACTIVE: { icon: CheckCircle2, color: "text-success", label: "Active" },
  EXPIRING_SOON: { icon: AlertTriangle, color: "text-warning", label: "Expiring" },
  EXPIRED: { icon: XCircle, color: "text-destructive", label: "Expired" },
};

const ratingVariant: Record<string, "success" | "warning" | "destructive"> = {
  Satisfactory: "success",
  Conditional: "warning",
  Unsatisfactory: "destructive",
};

const authorityVariant: Record<string, "success" | "destructive" | "warning"> = {
  ACTIVE: "success",
  INACTIVE: "warning",
  SUSPENDED: "destructive",
  REVOKED: "destructive",
};

function isCompliant(carrier: { insuranceStatus: string; authorityStatus: string; safetyRating: string | null }): boolean {
  return carrier.insuranceStatus === "ACTIVE" && carrier.authorityStatus === "ACTIVE" && carrier.safetyRating !== "Unsatisfactory";
}

function needsAction(carrier: { insuranceStatus: string; authorityStatus: string; safetyRating: string | null }): boolean {
  return !isCompliant(carrier) && !["EXPIRED", "SUSPENDED", "REVOKED"].includes(carrier.insuranceStatus) && !["SUSPENDED", "REVOKED"].includes(carrier.authorityStatus) && carrier.safetyRating !== "Unsatisfactory";
}

export default async function CompliancePage() {
  const auth = await getAuthContext();

  const carriers = auth
    ? await prisma.carrier.findMany({
        where: { companyId: auth.companyId },
        orderBy: { name: "asc" },
      })
    : [];

  const fullyCompliant = carriers.filter(isCompliant).length;
  const actionNeeded = carriers.filter(needsAction).length;
  const nonCompliant = carriers.length - fullyCompliant - actionNeeded;

  return (
    <>
      <Header title="Compliance" subtitle="Carrier authority, insurance, and safety ratings" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-success" />
              <div>
                <p className="text-xl font-bold">{fullyCompliant}</p>
                <p className="text-xs text-muted-foreground">Fully Compliant</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-warning" />
              <div>
                <p className="text-xl font-bold">{actionNeeded}</p>
                <p className="text-xs text-muted-foreground">Action Needed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <XCircle className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-xl font-bold">{nonCompliant}</p>
                <p className="text-xs text-muted-foreground">Non-Compliant</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <div className="divide-y divide-border">
            {carriers.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                No carriers yet. Add carriers to see compliance status.
              </div>
            ) : (
              carriers.map((carrier) => {
                const ins = insConfig[carrier.insuranceStatus] ?? insConfig.ACTIVE;
                return (
                  <div key={carrier.id} className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{carrier.name}</p>
                          {carrier.safetyRating && (
                            <Badge variant={ratingVariant[carrier.safetyRating] ?? "secondary"}>
                              {carrier.safetyRating}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {carrier.mcNumber ?? "MC-Pending"} · {carrier.dotNumber ?? "DOT-Pending"}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={`https://safer.fmcsa.dot.gov/query.asp?query_type=queryCarrierSnapshot&query_param=MC_MX&query_string=${carrier.mcNumber ?? ""}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          FMCSA
                        </a>
                      </Button>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Insurance</p>
                        <div className={`flex items-center gap-1 font-medium ${ins.color}`}>
                          <ins.icon className="h-3.5 w-3.5" />
                          {ins.label}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {carrier.insuranceExpiry
                            ? `Exp. ${carrier.insuranceExpiry.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                            : "No expiry on file"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Authority</p>
                        <Badge variant={authorityVariant[carrier.authorityStatus] ?? "destructive"}>
                          {carrier.authorityStatus}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Last Updated</p>
                        <p className="text-sm">
                          {carrier.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </main>
    </>
  );
}
