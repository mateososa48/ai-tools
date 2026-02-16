-- ============================================
-- Sift Database Schema - All Migrations
-- Run this entire file in the Supabase SQL Editor
-- Dashboard > SQL Editor > New query > Paste > Run
-- ============================================

-- 001: Create tools table
CREATE TABLE IF NOT EXISTS tools (
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

CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);
CREATE INDEX IF NOT EXISTS idx_tools_pricing ON tools(pricing_model);
CREATE INDEX IF NOT EXISTS idx_tools_rating ON tools(avg_rating DESC);
CREATE INDEX IF NOT EXISTS idx_tools_featured ON tools(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_tools_status ON tools(status);
CREATE INDEX IF NOT EXISTS idx_tools_search ON tools
  USING GIN (to_tsvector('english', name || ' ' || COALESCE(tagline, '') || ' ' || description));

-- 002: Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT NOT NULL,
  pros TEXT[],
  cons TEXT[],
  use_case TEXT,
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  usage_duration TEXT CHECK (usage_duration IN ('less_than_month', '1_3_months', '3_6_months', '6_12_months', 'over_year')),
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tool_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_tool ON reviews(tool_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(tool_id, rating);

-- 003: Create categories and tool_categories tables
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES categories(id),
  display_order INTEGER DEFAULT 0,
  tool_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tool_categories (
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  PRIMARY KEY (tool_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_tool_categories_category ON tool_categories(category_id);

-- 004: Enable pgvector for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS tool_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE UNIQUE,
  embedding vector(1536),
  content_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tool_embeddings_hnsw ON tool_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE OR REPLACE FUNCTION match_tools(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  tagline TEXT,
  description TEXT,
  url TEXT,
  logo_url TEXT,
  pricing_model TEXT,
  price_starting_at DECIMAL,
  has_free_tier BOOLEAN,
  has_free_trial BOOLEAN,
  features JSONB,
  use_cases JSONB,
  platforms JSONB,
  avg_rating DECIMAL,
  review_count INTEGER,
  is_featured BOOLEAN,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id, t.name, t.slug, t.tagline, t.description, t.url,
    t.logo_url, t.pricing_model, t.price_starting_at,
    t.has_free_tier, t.has_free_trial, t.features, t.use_cases,
    t.platforms, t.avg_rating, t.review_count, t.is_featured,
    1 - (te.embedding <=> query_embedding) AS similarity
  FROM tool_embeddings te
  JOIN tools t ON t.id = te.tool_id
  WHERE t.status = 'active'
    AND 1 - (te.embedding <=> query_embedding) > match_threshold
  ORDER BY te.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 005: Create profiles, saved_tools, and RLS policies
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS saved_tools (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, tool_id)
);

-- Row Level Security
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_embeddings ENABLE ROW LEVEL SECURITY;

-- Tools: public read
CREATE POLICY "Tools are viewable by everyone" ON tools FOR SELECT USING (true);

-- Categories: public read
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Tool categories are viewable by everyone" ON tool_categories FOR SELECT USING (true);

-- Reviews: public read, authenticated write
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert their own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- Profiles: public read, own write
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Saved tools: own only
CREATE POLICY "Users can view own saved tools" ON saved_tools FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save tools" ON saved_tools FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave tools" ON saved_tools FOR DELETE USING (auth.uid() = user_id);

-- Embeddings: public read (needed for search)
CREATE POLICY "Embeddings are viewable by everyone" ON tool_embeddings FOR SELECT USING (true);

-- 006: Category tool_count auto-update trigger
CREATE OR REPLACE FUNCTION update_category_tool_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE categories SET tool_count = tool_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories SET tool_count = tool_count - 1 WHERE id = OLD.category_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tool_category_count
AFTER INSERT OR DELETE ON tool_categories
FOR EACH ROW EXECUTE FUNCTION update_category_tool_count();
