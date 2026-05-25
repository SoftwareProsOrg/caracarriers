export interface LoadProfit {
  loadId: string;
  loadNumber: string;
  status: string;
  shipperName: string;
  carrierName: string | null;
  shipperRate: number;
  carrierRate: number | null;
  profit: number;
  margin: number;
  equipmentType: string;
  miles: number | null;
  pickupDate: Date;
  deliveryDate: Date;
}

export interface MonthlySummary {
  month: string;
  revenue: number;
  costs: number;
  profit: number;
  loadCount: number;
}

export interface BookkeepingSummary {
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
  averageMargin: number;
  loadCount: number;
  profits: LoadProfit[];
  monthly: MonthlySummary[];
}

export function computeBookkeeping(
  loads: Array<{
    id: string;
    loadNumber: string;
    status: string;
    shipperRate: { toNumber(): number } | number;
    carrierRate: { toNumber(): number } | number | null;
    miles: number | null;
    equipmentType: string;
    pickupDate: Date;
    deliveryDate: Date;
    shipper: { name: string } | null;
    carrier: { name: string } | null;
  }>,
): BookkeepingSummary {
  const profitRows: LoadProfit[] = [];

  for (const l of loads) {
    const shipperRate = typeof l.shipperRate === "number" ? l.shipperRate : l.shipperRate?.toNumber() ?? 0;
    const carrierRate = l.carrierRate != null
      ? (typeof l.carrierRate === "number" ? l.carrierRate : (l.carrierRate as any).toNumber?.() ?? 0)
      : null;

    const profit = carrierRate != null ? shipperRate - carrierRate : 0;
    const margin = shipperRate > 0 ? (profit / shipperRate) * 100 : 0;

    profitRows.push({
      loadId: l.id,
      loadNumber: l.loadNumber,
      status: l.status,
      shipperName: l.shipper?.name ?? "Unknown",
      carrierName: l.carrier?.name ?? null,
      shipperRate,
      carrierRate,
      profit,
      margin,
      equipmentType: l.equipmentType,
      miles: l.miles,
      pickupDate: l.pickupDate,
      deliveryDate: l.deliveryDate,
    });
  }

  const totalRevenue = profitRows.reduce((s, r) => s + r.shipperRate, 0);
  const totalCosts = profitRows.reduce((s, r) => s + (r.carrierRate ?? 0), 0);
  const netProfit = totalRevenue - totalCosts;
  const averageMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const monthMap = new Map<string, { revenue: number; costs: number; profit: number; loadCount: number }>();
  for (const r of profitRows) {
    const key = `${r.deliveryDate.getFullYear()}-${String(r.deliveryDate.getMonth() + 1).padStart(2, "0")}`;
    const m = monthMap.get(key) ?? { revenue: 0, costs: 0, profit: 0, loadCount: 0 };
    m.revenue += r.shipperRate;
    m.costs += r.carrierRate ?? 0;
    m.profit += r.profit;
    m.loadCount++;
    monthMap.set(key, m);
  }

  const monthly = Array.from(monthMap.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    totalRevenue,
    totalCosts,
    netProfit,
    averageMargin,
    loadCount: profitRows.length,
    profits: profitRows,
    monthly,
  };
}
