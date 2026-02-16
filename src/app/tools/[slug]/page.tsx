import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ExternalLink, Star, Globe, CheckCircle2, ArrowLeft,
  DollarSign, Smartphone, Chrome, Code, Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PRICING_LABELS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { Tool, PricingTier } from "@/types/tool";
import type { Review } from "@/types/review";

interface ToolPageData extends Tool {
  reviews: Review[];
}

async function getToolBySlug(slug: string): Promise<ToolPageData | null> {
  const supabase = await createClient();

  const { data: tool, error } = await supabase
    .from("tools")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !tool) return null;

  // Get categories
  const { data: toolCategories } = await supabase
    .from("tool_categories")
    .select("categories(id, name, slug, icon, description, parent_id, display_order, tool_count)")
    .eq("tool_id", tool.id);

  // Get reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles(display_name, avatar_url)")
    .eq("tool_id", tool.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    ...tool,
    categories: toolCategories?.map((tc: Record<string, unknown>) => tc.categories).filter(Boolean) || [],
    reviews: (reviews || []).map((r: Record<string, unknown>) => ({
      ...r,
      user: r.profiles || undefined,
    })),
  } as unknown as ToolPageData;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) return { title: "Tool Not Found" };
  return {
    title: tool.meta_title || `${tool.name} — AI Tool Review & Pricing`,
    description: tool.meta_description || tool.tagline || tool.description.slice(0, 160),
  };
}

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  web: Globe,
  ios: Smartphone,
  android: Smartphone,
  chrome: Chrome,
  api: Code,
  desktop: Monitor,
  vscode: Code,
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= Math.round(rating)
              ? "fill-brand-orange text-brand-orange"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  );
}

function PricingSection({ tiers }: { tiers: PricingTier[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tiers.map((tier) => (
        <div
          key={tier.name}
          className="rounded-xl border border-border/50 bg-card p-5"
        >
          <h4 className="font-heading text-lg font-semibold">{tier.name}</h4>
          <div className="mt-2 flex items-baseline gap-1">
            {tier.price === null || tier.price === 0 ? (
              <span className="text-2xl font-bold text-brand-green">Free</span>
            ) : (
              <>
                <span className="text-2xl font-bold">${tier.price}</span>
                {tier.interval && (
                  <span className="text-sm text-muted-foreground">/{tier.interval}</span>
                )}
              </>
            )}
          </div>
          {tier.features.length > 0 && (
            <ul className="mt-4 space-y-2">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-green" />
                  {feature}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);

  if (!tool) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/tools"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to tools
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-5">
          {tool.logo_url ? (
            <img
              src={tool.logo_url}
              alt={tool.name}
              className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-md"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 font-heading text-2xl font-bold text-primary shadow-md">
              {tool.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="font-heading text-2xl font-bold sm:text-3xl">{tool.name}</h1>
            <p className="mt-1 text-lg text-muted-foreground">{tool.tagline}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Badge
                variant="secondary"
                className={
                  tool.pricing_model === "free" || tool.pricing_model === "open_source"
                    ? "bg-brand-green/10 text-brand-green"
                    : ""
                }
              >
                <DollarSign className="mr-1 h-3 w-3" />
                {PRICING_LABELS[tool.pricing_model]}
              </Badge>
              {tool.avg_rating > 0 && (
                <div className="flex items-center gap-2">
                  <StarRating rating={tool.avg_rating} />
                  <span className="text-sm font-medium">{tool.avg_rating}</span>
                  <span className="text-sm text-muted-foreground">
                    ({tool.review_count} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Button size="lg" className="shadow-md shadow-primary/25" asChild>
          <a href={tool.url} target="_blank" rel="noopener noreferrer">
            Visit Website <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>

      <Separator className="my-8" />

      {/* Main content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Description & features */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <section>
            <h2 className="font-heading text-xl font-semibold">About {tool.name}</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{tool.description}</p>
          </section>

          {/* Features */}
          {tool.features && tool.features.length > 0 && (
            <section>
              <h2 className="font-heading text-xl font-semibold">Key Features</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {tool.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Pricing tiers */}
          {tool.pricing_details && tool.pricing_details.length > 0 && (
            <section>
              <h2 className="font-heading text-xl font-semibold">Pricing Plans</h2>
              <div className="mt-4">
                <PricingSection tiers={tool.pricing_details} />
              </div>
            </section>
          )}

          {/* Use cases */}
          {tool.use_cases && tool.use_cases.length > 0 && (
            <section>
              <h2 className="font-heading text-xl font-semibold">Best For</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {tool.use_cases.map((uc) => (
                  <Badge key={uc} variant="outline" className="text-sm">
                    {uc}
                  </Badge>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Quick facts */}
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <h3 className="font-heading text-lg font-semibold">Quick Facts</h3>
            <dl className="mt-4 space-y-4 text-sm">
              {tool.price_starting_at !== null && tool.price_starting_at !== undefined && (
                <div>
                  <dt className="text-muted-foreground">Starting price</dt>
                  <dd className="mt-0.5 font-medium">
                    {tool.price_starting_at === 0
                      ? "Free"
                      : `$${tool.price_starting_at}/month`}
                  </dd>
                </div>
              )}
              {tool.has_free_tier && (
                <div>
                  <dt className="text-muted-foreground">Free tier</dt>
                  <dd className="mt-0.5 font-medium text-brand-green">Available</dd>
                </div>
              )}
              {tool.has_free_trial && (
                <div>
                  <dt className="text-muted-foreground">Free trial</dt>
                  <dd className="mt-0.5 font-medium text-brand-green">Available</dd>
                </div>
              )}
              {tool.platforms && tool.platforms.length > 0 && (
                <div>
                  <dt className="text-muted-foreground">Available on</dt>
                  <dd className="mt-1.5 flex flex-wrap gap-2">
                    {tool.platforms.map((platform) => {
                      const Icon = platformIcons[platform] || Globe;
                      return (
                        <span
                          key={platform}
                          className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize"
                        >
                          <Icon className="h-3 w-3" />
                          {platform}
                        </span>
                      );
                    })}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Categories */}
          {tool.categories && tool.categories.length > 0 && (
            <div className="rounded-2xl border border-border/50 bg-card p-6">
              <h3 className="font-heading text-lg font-semibold">Categories</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {tool.categories.map((cat) => (
                  <Link key={cat.id} href={`/categories/${cat.slug}`}>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-accent">
                      {cat.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
