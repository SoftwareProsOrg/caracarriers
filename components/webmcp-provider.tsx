"use client";

import { useEffect } from "react";

export function WebMCPProvider() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("modelContext" in navigator)) return;

    (navigator as Navigator & { modelContext: { provideContext: (ctx: unknown) => void } })
      .modelContext.provideContext({
        tools: [
          {
            name: "request_freight_quote",
            description:
              "Initiate a freight quote request with CaraCarriers. Navigates to the quote form.",
            inputSchema: {
              type: "object",
              properties: {
                origin: {
                  type: "string",
                  description: "Origin city and state (e.g. Houston, TX)",
                },
                destination: {
                  type: "string",
                  description: "Destination city and state (e.g. Atlanta, GA)",
                },
                equipment: {
                  type: "string",
                  enum: ["Dry Van", "Flatbed", "Reefer", "Step Deck", "Box Truck", "Other"],
                  description: "Equipment type required",
                },
                weight_lbs: {
                  type: "number",
                  description: "Freight weight in pounds",
                },
                pickup_date: {
                  type: "string",
                  description: "Pickup date in YYYY-MM-DD format",
                },
              },
              required: ["origin", "destination"],
            },
            execute: async () => {
              window.location.hash = "contact";
              return { success: true, action: "navigated_to_quote_form" };
            },
          },
          {
            name: "get_contact_info",
            description: "Returns CaraCarriers dispatch contact information.",
            inputSchema: { type: "object", properties: {} },
            execute: async () => ({
              phone: "+19564564558",
              available: "24/7",
              email: "dispatch@caracarriers.com",
              website: "https://www.caracarriers.com",
            }),
          },
          {
            name: "list_services",
            description: "Returns the freight services offered by CaraCarriers.",
            inputSchema: { type: "object", properties: {} },
            execute: async () => ({
              services: [
                "Dry Van Freight",
                "Flatbed & Step Deck",
                "Temperature Controlled (Reefer)",
                "Expedited Shipping",
                "Partial Loads (LTL)",
                "Hazmat & Specialized",
              ],
              coverage: "48 US states",
            }),
          },
        ],
      });
  }, []);

  return null;
}
