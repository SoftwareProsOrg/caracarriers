import { prisma } from "@/lib/prisma";
import type { LoadBoardSearchParams, LoadBoardLoad, LoadBoardResult, LoadBoardProvider } from "../types";

const FREIGHT_HUBS = [
  { city: "Houston", state: "TX", zip: "77001" },
  { city: "Dallas", state: "TX", zip: "75201" },
  { city: "Chicago", state: "IL", zip: "60607" },
  { city: "Atlanta", state: "GA", zip: "30303" },
  { city: "Los Angeles", state: "CA", zip: "90012" },
  { city: "Memphis", state: "TN", zip: "38103" },
  { city: "Savannah", state: "GA", zip: "31401" },
  { city: "Newark", state: "NJ", zip: "07102" },
  { city: "Seattle", state: "WA", zip: "98119" },
  { city: "Denver", state: "CO", zip: "80202" },
  { city: "Phoenix", state: "AZ", zip: "85016" },
  { city: "Portland", state: "OR", zip: "97209" },
  { city: "Indianapolis", state: "IN", zip: "46201" },
  { city: "Nashville", state: "TN", zip: "37201" },
  { city: "Charlotte", state: "NC", zip: "28202" },
  { city: "Columbus", state: "OH", zip: "43215" },
  { city: "Kansas City", state: "MO", zip: "64108" },
  { city: "Louisville", state: "KY", zip: "40202" },
  { city: "Jacksonville", state: "FL", zip: "32202" },
  { city: "San Antonio", state: "TX", zip: "78205" },
  { city: "Philadelphia", state: "PA", zip: "19103" },
  { city: "Mobile", state: "AL", zip: "36602" },
  { city: "Birmingham", state: "AL", zip: "35203" },
  { city: "Boulder", state: "CO", zip: "80301" },
  { city: "Des Moines", state: "IA", zip: "50309" },
  { city: "Cleveland", state: "OH", zip: "44114" },
  { city: "Long Beach", state: "CA", zip: "90802" },
  { city: "Oakland", state: "CA", zip: "94607" },
  { city: "St. Louis", state: "MO", zip: "63101" },
  { city: "Tampa", state: "FL", zip: "33602" },
  { city: "Raleigh", state: "NC", zip: "27601" },
  { city: "Salt Lake City", state: "UT", zip: "84101" },
  { city: "Omaha", state: "NE", zip: "68102" },
  { city: "Tulsa", state: "OK", zip: "74103" },
  { city: "Richmond", state: "VA", zip: "23219" },
];

const EQUIPMENT = ["DRY_VAN", "REEFER", "FLATBED", "STEP_DECK", "LOWBOY", "TANKER", "BOX_TRUCK"];
const COMMODITIES = [
  "General freight", "Fresh produce", "Electronics", "Auto parts",
  "Lumber", "Steel coils", "Furniture", "Packaged food",
  "Chemicals", "Pharmaceuticals", "Building materials", "Textiles",
  "Machinery", "Dairy products", "Frozen food", "Pet supplies",
  "Beverages", "Paper products", "Plastic resins", "Aerospace components",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickDiff<T>(arr: T[], exclude?: T): T {
  const filtered = exclude ? arr.filter((x) => x !== exclude) : arr;
  return pick(filtered);
}

export class MockLoadBoardProvider implements LoadBoardProvider {
  name = "mock";

  async search(params: LoadBoardSearchParams): Promise<LoadBoardResult> {
    const internalLoads = await this.queryInternal(params);

    const externalLoads = this.generateExternal(params);

    const all = params.source === "internal" ? internalLoads
      : params.source === "external" ? externalLoads
      : [...internalLoads, ...externalLoads];

    const total = all.length;
    const offset = params.offset ?? 0;
    const limit = params.limit ?? 50;
    const loads = all.slice(offset, offset + limit);

    return { loads, total, source: params.source ?? "all" };
  }

  private async queryInternal(params: LoadBoardSearchParams): Promise<LoadBoardLoad[]> {
    const where: Record<string, unknown> = { status: "AVAILABLE" };

    if (params.equipmentType) {
      where.equipmentType = params.equipmentType;
    }

    const rows = await prisma.load.findMany({
      where: where as any,
      include: { shipper: true },
      orderBy: { createdAt: "desc" },
      take: params.limit ?? 50,
    });

    return rows.map((r) => ({
      id: r.id,
      loadNumber: r.loadNumber,
      origin: { city: r.originCity, state: r.originState, zip: r.originZip ?? undefined },
      destination: { city: r.destCity, state: r.destState, zip: r.destZip ?? undefined },
      equipmentType: r.equipmentType,
      weight: Number(r.weight ?? 0),
      pickupDate: r.pickupDate.toISOString(),
      deliveryDate: r.deliveryDate.toISOString(),
      rate: Number(r.shipperRate),
      commodity: r.commodity ?? undefined,
      miles: r.miles ?? undefined,
      shipperName: r.shipper?.name ?? undefined,
      source: "internal",
    }));
  }

  private generateExternal(_params: LoadBoardSearchParams): LoadBoardLoad[] {
    const count = 15 + Math.floor(Math.random() * 10);
    const loads: LoadBoardLoad[] = [];

    for (let i = 0; i < count; i++) {
      const origin = pick(FREIGHT_HUBS);
      const dest = pickDiff(FREIGHT_HUBS, origin);
      const equipment = pick(EQUIPMENT);

      if (_params.equipmentType && equipment !== _params.equipmentType) continue;

      loads.push({
        id: `external-load-${i + 1}`,
        origin: { city: origin.city, state: origin.state, zip: origin.zip },
        destination: { city: dest.city, state: dest.state, zip: dest.zip },
        equipmentType: equipment,
        weight: 10000 + Math.floor(Math.random() * 40000),
        pickupDate: new Date(Date.now() + (1 + Math.random() * 5) * 86400000).toISOString(),
        deliveryDate: new Date(Date.now() + (3 + Math.random() * 7) * 86400000).toISOString(),
        rate: 500 + Math.floor(Math.random() * 4500),
        commodity: pick(COMMODITIES),
        miles: 50 + Math.floor(Math.random() * 2500),
        shipperName: undefined,
        source: "mock",
      });
    }

    return loads;
  }
}
