import type { Metadata } from "next";
import Link from "next/link";
import {
  PenTool, Image, Video, Code, Megaphone, Briefcase,
  GraduationCap, BarChart3, Headphones, Target, Users, Scale, ArrowRight,
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Tool Categories",
  description: "Browse AI tools by category. Find the best AI tools for writing, design, coding, marketing, and more.",
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  PenTool, Image, Video, Code, Megaphone, Briefcase,
  GraduationCap, BarChart3, Headphones, Target, Users, Scale,
};

const colorClasses = [
  "from-brand-blue/10 to-brand-blue/5 hover:from-brand-blue/15 hover:to-brand-blue/10",
  "from-brand-pink/10 to-brand-pink/5 hover:from-brand-pink/15 hover:to-brand-pink/10",
  "from-brand-green/10 to-brand-green/5 hover:from-brand-green/15 hover:to-brand-green/10",
  "from-brand-orange/10 to-brand-orange/5 hover:from-brand-orange/15 hover:to-brand-orange/10",
  "from-purple-100 to-purple-50 hover:from-purple-200/60 hover:to-purple-100",
  "from-rose-100 to-rose-50 hover:from-rose-200/60 hover:to-rose-100",
  "from-cyan-100 to-cyan-50 hover:from-cyan-200/60 hover:to-cyan-100",
  "from-amber-100 to-amber-50 hover:from-amber-200/60 hover:to-amber-100",
  "from-indigo-100 to-indigo-50 hover:from-indigo-200/60 hover:to-indigo-100",
  "from-emerald-100 to-emerald-50 hover:from-emerald-200/60 hover:to-emerald-100",
  "from-fuchsia-100 to-fuchsia-50 hover:from-fuchsia-200/60 hover:to-fuchsia-100",
  "from-teal-100 to-teal-50 hover:from-teal-200/60 hover:to-teal-100",
];

const iconColors = [
  "text-brand-blue", "text-brand-pink", "text-brand-green", "text-brand-orange",
  "text-purple-600", "text-rose-600", "text-cyan-600", "text-amber-600",
  "text-indigo-600", "text-emerald-600", "text-fuchsia-600", "text-teal-600",
];

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Browse by Category
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Explore AI tools organized by what they help you accomplish
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category, i) => {
          const Icon = iconMap[category.icon] || Briefcase;
          return (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className={`group flex items-start gap-5 rounded-2xl bg-gradient-to-br p-6 transition-all duration-200 hover:shadow-lg ${colorClasses[i % colorClasses.length]}`}
            >
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/70 shadow-sm ${iconColors[i % iconColors.length]}`}>
                <Icon className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-lg font-semibold text-foreground">
                    {category.name}
                  </h2>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
