CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE saved_tools (
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
