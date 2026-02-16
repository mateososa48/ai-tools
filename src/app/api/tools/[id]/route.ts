import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  // Try to find by slug first, then by UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const { data: tool, error } = await supabase
    .from("tools")
    .select("*")
    .eq(isUUID ? "id" : "slug", id)
    .eq("status", "active")
    .single();

  if (error || !tool) {
    return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  }

  // Get categories for this tool
  const { data: categories } = await supabase
    .from("tool_categories")
    .select("categories(id, name, slug, icon)")
    .eq("tool_id", tool.id);

  // Get reviews for this tool
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles(display_name, avatar_url)")
    .eq("tool_id", tool.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return NextResponse.json({
    ...tool,
    categories: categories?.map((tc) => tc.categories) || [],
    reviews: reviews || [],
  });
}
