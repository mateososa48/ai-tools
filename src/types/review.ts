export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type UsageDuration = "less_than_month" | "1_3_months" | "3_6_months" | "6_12_months" | "over_year";

export interface Review {
  id: string;
  tool_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string;
  pros: string[];
  cons: string[];
  use_case: string | null;
  experience_level: ExperienceLevel | null;
  usage_duration: UsageDuration | null;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  user?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}
