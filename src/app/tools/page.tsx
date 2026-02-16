import { Suspense } from "react";
import type { Metadata } from "next";
import { ToolFilters } from "@/components/tools/tool-filters";
import { SearchBar } from "@/components/search/search-bar";
import { ToolsListing } from "@/components/tools/tools-listing";

export const metadata: Metadata = {
  title: "Browse AI Tools",
  description: "Explore hundreds of AI tools across every category. Filter by pricing, rating, and more.",
};

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Browse AI Tools
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Explore our collection of AI tools across every category
        </p>
      </div>

      {/* Quick search */}
      <div className="mb-6 max-w-xl">
        <SearchBar />
      </div>

      {/* Filters */}
      <Suspense fallback={null}>
        <div className="mb-8">
          <ToolFilters />
        </div>
      </Suspense>

      {/* Tool grid */}
      <Suspense
        fallback={
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        }
      >
        <ToolsListing />
      </Suspense>
    </div>
  );
}
