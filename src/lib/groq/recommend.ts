import { getGroqClient } from "./client";

interface ToolInput {
  id: string;
  name: string;
  tagline: string;
  description: string;
  pricing_model: string;
  price_starting_at: number | null;
  has_free_tier: boolean;
  avg_rating: number;
  features: string[];
  use_cases: string[];
}

export interface LLMRecommendation {
  toolId: string;
  relevanceScore: number;
  reason: string;
}

const SYSTEM_PROMPT = `You are an AI tools recommendation assistant helping everyday people find the right AI tools.
Given a user's description of what they want to accomplish and a list of available tools, select the best matches and explain why.

Return a JSON object with:
- "recommendations": array of objects, each with:
  - "toolId": the tool's ID (must match exactly)
  - "relevanceScore": 1-10 how well it matches the user's need
  - "reason": 1-2 sentence friendly explanation of why this tool is a great fit

Guidelines:
- Select the top 5-8 most relevant tools
- Only include tools that are actually relevant to the user's request
- Be honest — mention limitations if relevant
- Prioritize tools with free tiers for users who seem like beginners
- Use simple, non-technical language in reasons
- Sort by relevance (best match first)

Return ONLY valid JSON, no markdown code blocks.`;

export async function searchTools(
  query: string,
  tools: ToolInput[]
): Promise<LLMRecommendation[]> {
  const groq = getGroqClient();

  const toolList = tools
    .map(
      (t) =>
        `${t.id} | ${t.name} | ${t.tagline} | ${t.pricing_model}${t.has_free_tier ? " (free)" : ""} | ${t.avg_rating}/5 | ${t.features?.join(", ") || ""} | ${t.use_cases?.join(", ") || ""}`
    )
    .join("\n");

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `User's request: "${query}"\n\nAvailable tools:\n${toolList}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return [];

    const parsed = JSON.parse(content);
    return parsed.recommendations || [];
  } catch (err: unknown) {
    // Surface rate limit errors so the API route can handle them
    if (err && typeof err === "object" && "status" in err && (err as { status: number }).status === 429) {
      throw new Error("RATE_LIMITED");
    }
    console.error("Groq search error:", err);
    return [];
  }
}
