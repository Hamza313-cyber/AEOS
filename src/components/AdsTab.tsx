import React, { useState } from "react";
import { ContentItem, AdsCopySet } from "../types";
import { Sparkles, Loader2, AlertCircle, Check, Copy, AlertTriangle, Smartphone, Monitor } from "lucide-react";
import { motion } from "motion/react";

interface AdsTabProps {
  contentItems: ContentItem[];
  selectedCampaign: ContentItem | null;
  onSelectCampaign: (item: ContentItem) => void;
  onGenerateAds: (item: ContentItem) => Promise<void>;
  isProcessing: string | null;
  addLog: (task: string, status: "info" | "success" | "warning", msg: string) => void;
}

export default function AdsTab({
  contentItems,
  selectedCampaign,
  onSelectCampaign,
  onGenerateAds,
  isProcessing,
  addLog,
}: AdsTabProps) {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    addLog("Clipboard Copy", "info", `Copied ad copy asset to dashboard clipboard.`);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const isCurrentCampaignProcessing = selectedCampaign && isProcessing === selectedCampaign.id;

  return (
    <div id="ads-tab-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Sidebar: Select Campaign */}
      <div id="ads-sidebar" className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-sans font-semibold tracking-wider text-slate-400 uppercase">Select Project</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Generate high-intent Meta Campaign text and Google responsive headlines optimized under strict search parameters.
          </p>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {contentItems.map((item) => (
              <button
                key={item.id}
                id={`btn-select-ads-${item.id}`}
                onClick={() => onSelectCampaign(item)}
                className={`w-full p-3 rounded-lg text-left border transition-all flex items-start gap-3 ${
                  selectedCampaign?.id === item.id
                    ? "bg-slate-800/80 border-indigo-500/80"
                    : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                }`}
              >
                <Sparkles className={`w-4 h-4 shrink-0 mt-0.5 ${selectedCampaign?.id === item.id ? "text-indigo-400" : "text-slate-500"}`} />
                <div className="space-y-1 min-w-0">
                  <h4 className="text-xs font-sans font-semibold text-slate-200 line-clamp-1">{item.title}</h4>
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 uppercase">
                    <span>Status: {item.status.replace("_", " ")}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Panel: Ads workspace & Live mockups */}
      <div id="ads-main-workspace" className="lg:col-span-2 space-y-6">
        {selectedCampaign ? (
          <div id="ads-content-panel" className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Campaign Ad Creatives</span>
                <h2 className="text-base font-sans font-semibold text-slate-100">{selectedCampaign.title}</h2>
              </div>

              {!selectedCampaign.adsCopy && (
                <button
                  id="btn-generate-ads-copy"
                  disabled={!!isProcessing}
                  onClick={() => onGenerateAds(selectedCampaign)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-xs font-sans font-semibold rounded flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isCurrentCampaignProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Generating Ads...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate Ad Creative Sets
                    </>
                  )}
                </button>
              )}
            </div>

            {selectedCampaign.adsCopy ? (
              <div id="ads-details-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Google Responsive Search Ads Panel */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-sans font-semibold tracking-wider text-slate-300 uppercase">
                      Google Responsive Search Ads
                    </span>
                    <span className="px-1.5 py-0.25 rounded text-[8px] bg-sky-500/10 text-sky-400 font-mono">
                      Strict Bounds
                    </span>
                  </div>

                  {/* Headlines */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Headlines (Limit: 30 chars)</span>
                    <div className="space-y-2">
                      {selectedCampaign.adsCopy.googleHeadlines.map((headline, idx) => {
                        const len = headline.length;
                        const valid = len <= 30;
                        return (
                          <div key={idx} className="p-3 bg-slate-950 rounded border border-slate-850 space-y-1.5 relative group">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono text-slate-500">Headline {idx + 1}</span>
                              <div className="flex items-center gap-2 text-[9px]">
                                <span className={`font-mono font-medium ${valid ? "text-slate-500" : "text-amber-400"}`}>
                                  {len}/30 chars
                                </span>
                                <button
                                  onClick={() => handleCopy(headline, `gh-${idx}`)}
                                  className="text-slate-400 hover:text-slate-200 transition-all"
                                  title="Copy Headline"
                                >
                                  {copiedIndex === `gh-${idx}` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                            <p className="text-xs font-sans font-semibold text-sky-400 leading-relaxed">
                              {headline}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Descriptions (Limit: 90 chars)</span>
                    <div className="space-y-2">
                      {selectedCampaign.adsCopy.googleDescriptions.map((desc, idx) => {
                        const len = desc.length;
                        const valid = len <= 90;
                        return (
                          <div key={idx} className="p-3 bg-slate-950 rounded border border-slate-850 space-y-1.5 relative group">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono text-slate-500">Description {idx + 1}</span>
                              <div className="flex items-center gap-2 text-[9px]">
                                <span className={`font-mono font-medium ${valid ? "text-slate-500" : "text-amber-400"}`}>
                                  {len}/90 chars
                                </span>
                                <button
                                  onClick={() => handleCopy(desc, `gd-${idx}`)}
                                  className="text-slate-400 hover:text-slate-200 transition-all"
                                  title="Copy Description"
                                >
                                  {copiedIndex === `gd-${idx}` ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                            <p className="text-xs font-sans text-slate-300 leading-relaxed">
                              {desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Meta Campaigns Ad Panel & Live Mockup */}
                <div className="space-y-4">
                  <span className="text-xs font-sans font-semibold tracking-wider text-slate-300 uppercase block">
                    Meta Ads (Facebook / Instagram)
                  </span>

                  {/* Primary text */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Primary Texts (High Conversions)</span>
                    <div className="space-y-2">
                      {selectedCampaign.adsCopy.metaPrimaryTexts.map((text, idx) => (
                        <div key={idx} className="p-3 bg-slate-950 rounded border border-slate-850 space-y-1.5 relative group">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono text-slate-500">Ad Copy {idx + 1}</span>
                            <button
                              onClick={() => handleCopy(text, `mp-${idx}`)}
                              className="text-slate-400 hover:text-slate-200 transition-all"
                              title="Copy Primary Text"
                            >
                              {copiedIndex === `mp-${idx}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <p className="text-xs font-sans text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Google search live render mockup */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Google Search Preview Render</span>
                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-1 font-sans">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span>Ad</span>
                        <span>•</span>
                        <span className="truncate">https://agency-ops.aeos/content-command</span>
                      </div>
                      <a href="#" className="text-sky-400 hover:underline text-sm font-semibold line-clamp-1 block">
                        {selectedCampaign.adsCopy.googleHeadlines[0] || "Headline 1"} | {selectedCampaign.adsCopy.googleHeadlines[1] || "Headline 2"}
                      </a>
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                        {selectedCampaign.adsCopy.googleDescriptions[0] || "Description 1"} {selectedCampaign.adsCopy.googleDescriptions[1] || "Description 2"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 space-y-4">
                <Sparkles className="w-12 h-12 text-slate-600 mx-auto" />
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="text-sm font-sans font-semibold text-slate-300">Generate Targeted Search & Paid Creatives</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Select a project and compile search engine responsive headlines and high-converting Meta copywriting sets with built-in parameter checks. Click the generate button above.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center text-slate-500 font-sans">
            Please select a campaign from the left sidebar to access the advertising creatives suite.
          </div>
        )}
      </div>
    </div>
  );
}
