import React, { useState } from "react";
import { TrendingTopic, KeywordResearch, ContentItem } from "../types";
import { Search, Globe, Flame, Plus, TrendingUp, AlertCircle, Loader2, Link as LinkIcon, Compass, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface ResearchTabProps {
  onAddCampaign: (campaign: Partial<ContentItem>) => void;
  trends: TrendingTopic[];
  setTrends: React.Dispatch<React.SetStateAction<TrendingTopic[]>>;
  keywords: KeywordResearch[];
  setKeywords: React.Dispatch<React.SetStateAction<KeywordResearch[]>>;
  addLog: (task: string, status: "info" | "success" | "warning", msg: string) => void;
  onSetTab: (tab: string) => void;
}

export default function ResearchTab({
  onAddCampaign,
  trends,
  setTrends,
  keywords,
  setKeywords,
  addLog,
  onSetTab,
}: ResearchTabProps) {
  // Keyword Research state
  const [keywordInput, setKeywordInput] = useState("");
  const [audienceInput, setAudienceInput] = useState("");
  const [isResearching, setIsResearching] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordResearch | null>(
    keywords.length > 0 ? keywords[0] : null
  );

  // Trending Topics state
  const [nicheInput, setNicheInput] = useState("AI & Search Marketing");
  const [isFetchingTrends, setIsFetchingTrends] = useState(false);

  // Keyword Research Action
  const handleKeywordResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywordInput.trim()) return;

    setIsResearching(true);
    addLog("Keyword Research", "info", `Searching semantic intent parameters for seed keyword: "${keywordInput}"...`);

    try {
      const res = await fetch("/api/research-keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keywordInput, audience: audienceInput }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to research keywords");
      }

      const kwResult: KeywordResearch = await res.json();
      setKeywords((prev) => [kwResult, ...prev]);
      setSelectedKeyword(kwResult);
      addLog("Keyword Research", "success", `Discovered topical cluster for "${keywordInput}". Classified as ${kwResult.intent} intent.`);
    } catch (err: any) {
      console.error(err);
      addLog("Keyword Research", "warning", `Error conducting keyword research: ${err.message}`);
    } finally {
      setIsResearching(false);
    }
  };

  // Trending grounding Action
  const handleFetchTrends = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicheInput.trim()) return;

    setIsFetchingTrends(true);
    addLog("Trend Monitoring", "info", `Querying live Google Search indexes for real-time trending spikes in "${nicheInput}"...`);

    try {
      const res = await fetch("/api/trending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: nicheInput }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to fetch trends");
      }

      const data = await res.json();
      if (data.topics && data.topics.length > 0) {
        setTrends((prev) => {
          // Filter out duplicates
          const filtered = prev.filter((t) => t.niche !== nicheInput);
          return [...data.topics, ...filtered];
        });
        addLog("Trend Monitoring", "success", `Retrieved ${data.topics.length} grounded search trends for "${nicheInput}" with citation references.`);
      } else {
        addLog("Trend Monitoring", "warning", `Search grounding completed, but no prominent new trends were detected for "${nicheInput}".`);
      }
    } catch (err: any) {
      console.error(err);
      addLog("Trend Monitoring", "warning", `Trend search grounding failed: ${err.message}`);
    } finally {
      setIsFetchingTrends(false);
    }
  };

  const createCampaignFromKeyword = (kw: KeywordResearch) => {
    const freshCampaign: Partial<ContentItem> = {
      title: `The Ultimate Guide to ${kw.keyword.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}`,
      topic: `Analyzing ${kw.keyword} specifically tailored for modern SEO, answering questions like: ${kw.questionsToAnswer.join(" or ")}.`,
      keywords: [kw.keyword, ...kw.subtopics.slice(0, 2)],
      audience: audienceInput || "General Professional",
      eeatPoints: "",
      status: "draft"
    };
    onAddCampaign(freshCampaign);
    addLog("Campaign Setup", "info", `Created draft campaign from keyword research: "${freshCampaign.title}"`);
    onSetTab("articles");
  };

  const createCampaignFromTrend = (trend: TrendingTopic) => {
    const freshCampaign: Partial<ContentItem> = {
      title: `Why ${trend.title} is Changing the Industry`,
      topic: `Analyzing the trend: ${trend.summary}. Angle: ${trend.angle}`,
      keywords: [trend.title.toLowerCase().slice(0, 30), trend.niche.toLowerCase()],
      audience: "Industry Stakeholders",
      eeatPoints: `Drawing from our experience observing ${trend.title} in actual client operations.`,
      status: "draft"
    };
    onAddCampaign(freshCampaign);
    addLog("Campaign Setup", "info", `Created draft campaign from grounded trend: "${freshCampaign.title}"`);
    onSetTab("articles");
  };

  return (
    <div id="research-tab-wrapper" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* SECTION 1: KEYWORD & INTENT PLANNER */}
      <div id="keyword-planner-card" className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-md">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-sans font-semibold text-slate-100">Seed Keyword & Topic Planner</h2>
            <p className="text-xs text-slate-500">Analyze search intent and build a topical authority cluster</p>
          </div>
        </div>

        <form onSubmit={handleKeywordResearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Seed Keyword</label>
              <input
                id="keyword-input-box"
                type="text"
                placeholder="e.g. generative engine optimization"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Target Audience</label>
              <input
                id="audience-input-box"
                type="text"
                placeholder="e.g. content managers, tech marketers"
                value={audienceInput}
                onChange={(e) => setAudienceInput(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>
          </div>
          <button
            id="keyword-search-submit"
            type="submit"
            disabled={isResearching}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-xs font-sans font-semibold rounded flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isResearching ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Mapping Intent Patterns...
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                Analyze Search Intent & Clusters
              </>
            )}
          </button>
        </form>

        {/* Selected Keyword Results */}
        {selectedKeyword ? (
          <div id="keyword-analysis-output" className="border-t border-slate-800 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Active Analysis</span>
                <h3 className="text-sm font-sans font-semibold text-slate-100 mt-0.5">{selectedKeyword.keyword}</h3>
              </div>
              <button
                id="btn-create-from-keyword"
                onClick={() => createCampaignFromKeyword(selectedKeyword)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-200 text-xs hover:bg-slate-700 flex items-center gap-1 border border-slate-700 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Create Article Project
              </button>
            </div>

            {/* Metric badges */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded border border-slate-800">
              <div className="text-center">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Search Intent</span>
                <p className="text-xs font-sans font-semibold text-indigo-400 mt-1">{selectedKeyword.intent}</p>
              </div>
              <div className="text-center border-x border-slate-800">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Difficulty</span>
                <p className="text-xs font-sans font-semibold text-amber-400 mt-1">{selectedKeyword.difficulty}</p>
              </div>
              <div className="text-center">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Volume Class</span>
                <p className="text-xs font-sans font-semibold text-slate-300 mt-1">{selectedKeyword.estimatedVolume}</p>
              </div>
            </div>

            {/* Answer Engine Optimization Questions */}
            <div className="space-y-2">
              <h4 className="text-xs font-sans font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                GEO / AI Overview Focus Questions
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Generative models quote sources that provide clear, concise, direct answers immediately beneath these conceptual queries.
              </p>
              <div className="space-y-2">
                {selectedKeyword.questionsToAnswer.map((q, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded text-xs text-slate-300 border border-slate-800/40">
                    <span className="font-mono text-indigo-400 text-[10px] block mb-1">Citable Trigger H2 #{idx + 1}</span>
                    &ldquo;{q}&rdquo;
                  </div>
                ))}
              </div>
            </div>

            {/* Cluster maps */}
            <div className="space-y-2">
              <h4 className="text-xs font-sans font-semibold text-slate-300">Topical Authority Cluster</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedKeyword.subtopics.map((sub, idx) => (
                  <span key={idx} className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-sans text-xs border border-slate-700/50">
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs font-sans border-t border-slate-850">
            Submit a seed keyword above to generate semantic clusters.
          </div>
        )}
      </div>

      {/* SECTION 2: TRENDING TRACKER WITH GROUNDED WEB SEARCH */}
      <div id="trending-tracker-card" className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-md">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-sans font-semibold text-slate-100">Grounded Trending Tracker</h2>
              <p className="text-xs text-slate-500">Live news grounding via real-time search queries</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase font-mono">
            Anti-Hallucination Verified
          </span>
        </div>

        <form onSubmit={handleFetchTrends} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">Target Niche or Industry</label>
            <div className="flex gap-2">
              <input
                id="niche-input-box"
                type="text"
                placeholder="e.g. AI & Search Marketing, Fitness Tech"
                value={nicheInput}
                onChange={(e) => setNicheInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-emerald-500 font-sans"
              />
              <button
                id="trending-search-submit"
                type="submit"
                disabled={isFetchingTrends}
                className="px-4 bg-emerald-600 hover:bg-emerald-500 text-slate-100 text-xs font-sans font-semibold rounded flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                {isFetchingTrends ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5" />
                    Query Live Web
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Trends List */}
        <div id="trends-list" className="space-y-4 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
          {trends
            .filter((t) => t.niche.toLowerCase() === nicheInput.toLowerCase() || t.niche === "AI & Search Marketing" || t.niche === "SEO Strategy")
            .map((trend) => (
              <div key={trend.id} className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3 relative overflow-hidden">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xs font-sans font-semibold text-slate-200 leading-snug">{trend.title}</h3>
                  <button
                    id={`btn-create-from-trend-${trend.id}`}
                    onClick={() => createCampaignFromTrend(trend)}
                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 flex items-center gap-1 text-[10px] font-sans shrink-0 transition-all"
                    title="Initialize article campaign from this trend"
                  >
                    <Plus className="w-3.5 h-3.5" /> Campaign
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">{trend.summary}</p>

                {/* Creative Angle */}
                <div className="bg-emerald-500/5 border-l-2 border-emerald-500 p-2 text-[11px] text-emerald-300/90 rounded-r leading-relaxed">
                  <strong className="text-emerald-400 block font-sans mb-0.5">Recommended Experience Angle (E-E-A-T):</strong>
                  {trend.angle}
                </div>

                {/* Grounding Web References */}
                {trend.sources && trend.sources.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Grounded Web Sources</span>
                    <div className="flex flex-col gap-1">
                      {trend.sources.map((src, sIdx) => (
                        <a
                          key={sIdx}
                          href={src.url}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          rel="noreferrer"
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 font-sans truncate hover:underline"
                        >
                          <LinkIcon className="w-3 h-3 shrink-0" />
                          {src.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

          {trends.filter((t) => t.niche.toLowerCase() === nicheInput.toLowerCase()).length === 0 && (
            <div className="text-center py-12 text-slate-500 text-xs font-sans border border-dashed border-slate-800 rounded-lg">
              No live grounding logs cached for &ldquo;{nicheInput}&rdquo;. Trigger a &ldquo;Query Live Web&rdquo; search above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
