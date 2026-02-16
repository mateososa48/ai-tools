"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import { SEARCH_PLACEHOLDERS } from "@/lib/constants";

interface SearchBarProps {
  size?: "default" | "large";
  initialQuery?: string;
}

export function SearchBar({ size = "default", initialQuery = "" }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayPlaceholder, setDisplayPlaceholder] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const router = useRouter();

  // Rotating placeholder animation
  useEffect(() => {
    const currentPlaceholder = SEARCH_PLACEHOLDERS[placeholderIndex];
    let charIndex = 0;
    let timeout: NodeJS.Timeout;

    if (isTyping) {
      timeout = setInterval(() => {
        if (charIndex <= currentPlaceholder.length) {
          setDisplayPlaceholder(currentPlaceholder.slice(0, charIndex));
          charIndex++;
        } else {
          setIsTyping(false);
          clearInterval(timeout);
        }
      }, 50);
    } else {
      timeout = setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
        setIsTyping(true);
        setDisplayPlaceholder("");
      }, 2000);
    }

    return () => {
      clearInterval(timeout);
      clearTimeout(timeout);
    };
  }, [placeholderIndex, isTyping]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    },
    [query, router]
  );

  const isLarge = size === "large";

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`group relative flex items-center rounded-2xl border-2 border-border/60 bg-card shadow-lg transition-all duration-300 hover:border-primary/30 hover:shadow-xl focus-within:border-primary/50 focus-within:shadow-xl focus-within:shadow-primary/10 ${
          isLarge ? "px-5 py-4" : "px-4 py-3"
        }`}
      >
        <Sparkles
          className={`shrink-0 text-primary/60 transition-colors group-focus-within:text-primary ${
            isLarge ? "h-6 w-6" : "h-5 w-5"
          }`}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={displayPlaceholder}
          className={`flex-1 bg-transparent px-3 outline-none placeholder:text-muted-foreground/50 ${
            isLarge ? "text-lg" : "text-base"
          }`}
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className={`shrink-0 rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25 transition-all hover:bg-primary/90 disabled:opacity-40 disabled:shadow-none ${
            isLarge ? "px-5 py-2.5 text-sm font-medium" : "p-2"
          }`}
        >
          {isLarge ? (
            <span className="flex items-center gap-2">
              Find Tools <ArrowRight className="h-4 w-4" />
            </span>
          ) : (
            <Search className="h-4 w-4" />
          )}
        </button>
      </div>
    </form>
  );
}
