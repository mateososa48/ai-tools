"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { SearchBar } from "./search-bar";
import { ToolCard } from "@/components/tools/tool-card";
import type { SearchResponse } from "@/types/tool";

export function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;

    async function performSearch() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        if (!res.ok) throw new Error("Search failed");

        const data: SearchResponse = await res.json();
        setResults(data);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [query]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Search bar */}
      <div className="mb-8">
        <SearchBar initialQuery={query} />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex items-center gap-3 text-primary">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="font-heading text-lg font-medium">Finding the best tools for you...</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Our AI is analyzing hundreds of tools to find your perfect match
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-destructive">{error}</p>
        </div>
      )}

      {/* Results */}
      {!loading && results && (
        <>
          <div className="mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-xl font-semibold">
              {results.total > 0
                ? `Found ${results.total} tools for "${results.query}"`
                : `No tools found for "${results.query}"`}
            </h2>
          </div>

          {results.results.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {results.results.map((result) => (
                <ToolCard
                  key={result.tool.id}
                  tool={result.tool}
                  reason={result.reason}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="text-4xl">🤔</div>
              <h3 className="mt-4 font-heading text-xl font-semibold">No matches found</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Try describing what you want to accomplish differently, or browse our categories to discover tools.
              </p>
            </div>
          )}
        </>
      )}

      {/* Empty state (no query) */}
      {!query && !loading && (
        <div className="flex flex-col items-center py-16 text-center">
          <Sparkles className="h-10 w-10 text-primary/40" />
          <h3 className="mt-4 font-heading text-xl font-semibold">
            Describe what you need
          </h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Tell us what you want to accomplish in plain English, and our AI will find the best tools for you.
          </p>
        </div>
      )}
    </div>
  );
}
