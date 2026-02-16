import { HeroSection } from "@/components/home/hero-section";
import { FeaturedTools } from "@/components/home/featured-tools";
import { HowItWorks } from "@/components/home/how-it-works";
import { CategoryShowcase } from "@/components/home/category-showcase";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedTools />
      <HowItWorks />
      <CategoryShowcase />
    </>
  );
}
