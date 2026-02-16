import Link from "next/link";
import { ArrowRight, Star, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PRICING_LABELS } from "@/lib/constants";

// Static featured tools for MVP (before Supabase is connected)
const FEATURED_TOOLS = [
  {
    slug: "chatgpt",
    name: "ChatGPT",
    tagline: "AI assistant for writing, analysis, coding, and more",
    pricing_model: "freemium",
    avg_rating: 4.7,
    review_count: 1250,
    categories: ["Writing & Content", "Coding & Development"],
    logo_emoji: "🤖",
  },
  {
    slug: "midjourney",
    name: "Midjourney",
    tagline: "Create stunning images from text descriptions",
    pricing_model: "paid",
    avg_rating: 4.6,
    review_count: 890,
    categories: ["Image & Design"],
    logo_emoji: "🎨",
  },
  {
    slug: "notion-ai",
    name: "Notion AI",
    tagline: "AI-powered writing and organization in your workspace",
    pricing_model: "freemium",
    avg_rating: 4.5,
    review_count: 720,
    categories: ["Business & Productivity", "Writing & Content"],
    logo_emoji: "📝",
  },
  {
    slug: "cursor",
    name: "Cursor",
    tagline: "AI-first code editor that helps you build software faster",
    pricing_model: "freemium",
    avg_rating: 4.8,
    review_count: 540,
    categories: ["Coding & Development"],
    logo_emoji: "⌨️",
  },
  {
    slug: "canva-ai",
    name: "Canva AI",
    tagline: "Design anything with AI-powered tools built into Canva",
    pricing_model: "freemium",
    avg_rating: 4.5,
    review_count: 980,
    categories: ["Image & Design", "Marketing"],
    logo_emoji: "🖼️",
  },
  {
    slug: "grammarly",
    name: "Grammarly",
    tagline: "AI writing assistant for grammar, tone, and clarity",
    pricing_model: "freemium",
    avg_rating: 4.6,
    review_count: 1100,
    categories: ["Writing & Content"],
    logo_emoji: "✍️",
  },
];

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

export function FeaturedTools() {
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
          {FEATURED_TOOLS.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
                  {tool.logo_emoji}
                </div>
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
