import { NextResponse } from "next/server";

const MARKDOWN = `# CaraCarriers — Freight Brokerage | Nationwide Trucking Solutions

CaraCarriers is a licensed freight brokerage connecting shippers with reliable carriers across the United States. Competitive rates, real-time tracking, and dedicated service on every load.

## Services

### Dry Van Freight
Full truckload and partial loads in 53-foot dry van trailers for general commodity shipping nationwide.

### Flatbed & Step Deck
Over-dimensional and heavy freight requiring open-deck equipment. Tarped, strapped, and compliant.

### Temperature Controlled
Refrigerated and frozen freight moved in Reefer trailers with temperature monitoring from origin to delivery.

### Expedited Shipping
Time-critical shipments that can't wait. Direct-drive and team service available 24/7.

### Partial Loads (LTL)
Don't pay for a full truck when you don't need it. We consolidate partial loads to reduce freight costs.

### Hazmat & Specialized
Certified for hazmat freight with fully vetted, licensed carriers meeting all FMCSA requirements.

## Why Choose CaraCarriers

- **Licensed & Bonded** — Federally licensed freight broker (MC authority) with a $75,000 surety bond.
- **Vetted Carrier Network** — Every carrier vetted for active authority, insurance, and safety rating.
- **Real-Time Tracking** — Know where your freight is at every stage of transit.
- **Competitive Rates** — Our network gives access to capacity other brokers can't match.

## Coverage

Specializing in high-volume US lanes:
- Texas ↔ Midwest
- Southeast ↔ Northeast
- California ↔ Texas
- Texas ↔ Southeast
- Midwest ↔ Southeast
- Nationwide Coverage

## Contact

- **Phone**: +1 (956) 456-4558 (Available 24/7)
- **Email**: dispatch@caracarriers.com
- **Quote form**: https://www.caracarriers.com/#contact

## Legal

Licensed Freight Broker · FMCSA Authorized · 200 E Van Buren Ave, Harlingen, TX 78550
`;

export function GET() {
  return new NextResponse(MARKDOWN, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "x-markdown-tokens": String(MARKDOWN.length),
    },
  });
}
