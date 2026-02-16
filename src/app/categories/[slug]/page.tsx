import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { SEED_TOOLS } from "@/lib/seed-data";
import { ToolGrid } from "@/components/tools/tool-grid";
import type { Tool } from "@/types/tool";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) return { title: "Category Not Found" };
  return {
    title: `${category.name} AI Tools`,
    description: `Discover the best AI tools for ${category.description?.toLowerCase()}. Compare pricing, features, and reviews.`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);

  if (!category) notFound();

  // MVP: Filter seed data by category
  const tools = SEED_TOOLS.filter((t) =>
    t.categories?.some((c) => c.slug === slug)
  ) as unknown as Tool[];

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
          {category.name}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">{category.description}</p>
      </div>

      <ToolGrid tools={tools} />
    </div>
  );
}
