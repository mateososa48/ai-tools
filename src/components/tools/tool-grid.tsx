import { ToolCard } from "./tool-card";
import type { Tool } from "@/types/tool";

interface ToolGridProps {
  tools: Tool[];
  reasons?: Record<string, string>;
}

export function ToolGrid({ tools, reasons }: ToolGridProps) {
  if (tools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-4xl">🔍</div>
        <h3 className="mt-4 font-heading text-xl font-semibold">No tools found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard
          key={tool.id}
          tool={tool}
          reason={reasons?.[tool.id]}
        />
      ))}
    </div>
  );
}
