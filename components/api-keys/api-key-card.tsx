"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Key, Copy, Trash2, Check } from "lucide-react";

const PERMISSION_COLOR: Record<string, string> = {
  read: "bg-primary/10 text-primary",
  write: "bg-warning/10 text-warning",
  admin: "bg-destructive/10 text-destructive",
};

interface ApiKeyCardProps {
  id: string;
  name: string;
  keyValue: string;
  permissions: string;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  isActive: boolean;
  maskedKey: string;
}

export function ApiKeyCard({
  id,
  name,
  keyValue,
  permissions,
  lastUsedAt,
  expiresAt,
  createdAt,
  isActive,
  maskedKey,
}: ApiKeyCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isExpired = expiresAt && expiresAt < new Date();
  const status = !isActive ? "inactive" : isExpired ? "expired" : "active";
  const statusVariant: "success" | "muted" | "destructive" =
    status === "active" ? "success" : status === "expired" ? "destructive" : "muted";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(keyValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this API key? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/api-keys/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.refresh();
    } catch {
      setDeleting(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <Key className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-semibold text-sm">{name}</span>
              <Badge variant={statusVariant} className="capitalize">{status}</Badge>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">{maskedKey}</code>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
                {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${PERMISSION_COLOR[permissions] ?? ""}`}>
                {permissions}
              </span>
              {lastUsedAt && <span>Last used: {lastUsedAt.toLocaleDateString()}</span>}
              {expiresAt && <span>Expires: {expiresAt.toLocaleDateString()}</span>}
              <span>Created: {createdAt.toLocaleDateString()}</span>
            </div>
          </div>
          <div className="shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
