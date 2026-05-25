import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { CreateDealDialog } from "@/components/crm/create-deal-dialog";
import { DealCard } from "@/components/crm/deal-card";
import {
  PIPELINE_STAGES,
  computePipelineValue,
  computeWonRevenue,
  computeActiveDealCount,
  computeAverageDealSize,
  groupDealsByStage,
} from "@/lib/crm/pipeline";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  Target,
  BarChart3,
} from "lucide-react";

export default async function CrmPage() {
  const auth = await getAuthContext();

  const deals = auth
    ? await prisma.deal.findMany({
        where: { companyId: auth.companyId },
        orderBy: { createdAt: "desc" },
        take: 200,
      })
    : [];

  const payload = deals.map((d) => ({
    ...d,
    value: d.value ? Number(d.value) : null,
  }));

  const totalPipelineValue = computePipelineValue(payload);
  const wonRevenue = computeWonRevenue(payload);
  const activeDeals = computeActiveDealCount(payload);
  const avgDealSize = computeAverageDealSize(payload);
  const dealsByStage = groupDealsByStage(payload);

  return (
    <>
      <Header title="CRM" subtitle="Manage leads, deals, and sales pipeline" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{deals.length} deal{deals.length !== 1 ? "s" : ""} total</p>
          <CreateDealDialog />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Pipeline Value</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(totalPipelineValue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Won Revenue</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(wonRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Target className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Active Deals</span>
              </div>
              <p className="text-2xl font-bold">{activeDeals}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <BarChart3 className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Avg Deal Size</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(avgDealSize)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {PIPELINE_STAGES.map((stage) => {
            const stageDeals = dealsByStage[stage.key] ?? [];
            return (
              <div key={stage.key} className="flex flex-col">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className={stage.color}>
                      <div className="h-2.5 w-2.5 rounded-full bg-current" />
                    </span>
                    <span className="text-sm font-semibold">{stage.label}</span>
                  </div>
                  <Badge variant={stage.badgeVariant} className="text-[10px] px-1.5">
                    {stageDeals.length}
                  </Badge>
                </div>
                <div className="space-y-3 min-h-[200px]">
                  {stageDeals.length === 0 ? (
                    <div className="flex items-center justify-center h-24 rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                      No deals
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <DealCard key={deal.id} deal={deal} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
