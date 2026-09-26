import { apiFetch } from "./api";
import React, { useState, useEffect } from "react";
import { ContentItem, TrendingTopic, KeywordResearch, AgentLog } from "./types";
import {
  DEFAULT_TRENDS,
  DEFAULT_KEYWORDS,
  DEFAULT_LOGS,
  DEFAULT_CONTENT,
} from "./utils";
import DashboardTab from "./components/DashboardTab";
import ResearchTab from "./components/ResearchTab";
import ArticleTab from "./components/ArticleTab";
import DistributionTab from "./components/DistributionTab";
import AdsTab from "./components/AdsTab";
import { LayoutDashboard, Compass, BookOpen, Share2, Sparkles, Terminal, FileText, AlertTriangle } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "research" | "articles" | "distribution" | "ads">("dashboard");

  // Persistent States
  const [contentItems, setContentItems] = useState<ContentItem[]>(() => {
    try {
      const saved = localStorage.getItem("aeos_campaigns");
      return saved ? JSON.parse(saved) : DEFAULT_CONTENT;
    } catch {
      return DEFAULT_CONTENT;
    }
  });

  const [trends, setTrends] = useState<TrendingTopic[]>(() => {
    try {
      const saved = localStorage.getItem("aeos_trends");
      return saved ? JSON.parse(saved) : DEFAULT_TRENDS;
    } catch {
      return DEFAULT_TRENDS;
    }
  });

  const [keywords, setKeywords] = useState<KeywordResearch[]>(() => {
    try {
      const saved = localStorage.getItem("aeos_keywords");
      return saved ? JSON.parse(saved) : DEFAULT_KEYWORDS;
    } catch {
      return DEFAULT_KEYWORDS;
    }
  });

  const [logs, setLogs] = useState<AgentLog[]>(() => {
    try {
      const saved = localStorage.getItem("aeos_logs");
      return saved ? JSON.parse(saved) : DEFAULT_LOGS;
    } catch {
      return DEFAULT_LOGS;
    }
  });

  const [autopilot, setAutopilot] = useState<boolean>(() => {
    const saved = localStorage.getItem("aeos_autopilot");
    return saved ? saved === "true" : false; // Default is Ask-Permission (false)
  });

  const [selectedCampaign, setSelectedCampaign] = useState<ContentItem | null>(() => {
    return contentItems.length > 0 ? contentItems[0] : null;
  });

  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem("aeos_campaigns", JSON.stringify(contentItems));
  }, [contentItems]);

  useEffect(() => {
    localStorage.setItem("aeos_trends", JSON.stringify(trends));
  }, [trends]);

  useEffect(() => {
    localStorage.setItem("aeos_keywords", JSON.stringify(keywords));
  }, [keywords]);

  useEffect(() => {
    localStorage.setItem("aeos_logs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem("aeos_autopilot", autopilot ? "true" : "false");
  }, [autopilot]);

  // Log prepend helper
  const addLog = (task: string, status: "info" | "success" | "warning", message: string) => {
    const freshLog: AgentLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      task,
      status,
      message,
    };
    setLogs((prev) => [freshLog, ...prev.slice(0, 49)]);
  };

  // 1. Trigger Manual SEO Outline Generation (Ask-Permission flow)
  const handleGenerateOutline = async (item: ContentItem) => {
    setIsProcessing(item.id);
    addLog("SEO Planning", "info", `Compiling search signals and citable GEO triggers for "${item.title}"...`);
    try {
      const res = await apiFetch("/api/outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: item.topic,
          keywords: item.keywords,
          audience: item.audience,
          eeatPoints: item.eeatPoints,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Outline composition failed");
      }

      const outline = await res.json();

      setContentItems((prev) => {
        const updated = prev.map((c) =>
          c.id === item.id ? { ...c, outline, status: "outline_pending" as const } : c
        );
        const active = updated.find((c) => c.id === item.id);
        if (active) setSelectedCampaign(active);
        return updated;
      });

      addLog(
        "SEO Planning",
        "success",
        `Created search-intent outline brief for "${item.title}". Awaiting manual approval.`
      );
    } catch (err: any) {
      console.error(err);
      addLog("SEO Planning", "warning", `Outline generation halted: ${err.message}`);
    } finally {
      setIsProcessing(null);
    }
  };

  // 2. Trigger Manual Full Compose-Draft Execution from outline (Ask-Permission flow)
  const handleApproveOutline = async (item: ContentItem) => {
    setIsProcessing(item.id);
    addLog("Article Drafting", "info", `Outline approved. Triggering professional copywriter for "${item.title}"...`);
    try {
      // Set temporary state status
      setContentItems((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, status: "writing" as const } : c))
      );

      // Step A: Compose full Article
      const writeRes = await apiFetch("/api/write-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: item.topic,
          keywords: item.keywords,
          audience: item.audience,
          eeatPoints: item.eeatPoints,
          outline: item.outline,
        }),
      });

      if (!writeRes.ok) {
        const errData = await writeRes.json();
        throw new Error(errData.error || "Article drafting failed");
      }

      const { articleBody } = await writeRes.json();
      addLog(
        "Article Drafting",
        "success",
        `Composed full-length human-voice article body (~${articleBody.split(" ").length} words) for "${item.title}".`
      );

      // Step B: Auto-compile multi-channel social distribution
      addLog("Distribution Setup", "info", `Formatting platform-native posts and video story script...`);
      const distRes = await apiFetch("/api/write-distribution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleBody, topic: item.topic }),
      });

      let socialPosts = undefined;
      let videoScript = undefined;
      if (distRes.ok) {
        const distData = await distRes.json();
        socialPosts = distData.socialPosts;
        videoScript = distData.videoScript;
        addLog("Distribution Setup", "success", `Social distributions & visual video script successfully compiled.`);
      }

      // Step C: Auto-compile campaign ads copy
      addLog("Ads Generation", "info", `Drafting search responsive Headlines and Meta copy sets...`);
      const adsRes = await apiFetch("/api/write-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: item.title,
          productDescription: item.topic,
          audience: item.audience,
        }),
      });

      let adsCopy = undefined;
      if (adsRes.ok) {
        adsCopy = await adsRes.json();
        addLog("Ads Generation", "success", `Meta & Google Search Ads character sets ready.`);
      }

      // Complete operations and save
      setContentItems((prev) => {
        const updated = prev.map((c) =>
          c.id === item.id
            ? {
                ...c,
                articleBody,
                socialPosts,
                videoScript,
                adsCopy,
                status: "completed" as const,
              }
            : c
        );
        const active = updated.find((c) => c.id === item.id);
        if (active) setSelectedCampaign(active);
        return updated;
      });

      addLog("Operations Complete", "success", `Campaign package "${item.title}" successfully finalized.`);
    } catch (err: any) {
      console.error(err);
      addLog("Article Drafting", "warning", `Composing run halted: ${err.message}`);
      // Revert status to outline pending to allow retry
      setContentItems((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, status: "outline_pending" as const } : c))
      );
    } finally {
      setIsProcessing(null);
    }
  };

  // 3. Manual compile distribution package if not already done
  const handleCompileDistributionOnly = async (item: ContentItem) => {
    if (!item.articleBody) return;
    setIsProcessing(item.id);
    addLog("Distribution Setup", "info", `Compiling custom platform copy elements...`);
    try {
      const distRes = await apiFetch("/api/write-distribution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleBody: item.articleBody, topic: item.topic }),
      });

      if (!distRes.ok) {
        const errData = await distRes.json();
        throw new Error(errData.error || "Distribution package compiling failed");
      }

      const distData = await distRes.json();

      setContentItems((prev) => {
        const updated = prev.map((c) =>
          c.id === item.id
            ? {
                ...c,
                socialPosts: distData.socialPosts,
                videoScript: distData.videoScript,
              }
            : c
        );
        const active = updated.find((c) => c.id === item.id);
        if (active) setSelectedCampaign(active);
        return updated;
      });

      addLog("Distribution Setup", "success", `Channel assets & multimedia script created for "${item.title}".`);
    } catch (err: any) {
      console.error(err);
      addLog("Distribution Setup", "warning", `Distribution compiler failed: ${err.message}`);
    } finally {
      setIsProcessing(null);
    }
  };

  // 4. Manual compile ads sets if not already done
  const handleCompileAdsOnly = async (item: ContentItem) => {
    setIsProcessing(item.id);
    addLog("Ads Generation", "info", `Compiling campaign ad sets for "${item.title}"...`);
    try {
      const adsRes = await apiFetch("/api/write-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: item.title,
          productDescription: item.topic,
          audience: item.audience,
        }),
      });

      if (!adsRes.ok) {
        const errData = await adsRes.json();
        throw new Error(errData.error || "Ad set compiling failed");
      }

      const adsCopy = await adsRes.json();

      setContentItems((prev) => {
        const updated = prev.map((c) => (c.id === item.id ? { ...c, adsCopy } : c));
        const active = updated.find((c) => c.id === item.id);
        if (active) setSelectedCampaign(active);
        return updated;
      });

      addLog("Ads Generation", "success", `Ad campaign elements ready for "${item.title}".`);
    } catch (err: any) {
      console.error(err);
      addLog("Ads Generation", "warning", `Paid ads compiler failed: ${err.message}`);
    } finally {
      setIsProcessing(null);
    }
  };

  // 5. Add / Trigger Campaign setup (Autopilot vs Ask-Permission)
  const handleAddCampaign = async (campaignData: Partial<ContentItem>) => {
    const newItem: ContentItem = {
      id: `item-${Date.now()}`,
      title: campaignData.title || "Untitled Project",
      topic: campaignData.topic || "",
      keywords: campaignData.keywords || [],
      audience: campaignData.audience || "General Professional",
      eeatPoints: campaignData.eeatPoints || "",
      status: autopilot ? ("writing" as const) : ("draft" as const),
      createdAt: new Date().toISOString(),
    };

    setContentItems((prev) => [newItem, ...prev]);
    setSelectedCampaign(newItem);

    if (autopilot) {
      setIsProcessing(newItem.id);
      addLog("Autopilot Run", "info", `Initializing full autopilot cascade for "${newItem.title}"...`);
      try {
        // Step A: Create Outline
        addLog("Autopilot Run", "info", `[Step 1/4] Formulating search intents and experience maps...`);
        const outRes = await apiFetch("/api/outline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: newItem.topic,
            keywords: newItem.keywords,
            audience: newItem.audience,
            eeatPoints: newItem.eeatPoints,
          }),
        });
        if (!outRes.ok) throw new Error("Outline mapping failed");
        const outline = await outRes.json();

        // Step B: Compose full article
        addLog("Autopilot Run", "info", `[Step 2/4] Writing comprehensive E-E-A-T editorial draft...`);
        const writeRes = await apiFetch("/api/write-article", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: newItem.topic,
            keywords: newItem.keywords,
            audience: newItem.audience,
            eeatPoints: newItem.eeatPoints,
            outline,
          }),
        });
        if (!writeRes.ok) throw new Error("Article write failed");
        const { articleBody } = await writeRes.json();

        // Step C: Compile platform distributions
        addLog("Autopilot Run", "info", `[Step 3/4] Structuring native channel posts and multimedia storyboarding...`);
        const distRes = await apiFetch("/api/write-distribution", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ articleBody, topic: newItem.topic }),
        });
        let socialPosts = undefined;
        let videoScript = undefined;
        if (distRes.ok) {
          const distData = await distRes.json();
          socialPosts = distData.socialPosts;
          videoScript = distData.videoScript;
        }

        // Step D: Compile character checks Google & Meta Ads sets
        addLog("Autopilot Run", "info", `[Step 4/4] Composing Google PPC and Meta social ad copies...`);
        const adsRes = await apiFetch("/api/write-ads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: newItem.title,
            productDescription: newItem.topic,
            audience: newItem.audience,
          }),
        });
        let adsCopy = undefined;
        if (adsRes.ok) {
          adsCopy = await adsRes.json();
        }

        // Save complete compiled package
        setContentItems((prev) => {
          const updated = prev.map((c) =>
            c.id === newItem.id
              ? {
                  ...c,
                  outline,
                  articleBody,
                  socialPosts,
                  videoScript,
                  adsCopy,
                  status: "completed" as const,
                }
              : c
          );
          const active = updated.find((c) => c.id === newItem.id);
          if (active) setSelectedCampaign(active);
          return updated;
        });

        addLog("Autopilot Complete", "success", `Project "${newItem.title}" generated successfully with full distribution assets.`);
      } catch (err: any) {
        console.error(err);
        addLog("Autopilot Run", "warning", `Autopilot sequence failed: ${err.message}`);
        // Revert to manual draft status to permit retry
        setContentItems((prev) =>
          prev.map((c) => (c.id === newItem.id ? { ...c, status: "draft" as const } : c))
        );
      } finally {
        setIsProcessing(null);
      }
    } else {
      addLog("Campaign Setup", "info", `Campaign project "${newItem.title}" added to pipeline in Draft status.`);
    }
  };

  const handleCampaignSelectedFromOtherTabs = (item: ContentItem) => {
    setSelectedCampaign(item);
    setActiveTab("articles");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950 py-4 px-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-md shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <Terminal className="w-5 h-5 text-slate-100" />
            </div>
            <div>
              <h1 className="text-md font-sans font-semibold tracking-tight text-slate-100">AEOS Content Command</h1>
              <p className="text-[10px] text-slate-500 font-mono">Autonomous Content & SEO Suite • Single Operator</p>
            </div>
          </div>

          {/* Central Navigation Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto">
            {[
              { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: "research", label: "Research Grounding", icon: <Compass className="w-4 h-4" /> },
              { id: "articles", label: "Articles & Editorial", icon: <BookOpen className="w-4 h-4" /> },
              { id: "distribution", label: "Socials & Scripts", icon: <Share2 className="w-4 h-4" /> },
              { id: "ads", label: "Campaign Ads", icon: <Sparkles className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === "dashboard" && selectedCampaign === null && contentItems.length > 0) {
                    setSelectedCampaign(contentItems[0]);
                  }
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-sans transition-all shrink-0 ${
                  activeTab === tab.id
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 font-semibold"
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 py-8 px-6 max-w-7xl w-full mx-auto">
        {activeTab === "dashboard" && (
          <DashboardTab
            contentItems={contentItems}
            logs={logs}
            autopilot={autopilot}
            setAutopilot={setAutopilot}
            onApproveOutline={handleApproveOutline}
            onSelectCampaign={handleCampaignSelectedFromOtherTabs}
            isProcessing={isProcessing}
          />
        )}

        {activeTab === "research" && (
          <ResearchTab
            onAddCampaign={handleAddCampaign}
            trends={trends}
            setTrends={setTrends}
            keywords={keywords}
            setKeywords={setKeywords}
            addLog={addLog}
            onSetTab={setActiveTab}
          />
        )}

        {activeTab === "articles" && (
          <ArticleTab
            contentItems={contentItems}
            selectedCampaign={selectedCampaign}
            onSelectCampaign={setSelectedCampaign}
            onAddCampaign={handleAddCampaign}
            onGenerateOutline={handleGenerateOutline}
            onApproveOutline={handleApproveOutline}
            isProcessing={isProcessing}
          />
        )}

        {activeTab === "distribution" && (
          <DistributionTab
            contentItems={contentItems}
            selectedCampaign={selectedCampaign}
            onSelectCampaign={setSelectedCampaign}
            onCompileDistribution={handleCompileDistributionOnly}
            isProcessing={isProcessing}
            addLog={addLog}
          />
        )}

        {activeTab === "ads" && (
          <AdsTab
            contentItems={contentItems}
            selectedCampaign={selectedCampaign}
            onSelectCampaign={setSelectedCampaign}
            onGenerateAds={handleCompileAdsOnly}
            isProcessing={isProcessing}
            addLog={addLog}
          />
        )}
      </main>

      {/* Humble Elegant Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 mt-12 text-center text-[10px] text-slate-600 font-mono">
        AEOS Content Command © 2026 • Powered by Google Search Grounded Gemini Flash Models • Offline Local Persistence Active
      </footer>
    </div>
  );
}
