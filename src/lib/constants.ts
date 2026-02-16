export const APP_NAME = "AI Tools Finder";
export const APP_DESCRIPTION =
  "Discover the perfect AI tools for your needs. Describe what you want to accomplish, and we'll recommend the best matches with pricing, features, and honest reviews.";

export const CATEGORIES = [
  { name: "Writing & Content", slug: "writing-content", icon: "PenTool", description: "Blog writing, copywriting, grammar, SEO content" },
  { name: "Image & Design", slug: "image-design", icon: "Image", description: "Image generation, photo editing, logo design, UI design" },
  { name: "Video & Audio", slug: "video-audio", icon: "Video", description: "Video editing, text-to-speech, transcription, music" },
  { name: "Coding & Development", slug: "coding-development", icon: "Code", description: "Code generation, code review, documentation, testing" },
  { name: "Marketing", slug: "marketing", icon: "Megaphone", description: "Email marketing, social media, ad copy, analytics" },
  { name: "Business & Productivity", slug: "business-productivity", icon: "Briefcase", description: "Meeting notes, project management, spreadsheets" },
  { name: "Education & Research", slug: "education-research", icon: "GraduationCap", description: "Tutoring, summarization, research, language learning" },
  { name: "Data & Analytics", slug: "data-analytics", icon: "BarChart3", description: "Data visualization, BI, data cleaning" },
  { name: "Customer Support", slug: "customer-support", icon: "Headphones", description: "Chatbots, help desk, knowledge base" },
  { name: "Sales & CRM", slug: "sales-crm", icon: "Target", description: "Lead generation, outreach, CRM assistants" },
  { name: "HR & Recruiting", slug: "hr-recruiting", icon: "Users", description: "Resume screening, interview prep, job descriptions" },
  { name: "Legal & Finance", slug: "legal-finance", icon: "Scale", description: "Contract review, accounting, compliance" },
] as const;

export const SEARCH_PLACEHOLDERS = [
  "I want to write better blog posts...",
  "I need to edit photos without Photoshop...",
  "Help me summarize long documents...",
  "I want to create marketing emails...",
  "I need to generate code faster...",
  "Help me transcribe meeting recordings...",
  "I want to create presentations quickly...",
  "I need to analyze data without coding...",
];

export const PRICING_LABELS: Record<string, string> = {
  free: "Free",
  freemium: "Freemium",
  paid: "Paid",
  open_source: "Open Source",
  contact_sales: "Contact Sales",
};
