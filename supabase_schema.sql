-- Triarch Interiors Supabase Schema
-- Run in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ LEADS TABLE ============
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  pin_code TEXT NOT NULL,
  bhk TEXT,
  sqft NUMERIC,
  project_type TEXT CHECK (project_type IN ('new-home', 'renovation')),
  room_types TEXT[],
  budget_range TEXT,
  estimate_low NUMERIC,
  estimate_high NUMERIC,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'won', 'lost')),
  source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  notes TEXT
);

-- Updated_at trigger for leads
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============ PROJECTS TABLE ============
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  bhk TEXT,
  sqft NUMERIC,
  project_type TEXT CHECK (project_type IN ('new-home', 'renovation')),
  room_types TEXT[],
  cover_image TEXT,
  gallery_images TEXT[],
  location TEXT,
  brands_used TEXT[],
  seo_title TEXT,
  seo_description TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false
);

CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============ BRANDS TABLE ============
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- ============ PRICING RULES TABLE ============
CREATE TABLE IF NOT EXISTS pricing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  bhk TEXT NOT NULL,
  project_type TEXT NOT NULL CHECK (project_type IN ('new-home', 'renovation')),
  rate_per_sqft NUMERIC NOT NULL CHECK (rate_per_sqft > 0),
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TRIGGER set_pricing_updated_at
  BEFORE UPDATE ON pricing_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============ ROW LEVEL SECURITY ============
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;

-- Leads: only authenticated admins can read/write
CREATE POLICY "Leads: admin full access" ON leads
  FOR ALL USING (auth.role() = 'authenticated');

-- Service role can insert (for API route using service role)
-- NOTE: The API route uses the ANON key - enable insert for anon:
CREATE POLICY "Leads: anon can insert" ON leads
  FOR INSERT WITH CHECK (true);

-- Projects: public can read published, admins can do all
CREATE POLICY "Projects: public read published" ON projects
  FOR SELECT USING (is_published = true);
CREATE POLICY "Projects: admin full access" ON projects
  FOR ALL USING (auth.role() = 'authenticated');

-- Brands: public read active, admin all
CREATE POLICY "Brands: public read active" ON brands
  FOR SELECT USING (is_active = true);
CREATE POLICY "Brands: admin full access" ON brands
  FOR ALL USING (auth.role() = 'authenticated');

-- Pricing: admin only
CREATE POLICY "Pricing: admin full access" ON pricing_rules
  FOR ALL USING (auth.role() = 'authenticated');

-- ============ SAMPLE SEED DATA ============
-- Provisional pricing rates (clearly labelled as placeholder)
INSERT INTO pricing_rules (name, bhk, project_type, rate_per_sqft, is_active) VALUES
  ('1BHK New Home - Provisional', '1BHK', 'new-home', 1200, true),
  ('2BHK New Home - Provisional', '2BHK', 'new-home', 1150, true),
  ('3BHK New Home - Provisional', '3BHK', 'new-home', 1100, true),
  ('4BHK+ New Home - Provisional', '4BHK+', 'new-home', 1050, true),
  ('1BHK Renovation - Provisional', '1BHK', 'renovation', 900, true),
  ('2BHK Renovation - Provisional', '2BHK', 'renovation', 875, true),
  ('3BHK Renovation - Provisional', '3BHK', 'renovation', 850, true),
  ('4BHK+ Renovation - Provisional', '4BHK+', 'renovation', 820, true);

-- Sample brands
INSERT INTO brands (name, category, description, is_active) VALUES
  ('Greenply', 'Laminates & Boards', 'Premium plywood and MDF for furniture and cabinetry construction.', true),
  ('Hafele', 'Hardware & Fittings', 'German precision hardware — hinges, channels, handles, and kitchen fittings.', true),
  ('Hettich', 'Hardware & Fittings', 'Quality drawer systems, soft-close channels, and wardrobe hardware.', true),
  ('Kajaria', 'Tiles & Stone', 'India''s leading tile manufacturer for floors, walls, and bathrooms.', true),
  ('Asian Paints', 'Paints & Surfaces', 'Premium interior paints, textures, and wallcovering solutions.', true);
