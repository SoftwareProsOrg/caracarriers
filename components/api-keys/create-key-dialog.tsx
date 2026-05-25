"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Copy, Check, AlertTriangle, Loader2 } from "lucide-react";

const PERMISSION_OPTIONS = [
  { value: "read", label: "Read — view data only" },
  { value: "write", label: "Write — create and update" },
  { value: "admin", label: "Admin — full access" },
];

const EXPIRY_OPTIONS = [
  { value: "30", label: "30 days" },
  { value: "60", label: "60 days" },
  { value: "90", label: "90 days" },
  { value: "", label: "Never expires" },
];

interface CreatedKey {
  id: string;
  name: string;
  key: string;
  maskedKey: string;
  permissions: string;
  expiresAt: string | null;
  createdAt: string;
}

export function CreateKeyDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<CreatedKey | null>(null);
  const [copied, setCopied] = useState(false);

  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState("read");
  const [expiryDays, setExpiryDays] = useState("30");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          permissions,
          expiresInDays: expiryDays ? parseInt(expiryDays, 10) : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to create API key");
        return;
      }

      setCreatedKey(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function handleCopy() {
    if (!createdKey) return;
    try {
      await navigator.clipboard.writeText(createdKey.key);
      setCopied(true);
    } catch {}
  }

  function handleDone() {
    setOpen(false);
    setCreatedKey(null);
    setCopied(false);
    setName("");
    setPermissions("read");
    setExpiryDays("30");
    setError(null);
    router.refresh();
  }

  function isCreateForm() {
    return !createdKey;
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleDone(); setOpen(v); }}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4" />Create API Key</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {createdKey ? "API Key Created" : "Create API Key"}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="px-6">
            <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">{error}</p>
          </div>
        )}

        {createdKey ? (
          <div className="space-y-4 p-6 pt-4">
            <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-warning">Save this key — it will not be shown again</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Copy this key now and store it securely. For security reasons, you will not be able to view the full key again.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label>Name</Label>
              <p className="text-sm font-medium mt-1">{createdKey.name}</p>
            </div>

            <div>
              <Label>API Key</Label>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 rounded-md border border-border bg-muted px-3 py-2 font-mono text-xs break-all">
                  {createdKey.key}
                </code>
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleDone}>{copied ? "Done" : "I'll copy it later"}</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4 p-6 pt-4">
            <div>
              <Label htmlFor="name">Key Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Production API Key"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="permissions">Permissions</Label>
              <select
                id="permissions"
                value={permissions}
                onChange={(e) => setPermissions(e.target.value)}
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {PERMISSION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="expiry">Expires In</Label>
              <select
                id="expiry"
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)}
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {EXPIRY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={creating || !name.trim()}>
                {creating ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</>
                ) : (
                  <><Plus className="h-4 w-4" /> Create Key</>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
