import React, { useState } from "react";
import { ContentItem, SocialDistribution, VideoScript } from "../types";
import { Share2, Linkedin, Twitter, Facebook, Instagram, Video, Copy, Check, Loader2, Sparkles, MessageSquare } from "lucide-react";
import { motion } from "motion/react";

interface DistributionTabProps {
  contentItems: React.ReactNode | ContentItem[];
  selectedCampaign: ContentItem | null;
  onSelectCampaign: (item: ContentItem) => void;
  onCompileDistribution: (item: ContentItem) => Promise<void>;
  isProcessing: string | null;
  addLog: (task: string, status: "info" | "success" | "warning", msg: string) => void;
}

export default function DistributionTab({
  contentItems,
  selectedCampaign,
  onSelectCampaign,
  onCompileDistribution,
  isProcessing,
  addLog,
}: DistributionTabProps) {
  const [activeChannel, setActiveChannel] = useState<"linkedin" | "twitter" | "facebook" | "instagram" | "video">("linkedin");
  const [copiedText, setCopiedText] = useState(false);

  // Cast contentItems securely
  const campaigns = Array.isArray(contentItems) ? contentItems : [];
  const completedCampaigns = campaigns.filter((i) => i.status === "completed");

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    addLog("Copy Clipboard", "info", `Copied active channel copywriting assets to dashboard clipboard.`);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const getActiveSocialText = () => {
    if (!selectedCampaign || !selectedCampaign.socialPosts) return "";
    const posts = selectedCampaign.socialPosts;
    switch (activeChannel) {
      case "linkedin":
        return posts.linkedin || "";
      case "twitter":
        return posts.twitter || "";
      case "facebook":
        return posts.facebook || "";
      case "instagram":
        return posts.instagram || "";
      default:
        return "";
    }
  };

  const isCurrentCampaignProcessing = selectedCampaign && isProcessing === selectedCampaign.id;

  return (
    <div id="distribution-tab-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Sidebar: Select completed campaign */}
      <div id="campaign-picker-side" className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-sans font-semibold tracking-wider text-slate-400 uppercase">Completed Campaigns</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Select a completed article to design platform-native social threads, stories, and multimedia video scripts.
          </p>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {completedCampaigns.map((item) => (
              <button
                key={item.id}
                id={`btn-select-completed-${item.id}`}
                onClick={() => onSelectCampaign(item)}
                className={`w-full p-3 rounded-lg text-left border transition-all flex items-start gap-3 ${
                  selectedCampaign?.id === item.id
                    ? "bg-slate-800/80 border-indigo-500/80"
                    : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                }`}
              >
                <Share2 className={`w-4 h-4 shrink-0 mt-0.5 ${selectedCampaign?.id === item.id ? "text-indigo-400" : "text-slate-500"}`} />
                <div className="space-y-1 min-w-0">
                  <h4 className="text-xs font-sans font-semibold text-slate-200 line-clamp-1">{item.title}</h4>
                  <div className="flex items-center gap-1 text-[9px] font-mono text-slate-500">
                    <span>Platform Native</span>
                    <span>•</span>
                    <span>EEAT Scored</span>
                  </div>
                </div>
              </button>
            ))}

            {completedCampaigns.length === 0 && (
              <div className="text-center py-8 text-slate-600 text-xs font-mono">
                No completed articles yet. Draft and complete an article first in the Articles tab.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Panel: Channels, Copy View, Script dual columns */}
      <div id="distribution-workspace-main" className="lg:col-span-2 space-y-6">
        {selectedCampaign ? (
          <div id="active-distribution-panel" className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Multi-Channel Distribution</span>
                <h2 className="text-base font-sans font-semibold text-slate-100">{selectedCampaign.title}</h2>
              </div>

              {!selectedCampaign.socialPosts && (
                <button
                  id="btn-compile-distribution"
                  disabled={!!isProcessing}
                  onClick={() => onCompileDistribution(selectedCampaign)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-xs font-sans font-semibold rounded flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isCurrentCampaignProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Compiling Distribution...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Compile Channels & Video Script
                    </>
                  )}
                </button>
              )}
            </div>

            {selectedCampaign.socialPosts ? (
              <div className="space-y-6">
                {/* Channel Selector Tabs */}
                <div className="flex flex-wrap gap-1 border-b border-slate-800 pb-2">
                  {[
                    { id: "linkedin", label: "LinkedIn", icon: <Linkedin className="w-3.5 h-3.5" /> },
                    { id: "twitter", label: "X Thread", icon: <Twitter className="w-3.5 h-3.5" /> },
                    { id: "facebook", label: "Facebook", icon: <Facebook className="w-3.5 h-3.5" /> },
                    { id: "instagram", label: "Instagram", icon: <Instagram className="w-3.5 h-3.5" /> },
                    { id: "video", label: "Video/Reels Script", icon: <Video className="w-3.5 h-3.5" /> },
                  ].map((chan) => (
                    <button
                      key={chan.id}
                      id={`tab-channel-${chan.id}`}
                      onClick={() => {
                        setActiveChannel(chan.id as any);
                        setCopiedText(false);
                      }}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-t text-xs font-sans transition-all ${
                        activeChannel === chan.id
                          ? "bg-slate-800 border-b-2 border-indigo-500 text-slate-100"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {chan.icon}
                      {chan.label}
                    </button>
                  ))}
                </div>

                {/* Content Box for Social Posts */}
                {activeChannel !== "video" ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                        {activeChannel} Copy Blueprint
                      </span>
                      <button
                        id="btn-copy-social-text"
                        onClick={() => handleCopy(getActiveSocialText())}
                        className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 flex items-center gap-1 transition-all border border-slate-700"
                      >
                        {copiedText ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy Copywriting
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-slate-950 p-5 rounded-lg border border-slate-800/80 max-h-[360px] overflow-y-auto font-sans text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">
                      {getActiveSocialText()}
                    </div>
                  </div>
                ) : (
                  /* Multimedia / Video Script Dual Column Reader */
                  <div id="video-script-workspace" className="space-y-5">
                    {selectedCampaign.videoScript && (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Multimedia Director View</span>
                            <h3 className="text-xs font-sans font-semibold text-slate-300 mt-0.5">
                              Hook: &ldquo;{selectedCampaign.videoScript.hook}&rdquo;
                            </h3>
                          </div>
                        </div>

                        {/* Dual Column Script Layout */}
                        <div className="border border-slate-850 rounded-lg divide-y divide-slate-800/80 bg-slate-950/60 overflow-hidden">
                          {/* Header row */}
                          <div className="grid grid-cols-3 bg-slate-950 text-[10px] font-mono uppercase text-slate-500 border-b border-slate-800">
                            <div className="p-3 border-r border-slate-800">Production Type</div>
                            <div className="p-3 col-span-2">Scene Directives & Narration</div>
                          </div>

                          {/* Data rows */}
                          {selectedCampaign.videoScript.scriptLines.map((line, lIdx) => (
                            <div key={lIdx} className="grid grid-cols-3 text-xs">
                              <div className="p-3 border-r border-slate-800 font-mono flex items-center">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                                    line.type === "visual"
                                      ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                                      : line.type === "audio"
                                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                      : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                  }`}
                                >
                                  {line.type}
                                </span>
                              </div>
                              <div className="p-3 col-span-2 font-sans leading-relaxed text-slate-300">
                                {line.content}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/10 rounded-lg text-xs leading-relaxed text-indigo-300">
                          <strong className="text-indigo-400 block font-sans mb-1 uppercase tracking-wider text-[10px]">Compelling Call to Action:</strong>
                          {selectedCampaign.videoScript.callToAction}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 space-y-4">
                <MessageSquare className="w-12 h-12 text-slate-600 mx-auto" />
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="text-sm font-sans font-semibold text-slate-300">Generate Native Copy Distribution Packs</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Once an article is completed, the agent will analyze its core semantic structure and compose targeted copywriting packages for LinkedIn, X (Twitter), Facebook, Instagram, and a dual-column video script.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center text-slate-500 font-sans">
            Please select a completed campaign from the left sidebar to access the distribution workspace.
          </div>
        )}
      </div>
    </div>
  );
}
