import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";
import { computeBookkeeping, type LoadProfit } from "@/lib/bookkeeping/calculations";
import { estimateTax } from "@/lib/bookkeeping/tax";
import { getAiTaxAdvice } from "@/lib/bookkeeping/ai-tax";
import { TaxAssistant } from "@/components/bookkeeping/tax-assistant";
import {
  DollarSign, TrendingUp, TrendingDown, PiggyBank, Percent,
  Truck, ArrowUpRight,
} from "lucide-react";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function formatCurrencyFull(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function formatPercent(n: number) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}

function statusColor(status: string) {
  switch (status) {
    case "DELIVERED": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "IN_TRANSIT": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "DISPATCHED": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "BOOKED": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    case "AVAILABLE": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    case "CANCELLED": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "PROBLEM": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    default: return "bg-gray-100 text-gray-800";
  }
}

function ProfitRow({ p }: { p: LoadProfit }) {
  return (
    <div className="flex items-center gap-4 px-6 py-3 hover:bg-muted/40 transition-colors border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{p.loadNumber}</p>
        <p className="text-xs text-muted-foreground truncate">{p.shipperName}</p>
      </div>
      <div className="hidden md:block w-24 text-right">
        <p className="text-sm">{formatCurrency(p.shipperRate)}</p>
      </div>
      <div className="hidden md:block w-24 text-right">
        <p className="text-sm">{p.carrierRate != null ? formatCurrency(p.carrierRate) : "—"}</p>
      </div>
      <div className="w-24 text-right">
        <p className={`text-sm font-semibold ${p.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
          {formatCurrency(p.profit)}
        </p>
      </div>
      <div className="w-16 text-right">
        <p className={`text-xs font-medium ${p.margin >= 15 ? "text-green-600" : p.margin >= 0 ? "text-yellow-600" : "text-red-600"}`}>
          {formatPercent(p.margin)}
        </p>
      </div>
      <Badge className={`text-[10px] px-2 py-0.5 ${statusColor(p.status)}`}>
        {p.status.replace(/_/g, " ")}
      </Badge>
    </div>
  );
}

export default async function BookkeepingPage() {
  const auth = await getAuthContext();
  if (!auth) {
    return (
      <>
        <Header title="Bookkeeping" subtitle="Track profitability and manage taxes" />
        <main className="flex-1 overflow-y-auto p-6">
          <Card>
            <CardContent className="flex items-center justify-center h-48 text-muted-foreground">
              Sign in to view bookkeeping data.
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  const loads = await prisma.load.findMany({
    where: { companyId: auth.companyId },
    orderBy: { deliveryDate: "desc" },
    include: {
      shipper: { select: { name: true } },
      carrier: { select: { name: true } },
    },
    take: 500,
  });

  if (loads.length === 0) {
    return (
      <>
        <Header title="Bookkeeping" subtitle="Track profitability and manage taxes" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
              <DollarSign className="h-12 w-12 opacity-30" />
              <p className="text-lg font-medium">No load data yet</p>
              <p className="text-sm">Create some loads to see bookkeeping and profit tracking.</p>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  const bookkeeping = computeBookkeeping(loads);
  const tax = estimateTax(bookkeeping.totalRevenue, bookkeeping.totalCosts, 0, "single");
  const aiAdvice = await getAiTaxAdvice(bookkeeping, tax);

  const maxMonthlyProfit = Math.max(...bookkeeping.monthly.map((m) => Math.abs(m.profit)), 1);

  return (
    <>
      <Header title="Bookkeeping" subtitle="Track profitability and manage taxes" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Revenue</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(bookkeeping.totalRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingDown className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Costs</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(bookkeeping.totalCosts)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Net Profit</span>
              </div>
              <p className={`text-2xl font-bold ${bookkeeping.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(bookkeeping.netProfit)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Percent className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Avg Margin</span>
              </div>
              <p className={`text-2xl font-bold ${bookkeeping.averageMargin >= 15 ? "text-green-600" : bookkeeping.averageMargin >= 0 ? "text-yellow-600" : "text-red-600"}`}>
                {formatPercent(bookkeeping.averageMargin)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Truck className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Total Loads</span>
              </div>
              <p className="text-2xl font-bold">{bookkeeping.loadCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Profit Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Profit Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {bookkeeping.monthly.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No monthly data yet.</p>
            ) : (
              <div className="flex items-end gap-3 h-40">
                {bookkeeping.monthly.map((m) => {
                  const height = Math.max(4, (Math.abs(m.profit) / maxMonthlyProfit) * 100);
                  const isPositive = m.profit >= 0;
                  return (
                    <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                      <p className={`text-xs font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(m.profit)}
                      </p>
                      <div
                        className={`w-full rounded-t transition-all ${isPositive ? "bg-green-500" : "bg-red-500"}`}
                        style={{ height: `${height}%` }}
                      />
                      <p className="text-[10px] text-muted-foreground">{m.month}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profit Per Load Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profit per Load</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-b border-border px-6 py-2 flex items-center gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div className="flex-1">Load / Shipper</div>
              <div className="hidden md:block w-24 text-right">Revenue</div>
              <div className="hidden md:block w-24 text-right">Carrier Cost</div>
              <div className="w-24 text-right">Profit</div>
              <div className="w-16 text-right">Margin</div>
              <div className="w-24 text-right">Status</div>
            </div>
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {bookkeeping.profits.slice(0, 100).map((p) => (
                <ProfitRow key={p.loadId} p={p} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tax Estimation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <PiggyBank className="h-4 w-4" />
                Tax Estimation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gross Revenue</span>
                <span className="font-medium">{formatCurrencyFull(tax.grossRevenue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Deductions</span>
                <span className="font-medium text-green-600">-{formatCurrencyFull(tax.totalDeductions)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-sm">
                <span className="font-medium">Taxable Income</span>
                <span className="font-semibold">{formatCurrencyFull(tax.taxableIncome)}</span>
              </div>
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Self-Employment Tax (15.3%)</span>
                  <span>{formatCurrencyFull(tax.selfEmploymentTax)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Federal Income Tax</span>
                  <span>{formatCurrencyFull(tax.incomeTax)}</span>
                </div>
              </div>
              <div className="border-t pt-3 flex justify-between text-sm">
                <span className="font-semibold">Total Estimated Tax</span>
                <span className="font-bold text-lg">{formatCurrencyFull(tax.totalEstimatedTax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quarterly Payment</span>
                <span className="font-medium">{formatCurrencyFull(tax.quarterlyPayment)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Effective Rate</span>
                <span className="font-medium">{tax.effectiveTaxRate.toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>

          {/* AI Tax Assistant */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-blue-500" />
                AI Tax Advisor
              </CardTitle>
            </CardHeader>
            <CardContent>
              {"error" in aiAdvice ? (
                <div className="space-y-3">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      {aiAdvice.error}
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                      AI tax analysis requires an OpenAI API key. Rule-based tax estimates are still shown above.
                    </p>
                  </div>
                  <TaxAssistant bookkeeping={bookkeeping} taxEstimate={tax} />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                      {aiAdvice.summary}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Suggested Deductions</h4>
                    <ul className="space-y-1">
                      {aiAdvice.deductions.map((d, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Recommendations</h4>
                    <ul className="space-y-1">
                      {aiAdvice.recommendations.map((r, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">→</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">Estimated Potential Savings</span>
                    <span className="text-lg font-bold text-green-600">{formatCurrencyFull(aiAdvice.estimatedSavings)}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    AI tax advice is for informational purposes only. Consult a qualified CPA for official tax filings.
                  </p>
                  <TaxAssistant bookkeeping={bookkeeping} taxEstimate={tax} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
