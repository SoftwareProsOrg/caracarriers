"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckCircle2,
  Circle,
  Plus,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: string;
  subject: string;
  body: string | null;
  completed: boolean;
  dueAt: string | null;
  createdAt: string;
}

const ACTIVITY_ICONS: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
  task: CheckCircle2,
  other: FileText,
};

function ActivityIcon({ type }: { type: string }) {
  const Icon = ACTIVITY_ICONS[type] ?? FileText;
  return <Icon className="h-4 w-4" />;
}

interface ActivityFeedProps {
  activities: Activity[];
  dealId: string;
}

export function ActivityFeed({ activities, dealId }: ActivityFeedProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const body = {
      dealId,
      type: form.get("type") as string,
      subject: form.get("subject") as string,
      body: (form.get("body") as string) || null,
    };
    try {
      const res = await fetch("/api/crm/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setOpen(false);
        window.location.reload();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">Activity Feed</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Log Activity
        </Button>
      </CardHeader>
      <CardContent className="space-y-0 p-0">
        {activities.length === 0 ? (
          <div className="px-6 pb-4 text-sm text-muted-foreground text-center py-8">
            No activities yet.
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[23px] top-2 bottom-2 w-px bg-border" />
            <div className="divide-y divide-border">
              {activities.map((activity) => {
                const Icon = ACTIVITY_ICONS[activity.type] ?? FileText;
                return (
                  <div key={activity.id} className="flex gap-3 px-6 py-3">
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background z-10",
                      activity.completed ? "border-green-300 text-green-600" : "border-border text-muted-foreground"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{activity.subject}</p>
                        <span className="text-[10px] uppercase text-muted-foreground font-medium">{activity.type}</span>
                      </div>
                      {activity.body && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{activity.body}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                        <span>{formatDateTime(activity.createdAt)}</span>
                        {activity.dueAt && (
                          <span>Due: {formatDateTime(activity.dueAt)}</span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {activity.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Activity</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 p-6 pt-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                name="type"
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="call">Call</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
                <option value="task">Task</option>
                <option value="note">Note</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input id="subject" name="subject" placeholder="Call with shipper" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="body">Notes</Label>
              <Textarea id="body" name="body" placeholder="Details about this activity..." className="mt-1" rows={3} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Activity"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
