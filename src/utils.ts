import { ContentItem, KeywordResearch, TrendingTopic, AgentLog } from "./types";

export const DEFAULT_TRENDS: TrendingTopic[] = [
  {
    id: "trend-1",
    title: "AI Overviews (SGE) Rolling Out Internationally",
    niche: "AI & Search Marketing",
    summary: "Google is expanding its AI-generated answers to multiple new countries. The layout prioritizes direct factual summaries with simple citation links. This changes user behavior from clicking multiple organic links to viewing a single consensus answer.",
    angle: "Focus on creating clear, tabular comparison data and direct question-and-answer headings that AI agents can cite directly. This represents a prime GEO (Generative Engine Optimization) opportunity.",
    sources: [
      { title: "Google Search Central Blog on AI Overviews", url: "https://developers.google.com/search/blog" },
      { title: "Search Engine Land: SGE Global Footprint", url: "https://searchengineland.com" }
    ]
  },
  {
    id: "trend-2",
    title: "The Rise of E-E-A-T Over Faceless Backlinks",
    niche: "SEO Strategy",
    summary: "Google core algorithm updates are strictly demoting mass-produced AI content. Sites that feature real, verifiable author bios, direct personal stories, hands-on testing, and clear professional credentials (E-E-A-T) are gaining significant search presence.",
    angle: "Incorporate 'Experience logs' or 'Expertise statements' into every written block. Instead of talking theoretically, include quotes and case studies from actual projects.",
    sources: [
      { title: "Google Search Quality Rater Guidelines", url: "https://static.googleusercontent.com" }
    ]
  }
];

export const DEFAULT_KEYWORDS: KeywordResearch[] = [
  {
    id: "kw-1",
    keyword: "generative engine optimization",
    intent: "Informational",
    difficulty: "Medium",
    estimatedVolume: "880/mo",
    subtopics: ["GEO ranking factors", "AEO vs SEO", "AI Overview citations"],
    questionsToAnswer: [
      "What is generative engine optimization and how does it work?",
      "How do you optimize an article to be cited in AI search answers?"
    ]
  },
  {
    id: "kw-2",
    keyword: "topical authority map",
    intent: "Commercial",
    difficulty: "High",
    estimatedVolume: "1.2K/mo",
    subtopics: ["Content clustering", "Topical depth strategy", "Niche authority matrix"],
    questionsToAnswer: [
      "How do you build a topical authority content cluster map?",
      "Why is topical depth more important than keyword density?"
    ]
  }
];

export const DEFAULT_LOGS: AgentLog[] = [
  {
    id: "log-1",
    timestamp: "10:15:22 AM",
    task: "Trend Monitoring",
    status: "success",
    message: "Retrieved fresh web grounded trends for 'AI & Search Marketing' via Google Search. Detected international rollouts."
  },
  {
    id: "log-2",
    timestamp: "10:16:05 AM",
    task: "SEO Strategy Planning",
    status: "info",
    message: "Identified 'Generative Engine Optimization' as high-intent opportunity. Drafted strategic outline."
  },
  {
    id: "log-3",
    timestamp: "10:16:12 AM",
    task: "Autonomy Action",
    status: "warning",
    message: "Ask-Permission Mode: Strategy outline for 'How to Rank in AI Overviews' created. Awaiting user approval."
  }
];

export const DEFAULT_CONTENT: ContentItem[] = [
  {
    id: "content-1",
    title: "How to Build a High-E-E-A-T Content Engine",
    topic: "Building high-quality topical authority content using real-world experience, avoiding generic AI-generated templates.",
    keywords: ["E-E-A-T content strategy", "topical authority", "experience seo"],
    audience: "Agency owners and startup founders",
    eeatPoints: "Sharing our team's 7 years of SEO experience managing clients. Explaining our real case study where personal case studies boosted conversions by 42%.",
    status: "completed",
    createdAt: "2026-07-19T14:22:00.000Z",
    outline: {
      targetAudience: "Agency owners and startup founders looking to establish organic credibility.",
      eeatStrategy: "Use our real-world agency client case study. Introduce custom author bios and actual screenshots/process logs.",
      aeoGeoStrategy: "Structure the primary headings as clear, direct questions. Deliver concise answers in the first 2 sentences under each heading to enable AI overview scrapers to parse easily.",
      headings: [
        { title: "What is E-E-A-T and Why is Experience the New Gold?", intent: "Explain concept & define experience", depth: 2 },
        { title: "Why Traditional Keyword Stuffing Actually Harms Your SEO rankings", intent: "Address search engine penalties & shift to topical depth", depth: 2 },
        { title: "How to Map a True Topical Authority Cluster", intent: "Actionable roadmap with tactical breakdown", depth: 2 },
        { title: "Our 7-Year Agency Blueprint for Verifiable Trustworthiness", intent: "Present real agency case studies & authority elements", depth: 2 }
      ],
      keyTakeaways: [
        "Keyword stuffing is completely dead and actively flagged by modern search engines.",
        "Demonstrable experience is the most authoritative way to gain trust.",
        "Generative search tools prefer tabular comparison data and direct question answering."
      ],
      suggestedWordCount: 1400,
      verificationChecklist: [
        "Verify the conversion increase statistic of 42% against actual internal Analytics spreadsheet.",
        "Confirm timeline of Google's latest core system update."
      ]
    },
    articleBody: `# How to Build a High-E-E-A-T Content Engine

Credibility in digital publishing is undergoing its most significant evolution in a decade. Traditional strategies that relied on simple search matching and sheer keyword density are failing. Today, modern search ranking engines and generative AI summaries prioritize content that displays deep, verifiable expertise. 

To build an organic traffic engine that survives and thrives in this era, your writing must lead with **E-E-A-T**: Experience, Expertise, Authoritativeness, and Trustworthiness.

## What is E-E-A-T and Why is Experience the New Gold?

Experience is the newest addition to Google's rating guidelines. It refers to the creator's first-hand, real-world experience with the subject. Anyone can summarize a product manual; very few can document the raw, physical or technical reality of using that product under pressure. 

When your content includes specific details, actual failures, and original photographs, search algorithms detect these markers of authentic human effort. This separates your material from generic syntheses.

[Requires Verification: Verify standard industry guidelines for Google Quality Raters updated in late 2022 to officially add the 'Experience' component.]

## Why Traditional Keyword Stuffing Actually Harms Your SEO rankings

Keyword density targets are obsolete. Writing content for the sole purpose of repeating "E-E-A-T content strategy" six times inside a page is not only ineffective, it looks spammy to readers and triggers quality flags in modern crawlers. 

Instead, rank algorithms analyze the *topical depth* of your document. They map semantic clusters to evaluate whether you cover all logical questions a reader might hold. If you try to force keywords where they do not naturally flow, your sentence length becomes repetitive. This breaks the human rhythm of the editorial voice.

## How to Map a True Topical Authority Cluster

A topical authority cluster starts by defining a core pillar topic and then charting secondary, highly granular articles that feed back into it. 

To do this:
1. Identify the broad category (e.g., Topical Authority).
2. Create 5-6 sub-articles answering highly specific customer intents (e.g., mapping keyword difficulty, choosing search intent modifiers).
3. Connect them using natural anchor text that helps readers discover further depth.

This structure proves to search crawlers that your portal is a comprehensive resource, rather than a collection of disconnected landing pages.

## Our 7-Year Agency Blueprint for Verifiable Trustworthiness

Over our seven years of managing high-growth search strategies, we have tested dozens of quality frameworks. Our team discovered that when we replaced generic summaries with direct case studies, conversion rates boosted by 42%.

Here is the blueprint we apply for clients:
- **Author Transparency**: Always append a short, citable author bio detailing real certifications or decades of experience.
- **Fact-Checking Annotations**: Add clean footnotes linking back to official government, academic, or peer-reviewed industry resources.
- **First-Person Insights**: Frame guides using "In our experience" or "During our testing" to prove active involvement.

By adhering to these standards, you protect your content against algorithmic shifts and provide massive, undeniable value to your prospective clients.`,
    socialPosts: {
      linkedin: "Organic traffic isn't dead. The playbook just changed completely.\n\nAfter 7 years of scaling search engines, we've watched standard keyword stuffing go from 'tactical' to a fast-track penalty.\n\nNow, search algorithms prioritize a single factor: E-E-A-T (Experience, Expertise, Authoritativeness, Trust).\n\nWhen we replaced generic listicles with deep, first-person case studies, our conversions boosted by 42%. Why? Because people buy from real experts, and AI Overviews summarize first-hand experiences, not rehashed definitions.\n\nHere is how to map a topical authority cluster that ranks in 2026. Read the full blueprint.",
      twitter: "1/5 Search optimization has changed. Simple keyword stuffing is officially dead.\n\nModern search and AI engines now look for E-E-A-T: Experience, Expertise, Authoritativeness, and Trust.\n\nHere is how to build a content engine that ranks and converts. 🧵\n\n2/5 Stop optimizing for 'keyword density'. Ranking engines are semantic. They evaluate topical depth and cluster authority.\n\nMap 1 pillar topic, then write 5 deep sub-articles answering specific questions.\n\n3/5 Double down on 'Experience'. First-hand, raw details are gold.\n\nWrite about actual client campaigns, share original images, and document lessons from real-world testing.\n\n4/5 Format for Generative Search (AEO). Deliver concise answers directly under your H2 headings.\n\nAI summaries look for clean, citable definitions that answer direct user queries.\n\n5/5 When we replaced generic summaries with real case studies, conversions boosted by 42%.\n\nFocus on actual authority. If you found this useful, follow for grounded SEO workflows.",
      facebook: "Are you still trying to optimize your content by repeating keywords over and over? That outdated strategy is actually harming your search visibility. Modern algorithms look for real Experience and Trustworthiness (E-E-A-T). Read our complete blueprint where we show how adding first-person experience boosted our agency client conversions by 42%.",
      instagram: "Visual Suggestion: [A clean, high-contrast infographic showing 'Topical Authority Pillar' at the center with branching subtopics, styled in crisp charcoal and off-white.]\n\nCaption: Is your content ready for the AI Search era? Keyword stuffing won't save you. Generative engine optimization (GEO) requires topical depth and authentic E-E-A-T. Slide through to see our 7-year blueprint to build genuine authority that search assistants cite. #SEO #AEO #EEAT #ContentStrategy #MarketingAgency"
    },
    videoScript: {
      hook: "If you are still repeating search keywords to rank on Google, you are actively tanking your SEO score.",
      scriptLines: [
        { type: "visual", content: "Close-up on a split screen showing a massive red 'PENALTY' bar over a keyword-stuffed page, next to a clean, highly structured, well-cited article." },
        { type: "audio", content: "A sudden low warning tone, transitioning to a crisp, high-frequency focus synth." },
        { type: "narration", content: "Search ranking systems don't care about keyword density anymore. In fact, stuffing words makes your content look automated. Instead, modern search and AI overviews are hunting for E-E-A-T: Experience, Expertise, Authoritativeness, and Trust." },
        { type: "visual", content: "Zoom out to show a hand mapping out a pillar-and-cluster chart on a sketchpad." },
        { type: "narration", content: "To rank today, you need to map out semantic clusters. Build one master topic and branch into deep, highly specific answers to real questions." },
        { type: "visual", content: "Text overlay reads: '+42% Conversion rate with case studies'." },
        { type: "narration", content: "When we replaced generic articles with actual, first-hand client case studies, conversions skyrocketed by forty-two percent. People want real answers from real experts." }
      ],
      callToAction: "Stop writing for bots. Start writing for real authority. Follow for more grounded agency workflows."
    },
    adsCopy: {
      metaHeadlines: [
        "Traditional SEO is Dead. Meet E-E-A-T.",
        "How We Boosted Conversions by 42%",
        "Build Real Organic Authority"
      ],
      metaPrimaryTexts: [
        "Stop stuffing keywords. Modern search engines penalize fluff. Build a high-E-E-A-T content engine with our proven 7-year agency blueprint.",
        "We tested dozens of content templates. Real case studies beat generic summaries every single time, lifting client conversions by 42%. Here is the strategy.",
        "Optimizing for AI search overviews requires topical depth, not outdated hacks. Get the exact roadmap to rank as an authority today."
      ],
      googleHeadlines: [
        "SEO Strategy is Changing",
        "Build Topical Authority",
        "Our 7-Year Content Blueprint"
      ],
      googleDescriptions: [
        "Stop keyword stuffing. Optimize for E-E-A-T and AI search overviews with real experience.",
        "Case studies and topical depth increased conversions by 42%. Get our agency guide.",
        "Learn how to design authoritative content that generative search engines cite directly."
      ]
    }
  },
  {
    id: "content-2",
    title: "The Ultimate Guide to Generative Engine Optimization (GEO)",
    topic: "Optimizing website structures and content elements so they get cited by AI search engines like Gemini and AI Overviews.",
    keywords: ["generative engine optimization", "AEO strategies", "AI overview citations"],
    audience: "Tech marketers and enterprise content teams",
    eeatPoints: "Documenting our testing of 35 different schema markups and heading structures to analyze which formats are chosen for AI overview answers.",
    status: "outline_pending",
    createdAt: "2026-07-20T10:30:00.000Z"
  }
];
