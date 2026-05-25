"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle2, XCircle } from "lucide-react";

export function QuickBooksSyncDialog() {
  const [open, setOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    invoicesSynced?: number;
    paymentsSynced?: number;
    error?: string;
  } | null>(null);

  async function handleSync() {
    setSyncing(true);
    setResult(null);
    try {
      const res = await fetch("/api/accounting/quickbooks", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setResult({ success: false, error: data.error ?? "Sync failed" });
      } else {
        setResult({ success: true, invoicesSynced: data.invoicesSynced, paymentsSynced: data.paymentsSynced });
      }
    } catch {
      setResult({ success: false, error: "Network error. Please try again." });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setResult(null); }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><RefreshCw className="h-4 w-4" />QuickBooks Sync</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>QuickBooks Sync</DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-4 space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
            <div>
              <p className="text-sm font-medium">QuickBooks Online</p>
              <p className="text-xs text-muted-foreground">Connected</p>
            </div>
            <Badge variant="success"><CheckCircle2 className="h-3 w-3" />Connected</Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            Sync invoices as sales receipts and carrier payments as bills in QuickBooks.
          </p>

          {result && (
            <div className={`rounded-lg border p-3 ${result.success ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"}`}>
              {result.success ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />Sync completed
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {result.invoicesSynced} invoice{result.invoicesSynced !== 1 ? "s" : ""} synced
                    {" · "}
                    {result.paymentsSynced} payment{result.paymentsSynced !== 1 ? "s" : ""} synced
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-700 dark:text-red-300 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />Sync failed
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">{result.error}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Close</Button>
            <Button type="button" onClick={handleSync} disabled={syncing}>
              {syncing ? "Syncing..." : "Sync Now"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
