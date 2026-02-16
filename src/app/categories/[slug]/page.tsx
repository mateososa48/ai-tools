import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { ToolGrid } from "@/components/tools/tool-grid";
import type { Tool, Category } from "@/types/tool";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) return { title: "Category Not Found" };
  return {
    title: `${category.name} Tools`,
    description: `Discover the best AI tools for ${category.description?.toLowerCase()}. Compare pricing, features, and reviews.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // Get the category from the database
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  // Fall back to constants if not in DB yet
  const fallbackCategory = CATEGORIES.find((c) => c.slug === slug);
  if (!category && !fallbackCategory) notFound();

  const displayCategory = category || fallbackCategory!;

  // Get tools in this category via junction table
  let tools: Tool[] = [];

  if (category) {
    const { data: toolCategories } = await supabase
      .from("tool_categories")
      .select("tool_id, tools(*)")
      .eq("category_id", category.id);

    const rawTools = (toolCategories || [])
      .map((tc: Record<string, unknown>) => tc.tools)
      .filter(Boolean) as Tool[];

    // Attach categories to each tool for ToolCard display
    if (rawTools.length > 0) {
      const toolIds = rawTools.map((t) => t.id);
      const { data: allToolCats } = await supabase
        .from("tool_categories")
        .select("tool_id, categories(id, name, slug, icon, description, parent_id, display_order, tool_count)")
        .in("tool_id", toolIds);

      const catsByTool = new Map<string, Category[]>();
      for (const tc of allToolCats || []) {
        const existing = catsByTool.get(tc.tool_id as string) || [];
        if (tc.categories) existing.push(tc.categories as unknown as Category);
        catsByTool.set(tc.tool_id as string, existing);
      }

      tools = rawTools.map((t) => ({
        ...t,
        categories: catsByTool.get(t.id) || [],
      }));
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/categories"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All categories
      </Link>

      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          {displayCategory.name}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">{displayCategory.description}</p>
      </div>

      <ToolGrid tools={tools} />
    </div>
  );
}
