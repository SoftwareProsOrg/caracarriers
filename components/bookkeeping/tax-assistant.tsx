"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Loader2, AlertCircle } from "lucide-react";
import type { BookkeepingSummary } from "@/lib/bookkeeping/calculations";
import type { TaxEstimate } from "@/lib/bookkeeping/tax";

interface TaxAssistantProps {
  bookkeeping: BookkeepingSummary;
  taxEstimate: TaxEstimate;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function TaxAssistant({ bookkeeping, taxEstimate }: TaxAssistantProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/bookkeeping/tax-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg, bookkeeping, taxEstimate }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer ?? data.error ?? "No response." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to get response. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="w-full"
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        {open ? "Hide Tax Chat" : "Ask AI About Your Taxes"}
      </Button>

      {open && (
        <Card className="mt-2">
          <CardContent className="p-3 space-y-3">
            {messages.length === 0 && (
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                <p>
                  Ask questions like &quot;How can I reduce my tax burden?&quot;,
                  &quot;What deductions am I missing?&quot;, or
                  &quot;Should I make estimated quarterly payments?&quot;
                </p>
              </div>
            )}

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a tax question..."
                disabled={loading}
                className="text-sm"
              />
              <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
