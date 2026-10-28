-- ====================================================================
-- Triarch Interiors - Supabase Database Setup Script
-- ====================================================================
-- Instructions:
-- 1. Open your Supabase Project Dashboard (https://supabase.com/dashboard)
-- 2. Click "SQL Editor" on the left navigation sidebar
-- 3. Click "New Query", paste the entire contents of this file, and click "Run"
-- ====================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Timestamp update helper function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 3. LEADS TABLE (Contact Form & Cost Estimator Submissions)
-- ====================================================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  pin_code TEXT NOT NULL,
  bhk TEXT,
  sqft NUMERIC,
  project_type TEXT,
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

-- Trigger to keep updated_at in sync
DROP TRIGGER IF EXISTS set_leads_updated_at ON leads;
CREATE TRIGGER set_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ====================================================================
-- 4. PROJECTS TABLE (Portfolio Showcase)
-- ====================================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  bhk TEXT,
  sqft NUMERIC,
  project_type TEXT,
  room_types TEXT[],
  cover_image TEXT,
  gallery_images TEXT[],
  location TEXT,
  brands_used TEXT[],
  seo_title TEXT,
  seo_description TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false
);

DROP TRIGGER IF EXISTS set_projects_updated_at ON projects;
CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ====================================================================
-- 5. BRANDS TABLE (Partner Brand Directory)
-- ====================================================================
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- ====================================================================
-- 6. PRICING RULES TABLE (Configurable Estimator Rates)
-- ====================================================================
CREATE TABLE IF NOT EXISTS pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  bhk TEXT NOT NULL,
  project_type TEXT NOT NULL,
  rate_per_sqft NUMERIC NOT NULL CHECK (rate_per_sqft > 0),
  is_active BOOLEAN NOT NULL DEFAULT true
);

DROP TRIGGER IF EXISTS set_pricing_updated_at ON pricing_rules;
CREATE TRIGGER set_pricing_updated_at
  BEFORE UPDATE ON pricing_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ====================================================================
-- 7. ROW LEVEL SECURITY (RLS) & POLICIES
-- ====================================================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;

-- Clean up any existing policies before recreating to avoid duplicate errors
DROP POLICY IF EXISTS "Leads: anon can insert" ON leads;
DROP POLICY IF EXISTS "Leads: admin full access" ON leads;
DROP POLICY IF EXISTS "Projects: public read published" ON projects;
DROP POLICY IF EXISTS "Projects: admin full access" ON projects;
DROP POLICY IF EXISTS "Brands: public read active" ON brands;
DROP POLICY IF EXISTS "Brands: admin full access" ON brands;
DROP POLICY IF EXISTS "Pricing: public read active" ON pricing_rules;
DROP POLICY IF EXISTS "Pricing: admin full access" ON pricing_rules;

-- LEADS POLICIES:
-- Allow anyone (website visitors) to submit contact and estimator leads
CREATE POLICY "Leads: anon can insert" ON leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users (admin panel) to view and manage leads
CREATE POLICY "Leads: admin full access" ON leads
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- PROJECTS POLICIES:
-- Allow anyone to read published projects
CREATE POLICY "Projects: public read published" ON projects
  FOR SELECT TO anon, authenticated
  USING (is_published = true);

-- Allow admin full access to projects
CREATE POLICY "Projects: admin full access" ON projects
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- BRANDS POLICIES:
-- Allow anyone to view active brands
CREATE POLICY "Brands: public read active" ON brands
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Allow admin full access to brands
CREATE POLICY "Brands: admin full access" ON brands
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- PRICING RULES POLICIES:
-- Allow anyone to read active pricing rules (used by the estimator)
CREATE POLICY "Pricing: public read active" ON pricing_rules
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Allow admin full access to pricing rules
CREATE POLICY "Pricing: admin full access" ON pricing_rules
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- ====================================================================
-- 8. GRANT PRIVILEGES
-- ====================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- ====================================================================
-- 9. SEED DATA (Idempotent - safe to run multiple times)
-- ====================================================================
-- Base pricing rates
INSERT INTO pricing_rules (name, bhk, project_type, rate_per_sqft, is_active)
SELECT '1BHK New Home - Standard', '1BHK', 'new-home', 1200, true
WHERE NOT EXISTS (SELECT 1 FROM pricing_rules WHERE bhk = '1BHK' AND project_type = 'new-home');

INSERT INTO pricing_rules (name, bhk, project_type, rate_per_sqft, is_active)
SELECT '2BHK New Home - Standard', '2BHK', 'new-home', 1150, true
WHERE NOT EXISTS (SELECT 1 FROM pricing_rules WHERE bhk = '2BHK' AND project_type = 'new-home');

INSERT INTO pricing_rules (name, bhk, project_type, rate_per_sqft, is_active)
SELECT '3BHK New Home - Standard', '3BHK', 'new-home', 1100, true
WHERE NOT EXISTS (SELECT 1 FROM pricing_rules WHERE bhk = '3BHK' AND project_type = 'new-home');

INSERT INTO pricing_rules (name, bhk, project_type, rate_per_sqft, is_active)
SELECT '4BHK+ New Home - Standard', '4BHK+', 'new-home', 1050, true
WHERE NOT EXISTS (SELECT 1 FROM pricing_rules WHERE bhk = '4BHK+' AND project_type = 'new-home');

INSERT INTO pricing_rules (name, bhk, project_type, rate_per_sqft, is_active)
SELECT '1BHK Renovation - Standard', '1BHK', 'renovation', 900, true
WHERE NOT EXISTS (SELECT 1 FROM pricing_rules WHERE bhk = '1BHK' AND project_type = 'renovation');

INSERT INTO pricing_rules (name, bhk, project_type, rate_per_sqft, is_active)
SELECT '2BHK Renovation - Standard', '2BHK', 'renovation', 875, true
WHERE NOT EXISTS (SELECT 1 FROM pricing_rules WHERE bhk = '2BHK' AND project_type = 'renovation');

INSERT INTO pricing_rules (name, bhk, project_type, rate_per_sqft, is_active)
SELECT '3BHK Renovation - Standard', '3BHK', 'renovation', 850, true
WHERE NOT EXISTS (SELECT 1 FROM pricing_rules WHERE bhk = '3BHK' AND project_type = 'renovation');

INSERT INTO pricing_rules (name, bhk, project_type, rate_per_sqft, is_active)
SELECT '4BHK+ Renovation - Standard', '4BHK+', 'renovation', 820, true
WHERE NOT EXISTS (SELECT 1 FROM pricing_rules WHERE bhk = '4BHK+' AND project_type = 'renovation');

-- Brands
INSERT INTO brands (name, category, description, is_active)
SELECT 'Greenply', 'Laminates & Boards', 'Premium plywood and MDF for furniture and cabinetry construction.', true
WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Greenply');

INSERT INTO brands (name, category, description, is_active)
SELECT 'Hafele', 'Hardware & Fittings', 'German precision hardware — hinges, channels, handles, and kitchen fittings.', true
WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Hafele');

INSERT INTO brands (name, category, description, is_active)
SELECT 'Hettich', 'Hardware & Fittings', 'Quality drawer systems, soft-close channels, and wardrobe hardware.', true
WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Hettich');

INSERT INTO brands (name, category, description, is_active)
SELECT 'Kajaria', 'Tiles & Stone', 'India''s leading tile manufacturer for floors, walls, and bathrooms.', true
WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Kajaria');

INSERT INTO brands (name, category, description, is_active)
SELECT 'Asian Paints', 'Paints & Surfaces', 'Premium interior paints, textures, and wallcovering solutions.', true
WHERE NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Asian Paints');

-- Sample Projects (initial showcase entries)
INSERT INTO projects (title, slug, description, bhk, sqft, project_type, room_types, cover_image, gallery_images, location, brands_used, is_published)
SELECT 
  '3BHK — Gachibowli',
  'gachibowli-3bhk',
  'Contemporary open-plan living with walnut accents and city views. Full-home interior with modular kitchen.',
  '3BHK',
  1850,
  'new-home',
  ARRAY['Living Room', 'Bedrooms', 'Kitchen', 'Study Room'],
  '/project-3bhk.jpg',
  ARRAY['/project-3bhk.jpg', '/project-bedroom.jpg', '/project-kitchen.jpg'],
  'Gachibowli, Hyderabad',
  ARRAY['Greenply', 'Hafele', 'Asian Paints'],
  true
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE slug = 'gachibowli-3bhk');

INSERT INTO projects (title, slug, description, bhk, sqft, project_type, room_types, cover_image, gallery_images, location, brands_used, is_published)
SELECT 
  'Kitchen Renovation — Jubilee Hills',
  'jubilee-hills-kitchen',
  'High-gloss modular kitchen with gold hardware, quartz countertops, and island seating.',
  'Kitchen',
  220,
  'renovation',
  ARRAY['Modular Kitchen'],
  '/project-kitchen.jpg',
  ARRAY['/project-kitchen.jpg', '/project-3bhk.jpg'],
  'Jubilee Hills, Hyderabad',
  ARRAY['Hettich', 'Hafele', 'Duravit'],
  true
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE slug = 'jubilee-hills-kitchen');

INSERT INTO projects (title, slug, description, bhk, sqft, project_type, room_types, cover_image, gallery_images, location, brands_used, is_published)
SELECT 
  'Master Bedroom — Banjara Hills',
  'banjara-hills-bedroom',
  'Warm walnut panelling, cove lighting, custom wardrobe, and upholstered headboard.',
  '2BHK',
  180,
  'new-home',
  ARRAY['Bedroom', 'Wardrobe'],
  '/project-bedroom.jpg',
  ARRAY['/project-bedroom.jpg', '/project-3bhk.jpg'],
  'Banjara Hills, Hyderabad',
  ARRAY['Greenply', 'Hettich', 'Asian Paints'],
  true
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE slug = 'banjara-hills-bedroom');

