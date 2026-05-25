import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { PLANS, getPlanDisplayUsers, formatPrice } from "@/lib/billing/plans";

export default function PricingPage() {
  return (
    <>
      <Header
        title="Plans & Pricing"
        subtitle="Choose the right plan for your brokerage — upgrade or downgrade anytime"
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-12">
          {/* Annual billing toggle note */}
          <div className="text-center mb-12">
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Annual plans save ~17% compared to monthly billing.
              All plans include a 14-day free trial. No credit card required.
            </p>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={`relative flex flex-col ${
                  plan.highlighted
                    ? "border-2 border-indigo-500 shadow-lg shadow-indigo-500/10 scale-105"
                    : ""
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-indigo-600 hover:bg-indigo-600 text-white px-4 py-1">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardContent className="p-6 flex flex-col flex-1">
                  {/* Plan header */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{plan.tagline}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{formatPrice(plan.monthlyPrice)}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      or {formatPrice(plan.annualPrice)}/year (save {formatPrice(plan.monthlyPrice * 12 - plan.annualPrice)})
                    </p>
                  </div>

                  {/* Limits */}
                  <div className="space-y-2 mb-6 pb-6 border-b">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Monthly loads</span>
                      <span className="font-semibold">
                        {plan.monthlyLoads >= 1000
                          ? `${(plan.monthlyLoads / 1000).toFixed(0)}K`
                          : plan.monthlyLoads === 2000
                          ? "2K+"
                          : plan.monthlyLoads}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Users</span>
                      <span className="font-semibold">{getPlanDisplayUsers(plan)}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Includes
                    </p>
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Button
                    className={`mt-8 w-full ${
                      plan.highlighted
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                        : ""
                    }`}
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.highlighted ? "Start Free Trial" : "Get Started"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom comparison table */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">Compare Plans</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Feature</th>
                    {PLANS.map((p) => (
                      <th key={p.id} className="text-center py-3 px-4 font-semibold">
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Monthly Loads", values: ["100", "500", "2K+"] },
                    { label: "Users", values: ["3", "15", "Unlimited"] },
                    { label: "Load Lifecycle", values: ["✓", "✓", "✓"] },
                    { label: "Carrier Management", values: ["✓", "✓", "✓"] },
                    { label: "Dispatch Board", values: ["✓", "✓", "✓"] },
                    { label: "Customer Portal", values: ["—", "✓", "✓"] },
                    { label: "Real-Time GPS Tracking", values: ["—", "✓", "✓"] },
                    { label: "CRM + Sales Pipeline", values: ["—", "✓", "✓"] },
                    { label: "Rate Engine", values: ["—", "✓", "✓"] },
                    { label: "EDI Connectivity", values: ["—", "✓", "✓"] },
                    { label: "API Access", values: ["—", "✓", "✓"] },
                    { label: "Accounting Sync", values: ["—", "✓", "✓"] },
                    { label: "Workflow Automation", values: ["—", "—", "✓"] },
                    { label: "AI Features", values: ["—", "—", "✓"] },
                    { label: "White-Label Portal", values: ["—", "—", "✓"] },
                    { label: "Dedicated Support", values: ["Community", "Priority", "24/7 Phone"] },
                  ].map((row) => (
                    <tr key={row.label} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-3 px-4 font-medium">{row.label}</td>
                      {row.values.map((v, i) => (
                        <td key={i} className="text-center py-3 px-4">
                          {v === "✓" ? (
                            <Check className="h-4 w-4 text-green-500 mx-auto" />
                          ) : v === "—" ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <span className={v.includes("$") ? "font-semibold" : ""}>{v}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
