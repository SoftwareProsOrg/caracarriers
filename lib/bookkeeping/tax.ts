export interface TaxEstimate {
  grossRevenue: number;
  totalDeductions: number;
  taxableIncome: number;
  selfEmploymentTax: number;
  incomeTax: number;
  totalEstimatedTax: number;
  quarterlyPayment: number;
  effectiveTaxRate: number;
  breakdown: {
    socialSecurity: number;
    medicare: number;
    federalIncome: number;
  };
}

const SOCIAL_SECURITY_WAGE_BASE = 176100;
const SELF_EMPLOYMENT_DEDUCTION_RATE = 0.5;

const TAX_BRACKETS_2025: { rate: number; from: number; to: number }[] = [
  { rate: 0.10, from: 0, to: 11600 },
  { rate: 0.12, from: 11601, to: 47150 },
  { rate: 0.22, from: 47151, to: 100525 },
  { rate: 0.24, from: 100526, to: 191950 },
  { rate: 0.32, from: 191951, to: 243725 },
  { rate: 0.35, from: 243726, to: 609350 },
  { rate: 0.37, from: 609351, to: Infinity },
];

const STANDARD_DEDUCTION_SINGLE = 15000;
const STANDARD_DEDUCTION_MARRIED = 29200;

export function estimateTax(
  grossRevenue: number,
  totalCarrierPayments: number,
  additionalDeductions: number = 0,
  filingStatus: "single" | "married" = "single",
): TaxEstimate {
  const standardDeduction = filingStatus === "single" ? STANDARD_DEDUCTION_SINGLE : STANDARD_DEDUCTION_MARRIED;
  const totalDeductions = totalCarrierPayments + additionalDeductions + standardDeduction;

  const netEarnings = grossRevenue - totalCarrierPayments;
  const taxableIncome = Math.max(0, grossRevenue - totalDeductions);

  const seDeduction = netEarnings * SELF_EMPLOYMENT_DEDUCTION_RATE;
  const seSubjectWage = Math.max(0, netEarnings - seDeduction);

  const ssTax = Math.min(seSubjectWage, SOCIAL_SECURITY_WAGE_BASE) * 0.124;
  const medicareTax = seSubjectWage * 0.029;
  const selfEmploymentTax = ssTax + medicareTax;

  const halfSeDeduction = selfEmploymentTax * 0.5;
  const adjustedIncome = Math.max(0, taxableIncome - halfSeDeduction);
  const standardDeductionAdjusted = filingStatus === "single" ? STANDARD_DEDUCTION_SINGLE : STANDARD_DEDUCTION_MARRIED;
  const incomeAfterDeduction = Math.max(0, adjustedIncome - standardDeductionAdjusted);

  let incomeTax = 0;
  let remaining = incomeAfterDeduction;
  for (const bracket of TAX_BRACKETS_2025) {
    if (remaining <= 0) break;
    const taxableInBracket = Math.min(remaining, bracket.to - bracket.from + 1);
    incomeTax += taxableInBracket * bracket.rate;
    remaining -= taxableInBracket;
  }

  const totalEstimatedTax = selfEmploymentTax + incomeTax;
  const quarterlyPayment = totalEstimatedTax / 4;
  const effectiveTaxRate = grossRevenue > 0 ? (totalEstimatedTax / grossRevenue) * 100 : 0;

  return {
    grossRevenue,
    totalDeductions,
    taxableIncome,
    selfEmploymentTax,
    incomeTax,
    totalEstimatedTax,
    quarterlyPayment,
    effectiveTaxRate,
    breakdown: {
      socialSecurity: ssTax,
      medicare: medicareTax,
      federalIncome: incomeTax,
    },
  };
}
