import Link from "next/link";
import { ArrowRight, Star, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PRICING_LABELS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

function PricingBadge({ model }: { model: string }) {
  const variants: Record<string, string> = {
    free: "bg-brand-green/10 text-brand-green border-brand-green/20",
    freemium: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
    paid: "bg-brand-orange/10 text-brand-orange border-brand-orange/20",
    open_source: "bg-brand-green/10 text-brand-green border-brand-green/20",
  };
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${variants[model] || variants.paid}`}>
      {PRICING_LABELS[model] || model}
    </span>
  );
}

interface FeaturedTool {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  pricing_model: string;
  avg_rating: number;
  review_count: number;
  logo_url: string | null;
  categories: string[];
}

async function getFeaturedTools(): Promise<FeaturedTool[]> {
  const supabase = await createClient();

  const { data: tools } = await supabase
    .from("tools")
    .select("id, slug, name, tagline, pricing_model, avg_rating, review_count, logo_url")
    .eq("status", "active")
    .eq("is_featured", true)
    .order("avg_rating", { ascending: false })
    .limit(6);

  if (!tools || tools.length === 0) return [];

  // Fetch categories for featured tools
  const toolIds = tools.map((t) => t.id);
  const { data: toolCats } = await supabase
    .from("tool_categories")
    .select("tool_id, categories(name)")
    .in("tool_id", toolIds);

  const catMap = new Map<string, string[]>();
  for (const tc of toolCats || []) {
    const existing = catMap.get(tc.tool_id as string) || [];
    if (tc.categories) existing.push((tc.categories as unknown as { name: string }).name);
    catMap.set(tc.tool_id as string, existing);
  }

  return tools.map((t) => ({
    ...t,
    categories: catMap.get(t.id) || [],
  }));
}

export async function FeaturedTools() {
  const featuredTools = await getFeaturedTools();

  if (featuredTools.length === 0) return null;

  return (
    <section className="border-t border-border/40 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Popular tools
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Loved by thousands of users
            </p>
          </div>
          <Link
            href="/tools"
            className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:flex"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredTools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-start gap-4">
                {tool.logo_url ? (
                  <img
                    src={tool.logo_url}
                    alt={tool.name}
                    className="h-12 w-12 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 font-heading text-lg font-bold text-primary">
                    {tool.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-lg font-semibold group-hover:text-primary">
                      {tool.name}
                    </h3>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {tool.tagline}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <PricingBadge model={tool.pricing_model} />
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" />
                    <span className="font-medium">{tool.avg_rating}</span>
                    <span className="text-muted-foreground">({tool.review_count})</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {tool.categories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-xs font-normal">
                    {cat}
                  </Badge>
                ))}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/tools"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary"
          >
            View all tools <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
