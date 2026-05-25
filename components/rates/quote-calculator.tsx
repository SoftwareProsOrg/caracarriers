"use client";

import { useState } from "react";
import {
  Calculator,
  Fuel,
  Save,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { EQUIPMENT_OPTIONS } from "@/lib/rates/market-data";
import {
  calculateMargin,
  calculateRpm,
  calculateFuelSurcharge,
} from "@/lib/rates/calculator";

export function QuoteCalculator() {
  const [originCity, setOriginCity] = useState("");
  const [originState, setOriginState] = useState("");
  const [destCity, setDestCity] = useState("");
  const [destState, setDestState] = useState("");
  const [equipmentType, setEquipmentType] = useState("");
  const [weight, setWeight] = useState("");
  const [miles, setMiles] = useState("");
  const [shipperRate, setShipperRate] = useState("");
  const [carrierRate, setCarrierRate] = useState("");
  const [fuelPrice, setFuelPrice] = useState("3.50");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const numMiles = parseFloat(miles) || 0;
  const numWeight = parseFloat(weight) || 0;
  const numShipperRate = parseFloat(shipperRate) || 0;
  const numCarrierRate = parseFloat(carrierRate) || 0;
  const numFuelPrice = parseFloat(fuelPrice) || 3.5;

  const calculatedRpm =
    numShipperRate > 0 && numMiles > 0
      ? calculateRpm(numShipperRate, numMiles)
      : 0;

  const margin = (numShipperRate > 0 || numCarrierRate > 0)
    ? calculateMargin(numShipperRate || 0, numCarrierRate || 0)
    : null;

  const fuelSurcharge =
    numMiles > 0 ? calculateFuelSurcharge(numMiles, numFuelPrice) : 0;

  const totalCustomerRate = numShipperRate + fuelSurcharge;

  async function handleSaveAsDeal() {
    if (!originCity || !destCity) return;

    setSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch("/api/crm/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Quote: ${originCity}, ${originState} → ${destCity}, ${destState}`,
          value: numShipperRate || null,
          stage: "lead",
          probability: 50,
          notes: [
            `Origin: ${originCity}, ${originState}`,
            `Destination: ${destCity}, ${destState}`,
            equipmentType ? `Equipment: ${equipmentType}` : "",
            numWeight ? `Weight: ${numWeight.toLocaleString()} lbs` : "",
            numMiles ? `Miles: ${numMiles}` : "",
            numShipperRate ? `Shipper Rate: ${formatCurrency(numShipperRate)}` : "",
            numCarrierRate ? `Carrier Rate: ${formatCurrency(numCarrierRate)}` : "",
            fuelSurcharge ? `Fuel Surcharge: ${formatCurrency(fuelSurcharge)}` : "",
            margin ? `Margin: ${formatCurrency(margin.profit)} (${margin.marginPercent}%)` : "",
          ]
            .filter(Boolean)
            .join("\n"),
        }),
      });

      if (!res.ok) throw new Error("Failed to create deal");

      setSaveMessage("Quote saved as deal!");
    } catch {
      setSaveMessage("Error saving deal. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quote Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qOriginCity">Origin City</Label>
              <Input
                id="qOriginCity"
                placeholder="e.g. Houston"
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qOriginState">Origin State</Label>
              <Input
                id="qOriginState"
                placeholder="e.g. TX"
                value={originState}
                onChange={(e) => setOriginState(e.target.value)}
                maxLength={2}
                className="uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="qDestCity">Destination City</Label>
              <Input
                id="qDestCity"
                placeholder="e.g. Atlanta"
                value={destCity}
                onChange={(e) => setDestCity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qDestState">Destination State</Label>
              <Input
                id="qDestState"
                placeholder="e.g. GA"
                value={destState}
                onChange={(e) => setDestState(e.target.value)}
                maxLength={2}
                className="uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="qEquipment">Equipment</Label>
              <select
                id="qEquipment"
                value={equipmentType}
                onChange={(e) => setEquipmentType(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select...</option>
                {EQUIPMENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qWeight">Weight (lbs)</Label>
              <Input
                id="qWeight"
                type="number"
                placeholder="42000"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qMiles">Miles</Label>
              <Input
                id="qMiles"
                type="number"
                placeholder="1200"
                value={miles}
                onChange={(e) => setMiles(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Rate Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shipperRate">Shipper Rate (charge customer)</Label>
              <Input
                id="shipperRate"
                type="number"
                placeholder="2500"
                value={shipperRate}
                onChange={(e) => setShipperRate(e.target.value)}
              />
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Revenue per Mile</span>
                <span className="font-medium">
                  {calculatedRpm > 0
                    ? formatCurrency(calculatedRpm)
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipper Rate</span>
                <span className="font-medium">
                  {numShipperRate > 0
                    ? formatCurrency(numShipperRate)
                    : "—"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Margin Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="carrierRate">Carrier Rate (pay carrier)</Label>
              <Input
                id="carrierRate"
                type="number"
                placeholder="2000"
                value={carrierRate}
                onChange={(e) => setCarrierRate(e.target.value)}
              />
            </div>

            {margin && (
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Profit</span>
                  <span
                    className={`font-medium ${margin.isProfitable ? "text-success" : "text-destructive"}`}
                  >
                    {margin.isProfitable ? "+" : ""}
                    {formatCurrency(margin.profit)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Margin</span>
                  <span
                    className={`font-medium ${margin.isProfitable ? "text-success" : "text-destructive"}`}
                  >
                    {margin.marginPercent}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={margin.isProfitable ? "success" : "destructive"}>
                    {margin.isProfitable ? "Profitable" : "Loss"}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-4 w-4" />
            Fuel Surcharge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fuelPrice">Diesel Price ($/gal)</Label>
              <Input
                id="fuelPrice"
                type="number"
                step="0.01"
                placeholder="3.50"
                value={fuelPrice}
                onChange={(e) => setFuelPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Fuel Surcharge</Label>
              <div className="flex h-9 items-center text-lg font-bold">
                {formatCurrency(fuelSurcharge)}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Total to Customer</Label>
              <div className="flex h-9 items-center text-lg font-bold text-primary">
                {formatCurrency(totalCustomerRate)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="rounded-lg bg-primary/5 border border-primary/10 p-4 mb-4">
            <h3 className="text-sm font-semibold mb-2">Quote Summary</h3>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Lane: </span>
                {originCity && originState
                  ? `${originCity}, ${originState} → `
                  : "Origin → "}
                {destCity && destState
                  ? `${destCity}, ${destState}`
                  : "Destination"}
              </p>
              <p>
                <span className="text-muted-foreground">Equipment: </span>
                {EQUIPMENT_OPTIONS.find((o) => o.value === equipmentType)
                  ?.label ?? "Not selected"}
              </p>
              <p>
                <span className="text-muted-foreground">Miles: </span>
                {numMiles > 0 ? numMiles.toLocaleString() : "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Shipper Rate: </span>
                {numShipperRate > 0 ? formatCurrency(numShipperRate) : "—"}
              </p>
              {margin && (
                <>
                  <p>
                    <span className="text-muted-foreground">Carrier Rate: </span>
                    {formatCurrency(numCarrierRate)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Margin: </span>
                    <span className={margin.isProfitable ? "text-success" : "text-destructive"}>
                      {formatCurrency(margin.profit)} ({margin.marginPercent}%)
                    </span>
                  </p>
                </>
              )}
              {fuelSurcharge > 0 && (
                <p>
                  <span className="text-muted-foreground">Fuel Surcharge: </span>
                  {formatCurrency(fuelSurcharge)}
                </p>
              )}
            </div>
          </div>

          <Button
            onClick={handleSaveAsDeal}
            disabled={saving || !originCity || !destCity}
            className="w-full"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save as Deal"}
          </Button>

          {saveMessage && (
            <div className="flex items-center gap-2 mt-3 text-sm">
              {saveMessage.includes("Error") ? (
                <AlertCircle className="h-4 w-4 text-destructive" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-success" />
              )}
              <span
                className={
                  saveMessage.includes("Error")
                    ? "text-destructive"
                    : "text-success"
                }
              >
                {saveMessage}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
