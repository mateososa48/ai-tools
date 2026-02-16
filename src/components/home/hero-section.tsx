import { SearchBar } from "@/components/search/search-bar";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      <div className="mx-auto max-w-4xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pb-24 sm:pt-28 lg:px-8">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          AI-powered recommendations
        </div>

        {/* Heading */}
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Find the perfect{" "}
          <span className="bg-gradient-to-r from-primary via-brand-blue to-brand-green bg-clip-text text-transparent">
            AI tool
          </span>{" "}
          for anything you need
        </h1>

        {/* Subheading */}
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Describe what you want to do in plain English. We&apos;ll match you with the best AI tools
          — with honest pricing breakdowns and real user reviews.
        </p>

        {/* Search bar */}
        <div className="mx-auto mt-10 max-w-2xl">
          <SearchBar size="large" />
        </div>

        {/* Social proof */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-foreground">500+</span> AI tools
          </span>
          <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/40 sm:block" />
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-foreground">12</span> categories
          </span>
          <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/40 sm:block" />
          <span className="flex items-center gap-1.5">
            <span className="font-semibold text-foreground">100%</span> free to use
          </span>
        </div>
      </div>
    </section>
  );
}
