CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  logo_url TEXT,
  screenshot_url TEXT,
  pricing_model TEXT CHECK (pricing_model IN ('free', 'freemium', 'paid', 'open_source', 'contact_sales')),
  price_starting_at DECIMAL(10,2),
  has_free_tier BOOLEAN DEFAULT false,
  has_free_trial BOOLEAN DEFAULT false,
  pricing_details JSONB,
  features JSONB DEFAULT '[]'::jsonb,
  use_cases JSONB DEFAULT '[]'::jsonb,
  platforms JSONB DEFAULT '[]'::jsonb,
  integrations JSONB DEFAULT '[]'::jsonb,
  avg_rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated')),
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_verified_at TIMESTAMPTZ
);

CREATE INDEX idx_tools_slug ON tools(slug);
CREATE INDEX idx_tools_pricing ON tools(pricing_model);
CREATE INDEX idx_tools_rating ON tools(avg_rating DESC);
CREATE INDEX idx_tools_featured ON tools(is_featured) WHERE is_featured = true;
CREATE INDEX idx_tools_status ON tools(status);
CREATE INDEX idx_tools_search ON tools
  USING GIN (to_tsvector('english', name || ' ' || COALESCE(tagline, '') || ' ' || description));
