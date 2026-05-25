export interface FactoringResult {
  advanceAmount: number;
  factorFee: number;
  netToYou: number;
  factorRate: number;
}

export function calculateFactorAmount(
  invoiceAmount: number,
  factorRate: number = 0.95,
): FactoringResult {
  const advanceAmount = invoiceAmount * factorRate;
  const factorFee = invoiceAmount - advanceAmount;
  return {
    advanceAmount: Math.round(advanceAmount * 100) / 100,
    factorFee: Math.round(factorFee * 100) / 100,
    netToYou: Math.round(advanceAmount * 100) / 100,
    factorRate,
  };
}

export function isEligibleForFactoring(invoice: {
  status: string;
  amount: number;
  dueAt: Date;
}): boolean {
  if (invoice.status !== "SENT" && invoice.status !== "OVERDUE") return false;
  if (Number(invoice.amount) <= 0) return false;
  return true;
}
