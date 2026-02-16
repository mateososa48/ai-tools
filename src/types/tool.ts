export type PricingModel = "free" | "freemium" | "paid" | "open_source" | "contact_sales";
export type ToolStatus = "active" | "inactive" | "deprecated";
export type Platform = "web" | "ios" | "android" | "api" | "chrome" | "desktop" | "vscode";

export interface PricingTier {
  name: string;
  price: number | null;
  interval: "month" | "year" | "one_time" | null;
  features: string[];
}

export interface Tool {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  url: string;
  logo_url: string | null;
  screenshot_url: string | null;
  pricing_model: PricingModel;
  price_starting_at: number | null;
  has_free_tier: boolean;
  has_free_trial: boolean;
  pricing_details: PricingTier[] | null;
  features: string[];
  use_cases: string[];
  platforms: Platform[];
  integrations: string[];
  avg_rating: number;
  review_count: number;
  is_verified: boolean;
  is_featured: boolean;
  status: ToolStatus;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  last_verified_at: string | null;
  categories?: Category[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  parent_id: string | null;
  display_order: number;
  tool_count: number;
}

export interface ToolCategory {
  tool_id: string;
  category_id: string;
  is_primary: boolean;
}

export interface SearchResult {
  tool: Tool;
  similarity: number;
  reason?: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
}
