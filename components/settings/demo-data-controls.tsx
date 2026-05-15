"use client";

import { useState, useTransition } from "react";
import { seedDemoData, clearDemoData } from "@/app/actions/seed";
import { Button } from "@/components/ui/button";
import { Database, Trash2 } from "lucide-react";

export function DemoDataControls() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSeed = () => {
    startTransition(async () => {
      const result = await seedDemoData();
      setMessage(result.error
        ? { type: "error", text: result.error }
        : { type: "success", text: "Demo data seeded successfully. Refresh pages to see the data." }
      );
    });
  };

  const handleClear = () => {
    if (!confirm("This will permanently delete all demo records. Continue?")) return;
    startTransition(async () => {
      const result = await clearDemoData();
      setMessage(result.error
        ? { type: "error", text: result.error }
        : { type: "success", text: "Demo data cleared." }
      );
    });
  };

  return (
    <div className="space-y-4">
      {message && (
        <p className={`text-sm rounded-md px-3 py-2 ${message.type === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
          {message.text}
        </p>
      )}
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSeed}
          disabled={isPending}
        >
          <Database className="h-4 w-4" />
          {isPending ? "Loading..." : "Seed Demo Data"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={isPending}
          className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive"
        >
          <Trash2 className="h-4 w-4" />
          {isPending ? "Clearing..." : "Clear Demo Data"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Demo data uses fixed IDs (prefixed &ldquo;demo-&rdquo;) so it can be cleared without affecting real records.
      </p>
    </div>
  );
}
