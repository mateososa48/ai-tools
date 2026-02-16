import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchResults } from "@/components/search/search-results";

export const metadata: Metadata = {
  title: "Search AI Tools",
  description: "Describe what you want to accomplish and find the perfect AI tool for your needs.",
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
