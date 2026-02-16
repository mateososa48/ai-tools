import { createClient } from "@supabase/supabase-js";
import { SEED_TOOLS } from "../src/lib/seed-data";
import { CATEGORIES } from "../src/lib/constants";
import * as fs from "fs";
import * as path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  console.error("Make sure your .env.local file has these values set.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedCategories(): Promise<Map<string, string>> {
  console.log("Seeding categories...");
  const slugToId = new Map<string, string>();

  for (const [i, cat] of CATEGORIES.entries()) {
    const { data, error } = await supabase
      .from("categories")
      .upsert(
        {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          icon: cat.icon,
          parent_id: null,
          display_order: i,
          tool_count: 0,
        },
        { onConflict: "slug" }
      )
      .select("id, slug")
      .single();

    if (error) {
      console.error(`Failed to insert category "${cat.name}":`, error.message);
      continue;
    }
    slugToId.set(data.slug, data.id);
    console.log(`  + ${cat.name} (${data.id})`);
  }

  console.log(`Seeded ${slugToId.size} categories.\n`);
  return slugToId;
}

interface ToolData {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  url: string;
  logo_url?: string | null;
  screenshot_url?: string | null;
  pricing_model: string;
  price_starting_at?: number | null;
  has_free_tier: boolean;
  has_free_trial: boolean;
  pricing_details?: unknown;
  features: string[];
  use_cases: string[];
  platforms: string[];
  integrations: string[];
  avg_rating: number;
  review_count: number;
  is_verified: boolean;
  is_featured: boolean;
  status: string;
  meta_title?: string | null;
  meta_description?: string | null;
  categories?: { slug: string }[];
  category_slugs?: string[];
}

async function seedTools(
  tools: ToolData[],
  categoryMap: Map<string, string>
): Promise<void> {
  console.log(`Seeding ${tools.length} tools...`);
  let inserted = 0;
  let skipped = 0;

  for (const tool of tools) {
    // Extract category info before inserting the tool
    const categorySlugs =
      tool.category_slugs ||
      tool.categories?.map((c) => c.slug) ||
      [];

    // Strip fields that don't belong in the tools table
    const {
      categories: _cats,
      category_slugs: _slugs,
      ...toolFields
    } = tool as ToolData & { categories?: unknown; category_slugs?: unknown };

    // Remove the old string id if present
    const { id: _id, ...cleanFields } = toolFields as typeof toolFields & { id?: string };

    const { data, error } = await supabase
      .from("tools")
      .upsert(cleanFields, { onConflict: "slug" })
      .select("id, slug")
      .single();

    if (error) {
      console.error(`  Failed to insert tool "${tool.name}":`, error.message);
      skipped++;
      continue;
    }

    // Insert tool_categories junction entries
    for (const [i, catSlug] of categorySlugs.entries()) {
      const categoryId = categoryMap.get(catSlug);
      if (!categoryId) {
        console.warn(`  Warning: Category "${catSlug}" not found for tool "${tool.name}"`);
        continue;
      }

      const { error: junctionError } = await supabase
        .from("tool_categories")
        .upsert(
          {
            tool_id: data.id,
            category_id: categoryId,
            is_primary: i === 0,
          },
          { onConflict: "tool_id,category_id" }
        );

      if (junctionError) {
        console.warn(`  Warning: Failed to link "${tool.name}" to category "${catSlug}":`, junctionError.message);
      }
    }

    inserted++;
    console.log(`  + ${tool.name}`);
  }

  console.log(`\nSeeded ${inserted} tools (${skipped} skipped).\n`);
}

async function updateCategoryCounts(categoryMap: Map<string, string>): Promise<void> {
  console.log("Updating category tool counts...");

  for (const [slug, id] of categoryMap) {
    const { count, error } = await supabase
      .from("tool_categories")
      .select("*", { count: "exact", head: true })
      .eq("category_id", id);

    if (error) {
      console.warn(`  Warning: Could not count tools for category "${slug}"`);
      continue;
    }

    await supabase
      .from("categories")
      .update({ tool_count: count || 0 })
      .eq("id", id);
  }

  console.log("Category counts updated.\n");
}

async function main() {
  console.log("=== Sift Database Seeder ===\n");

  // 1. Seed categories
  const categoryMap = await seedCategories();

  // 2. Seed the original 20 tools from seed data
  await seedTools(SEED_TOOLS as unknown as ToolData[], categoryMap);

  // 3. Check for generated tools file and seed those too
  const generatedPath = path.join(__dirname, "data", "generated-tools.json");
  if (fs.existsSync(generatedPath)) {
    console.log("Found generated tools file, seeding additional tools...\n");
    const generatedTools: ToolData[] = JSON.parse(
      fs.readFileSync(generatedPath, "utf-8")
    );
    await seedTools(generatedTools, categoryMap);
  }

  // 4. Update category tool counts
  await updateCategoryCounts(categoryMap);

  console.log("=== Seeding complete! ===");
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
