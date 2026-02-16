import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "24");
  const category = searchParams.get("category");
  const pricing = searchParams.get("pricing");
  const sort = searchParams.get("sort") || "featured";
  const search = searchParams.get("search");

  const offset = (page - 1) * limit;
  const supabase = createAdminClient();

  let query = supabase
    .from("tools")
    .select("*, tool_categories!inner(category_id, is_primary, categories(name, slug))", {
      count: "exact",
    })
    .eq("status", "active");

  // Filter by category
  if (category) {
    query = query.eq("tool_categories.categories.slug", category);
  }

  // Filter by pricing model
  if (pricing) {
    query = query.eq("pricing_model", pricing);
  }

  // Text search
  if (search) {
    query = query.textSearch("name", search, { type: "websearch" });
  }

  // Sorting
  switch (sort) {
    case "rating":
      query = query.order("avg_rating", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "name":
      query = query.order("name", { ascending: true });
      break;
    case "featured":
    default:
      query = query
        .order("is_featured", { ascending: false })
        .order("avg_rating", { ascending: false });
      break;
  }

  query = query.range(offset, offset + limit - 1);

  const { data: tools, error, count } = await query;

  if (error) {
    console.error("Tools fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch tools" }, { status: 500 });
  }

  return NextResponse.json({
    tools: tools || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}
