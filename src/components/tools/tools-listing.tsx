"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ToolGrid } from "./tool-grid";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Tool } from "@/types/tool";

interface ToolsResponse {
  tools: Tool[];
  total: number;
  page: number;
  totalPages: number;
}

export function ToolsListing() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<ToolsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTools() {
      setLoading(true);
      try {
        const res = await fetch(`/api/tools?${searchParams.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        // silently fail, show empty state
      } finally {
        setLoading(false);
      }
    }
    fetchTools();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-52 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <ToolGrid tools={data.tools} />

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={data.page <= 1}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("page", String(data.page - 1));
              window.location.search = params.toString();
            }}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {data.page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={data.page >= data.totalPages}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("page", String(data.page + 1));
              window.location.search = params.toString();
            }}
          >
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
