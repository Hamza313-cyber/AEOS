export type ContentStatus = 'draft' | 'outline_pending' | 'approved' | 'writing' | 'completed';

export interface HeadingItem {
  title: string;
  intent: string; // e.g. "Answer Engine Optimization", "Expert Perspective", "Actionable Guidance"
  depth: number; // 2 or 3
}

export interface ContentOutline {
  targetAudience: string;
  eeatStrategy: string;
  aeoGeoStrategy: string;
  headings: HeadingItem[];
  keyTakeaways: string[];
  suggestedWordCount: number;
  verificationChecklist: string[]; // Factual claims that MUST be verified
}

export interface ScriptLine {
  type: 'visual' | 'audio' | 'narration';
  content: string;
}

export interface VideoScript {
  hook: string;
  scriptLines: ScriptLine[];
  callToAction: string;
}

export interface SocialDistribution {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
}

export interface AdsCopySet {
  metaHeadlines: string[];
  metaPrimaryTexts: string[];
  googleHeadlines: string[]; // Must be max 30 chars
  googleDescriptions: string[]; // Must be max 90 chars
}

export interface ContentItem {
  id: string;
  title: string;
  topic: string;
  keywords: string[];
  audience: string;
  eeatPoints: string;
  status: ContentStatus;
  outline?: ContentOutline;
  articleBody?: string;
  socialPosts?: SocialDistribution;
  videoScript?: VideoScript;
  adsCopy?: AdsCopySet;
  createdAt: string;
}

export interface KeywordResearch {
  id: string;
  keyword: string;
  intent: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';
  difficulty: 'Low' | 'Medium' | 'High';
  estimatedVolume: string;
  subtopics: string[];
  questionsToAnswer: string[]; // For GEO / AEO optimization
}

export interface TrendingTopic {
  id: string;
  title: string;
  niche: string;
  summary: string;
  angle: string; // Creative angle for the agency
  sources: { title: string; url: string }[];
}

export interface AgentLog {
  id: string;
  timestamp: string;
  task: string;
  status: 'info' | 'success' | 'warning' | 'pending';
  message: string;
}
