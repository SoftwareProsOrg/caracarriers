import OpenAI from "openai";
import type { BookkeepingSummary } from "./calculations";
import type { TaxEstimate } from "./tax";
import { env } from "@/lib/env";

function getClient(): OpenAI | null {
  if (!env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
}

export interface TaxAdvice {
  summary: string;
  deductions: string[];
  recommendations: string[];
  estimatedSavings: number;
}

export async function getAiTaxAdvice(
  bookkeeping: BookkeepingSummary,
  taxEstimate: TaxEstimate,
): Promise<TaxAdvice | { error: string }> {
  const client = getClient();
  if (!client) {
    return { error: "OPENAI_API_KEY not configured. Set it in your environment for AI tax assistance." };
  }

  try {
    const prompt = `You are a tax professional AI assistant for a freight brokerage company. Analyze the following financial data and provide tax advice.

FINANCIAL SUMMARY:
- Total Revenue: $${bookkeeping.totalRevenue.toLocaleString()}
- Total Carrier Costs: $${bookkeeping.totalCosts.toLocaleString()}
- Net Profit: $${bookkeeping.netProfit.toLocaleString()}
- Average Margin: ${bookkeeping.averageMargin.toFixed(1)}%
- Loads This Period: ${bookkeeping.loadCount}

TAX ESTIMATE:
- Gross Revenue: $${taxEstimate.grossRevenue.toLocaleString()}
- Total Deductions: $${taxEstimate.totalDeductions.toLocaleString()}
- Taxable Income: $${taxEstimate.taxableIncome.toLocaleString()}
- Self-Employment Tax: $${taxEstimate.selfEmploymentTax.toLocaleString()}
- Income Tax: $${taxEstimate.incomeTax.toLocaleString()}
- Total Estimated Tax: $${taxEstimate.totalEstimatedTax.toLocaleString()}
- Quarterly Payment: $${taxEstimate.quarterlyPayment.toLocaleString()}
- Effective Tax Rate: ${taxEstimate.effectiveTaxRate.toFixed(1)}%

PROFIT PER LOAD:
${bookkeeping.profits.slice(0, 20).map((p) =>
  `- ${p.loadNumber}: Shipper $${p.shipperRate.toLocaleString()} | Carrier $${(p.carrierRate ?? 0).toLocaleString()} | Profit $${p.profit.toLocaleString()} | Margin ${p.margin.toFixed(1)}%`
).join("\n")}

MONTHLY BREAKDOWN:
${bookkeeping.monthly.map((m) =>
  `- ${m.month}: Revenue $${m.revenue.toLocaleString()} | Profit $${m.profit.toLocaleString()} | Loads ${m.loadCount}`
).join("\n")}

Please provide:
1. A brief summary of the tax situation (2-3 sentences)
2. List of potential deductions this brokerage may be missing
3. Specific tax-saving recommendations for a freight brokerage
4. Estimated potential savings from implementing these recommendations

Format the response as JSON with keys: summary (string), deductions (array of strings), recommendations (array of strings), estimatedSavings (number).`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return { error: "No response from AI" };

    const parsed = JSON.parse(content) as TaxAdvice;
    return parsed;
  } catch (err) {
    return { error: `AI tax analysis failed: ${(err as Error).message}` };
  }
}

export async function getAiTaxAnswer(
  question: string,
  context: { bookkeeping: BookkeepingSummary; taxEstimate: TaxEstimate },
): Promise<string | { error: string }> {
  const client = getClient();
  if (!client) {
    return { error: "OPENAI_API_KEY not configured." };
  }

  try {
    const prompt = `You are a tax professional AI assistant for a freight brokerage. Use this financial data to answer the user's question.

FINANCIAL SUMMARY:
- Total Revenue: $${context.bookkeeping.totalRevenue.toLocaleString()}
- Total Carrier Costs: $${context.bookkeeping.totalCosts.toLocaleString()}
- Net Profit: $${context.bookkeeping.netProfit.toLocaleString()}
- Loads: ${context.bookkeeping.loadCount}

TAX ESTIMATE:
- Gross Revenue: $${context.taxEstimate.grossRevenue.toLocaleString()}
- Total Deductions: $${context.taxEstimate.totalDeductions.toLocaleString()}
- Total Estimated Tax: $${context.taxEstimate.totalEstimatedTax.toLocaleString()}
- Quarterly Payment: $${context.taxEstimate.quarterlyPayment.toLocaleString()}

User question: ${question}

Answer concisely but thoroughly, with specific numbers from the data. Advise consulting a CPA for legally binding tax filings.`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content ?? "No response from AI.";
  } catch (err) {
    return { error: `Failed to get answer: ${(err as Error).message}` };
  }
}
