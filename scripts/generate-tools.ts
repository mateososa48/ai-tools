import Groq from "groq-sdk";
import * as fs from "fs";
import * as path from "path";

const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
  console.error("Missing GROQ_API_KEY in environment variables.");
  process.exit(1);
}

const groq = new Groq({ apiKey: groqApiKey });

// AI tools to generate data for, organized by category
// Excludes the 20 already in seed-data.ts
const TOOLS_TO_GENERATE: { name: string; url: string; categories: string[] }[] = [
  // Writing & Content
  { name: "Writesonic", url: "https://writesonic.com", categories: ["writing-content", "marketing"] },
  { name: "Rytr", url: "https://rytr.me", categories: ["writing-content"] },
  { name: "Wordtune", url: "https://wordtune.com", categories: ["writing-content"] },
  { name: "QuillBot", url: "https://quillbot.com", categories: ["writing-content"] },
  { name: "Hemingway Editor", url: "https://hemingwayapp.com", categories: ["writing-content"] },
  { name: "Sudowrite", url: "https://sudowrite.com", categories: ["writing-content"] },
  { name: "Simplified", url: "https://simplified.com", categories: ["writing-content", "marketing"] },
  { name: "Anyword", url: "https://anyword.com", categories: ["writing-content", "marketing"] },
  { name: "Writer", url: "https://writer.com", categories: ["writing-content"] },
  { name: "Textblaze", url: "https://blaze.today", categories: ["writing-content", "business-productivity"] },

  // Image & Design
  { name: "Stable Diffusion", url: "https://stability.ai", categories: ["image-design"] },
  { name: "Leonardo AI", url: "https://leonardo.ai", categories: ["image-design"] },
  { name: "Adobe Firefly", url: "https://firefly.adobe.com", categories: ["image-design"] },
  { name: "Ideogram", url: "https://ideogram.ai", categories: ["image-design"] },
  { name: "Flux", url: "https://flux.ai", categories: ["image-design"] },
  { name: "Playground AI", url: "https://playground.com", categories: ["image-design"] },
  { name: "Photoroom", url: "https://photoroom.com", categories: ["image-design", "marketing"] },
  { name: "Remove.bg", url: "https://remove.bg", categories: ["image-design"] },
  { name: "Clipdrop", url: "https://clipdrop.co", categories: ["image-design"] },
  { name: "Lensa AI", url: "https://prisma-ai.com/lensa", categories: ["image-design"] },

  // Video & Audio
  { name: "Sora", url: "https://openai.com/sora", categories: ["video-audio"] },
  { name: "HeyGen", url: "https://heygen.com", categories: ["video-audio", "marketing"] },
  { name: "Opus Clip", url: "https://opus.pro", categories: ["video-audio", "marketing"] },
  { name: "Pictory", url: "https://pictory.ai", categories: ["video-audio"] },
  { name: "Murf AI", url: "https://murf.ai", categories: ["video-audio"] },
  { name: "Suno", url: "https://suno.com", categories: ["video-audio"] },
  { name: "AIVA", url: "https://aiva.ai", categories: ["video-audio"] },
  { name: "Kapwing", url: "https://kapwing.com", categories: ["video-audio"] },
  { name: "Captions", url: "https://captions.ai", categories: ["video-audio"] },
  { name: "Luma AI", url: "https://lumalabs.ai", categories: ["video-audio", "image-design"] },

  // Coding & Development
  { name: "Replit AI", url: "https://replit.com", categories: ["coding-development"] },
  { name: "Tabnine", url: "https://tabnine.com", categories: ["coding-development"] },
  { name: "Codeium", url: "https://codeium.com", categories: ["coding-development"] },
  { name: "Amazon CodeWhisperer", url: "https://aws.amazon.com/codewhisperer", categories: ["coding-development"] },
  { name: "Devin", url: "https://devin.ai", categories: ["coding-development"] },
  { name: "v0 by Vercel", url: "https://v0.dev", categories: ["coding-development", "image-design"] },
  { name: "Bolt", url: "https://bolt.new", categories: ["coding-development"] },
  { name: "Windsurf", url: "https://codeium.com/windsurf", categories: ["coding-development"] },
  { name: "Sourcegraph Cody", url: "https://sourcegraph.com/cody", categories: ["coding-development"] },
  { name: "Claude Code", url: "https://docs.anthropic.com/en/docs/claude-code", categories: ["coding-development"] },

  // Marketing
  { name: "Surfer SEO", url: "https://surferseo.com", categories: ["marketing", "writing-content"] },
  { name: "Semrush AI", url: "https://semrush.com", categories: ["marketing"] },
  { name: "AdCreative.ai", url: "https://adcreative.ai", categories: ["marketing", "image-design"] },
  { name: "Predis.ai", url: "https://predis.ai", categories: ["marketing"] },
  { name: "Flick", url: "https://flick.social", categories: ["marketing"] },
  { name: "Brandwatch", url: "https://brandwatch.com", categories: ["marketing", "data-analytics"] },
  { name: "Lately", url: "https://lately.ai", categories: ["marketing"] },
  { name: "Phrasee", url: "https://phrasee.co", categories: ["marketing"] },

  // Business & Productivity
  { name: "Mem", url: "https://mem.ai", categories: ["business-productivity"] },
  { name: "Reclaim AI", url: "https://reclaim.ai", categories: ["business-productivity"] },
  { name: "Taskade", url: "https://taskade.com", categories: ["business-productivity"] },
  { name: "Fireflies.ai", url: "https://fireflies.ai", categories: ["business-productivity"] },
  { name: "Krisp", url: "https://krisp.ai", categories: ["business-productivity", "video-audio"] },
  { name: "Clockwise", url: "https://getclockwise.com", categories: ["business-productivity"] },
  { name: "Motion", url: "https://usemotion.com", categories: ["business-productivity"] },
  { name: "Lex", url: "https://lex.page", categories: ["business-productivity", "writing-content"] },

  // Education & Research
  { name: "Elicit", url: "https://elicit.com", categories: ["education-research"] },
  { name: "Consensus", url: "https://consensus.app", categories: ["education-research"] },
  { name: "Scholarcy", url: "https://scholarcy.com", categories: ["education-research"] },
  { name: "Socratic by Google", url: "https://socratic.org", categories: ["education-research"] },
  { name: "Khanmigo", url: "https://khanacademy.org/khan-labs", categories: ["education-research"] },
  { name: "Quizlet AI", url: "https://quizlet.com", categories: ["education-research"] },
  { name: "Scispace", url: "https://typeset.io", categories: ["education-research"] },
  { name: "NotebookLM", url: "https://notebooklm.google.com", categories: ["education-research"] },

  // Data & Analytics
  { name: "Julius AI", url: "https://julius.ai", categories: ["data-analytics"] },
  { name: "Tableau AI", url: "https://tableau.com", categories: ["data-analytics"] },
  { name: "Obviously AI", url: "https://obviously.ai", categories: ["data-analytics"] },
  { name: "MonkeyLearn", url: "https://monkeylearn.com", categories: ["data-analytics"] },
  { name: "Akkio", url: "https://akkio.com", categories: ["data-analytics"] },
  { name: "Polymer", url: "https://polymersearch.com", categories: ["data-analytics"] },

  // Customer Support
  { name: "Zendesk AI", url: "https://zendesk.com", categories: ["customer-support"] },
  { name: "Freshdesk Freddy", url: "https://freshworks.com/freshdesk", categories: ["customer-support"] },
  { name: "Ada", url: "https://ada.cx", categories: ["customer-support"] },
  { name: "Tidio", url: "https://tidio.com", categories: ["customer-support"] },
  { name: "Drift", url: "https://salesloft.com/drift", categories: ["customer-support", "sales-crm"] },
  { name: "ChatBot", url: "https://chatbot.com", categories: ["customer-support"] },

  // Sales & CRM
  { name: "Apollo AI", url: "https://apollo.io", categories: ["sales-crm"] },
  { name: "Gong", url: "https://gong.io", categories: ["sales-crm"] },
  { name: "Lavender", url: "https://lavender.ai", categories: ["sales-crm", "writing-content"] },
  { name: "Outreach", url: "https://outreach.io", categories: ["sales-crm"] },
  { name: "Clari", url: "https://clari.com", categories: ["sales-crm"] },
  { name: "Seamless.AI", url: "https://seamless.ai", categories: ["sales-crm"] },

  // HR & Recruiting
  { name: "HireVue", url: "https://hirevue.com", categories: ["hr-recruiting"] },
  { name: "Fetcher", url: "https://fetcher.ai", categories: ["hr-recruiting"] },
  { name: "Textio", url: "https://textio.com", categories: ["hr-recruiting", "writing-content"] },
  { name: "Paradox", url: "https://paradox.ai", categories: ["hr-recruiting"] },
  { name: "Eightfold AI", url: "https://eightfold.ai", categories: ["hr-recruiting"] },

  // Legal & Finance
  { name: "Harvey AI", url: "https://harvey.ai", categories: ["legal-finance"] },
  { name: "Casetext", url: "https://casetext.com", categories: ["legal-finance"] },
  { name: "Runway Financial", url: "https://runway.com", categories: ["legal-finance"] },
  { name: "Stampli", url: "https://stampli.com", categories: ["legal-finance"] },
  { name: "Vic.ai", url: "https://vic.ai", categories: ["legal-finance"] },
];

const BATCH_SIZE = 8;

const SYSTEM_PROMPT = `You are a data entry assistant generating structured JSON data about AI tools.
For each tool, generate accurate, factual information in this exact JSON format:

{
  "name": "Tool Name",
  "slug": "tool-name",
  "tagline": "Short catchy description (under 80 chars)",
  "description": "2-3 sentence description of what the tool does, who it's for, and what makes it special. Write for non-technical users.",
  "url": "https://tool-url.com",
  "pricing_model": "free|freemium|paid|open_source|contact_sales",
  "price_starting_at": 0,
  "has_free_tier": true,
  "has_free_trial": false,
  "pricing_details": [
    { "name": "Free", "price": 0, "interval": null, "features": ["feature1", "feature2"] },
    { "name": "Pro", "price": 20, "interval": "month", "features": ["feature1", "feature2"] }
  ],
  "features": ["feature1", "feature2", "feature3", "feature4", "feature5", "feature6"],
  "use_cases": ["use case 1", "use case 2", "use case 3", "use case 4"],
  "platforms": ["web", "ios", "android", "desktop", "api", "chrome", "vscode"],
  "integrations": ["Integration1", "Integration2"],
  "avg_rating": 4.5,
  "review_count": 500,
  "is_verified": true,
  "is_featured": false,
  "status": "active"
}

Important:
- Be factual about pricing. If unsure, use reasonable estimates.
- avg_rating should be between 3.5 and 4.9
- review_count should be between 50 and 2000
- platforms must only use: web, ios, android, desktop, api, chrome, vscode
- pricing_model must be one of: free, freemium, paid, open_source, contact_sales
- interval must be "month", "year", or null
- Include 2-3 pricing tiers when applicable
- Include 5-8 features and 3-6 use cases
- Write descriptions and taglines for a general, non-technical audience
- Return ONLY a JSON array. No markdown, no code blocks.`;

async function generateBatch(
  tools: { name: string; url: string; categories: string[] }[]
): Promise<unknown[]> {
  const toolList = tools
    .map((t) => `- ${t.name} (${t.url})`)
    .join("\n");

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    max_tokens: 8000,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Generate structured data for these AI tools:\n${toolList}\n\nReturn a JSON object with a "tools" array containing the data for each tool.`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    console.error("Empty response from Groq");
    return [];
  }

  try {
    const parsed = JSON.parse(content);
    const generatedTools = parsed.tools || parsed;

    // Add category_slugs from our input data
    return (Array.isArray(generatedTools) ? generatedTools : []).map(
      (generated: Record<string, unknown>, i: number) => ({
        ...generated,
        url: tools[i]?.url || generated.url,
        category_slugs: tools[i]?.categories || [],
        logo_url: null,
        screenshot_url: null,
        meta_title: null,
        meta_description: null,
      })
    );
  } catch (err) {
    console.error("Failed to parse Groq response:", err);
    console.error("Raw response:", content.slice(0, 500));
    return [];
  }
}

async function main() {
  console.log(`=== Sift AI Tool Data Generator ===\n`);
  console.log(`Generating data for ${TOOLS_TO_GENERATE.length} tools in batches of ${BATCH_SIZE}...\n`);

  const allTools: unknown[] = [];
  const batches = [];

  for (let i = 0; i < TOOLS_TO_GENERATE.length; i += BATCH_SIZE) {
    batches.push(TOOLS_TO_GENERATE.slice(i, i + BATCH_SIZE));
  }

  for (const [i, batch] of batches.entries()) {
    const batchNames = batch.map((t) => t.name).join(", ");
    console.log(`Batch ${i + 1}/${batches.length}: ${batchNames}`);

    try {
      const results = await generateBatch(batch);
      allTools.push(...results);
      console.log(`  Generated ${results.length} tools\n`);
    } catch (err) {
      console.error(`  Batch failed:`, err);
    }

    // Rate limit: wait between batches
    if (i < batches.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  // Write output
  const outputPath = path.join(__dirname, "data", "generated-tools.json");
  fs.writeFileSync(outputPath, JSON.stringify(allTools, null, 2));

  console.log(`\n=== Done! Generated ${allTools.length} tools ===`);
  console.log(`Output: ${outputPath}`);
  console.log(`\nRun "npm run seed" to import these tools into Supabase.`);
}

main().catch((err) => {
  console.error("Generation failed:", err);
  process.exit(1);
});
