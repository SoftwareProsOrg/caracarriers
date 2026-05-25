import { getBaseRate, getEquipmentMultiplier } from "@/lib/rates/market-data";

export interface LaneHistoryEntry {
  id: string;
  originCity: string;
  originState: string;
  destCity: string;
  destState: string;
  equipmentType: string | null;
  rate: number;
  ratePerMile: number | null;
  source: string | null;
  recordedAt: Date;
}

export interface SuggestedRateResult {
  rate: number;
  rpm: number;
  confidence: "high" | "medium" | "low";
  dataPoints: number;
}

export interface MarginResult {
  profit: number;
  marginPercent: number;
  isProfitable: boolean;
}

export function calculateSuggestedRate(
  history: LaneHistoryEntry[],
  weight?: number,
  miles?: number
): SuggestedRateResult {
  if (history.length > 0) {
    const rates = history.map((h) => Number(h.rate));
    const ratesWithRpm = history.filter((h) => h.ratePerMile != null);

    const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;
    const avgRpm =
      ratesWithRpm.length > 0
        ? ratesWithRpm.reduce((a, h) => a + Number(h.ratePerMile), 0) /
          ratesWithRpm.length
        : miles && miles > 0
          ? avgRate / miles
          : 0;

    const confidence =
      history.length >= 10
        ? "high"
        : history.length >= 3
          ? "medium"
          : "low";

    return {
      rate: Math.round(avgRate * 100) / 100,
      rpm: Math.round(avgRpm * 100) / 100,
      confidence,
      dataPoints: history.length,
    };
  }

  return { rate: 0, rpm: 0, confidence: "low", dataPoints: 0 };
}

export function calculateMargin(
  shipperRate: number,
  carrierRate: number
): MarginResult {
  const profit = shipperRate - carrierRate;
  const marginPercent =
    shipperRate > 0 ? (profit / shipperRate) * 100 : 0;

  return {
    profit: Math.round(profit * 100) / 100,
    marginPercent: Math.round(marginPercent * 100) / 100,
    isProfitable: profit >= 0,
  };
}

export function calculateRpm(rate: number, miles: number): number {
  if (miles <= 0) return 0;
  return Math.round((rate / miles) * 100) / 100;
}

export function calculateFuelSurcharge(
  miles: number,
  fuelPrice: number = 3.5
): number {
  const BASE_FUEL_PRICE = 3.0;
  const AVG_MPG = 6;

  if (fuelPrice <= BASE_FUEL_PRICE || miles <= 0) return 0;

  const surchargePerMile = (fuelPrice - BASE_FUEL_PRICE) / AVG_MPG;
  return Math.round(surchargePerMile * miles * 100) / 100;
}

export function estimateFromMarketData(
  originState: string,
  destState: string,
  equipmentType: string,
  miles?: number
): SuggestedRateResult {
  const base = getBaseRate(originState, destState);
  if (!base) {
    return { rate: 0, rpm: 0, confidence: "low", dataPoints: 0 };
  }

  const multiplier = getEquipmentMultiplier(equipmentType);
  const estimatedRate = Math.round(base.rate * multiplier * 100) / 100;
  const estimatedRpm = miles && miles > 0 ? calculateRpm(estimatedRate, miles) : base.rpm;

  return {
    rate: estimatedRate,
    rpm: estimatedRpm,
    confidence: "low",
    dataPoints: 0,
  };
}
