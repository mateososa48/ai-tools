CREATE TABLE reviews (
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

CREATE INDEX idx_reviews_tool ON reviews(tool_id);
CREATE INDEX idx_reviews_rating ON reviews(tool_id, rating);
