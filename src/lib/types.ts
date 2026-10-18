export interface Project {
  id: string
  title: string
  slug: string
  description: string
  bhk: string
  sqft: number | null
  project_type: 'new-home' | 'renovation'
  room_types: string[]
  cover_image: string
  gallery_images: string[]
  location: string | null
  brands_used: string[]
  seo_title: string | null
  seo_description: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Brand {
  id: string
  name: string
  category: string
  description: string
  logo_url: string | null
  is_active: boolean
  created_at: string
}

export interface Lead {
  id: string
  name: string
  phone: string
  email: string
  pin_code: string
  bhk: string | null
  sqft: number | null
  project_type: string | null
  room_types: string[] | null
  budget_range: string | null
  estimate_low: number | null
  estimate_high: number | null
  status: 'new' | 'contacted' | 'qualified' | 'won' | 'lost'
  source: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PricingRuleDB {
  id: string
  name: string
  bhk: string
  project_type: string
  rate_per_sqft: number
  is_active: boolean
  updated_at: string
}
