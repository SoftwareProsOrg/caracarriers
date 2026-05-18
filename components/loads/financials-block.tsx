import { DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Props {
  shipperRate: number;
  carrierRate: number | null;
  fuelSurcharge: number | null;
  margin: number | null;
  marginPct: number | null;
}

export function FinancialsBlock({ shipperRate, carrierRate, fuelSurcharge, margin, marginPct }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-1.5">
        <DollarSign className="h-4 w-4" />Financials
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-muted/40 p-3 text-center">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Shipper Rate</p>
          <p className="text-lg font-bold text-success mt-1">{formatCurrency(shipperRate)}</p>
        </div>
        <div className="rounded-lg bg-muted/40 p-3 text-center">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Carrier Rate</p>
          <p className="text-lg font-bold text-warning mt-1">
            {carrierRate != null ? formatCurrency(carrierRate) : <span className="text-sm text-muted-foreground">—</span>}
          </p>
        </div>
        <div className="rounded-lg bg-muted/40 p-3 text-center">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Fuel Surcharge</p>
          <p className="text-lg font-bold mt-1">
            {fuelSurcharge != null ? formatCurrency(fuelSurcharge) : <span className="text-sm text-muted-foreground">—</span>}
          </p>
        </div>
        <div className={`rounded-lg p-3 text-center ${margin != null && margin >= 0 ? "bg-success/10" : "bg-destructive/10"}`}>
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Margin</p>
          {margin != null ? (
            <>
              <p className={`text-lg font-bold mt-1 ${margin >= 0 ? "text-success" : "text-destructive"}`}>
                {formatCurrency(margin)}
              </p>
              <p className={`text-xs ${margin >= 0 ? "text-success/80" : "text-destructive/80"}`}>
                {marginPct?.toFixed(1)}%
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">Assign carrier to calculate</p>
          )}
        </div>
      </div>
    </div>
  );
}
