import { getOpenAIClient } from "./client";
import type { SearchResult } from "@/types/tool";

interface RecommendationInput {
  id: string;
  name: string;
  tagline: string;
  description: string;
  pricing_model: string;
  price_starting_at: number | null;
  has_free_tier: boolean;
  avg_rating: number;
  features: string[];
}

interface LLMRecommendation {
  toolId: string;
  relevanceScore: number;
  reason: string;
}

const SYSTEM_PROMPT = `You are an AI tools recommendation assistant helping everyday people find the right AI tools.
Given a user's description of what they want to accomplish and a list of candidate tools, select the best matches and explain why.

Return a JSON object with:
- "recommendations": array of objects, each with:
  - "toolId": the tool's ID
  - "relevanceScore": 1-10 how well it matches the user's need
  - "reason": 1-2 sentence friendly explanation of why this tool is a great fit

Guidelines:
- Select the top 5-8 most relevant tools
- Be honest — mention limitations if relevant
- Prioritize tools with free tiers for users who seem like beginners
- Use simple, non-technical language in reasons
- Sort by relevance (best match first)

Return ONLY valid JSON, no markdown.`;

export async function getRecommendations(
  query: string,
  candidates: RecommendationInput[]
): Promise<LLMRecommendation[]> {
  const openai = getOpenAIClient();

  const candidateList = candidates
    .map(
      (t) =>
        `ID: ${t.id} | Name: ${t.name} | ${t.tagline} | Pricing: ${t.pricing_model}${t.has_free_tier ? " (free tier available)" : ""} | Rating: ${t.avg_rating}/5 | Features: ${t.features?.slice(0, 5).join(", ") || "N/A"}`
    )
    .join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `User's request: "${query}"\n\nCandidate tools:\n${candidateList}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return [];

  try {
    const parsed = JSON.parse(content);
    return parsed.recommendations || [];
  } catch {
    return [];
  }
}

export function mergeRecommendationsWithResults(
  results: SearchResult[],
  recommendations: LLMRecommendation[]
): SearchResult[] {
  const recMap = new Map(recommendations.map((r) => [r.toolId, r]));

  return results
    .map((result) => {
      const rec = recMap.get(result.tool.id);
      if (rec) {
        return { ...result, reason: rec.reason, similarity: rec.relevanceScore / 10 };
      }
      return result;
    })
    .sort((a, b) => b.similarity - a.similarity);
}
