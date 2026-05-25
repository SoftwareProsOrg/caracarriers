-- Enable RLS on all tables
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

-- Basic Policies (example for leads)
-- Allow authenticated users to see leads (this can be refined to company_id later if leads are company-scoped)
CREATE POLICY "Allow authenticated users to read leads" ON "leads"
  FOR SELECT TO authenticated USING (true);

-- For other tables, they are company-scoped.
-- We need a way to get the company_id for the current user in SQL.
-- Typically, we'd store company_id in auth.users.raw_user_meta_data.

CREATE POLICY "Users can view their own company" ON "companies"
  FOR SELECT TO authenticated
  USING (id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::text);

CREATE POLICY "Users can view members of their own company" ON "users"
  FOR SELECT TO authenticated
  USING (company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::text);

CREATE POLICY "Users can view their company's loads" ON "loads"
  FOR SELECT TO authenticated
  USING (company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::text);

-- Add more policies as needed...
