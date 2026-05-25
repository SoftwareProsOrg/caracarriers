"use client";

import { useState } from "react";
import { Search, TrendingUp, TrendingDown, Minus, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EQUIPMENT_OPTIONS } from "@/lib/rates/market-data";

interface RecentRate {
  id: string;
  originCity: string;
  originState: string;
  destCity: string;
  destState: string;
  equipmentType: string | null;
  rate: number;
  ratePerMile: number | null;
  source: string | null;
  recordedAt: string;
}

interface SearchResult {
  averageRate: number;
  averageRpm: number;
  count: number;
  trend: string;
  recentRates: RecentRate[];
}

export function LaneSearch() {
  const [originCity, setOriginCity] = useState("");
  const [originState, setOriginState] = useState("");
  const [destCity, setDestCity] = useState("");
  const [destState, setDestState] = useState("");
  const [equipmentType, setEquipmentType] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (originCity) params.set("originCity", originCity);
      if (originState) params.set("originState", originState);
      if (destCity) params.set("destCity", destCity);
      if (destState) params.set("destState", destState);
      if (equipmentType) params.set("equipmentType", equipmentType);

      const res = await fetch(`/api/rates?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to search rates");
      }

      const data: SearchResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  const TrendIcon =
    result?.trend === "up"
      ? TrendingUp
      : result?.trend === "down"
        ? TrendingDown
        : Minus;

  const trendColor =
    result?.trend === "up"
      ? "text-success"
      : result?.trend === "down"
        ? "text-destructive"
        : "text-muted-foreground";

  const confidenceVariant =
    result && result.count >= 10
      ? "success"
      : result && result.count >= 3
        ? "warning"
        : "secondary";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search Lane Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="originCity">Origin City</Label>
                <Input
                  id="originCity"
                  placeholder="e.g. Houston"
                  value={originCity}
                  onChange={(e) => setOriginCity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originState">Origin State</Label>
                <Input
                  id="originState"
                  placeholder="e.g. TX"
                  value={originState}
                  onChange={(e) => setOriginState(e.target.value)}
                  maxLength={2}
                  className="uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="destCity">Destination City</Label>
                <Input
                  id="destCity"
                  placeholder="e.g. Atlanta"
                  value={destCity}
                  onChange={(e) => setDestCity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destState">Destination State</Label>
                <Input
                  id="destState"
                  placeholder="e.g. GA"
                  value={destState}
                  onChange={(e) => setDestState(e.target.value)}
                  maxLength={2}
                  className="uppercase"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment">Equipment Type</Label>
              <select
                id="equipment"
                value={equipmentType}
                onChange={(e) => setEquipmentType(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All Equipment</option>
                {EQUIPMENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              <Search className="h-4 w-4" />
              {loading ? "Searching..." : "Search Rates"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground mb-1">Average Rate</p>
                <p className="text-2xl font-bold">
                  {result.averageRate > 0
                    ? formatCurrency(result.averageRate)
                    : "—"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground mb-1">Avg RPM</p>
                <p className="text-2xl font-bold">
                  {result.averageRpm > 0
                    ? formatCurrency(result.averageRpm)
                    : "—"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground mb-1">Data Points</p>
                <p className="text-2xl font-bold">{result.count}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground mb-1">Rate Trend</p>
                <div className="flex items-center gap-2">
                  <TrendIcon className={`h-5 w-5 ${trendColor}`} />
                  <span className="text-lg font-semibold capitalize">{result.trend}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Lane History</CardTitle>
              <Badge variant={confidenceVariant}>
                {result.count === 0
                  ? "No Data"
                  : result.count >= 10
                    ? "High Confidence"
                    : result.count >= 3
                      ? "Medium Confidence"
                      : "Low Confidence"}
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {result.recentRates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No lane history found. Try a broader search.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Lane</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Equipment</th>
                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">Rate</th>
                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">RPM</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {result.recentRates.map((r) => (
                        <tr key={r.id} className="hover:bg-muted/40 transition-colors">
                          <td className="px-4 py-3 text-muted-foreground">
                            {formatDate(r.recordedAt)}
                          </td>
                          <td className="px-4 py-3">
                            {r.originCity}, {r.originState} → {r.destCity},{" "}
                            {r.destState}
                          </td>
                          <td className="px-4 py-3">
                            {r.equipmentType ? (
                              <Badge variant="outline">
                                {EQUIPMENT_OPTIONS.find(
                                  (o) => o.value === r.equipmentType
                                )?.label ?? r.equipmentType}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {formatCurrency(r.rate)}
                          </td>
                          <td className="px-4 py-3 text-right text-muted-foreground">
                            {r.ratePerMile
                              ? formatCurrency(r.ratePerMile)
                              : "—"}
                          </td>
                          <td className="px-4 py-3 capitalize text-muted-foreground">
                            {r.source ?? "manual"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
