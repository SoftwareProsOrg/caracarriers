export interface BaseRateEntry {
  rate: number;
  rpm: number;
}

export interface EquipmentMultiplier {
  label: string;
  multiplier: number;
}

export const BASE_RATES: Record<string, BaseRateEntry> = {
  "TX-CA": { rate: 2200, rpm: 1.95 },
  "CA-TX": { rate: 1800, rpm: 1.65 },
  "TX-GA": { rate: 1500, rpm: 2.25 },
  "GA-TX": { rate: 1400, rpm: 2.1 },
  "TX-IL": { rate: 1600, rpm: 2.05 },
  "IL-TX": { rate: 1550, rpm: 1.85 },
  "CA-IL": { rate: 3200, rpm: 2.15 },
  "IL-CA": { rate: 2800, rpm: 1.9 },
  "CA-WA": { rate: 800, rpm: 2.5 },
  "WA-CA": { rate: 900, rpm: 2.4 },
  "NY-FL": { rate: 1800, rpm: 2.5 },
  "FL-NY": { rate: 2000, rpm: 2.6 },
  "GA-FL": { rate: 600, rpm: 2.8 },
  "FL-GA": { rate: 550, rpm: 2.7 },
  "OH-TX": { rate: 1700, rpm: 2.1 },
  "TX-OH": { rate: 1750, rpm: 2.0 },
  "IL-OH": { rate: 500, rpm: 2.6 },
  "OH-IL": { rate: 450, rpm: 2.5 },
  "CA-NV": { rate: 400, rpm: 3.0 },
  "NV-CA": { rate: 450, rpm: 2.8 },
  "NJ-PA": { rate: 300, rpm: 3.2 },
  "PA-NJ": { rate: 280, rpm: 3.0 },
};

export const EQUIPMENT_MULTIPLIERS: Record<string, EquipmentMultiplier> = {
  DRY_VAN: { label: "Dry Van", multiplier: 1.0 },
  REEFER: { label: "Reefer", multiplier: 1.2 },
  FLATBED: { label: "Flatbed", multiplier: 1.15 },
  STEP_DECK: { label: "Step Deck", multiplier: 1.1 },
  LOWBOY: { label: "Lowboy", multiplier: 1.25 },
  TANKER: { label: "Tanker", multiplier: 1.15 },
  BOX_TRUCK: { label: "Box Truck", multiplier: 0.9 },
  POWER_ONLY: { label: "Power Only", multiplier: 0.7 },
  OTHER: { label: "Other", multiplier: 1.0 },
};

export const EQUIPMENT_OPTIONS = Object.entries(EQUIPMENT_MULTIPLIERS).map(
  ([value, entry]) => ({ value, label: entry.label })
);

export function getBaseRate(
  originState: string,
  destState: string
): BaseRateEntry | null {
  const key = `${originState}-${destState}`;
  const reverseKey = `${destState}-${originState}`;
  return BASE_RATES[key] ?? BASE_RATES[reverseKey] ?? null;
}

export function getEquipmentMultiplier(equipmentType: string): number {
  return EQUIPMENT_MULTIPLIERS[equipmentType]?.multiplier ?? 1.0;
}
