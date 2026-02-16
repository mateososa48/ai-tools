import { NextRequest, NextResponse } from "next/server";
import { searchTools } from "@/lib/groq/recommend";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Tool, Category } from "@/types/tool";

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const trimmedQuery = query.trim();

    // Extract keywords for pre-filtering (split on spaces, take meaningful words)
    const keywords = trimmedQuery
      .toLowerCase()
      .split(/\s+/)
      .filter((w: string) => w.length > 2);

    // Pre-filter: use text search to narrow down to ~30-40 relevant tools
    // This dramatically reduces the tokens sent to the LLM
    const selectFields = "id, name, slug, tagline, description, pricing_model, price_starting_at, has_free_tier, avg_rating, features, use_cases";

    let tools: { id: string; name: string; slug: string; tagline: string; description: string; pricing_model: string; price_starting_at: number | null; has_free_tier: boolean; avg_rating: number; features: unknown; use_cases: unknown }[] = [];

    if (keywords.length > 0) {
      const orConditions = keywords
        .flatMap((kw: string) => [
          `name.ilike.%${kw}%`,
          `tagline.ilike.%${kw}%`,
          `description.ilike.%${kw}%`,
        ])
        .join(",");

      const { data } = await supabase
        .from("tools")
        .select(selectFields)
        .eq("status", "active")
        .or(orConditions)
        .limit(40);

      tools = (data as typeof tools) || [];
    }

    // If pre-filter returned too few results (<8), fall back to all tools
    if (tools.length < 8) {
      const { data, error } = await supabase
        .from("tools")
        .select(selectFields)
        .eq("status", "active");

      if (error || !data || data.length === 0) {
        return NextResponse.json({ error: "No tools available" }, { status: 500 });
      }
      tools = data as typeof tools;
    }

    // Send tools to Groq LLM — it picks the best matches
    const recommendations = await searchTools(
      trimmedQuery,
      tools.map((t) => ({
        id: t.id,
        name: t.name,
        tagline: t.tagline,
        description: "", // omit description to save tokens — tagline is enough
        pricing_model: t.pricing_model,
        price_starting_at: t.price_starting_at,
        has_free_tier: t.has_free_tier,
        avg_rating: t.avg_rating,
        features: (t.features as string[] || []).slice(0, 3),
        use_cases: (t.use_cases as string[] || []).slice(0, 2),
      }))
    );

    // Build lookup maps for matching LLM results back to tools
    const toolById = new Map(tools.map((t) => [t.id, t]));
    const toolByName = new Map(tools.map((t) => [t.name.toLowerCase(), t]));
    const toolBySlug = new Map(tools.map((t) => [t.slug, t]));

    // Resolve which tools the LLM recommended
    const matchedIds: string[] = [];
    const recMap = new Map<string, { similarity: number; reason: string }>();

    for (const rec of recommendations) {
      const id = String(rec.toolId);
      const match =
        toolById.get(id) ||
        toolByName.get(id.toLowerCase()) ||
        toolBySlug.get(id.toLowerCase());

      if (!match) {
        console.log(`Could not match toolId: "${rec.toolId}"`);
        continue;
      }

      matchedIds.push(match.id);
      recMap.set(match.id, {
        similarity: rec.relevanceScore / 10,
        reason: rec.reason,
      });
    }

    if (matchedIds.length === 0) {
      return NextResponse.json({ query, results: [], total: 0 });
    }

    // Fetch full tool data for matched tools
    const { data: fullTools } = await supabase
      .from("tools")
      .select("*")
      .in("id", matchedIds);

    // Fetch categories for matched tools
    const { data: toolCats } = await supabase
      .from("tool_categories")
      .select("tool_id, categories(id, name, slug, icon, description, parent_id, display_order, tool_count)")
      .in("tool_id", matchedIds);

    const catMap = new Map<string, Category[]>();
    for (const tc of toolCats || []) {
      const existing = catMap.get(tc.tool_id as string) || [];
      if (tc.categories) existing.push(tc.categories as unknown as Category);
      catMap.set(tc.tool_id as string, existing);
    }

    // Build results in the order the LLM ranked them
    const fullToolMap = new Map((fullTools || []).map((t) => [t.id, t]));
    const results = matchedIds
      .map((id) => {
        const tool = fullToolMap.get(id);
        const rec = recMap.get(id);
        if (!tool || !rec) return null;
        return {
          tool: { ...tool, categories: catMap.get(id) || [] } as unknown as Tool,
          similarity: rec.similarity,
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
    if (err instanceof Error && err.message === "RATE_LIMITED") {
      return NextResponse.json(
        { error: "Our AI search is temporarily at capacity. Please try again in a few minutes." },
        { status: 429 }
      );
    }
    console.error("Search API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
