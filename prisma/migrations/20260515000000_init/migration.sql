-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "LoadStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'PROBLEM');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED', 'VOID');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('BOL', 'POD', 'RATE_CONFIRMATION', 'INSURANCE_CERTIFICATE', 'CONTRACT', 'CARRIER_PACKET', 'W9', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING_UPLOAD', 'COMPLETE', 'MISSING', 'EXPIRING_SOON', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SigningStatus" AS ENUM ('DRAFT', 'PENDING', 'SIGNED', 'DECLINED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CarrierStatus" AS ENUM ('PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('DRY_VAN', 'FLATBED', 'REEFER', 'STEP_DECK', 'LOWBOY', 'TANKER', 'BOX_TRUCK', 'POWER_ONLY', 'OTHER');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'DISPATCHER', 'AGENT', 'ACCOUNTING', 'READONLY');

-- CreateEnum
CREATE TYPE "InsuranceStatus" AS ENUM ('ACTIVE', 'EXPIRING_SOON', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AuthorityStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'REVOKED');

-- CreateEnum
CREATE TYPE "CarrierPaymentMethod" AS ENUM ('CHECK', 'ACH', 'WIRE', 'FUEL_CARD', 'FACTORING', 'OTHER');

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mc_number" TEXT,
    "dot_number" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "auth_id" TEXT,
    "company_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'DISPATCHER',
    "avatar_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shippers" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact_name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "credit_limit" DECIMAL(12,2),
    "payment_terms" INTEGER NOT NULL DEFAULT 30,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shippers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carriers" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mc_number" TEXT,
    "dot_number" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "status" "CarrierStatus" NOT NULL DEFAULT 'PENDING',
    "insurance_status" "InsuranceStatus" NOT NULL DEFAULT 'ACTIVE',
    "insurance_expiry" TIMESTAMP(3),
    "authority_status" "AuthorityStatus" NOT NULL DEFAULT 'ACTIVE',
    "safety_rating" TEXT,
    "rating" DECIMAL(3,2),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carriers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carrier_equipment" (
    "id" TEXT NOT NULL,
    "carrier_id" TEXT NOT NULL,
    "type" "EquipmentType" NOT NULL,

    CONSTRAINT "carrier_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loads" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "load_number" TEXT NOT NULL,
    "shipper_id" TEXT,
    "carrier_id" TEXT,
    "dispatcher_id" TEXT,
    "created_by_id" TEXT,
    "status" "LoadStatus" NOT NULL DEFAULT 'AVAILABLE',
    "equipment_type" "EquipmentType" NOT NULL,
    "origin_address" TEXT,
    "origin_city" TEXT NOT NULL,
    "origin_state" TEXT NOT NULL,
    "origin_zip" TEXT,
    "pickup_date" TIMESTAMP(3) NOT NULL,
    "pickup_window" TEXT,
    "dest_address" TEXT,
    "dest_city" TEXT NOT NULL,
    "dest_state" TEXT NOT NULL,
    "dest_zip" TEXT,
    "delivery_date" TIMESTAMP(3) NOT NULL,
    "delivery_window" TEXT,
    "commodity" TEXT,
    "weight" DECIMAL(10,2),
    "pieces" INTEGER,
    "hazmat" BOOLEAN NOT NULL DEFAULT false,
    "temperature" TEXT,
    "shipper_rate" DECIMAL(10,2) NOT NULL,
    "carrier_rate" DECIMAL(10,2),
    "fuel_surcharge" DECIMAL(10,2),
    "miles" INTEGER,
    "current_location" TEXT,
    "eta" TIMESTAMP(3),
    "pro_number" TEXT,
    "po_number" TEXT,
    "bol_number" TEXT,
    "seal_number" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "load_events" (
    "id" TEXT NOT NULL,
    "load_id" TEXT NOT NULL,
    "status" "LoadStatus" NOT NULL,
    "location" TEXT,
    "notes" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "load_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "load_id" TEXT,
    "shipper_id" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "amount" DECIMAL(12,2) NOT NULL,
    "tax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_at" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),
    "stripe_payment_intent_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carrier_payments" (
    "id" TEXT NOT NULL,
    "carrier_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "method" "CarrierPaymentMethod" NOT NULL DEFAULT 'ACH',
    "reference" TEXT,
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "carrier_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "load_id" TEXT,
    "carrier_id" TEXT,
    "type" "DocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING_UPLOAD',
    "signing_status" "SigningStatus",
    "file_url" TEXT,
    "file_path" TEXT,
    "documenso_id" INTEGER,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_mc_number_key" ON "companies"("mc_number");

-- CreateIndex
CREATE UNIQUE INDEX "companies_dot_number_key" ON "companies"("dot_number");

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_id_key" ON "users"("auth_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_company_id_idx" ON "users"("company_id");

-- CreateIndex
CREATE INDEX "users_auth_id_idx" ON "users"("auth_id");

-- CreateIndex
CREATE INDEX "shippers_company_id_idx" ON "shippers"("company_id");

-- CreateIndex
CREATE INDEX "carriers_company_id_idx" ON "carriers"("company_id");

-- CreateIndex
CREATE INDEX "carriers_mc_number_idx" ON "carriers"("mc_number");

-- CreateIndex
CREATE INDEX "carrier_equipment_carrier_id_idx" ON "carrier_equipment"("carrier_id");

-- CreateIndex
CREATE UNIQUE INDEX "loads_load_number_key" ON "loads"("load_number");

-- CreateIndex
CREATE INDEX "loads_company_id_idx" ON "loads"("company_id");

-- CreateIndex
CREATE INDEX "loads_shipper_id_idx" ON "loads"("shipper_id");

-- CreateIndex
CREATE INDEX "loads_carrier_id_idx" ON "loads"("carrier_id");

-- CreateIndex
CREATE INDEX "loads_status_idx" ON "loads"("status");

-- CreateIndex
CREATE INDEX "loads_pickup_date_idx" ON "loads"("pickup_date");

-- CreateIndex
CREATE INDEX "loads_company_id_status_idx" ON "loads"("company_id", "status");

-- CreateIndex
CREATE INDEX "load_events_load_id_idx" ON "load_events"("load_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_load_id_key" ON "invoices"("load_id");

-- CreateIndex
CREATE INDEX "invoices_company_id_idx" ON "invoices"("company_id");

-- CreateIndex
CREATE INDEX "invoices_shipper_id_idx" ON "invoices"("shipper_id");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_due_at_idx" ON "invoices"("due_at");

-- CreateIndex
CREATE INDEX "carrier_payments_carrier_id_idx" ON "carrier_payments"("carrier_id");

-- CreateIndex
CREATE INDEX "documents_company_id_idx" ON "documents"("company_id");

-- CreateIndex
CREATE INDEX "documents_load_id_idx" ON "documents"("load_id");

-- CreateIndex
CREATE INDEX "documents_carrier_id_idx" ON "documents"("carrier_id");

-- CreateIndex
CREATE INDEX "documents_expires_at_idx" ON "documents"("expires_at");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shippers" ADD CONSTRAINT "shippers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carriers" ADD CONSTRAINT "carriers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carrier_equipment" ADD CONSTRAINT "carrier_equipment_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "carriers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loads" ADD CONSTRAINT "loads_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loads" ADD CONSTRAINT "loads_shipper_id_fkey" FOREIGN KEY ("shipper_id") REFERENCES "shippers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loads" ADD CONSTRAINT "loads_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "carriers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loads" ADD CONSTRAINT "loads_dispatcher_id_fkey" FOREIGN KEY ("dispatcher_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loads" ADD CONSTRAINT "loads_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "load_events" ADD CONSTRAINT "load_events_load_id_fkey" FOREIGN KEY ("load_id") REFERENCES "loads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_load_id_fkey" FOREIGN KEY ("load_id") REFERENCES "loads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_shipper_id_fkey" FOREIGN KEY ("shipper_id") REFERENCES "shippers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carrier_payments" ADD CONSTRAINT "carrier_payments_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "carriers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_load_id_fkey" FOREIGN KEY ("load_id") REFERENCES "loads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_carrier_id_fkey" FOREIGN KEY ("carrier_id") REFERENCES "carriers"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Enable Row Level Security on all tables (Supabase security requirement)
ALTER TABLE "companies"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shippers"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "carriers"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "carrier_equipment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "loads"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "load_events"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invoices"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "carrier_payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "documents"        ENABLE ROW LEVEL SECURITY;

-- Server-side Prisma (postgres role) bypasses RLS by default.
-- These policies protect the Supabase Data API (anon/authenticated roles).
-- Data is scoped to company via application logic on the server side.
