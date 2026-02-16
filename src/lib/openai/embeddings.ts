import { getOpenAIClient } from "./client";
import type { Tool } from "@/types/tool";

export function buildToolEmbeddingText(tool: Pick<Tool, "name" | "tagline" | "description" | "features" | "use_cases"> & { categories?: { name: string }[] }): string {
  return [
    tool.name,
    tool.tagline,
    tool.description,
    tool.features?.length ? `Features: ${tool.features.join(", ")}` : null,
    tool.use_cases?.length ? `Use cases: ${tool.use_cases.join(", ")}` : null,
    tool.categories?.length ? `Categories: ${tool.categories.map((c) => c.name).join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAIClient();
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const openai = getOpenAIClient();
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });
  return response.data.map((d) => d.embedding);
}
