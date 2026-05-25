-- Create leads table for capturing potential customers
create table leads (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  phone text,
  company text,
  origin text,
  destination text,
  equipment_type text,
  weight text,
  pickup_date date,
  notes text,
  source text default 'website',
  status text default 'new',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index leads_email_idx on leads(email);
create index leads_status_idx on leads(status);
create index leads_created_at_idx on leads(created_at);

-- Enable realtime for leads table (if using Supabase Realtime)
alter publication supabase_realtime add table leads;