CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE tool_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE UNIQUE,
  embedding vector(1536),
  content_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tool_embeddings_hnsw ON tool_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Semantic search function
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
