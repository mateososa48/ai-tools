import Link from "next/link";
import { Star, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PRICING_LABELS } from "@/lib/constants";
import type { Tool } from "@/types/tool";

interface ToolCardProps {
  tool: Tool;
  reason?: string;
}

const pricingStyles: Record<string, string> = {
  free: "bg-brand-green/10 text-brand-green border-brand-green/20",
  freemium: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
  paid: "bg-brand-orange/10 text-brand-orange border-brand-orange/20",
  open_source: "bg-brand-green/10 text-brand-green border-brand-green/20",
  contact_sales: "bg-muted text-muted-foreground border-border",
};

export function ToolCard({ tool, reason }: ToolCardProps) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
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
            <h3 className="font-heading text-lg font-semibold group-hover:text-primary transition-colors">
              {tool.name}
            </h3>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {tool.tagline || tool.description}
          </p>
        </div>
      </div>

      {reason && (
        <div className="mt-3 rounded-lg bg-primary/5 px-3 py-2 text-sm text-primary">
          {reason}
        </div>
      )}

      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              pricingStyles[tool.pricing_model] || pricingStyles.paid
            }`}
          >
            {PRICING_LABELS[tool.pricing_model] || tool.pricing_model}
          </span>
          {tool.avg_rating > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" />
              <span className="font-medium">{tool.avg_rating}</span>
              {tool.review_count > 0 && (
                <span className="text-muted-foreground">({tool.review_count})</span>
              )}
            </div>
          )}
        </div>

        {tool.categories && tool.categories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tool.categories.slice(0, 3).map((cat) => (
              <Badge key={cat.id} variant="secondary" className="text-xs font-normal">
                {cat.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
