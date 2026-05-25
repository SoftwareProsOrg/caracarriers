export interface AccessorialChargeConfig {
  type: string;
  label: string;
  description: string;
  typicalAmount: number;
}

export const ACCESSORIAL_CHARGES: AccessorialChargeConfig[] = [
  { type: "detention", label: "Detention", description: "Driver wait time beyond free time", typicalAmount: 65 },
  { type: "lumper", label: "Lumper", description: "Loading/unloading labor at facility", typicalAmount: 150 },
  { type: "fuel", label: "Fuel Surcharge", description: "Fuel cost adjustment", typicalAmount: 75 },
  { type: "other", label: "Other", description: "Miscellaneous accessorial charge", typicalAmount: 0 },
];

export function calculateDetention(hours: number, equipmentType: string): number {
  const freeHours = 2;
  const billableHours = Math.max(0, hours - freeHours);
  const rates: Record<string, number> = {
    DRY_VAN: 50,
    REEFER: 60,
    FLATBED: 65,
    STEP_DECK: 70,
    LOWBOY: 85,
    TANKER: 75,
    BOX_TRUCK: 45,
    POWER_ONLY: 50,
    OTHER: 55,
  };
  const hourlyRate = rates[equipmentType] ?? 55;
  return Math.round(billableHours * hourlyRate * 100) / 100;
}

export function calculateLumperFee(weight: number, pieces: number): number {
  const baseFee = 75;
  const weightFee = (weight / 100) * 0.25;
  const pieceFee = pieces * 1.5;
  return Math.round((baseFee + weightFee + pieceFee) * 100) / 100;
}
