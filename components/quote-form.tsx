"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export function QuoteForm() {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = {
      name: (form.elements.namedItem("name") as HTMLInputElement)?.value || "",
      email: (form.elements.namedItem("email") as HTMLInputElement)?.value || "",
      phone: (form.elements.namedItem("phone") as HTMLInputElement)?.value || "",
      company: (form.elements.namedItem("company") as HTMLInputElement)?.value || "",
      origin: (form.elements.namedItem("origin") as HTMLInputElement)?.value || "",
      destination: (form.elements.namedItem("destination") as HTMLInputElement)?.value || "",
      equipment: (form.elements.namedItem("equipment") as HTMLSelectElement)?.value || "",
      weight: (form.elements.namedItem("weight") as HTMLInputElement)?.value || "",
      pickup: (form.elements.namedItem("pickup") as HTMLInputElement)?.value || "",
      notes: (form.elements.namedItem("notes") as HTMLTextAreaElement)?.value || "",
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        alert("Thank you for your quote request! We will get back to you shortly.");
        form.reset();
      } else {
        throw new Error(data.error || "Failed to submit");
      }
    } catch {
      alert("There was an error submitting your request. Please try again or call us directly.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form id="quote-form" onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1.5" htmlFor="name">Your Name *</label>
          <input
            id="name" name="name" type="text" required
            placeholder="John Smith"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5" htmlFor="company">Company</label>
          <input
            id="company" name="company" type="text"
            placeholder="Acme Corp"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1.5" htmlFor="email">Email *</label>
          <input
            id="email" name="email" type="email" required
            placeholder="you@company.com"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5" htmlFor="phone">Phone</label>
          <input
            id="phone" name="phone" type="tel"
            placeholder="(555) 000-0000"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1.5" htmlFor="origin">Origin City, State *</label>
          <input
            id="origin" name="origin" type="text" required
            placeholder="Houston, TX"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5" htmlFor="destination">Destination City, State *</label>
          <input
            id="destination" name="destination" type="text" required
            placeholder="Atlanta, GA"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1.5" htmlFor="equipment">Equipment Type</label>
          <select
            id="equipment" name="equipment"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option>Dry Van</option>
            <option>Flatbed</option>
            <option>Reefer</option>
            <option>Step Deck</option>
            <option>Box Truck</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5" htmlFor="weight">Weight (lbs)</label>
          <input
            id="weight" name="weight" type="number"
            placeholder="42000"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5" htmlFor="pickup">Pickup Date</label>
          <input
            id="pickup" name="pickup" type="date"
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1.5" htmlFor="notes">Commodity / Special Instructions</label>
        <textarea
          id="notes" name="notes" rows={3}
          placeholder="What are you shipping? Any special requirements?"
          className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {submitting ? "Sending..." : "Submit Quote Request"}
        <ArrowRight className="h-5 w-5" />
      </button>
    </form>
  );
}
