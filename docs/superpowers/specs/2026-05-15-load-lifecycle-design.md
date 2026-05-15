# Load Lifecycle Management — Design Spec
_2026-05-15 · CaraCarriers TMS_

## Overview

Phase 1 of the TMS expansion. Adds a full-page load detail view at `/loads/[id]` with carrier assignment, status stepping, check calls, document uploads, auto-generated rate confirmations, and auto-drafted invoices on delivery. Loads table rows become clickable links.

This phase competes directly with what dispatchers do daily in McLeod and AscendTMS:
assign a carrier, track the truck, collect POD, close the load.

---

## Schema Migration

One additive change to `LoadEvent` — add an event type so the activity log can distinguish check calls from status changes.

```prisma
enum LoadEventType {
  STATUS_CHANGE
  CHECK_CALL
  NOTE
  CARRIER_ASSIGNED
  DOCUMENT_UPLOADED
}

model LoadEvent {
  // existing fields unchanged
  id         String        @id @default(cuid())
  loadId     String        @map("load_id")
  status     LoadStatus
  location   String?
  notes      String?
  occurredAt DateTime      @default(now()) @map("occurred_at")

  // NEW
  eventType  LoadEventType @default(STATUS_CHANGE) @map("event_type")
  userId     String?       @map("user_id")   // who logged it

  load Load @relation(fields: [loadId], references: [id], onDelete: Cascade)
}
```

Run `prisma migrate dev --name add_load_event_type` after editing schema.

No other schema changes — all other needed fields already exist (carrierRate, fuelSurcharge, miles, bolNumber, documents relation, etc.).

---

## Architecture

### New pages

| Route | File | Description |
|---|---|---|
| `/loads/[id]` | `app/loads/[id]/page.tsx` | Full load detail page (server component) |
| `/loads/[id]/edit` | merged into detail page via dialog | Edit all load fields |

### Updated pages

- `app/loads/page.tsx` — wrap each row in `<Link href={/loads/${load.id}}>` 

### New server actions (`app/actions/loads.ts` additions)

| Action | What it does |
|---|---|
| `updateLoad(id, data)` | Edit all load fields, revalidate |
| `assignCarrier(loadId, carrierId, carrierRate)` | Assign carrier, log CARRIER_ASSIGNED event, trigger rate con |
| `advanceStatus(loadId, newStatus)` | Move status forward, log STATUS_CHANGE event |
| `addCheckCall(loadId, location, notes)` | Log CHECK_CALL event with location |
| `addNote(loadId, notes)` | Log NOTE event |
| `recordDocument(loadId, type, fileUrl, filePath)` | Save Document record after Supabase Storage upload |

### New API routes

| Route | Purpose |
|---|---|
| `GET /api/loads/[id]/rate-confirmation` | Generate + return rate confirmation PDF (pdf-lib) for browser download |

### New lib files

- `lib/email/rate-confirmation.ts` — Resend email with HTML body + PDF attachment
- `lib/pdf/rate-confirmation.ts` — pdf-lib document builder returning `Uint8Array`

### New npm dependency

- `pdf-lib` — pure-JS, server-safe PDF generation. No canvas, no browser needed.

---

## Components

All new components live under `components/loads/`.

### `load-detail-header.tsx` (server)
Props: `load` (with carrier, shipper), `companyId`  
Renders: back button, load number + route label, status badge, action buttons (Edit Load, Rate Con, Invoice).

### `status-stepper.tsx` (client)
Props: `currentStatus: LoadStatus`, `loadId`  
Shows the AVAILABLE → BOOKED → DISPATCHED → IN_TRANSIT → DELIVERED pipeline as a horizontal stepper. Clicking the next step calls `advanceStatus` via `useTransition`. Status can only move forward (no backwards except to CANCELLED/PROBLEM which are always available as danger actions).

### `carrier-search-dialog.tsx` (client)
Props: `loadId`, `equipmentType`, `currentCarrierId?`  
Opens a modal. Contains a controlled search input that fires a server action `searchCarriers(query, equipmentType, companyId)` using `useTransition`. Results show:
- Carrier name, MC#
- Equipment badges
- Insurance status chip (green/red)
- Star rating
- Phone number

"Assign" button calls `assignCarrier` then closes modal.

### `carrier-rate-input.tsx` (inside carrier-search-dialog)
Inline rate field shown after selecting a carrier. Required before confirming assignment. Prefills with 0.

### `check-call-form.tsx` (client)
Inline form (not modal) at the top of the activity sidebar. Two fields: location (text), note (text). Submits via `addCheckCall`.

### `activity-log.tsx` (server)
Props: `events: LoadEvent[]`  
Renders a chronological list of events with icon/color per event type:
- STATUS_CHANGE — blue pill
- CHECK_CALL — map pin icon, teal
- CARRIER_ASSIGNED — truck icon, green
- DOCUMENT_UPLOADED — paper icon, slate
- NOTE — chat bubble, gray

### `financials-block.tsx` (server)
Props: load financials  
Shows shipper rate, carrier rate, fuel surcharge, computed margin (shipperRate - carrierRate - fuelSurcharge) and margin %. All editable via Edit Load dialog.

### `document-list.tsx` (client)
Props: `documents: Document[]`, `loadId`  
Lists documents with type badge, name, and Download link (signed Supabase URL).  
Upload button opens a file picker → uploads directly to Supabase Storage from the browser using the anon key → calls `recordDocument` server action with the resulting URL.

Expected doc types per load: RATE_CONFIRMATION, BOL, POD. Shows pending placeholders for any missing type.

### `edit-load-dialog.tsx` (client)
Full form covering all load fields: origin/dest, dates/windows, equipment, commodity, weight, miles, rates, BOL/PO/PRO/seal numbers, notes, shipper assignment.  
Uses `react-hook-form` + Zod. On submit, calls `updateLoad` via `useTransition` (not `useActionState` — the form has too many fields for uncontrolled form state).

---

## Rate Confirmation PDF

Generated server-side by `lib/pdf/rate-confirmation.ts` using `pdf-lib`.

Content sections:
1. Header: CaraCarriers name, MC#, address, phone, date
2. Carrier block: name, MC#, contact, email
3. Load block: load number, equipment, origin → destination, pickup/delivery dates
4. Rate block: carrier rate + fuel surcharge + total
5. Commodity/weight
6. Terms section (standard broker-carrier terms, 5 lines)
7. Signature lines: Carrier Rep / Date and Broker Rep / Date

The `GET /api/loads/[id]/rate-confirmation` route (download button):
- Fetches load + carrier + company from DB
- Builds PDF bytes via `lib/pdf/rate-confirmation.ts`
- Returns `Response` with `Content-Type: application/pdf` and `Content-Disposition: attachment`

Email flow (inside `assignCarrier` server action):
- Generates PDF bytes
- Uploads to Supabase Storage → `{companyId}/{loadId}/RATE_CONFIRMATION.pdf`
- Calls `recordDocument` to upsert the Document record
- Sends email via Resend with PDF as base64 attachment

---

## Auto-actions (triggered by server actions, not cron)

| Trigger | Auto-action |
|---|---|
| `assignCarrier` completes | If carrier has email → generate PDF + send via Resend inline (awaited). Acceptable latency for carrier assignment. |
| `advanceStatus(DELIVERED)` | Call `createInvoice` inline (awaited) to auto-draft an invoice for the load's shipper at `shipperRate`. |

Both are awaited inside their parent server action. No background workers or API routes needed for the trigger path — the email and invoice creation are fast enough to include synchronously.

---

## Supabase Storage Setup

Bucket: `load-documents` (private)

Path convention: `{companyId}/{loadId}/{DocumentType}-{unix-timestamp}.{ext}`

Upload flow:
1. Client picks file via `<input type="file">`
2. Client uploads directly to Supabase Storage using `supabase.storage.from('load-documents').upload(path, file)`
3. On success, client calls `recordDocument` server action with the returned `path` and public/signed URL
4. Server creates/updates the Document record

RLS policy on `load-documents` bucket: authenticated users may read/write paths starting with their `companyId` (needs to be configured in Supabase dashboard).

---

## Carrier Search Logic

`searchCarriers(query, equipmentType, companyId)` server action:

1. `WHERE companyId = ? AND status = APPROVED`
2. If `query` provided: `WHERE name ILIKE '%query%' OR mcNumber ILIKE '%query%'`
3. If `equipmentType` provided: `WHERE equipment.type = equipmentType` (join on CarrierEquipment)
4. Sort: insurance ACTIVE first, then by rating DESC, then name ASC
5. Returns first 20 results with: id, name, mcNumber, phone, email, rating, insuranceStatus, insuranceExpiry, equipment types

No external FMCSA lookup in Phase 1 — that's Phase 2.

---

## Error Handling

- All server actions return `{ error: string } | { success: true }` — standard pattern from existing actions
- If carrier has no email: skip rate con email silently, show toast "No email on file for carrier — download rate con manually"
- If Supabase Storage upload fails: surface error in document-list UI, don't save Document record
- PDF generation errors: return 500 with JSON `{ error: "PDF generation failed" }`, log to console

---

## What this does NOT include (Phase 2+)

- FMCSA authority/insurance lookup by MC# (Phase 2)
- Twilio SMS check calls to driver (Phase 2)
- Load board posting to DAT/Truckstop (Phase 3)
- E-signatures on rate confirmations via Documenso (Phase 3 — schema already has `documensoId`)
- Carrier portal (carriers see their loads) (Phase 3)
