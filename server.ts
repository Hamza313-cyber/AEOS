import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: "5mb" }));

// Lazy initializer for Gemini client to prevent crash if key is not configured on boot
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined. Please add your Gemini API Key in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Trending topics tracker via web search grounding
app.post("/api/trending", async (req, res) => {
  const { niche } = req.body;
  if (!niche) {
    res.status(400).json({ error: "Niche is required" });
    return;
  }

  try {
    const ai = getGeminiClient();
    const prompt = `Identify 3 to 4 trending topics, latest news, developments, or discussions in the niche: "${niche}" as of today. 
For each trend, provide:
1. Title
2. A detailed factual summary
3. A unique content angle suitable for an agency or professional (e.g. how they can write about it to showcase topical authority and expertise)

You must return a raw JSON object matching the following TypeScript structure EXACTLY:
{
  "topics": [
    {
      "title": "Trend Title Here",
      "summary": "Detailed factual summary of what is happening, key points",
      "angle": "Creative and unique angle for content creation, incorporating E-E-A-T principles"
    }
  ]
}

Ensure your response is valid JSON and nothing else. No markdown wrappers like \`\`\`json.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    let parsedData;
    try {
      parsedData = JSON.parse(text.trim());
    } catch (parseErr) {
      console.error("Failed to parse trending JSON:", text);
      parsedData = { topics: [] };
    }

    // Extract search grounding sources
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = chunks
      ? chunks
          .filter((c: any) => c.web)
          .map((c: any) => ({
            title: c.web.title || "Web Source",
            url: c.web.uri,
          }))
      : [];

    // Attach sources to trending topics
    const topicsWithSources = (parsedData.topics || []).map((t: any, idx: number) => ({
      ...t,
      id: `trend-${Date.now()}-${idx}`,
      niche,
      sources: sources.slice(idx * 2, (idx + 1) * 2), // Distribute sources reasonably
    }));

    res.json({ topics: topicsWithSources });
  } catch (err: any) {
    console.error("Error in /api/trending:", err);
    res.status(500).json({ error: err.message || "Failed to fetch trending topics" });
  }
});

// 2. Keyword & topic research module
app.post("/api/research-keywords", async (req, res) => {
  const { keyword, audience } = req.body;
  if (!keyword) {
    res.status(400).json({ error: "Seed keyword is required" });
    return;
  }

  try {
    const ai = getGeminiClient();
    const prompt = `Conduct comprehensive keyword and topic research on the seed keyword: "${keyword}" for the target audience: "${audience || "general professional"}".
We want to optimize for topical authority, search intent match, and Generative Engine Optimization (GEO/AEO) so our content can be easily citable by AI Overviews and chat assistants. Do NOT suggest keyword stuffing tactics.

Return a raw JSON object matching this structure EXACTLY:
{
  "id": "keyword-id",
  "keyword": "${keyword}",
  "intent": "Informational", // Must be one of: 'Informational', 'Commercial', 'Transactional', 'Navigational'
  "difficulty": "Medium", // Must be one of: 'Low', 'Medium', 'High'
  "estimatedVolume": "1.5K/mo",
  "subtopics": ["Subtopic 1", "Subtopic 2"],
  "questionsToAnswer": [
    "Specific question that AI search engines are likely to summarize",
    "Pragmatic question from experience that demonstrates deep expertise"
  ]
}

Ensure your response is valid JSON and nothing else. No markdown wrappers.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    let parsedData = JSON.parse(text.trim());
    parsedData.id = `kw-${Date.now()}`;

    res.json(parsedData);
  } catch (err: any) {
    console.error("Error in /api/research-keywords:", err);
    res.status(500).json({ error: err.message || "Failed to perform keyword research" });
  }
});

// 3. Generate proposed Outline/Strategy (Ask-Permission mode)
app.post("/api/outline", async (req, res) => {
  const { topic, keywords, audience, eeatPoints } = req.body;
  if (!topic) {
    res.status(400).json({ error: "Topic is required" });
    return;
  }

  try {
    const ai = getGeminiClient();
    const prompt = `Create a complete SEO Outline & Content Strategy for an article on topic: "${topic}".
Keywords to cover: ${JSON.stringify(keywords || [])}
Target Audience: "${audience || "general professional"}"
E-E-A-T points (Experience, Expertise, Authoritativeness, Trust): "${eeatPoints || "None specified"}"

Apply the Critical SEO Philosophy: do NOT optimize for keyword stuffing. Instead, optimize for E-E-A-T, topical authority, search intent match, and Generative Engine Optimization (GEO) so content is structured to be citable by AI Overviews.
Provide a clear 'verificationChecklist' listing specific factual claims, statistics, or quotes that will need careful human verification once written (following the critical anti-hallucination rule).

Return a raw JSON object matching this structure EXACTLY:
{
  "targetAudience": "Detailed target audience statement",
  "eeatStrategy": "How we will demonstrate Experience, Expertise, Authoritativeness, and Trust",
  "aeoGeoStrategy": "Structure strategy to be highly citable by AI assistants (Answer Engine Optimization)",
  "headings": [
    { "title": "Heading title (incorporate keyword naturally)", "intent": "E.E.A.T / Actionable Insight / AI Overview Citable", "depth": 2 }
  ],
  "keyTakeaways": [
    "Takeaway 1 (direct, concise)",
    "Takeaway 2 (focused on practical application)"
  ],
  "suggestedWordCount": 1500,
  "verificationChecklist": [
    "Checklist item 1: Verify specific percentage claims for tool usage",
    "Checklist item 2: Double check timeline of updates"
  ]
}

Ensure your response is valid JSON and nothing else. No markdown wrappers.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const parsedData = JSON.parse(text.trim());
    res.json(parsedData);
  } catch (err: any) {
    console.error("Error in /api/outline:", err);
    res.status(500).json({ error: err.message || "Failed to generate outline" });
  }
});

// 4. Blog/Article Writer
app.post("/api/write-article", async (req, res) => {
  const { topic, keywords, audience, eeatPoints, outline } = req.body;
  if (!topic) {
    res.status(400).json({ error: "Topic is required" });
    return;
  }

  try {
    const ai = getGeminiClient();
    const prompt = `Write a comprehensive, professional, highly engaging article on the topic: "${topic}".
Target Audience: "${audience || "general professional"}"
Target Keywords: ${JSON.stringify(keywords || [])}
Incorporate these E-E-A-T experiences/points: "${eeatPoints || "None specified"}"
Follow this proposed outline: ${JSON.stringify(outline || {})}

CRITICAL VOICE RULES (STRICTLY FORBIDDEN PHRASES & STYLES):
- NEVER use em-dashes (—). Use parentheses, semicolons, or split into separate sentences instead.
- NEVER use generic words/tropes like: "game-changer", "unlock", "dive in", "in today's world", "not just X but Y", "seamless", "revolutionize".
- Vary sentence length. Keep some sentences short (under 8 words) for punchy pacing, and others longer and descriptive.
- Sound like an experienced, grounded human editor, not a generic AI assistant. Use a natural, informative, conversational yet expert tone.

CRITICAL ANTI-HALLUCINATION RULES:
- Never invent statistics, study names, dates, quotes, competitor data, or facts.
- If a specific factual claim cannot be traced to the provided inputs, you MUST explicitly write "[Requires Verification: <insert exact placeholder statement>]" inline or inside the text rather than stating it as a certain fact.
- Every factual claim made must be easily traceable or flagged as needing verification.

CRITICAL SEO RULES:
- Do NOT repeat keywords awkwardly (no keyword stuffing).
- Structure paragraphs with clear headings. Give direct answers immediately under questions to optimize for Generative Engine snippets (AEO/GEO).

Please write the complete full-length article body (minimum 1200 words, rich with depth and subheadings). Add a summary at the end. Make sure the output contains ONLY the article text with markdown heading formats (#, ##, ###).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ articleBody: response.text });
  } catch (err: any) {
    console.error("Error in /api/write-article:", err);
    res.status(500).json({ error: err.message || "Failed to write article" });
  }
});

// 5. Social Posts & Video Script distribution writer
app.post("/api/write-distribution", async (req, res) => {
  const { articleBody, topic } = req.body;
  if (!articleBody) {
    res.status(400).json({ error: "Article content is required" });
    return;
  }

  try {
    const ai = getGeminiClient();
    const prompt = `Based on this article about "${topic || "the topic"}", generate a comprehensive social media distribution package and a professional video script.

Article text:
"""
${articleBody}
"""

You must generate:
1. LinkedIn Post (written in a thought-provoking, conversational human voice, sharing a core personal insight from the article, no emoji overload, no generic buzzwords).
2. X/Twitter Thread (3-4 posts, opening with a punchy hook, concise value, no em-dashes, no fluff).
3. Facebook Post (engaging story style, prompting a community discussion).
4. Instagram Caption (visual suggestion + descriptive hooky text + relevant hashtags).
5. Video/Reels/YouTube script (containing a strong initial Hook, a sequence of scenes detailing visual instructions, audio cues, and narrated text, and a compelling Call to Action).

CRITICAL VOICE & STYLE RULES (Apply to all generated text!):
- NO em-dashes.
- NO buzzwords: "game-changer", "unlock", "dive in", "in today's world", "not just X but Y", "seamless", "revolutionize".
- Sound like a genuine human creator sharing experience. Vary sentence length.

Return a raw JSON object matching this structure EXACTLY:
{
  "socialPosts": {
    "linkedin": "Full LinkedIn post text",
    "twitter": "Post 1/4:\\nText here\\n\\nPost 2/4:\\nText here\\n\\nPost 3/4:\\nText here\\n\\nPost 4/4:\\nText here",
    "facebook": "Full Facebook post text",
    "instagram": "Visual Suggestion: [Brief image description]\\n\\nCaption: Full Instagram caption text"
  },
  "videoScript": {
    "hook": "Unusual or highly focused 10-second opening statement",
    "scriptLines": [
      { "type": "visual", "content": "Visual description (e.g., Close up of hands typing on mechanical keyboard)" },
      { "type": "audio", "content": "Audio description (e.g., Subtle lo-fi background beat)" },
      { "type": "narration", "content": "Spoken narrator text. Keep it completely natural and vary sentence length." }
    ],
    "callToAction": "Clear and native CTA (e.g., Subscribe for grounded SEO strategies)"
  }
}

Ensure your response is valid JSON and nothing else. No markdown wrappers.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const parsedData = JSON.parse(text.trim());
    res.json(parsedData);
  } catch (err: any) {
    console.error("Error in /api/write-distribution:", err);
    res.status(500).json({ error: err.message || "Failed to generate distribution posts" });
  }
});

// 6. Meta & Google Ads copy generator
app.post("/api/write-ads", async (req, res) => {
  const { topic, productDescription, audience } = req.body;
  if (!topic) {
    res.status(400).json({ error: "Topic/Product is required" });
    return;
  }

  try {
    const ai = getGeminiClient();
    const prompt = `Generate highly optimized Meta Ads (Facebook/Instagram) and Google Search Ads copy for:
Product/Topic: "${topic}"
Description: "${productDescription || ""}"
Target Audience: "${audience || "general professional"}"

CRITICAL VOICE & ACCURACY RULES:
- No em-dashes.
- No buzzwords: "game-changer", "unlock", "dive in", "in today's world", "not just X but Y", "seamless", "revolutionize".
- Google Search Ads headlines MUST be under 30 characters.
- Google Search Ads descriptions MUST be under 90 characters.
- Return 3 Meta headlines, 3 Meta primary texts, 3 Google headlines, and 3 Google descriptions.

Return a raw JSON object matching this structure EXACTLY:
{
  "metaHeadlines": ["Headline 1", "Headline 2", "Headline 3"],
  "metaPrimaryTexts": ["Primary Text 1", "Primary Text 2", "Primary Text 3"],
  "googleHeadlines": ["Headline 1 (max 30 chars)", "Headline 2 (max 30 chars)", "Headline 3 (max 30 chars)"],
  "googleDescriptions": ["Description 1 (max 90 chars)", "Description 2 (max 90 chars)", "Description 3 (max 90 chars)"]
}

Strictly validate character counts for Google Ads inside the generated text. Ensure the response is valid JSON and nothing else.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const parsedData = JSON.parse(text.trim());
    res.json(parsedData);
  } catch (err: any) {
    console.error("Error in /api/write-ads:", err);
    res.status(500).json({ error: err.message || "Failed to generate ads copy" });
  }
});


// Express and Vite setup logic
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
