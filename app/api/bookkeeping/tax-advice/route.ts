import { NextRequest, NextResponse } from "next/server";
import { getAiTaxAnswer } from "@/lib/bookkeeping/ai-tax";
import type { BookkeepingSummary } from "@/lib/bookkeeping/calculations";
import type { TaxEstimate } from "@/lib/bookkeeping/tax";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, bookkeeping, taxEstimate } = body as {
      question: string;
      bookkeeping: BookkeepingSummary;
      taxEstimate: TaxEstimate;
    };

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const answer = await getAiTaxAnswer(question, { bookkeeping, taxEstimate });

    if (typeof answer === "object" && "error" in answer) {
      return NextResponse.json({ error: answer.error }, { status: 503 });
    }

    return NextResponse.json({ answer });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to process tax question", details: (err as Error).message },
      { status: 500 },
    );
  }
}
