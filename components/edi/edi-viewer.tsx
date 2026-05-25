"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";

interface EdiViewerProps {
  rawContent: string;
  parsedData?: Record<string, unknown> | null;
  title?: string;
}

export function EdiViewer({ rawContent, parsedData, title }: EdiViewerProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(rawContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const segments = rawContent.split("\n").filter(Boolean);

  function segmentColor(line: string): string {
    if (line.startsWith("ISA")) return "text-primary font-semibold";
    if (line.startsWith("GS") || line.startsWith("GE")) return "text-muted-foreground";
    if (line.startsWith("ST") || line.startsWith("SE")) return "text-accent";
    if (line.startsWith("IEA")) return "text-destructive";
    return "text-foreground";
  }

  return (
    <div className="space-y-4">
      {parsedData && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Parsed Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs text-muted-foreground overflow-auto max-h-60 whitespace-pre-wrap">
              {JSON.stringify(parsedData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm">{title ?? "Raw EDI Content"}</CardTitle>
          <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={handleCopy}>
            {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </CardHeader>
        <CardContent>
          <pre className="rounded-lg bg-muted p-4 text-xs leading-relaxed overflow-auto max-h-96 font-mono whitespace-pre">
            {segments.map((seg, i) => (
              <div key={i} className={segmentColor(seg)}>
                {seg
                  .split("*")
                  .map((el, j) => (
                    <span key={j}>
                      {j > 0 && <span className="text-muted-foreground">*</span>}
                      {j === 1 && !isNaN(Number(el))
                        ? <span className="text-warning">{el}</span>
                        : el}
                    </span>
                  ))}
              </div>
            ))}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
