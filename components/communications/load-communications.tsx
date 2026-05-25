"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CommunicationItem } from "@/components/communications/communication-item";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, MessageSquare } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface Communication {
  id: string;
  type: string;
  direction: string;
  subject: string | null;
  body: string | null;
  fromAddr: string | null;
  toAddr: string | null;
  userId: string | null;
  loadId: string | null;
  createdAt: Date;
  load: { loadNumber: string } | null;
}

interface LoadCommunicationsProps {
  loadId: string;
}

export function LoadCommunications({ loadId }: LoadCommunicationsProps) {
  const router = useRouter();
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [noteBody, setNoteBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCommunications = useCallback(async () => {
    try {
      const res = await fetch(`/api/communications?loadId=${loadId}&limit=100`);
      if (res.ok) {
        const data = await res.json();
        setCommunications(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [loadId]);

  useEffect(() => {
    fetchCommunications();
  }, [fetchCommunications]);

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteBody.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loadId,
          type: "note",
          direction: "outbound",
          body: noteBody,
        }),
      });

      if (res.ok) {
        setNoteBody("");
        setShowForm(false);
        fetchCommunications();
        router.refresh();
      }
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Communications
        </h3>
        <Button variant="ghost" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-3 w-3 mr-1" />
          Add Note
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleAddNote} className="mb-4 space-y-2">
          <Textarea
            placeholder="Type a note..."
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            rows={3}
            className="text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting || !noteBody.trim()}>
              {submitting ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3 py-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : communications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
          <MessageSquare className="h-8 w-8 opacity-30" />
          <p className="text-sm">No communications yet</p>
        </div>
      ) : (
        <div className="relative space-y-3">
          {communications.map((comm, index) => (
            <div key={comm.id} className="relative pl-6">
              {index < communications.length - 1 && (
                <div className="absolute left-[7px] top-4 bottom-0 w-px bg-border" />
              )}
              <div className="absolute left-0 top-[6px] h-3.5 w-3.5 rounded-full border-2 border-primary bg-background" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    {formatDateTime(new Date(comm.createdAt))}
                  </span>
                  <span className="text-[10px] uppercase font-medium text-muted-foreground">{comm.type}</span>
                </div>
                {comm.body && (
                  <p className="text-sm text-foreground whitespace-pre-wrap">{comm.body}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
