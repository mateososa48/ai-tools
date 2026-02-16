import Link from "next/link";
import {
  PenTool, Image, Video, Code, Megaphone, Briefcase,
  GraduationCap, BarChart3, Headphones, Target, Users, Scale,
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  PenTool, Image, Video, Code, Megaphone, Briefcase,
  GraduationCap, BarChart3, Headphones, Target, Users, Scale,
};

const colorClasses = [
  "bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/15",
  "bg-brand-pink/10 text-brand-pink hover:bg-brand-pink/15",
  "bg-brand-green/10 text-brand-green hover:bg-brand-green/15",
  "bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/15",
  "bg-purple-100 text-purple-600 hover:bg-purple-200/60",
  "bg-rose-100 text-rose-600 hover:bg-rose-200/60",
  "bg-cyan-100 text-cyan-600 hover:bg-cyan-200/60",
  "bg-amber-100 text-amber-600 hover:bg-amber-200/60",
  "bg-indigo-100 text-indigo-600 hover:bg-indigo-200/60",
  "bg-emerald-100 text-emerald-600 hover:bg-emerald-200/60",
  "bg-fuchsia-100 text-fuchsia-600 hover:bg-fuchsia-200/60",
  "bg-teal-100 text-teal-600 hover:bg-teal-200/60",
];

export function CategoryShowcase() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Browse by category
        </h2>
        <p className="mt-3 text-lg text-muted-foreground">
          Explore AI tools organized by what they do
        </p>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {CATEGORIES.map((category, i) => {
          const Icon = iconMap[category.icon] || Briefcase;
          return (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className={`group flex flex-col items-center rounded-2xl border border-transparent p-6 text-center transition-all duration-200 hover:border-border/40 hover:shadow-lg ${colorClasses[i % colorClasses.length]}`}
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/60 shadow-sm">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{category.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{category.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
