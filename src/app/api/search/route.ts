import { NextRequest, NextResponse } from "next/server";
import { searchTools } from "@/lib/groq/recommend";
import { SEED_TOOLS } from "@/lib/seed-data";
import type { Tool } from "@/types/tool";

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Send all seed tools to Groq LLM — it picks the best matches
    const recommendations = await searchTools(
      query.trim(),
      SEED_TOOLS.map((t) => ({
        id: t.id,
        name: t.name,
        tagline: t.tagline,
        description: t.description,
        pricing_model: t.pricing_model,
        price_starting_at: t.price_starting_at,
        has_free_tier: t.has_free_tier,
        avg_rating: t.avg_rating,
        features: t.features,
        use_cases: t.use_cases,
      }))
    );

    // Match by ID first, fall back to name matching (LLMs sometimes use names)
    const toolById = new Map(SEED_TOOLS.map((t) => [t.id, t]));
    const toolByName = new Map(SEED_TOOLS.map((t) => [t.name.toLowerCase(), t]));
    const toolBySlug = new Map(SEED_TOOLS.map((t) => [t.slug, t]));

    const results = recommendations
      .map((rec) => {
        const id = String(rec.toolId);
        const tool =
          toolById.get(id) ||
          toolByName.get(id.toLowerCase()) ||
          toolBySlug.get(id.toLowerCase());
        if (!tool) {
          console.log(`Could not match toolId: "${rec.toolId}"`);
          return null;
        }
        return {
          tool: tool as unknown as Tool,
          similarity: rec.relevanceScore / 10,
          reason: rec.reason,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      query,
      results,
      total: results.length,
    });
  } catch (err) {
    console.error("Search API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
