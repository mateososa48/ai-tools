import { MessageSquare, Cpu, ThumbsUp } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    title: "Describe your need",
    description: "Tell us what you want to accomplish in your own words. No tech jargon needed.",
    color: "bg-brand-blue/10 text-brand-blue",
  },
  {
    icon: Cpu,
    title: "AI finds matches",
    description: "Our AI analyzes hundreds of tools and picks the ones that fit your exact use case.",
    color: "bg-brand-green/10 text-brand-green",
  },
  {
    icon: ThumbsUp,
    title: "Compare & choose",
    description: "See honest pricing, features, and reviews side by side. Pick the best one for you.",
    color: "bg-brand-orange/10 text-brand-orange",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          How it works
        </h2>
        <p className="mt-3 text-lg text-muted-foreground">
          Finding the right AI tool shouldn&apos;t be complicated
        </p>
      </div>

      <div className="mt-14 grid gap-8 sm:grid-cols-3">
        {steps.map((step, i) => (
          <div key={step.title} className="relative text-center">
            {/* Connector line (desktop) */}
            {i < steps.length - 1 && (
              <div className="absolute left-1/2 top-10 hidden h-0.5 w-full bg-gradient-to-r from-border to-transparent sm:block" />
            )}

            <div className="relative flex flex-col items-center">
              {/* Step number */}
              <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {i + 1}
              </div>

              {/* Icon */}
              <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${step.color}`}>
                <step.icon className="h-7 w-7" />
              </div>

              <h3 className="font-heading text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
