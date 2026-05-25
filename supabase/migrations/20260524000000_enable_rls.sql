-- ─────────────────────────────────────────────────────────────────────────────
-- Enable RLS on all tables
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "companies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shippers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "carriers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "carrier_equipment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "loads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "load_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "carrier_payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "documents" ENABLE ROW LEVEL SECURITY;

-- Helper function to get the current user's company_id from JWT metadata
CREATE OR REPLACE FUNCTION get_company_id()
RETURNS text AS $$
  SELECT (auth.jwt() -> 'user_metadata' ->> 'company_id')::text;
$$ LANGUAGE sql STABLE;

-- ─────────────────────────────────────────────────────────────────────────────
-- LEADS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "Allow public lead creation" ON "leads"
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read leads" ON "leads"
  FOR SELECT TO authenticated USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- COMPANIES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "Users can view their own company" ON "companies"
  FOR SELECT TO authenticated
  USING (id = get_company_id());

CREATE POLICY "Admins can update their own company" ON "companies"
  FOR UPDATE TO authenticated
  USING (id = get_company_id())
  WITH CHECK (id = get_company_id());

-- ─────────────────────────────────────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "Users can view members of their own company" ON "users"
  FOR SELECT TO authenticated
  USING (company_id = get_company_id());

CREATE POLICY "Users can update their own profile" ON "users"
  FOR UPDATE TO authenticated
  USING (auth_id = auth.uid()::text)
  WITH CHECK (auth_id = auth.uid()::text);

-- ─────────────────────────────────────────────────────────────────────────────
-- SHIPPERS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "Users can view company shippers" ON "shippers"
  FOR SELECT TO authenticated USING (company_id = get_company_id());

CREATE POLICY "Users can create company shippers" ON "shippers"
  FOR INSERT TO authenticated WITH CHECK (company_id = get_company_id());

CREATE POLICY "Users can update company shippers" ON "shippers"
  FOR UPDATE TO authenticated USING (company_id = get_company_id());

-- ─────────────────────────────────────────────────────────────────────────────
-- CARRIERS & EQUIPMENT
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "Users can view company carriers" ON "carriers"
  FOR SELECT TO authenticated USING (company_id = get_company_id());

CREATE POLICY "Users can create company carriers" ON "carriers"
  FOR INSERT TO authenticated WITH CHECK (company_id = get_company_id());

CREATE POLICY "Users can update company carriers" ON "carriers"
  FOR UPDATE TO authenticated USING (company_id = get_company_id());

CREATE POLICY "Users can view carrier equipment" ON "carrier_equipment"
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM carriers WHERE carriers.id = carrier_id AND carriers.company_id = get_company_id())
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- LOADS & EVENTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "Users can view company loads" ON "loads"
  FOR SELECT TO authenticated USING (company_id = get_company_id());

CREATE POLICY "Users can create company loads" ON "loads"
  FOR INSERT TO authenticated WITH CHECK (company_id = get_company_id());

CREATE POLICY "Users can update company loads" ON "loads"
  FOR UPDATE TO authenticated USING (company_id = get_company_id());

CREATE POLICY "Users can delete company loads" ON "loads"
  FOR DELETE TO authenticated USING (company_id = get_company_id());

CREATE POLICY "Users can view load events" ON "load_events"
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM loads WHERE loads.id = load_id AND loads.company_id = get_company_id())
  );

CREATE POLICY "Users can create load events" ON "load_events"
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM loads WHERE loads.id = load_id AND loads.company_id = get_company_id())
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- INVOICES & PAYMENTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "Users can view company invoices" ON "invoices"
  FOR SELECT TO authenticated USING (company_id = get_company_id());

CREATE POLICY "Users can view company payments" ON "carrier_payments"
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM carriers WHERE carriers.id = carrier_id AND carriers.company_id = get_company_id())
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- DOCUMENTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "Users can view company documents" ON "documents"
  FOR SELECT TO authenticated USING (company_id = get_company_id());

CREATE POLICY "Users can create company documents" ON "documents"
  FOR INSERT TO authenticated WITH CHECK (company_id = get_company_id());

CREATE POLICY "Users can update company documents" ON "documents"
  FOR UPDATE TO authenticated USING (company_id = get_company_id());
