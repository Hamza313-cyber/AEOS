import React from "react";
import { ContentItem, AgentLog } from "../types";
import { Play, Check, ShieldAlert, Zap, Loader2, Sparkles, FileText, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface DashboardTabProps {
  contentItems: ContentItem[];
  logs: AgentLog[];
  autopilot: boolean;
  setAutopilot: (val: boolean) => void;
  onApproveOutline: (item: ContentItem) => Promise<void>;
  onSelectCampaign: (item: ContentItem) => void;
  isProcessing: string | null;
}

export default function DashboardTab({
  contentItems,
  logs,
  autopilot,
  setAutopilot,
  onApproveOutline,
  onSelectCampaign,
  isProcessing,
}: DashboardTabProps) {
  const totalCampaigns = contentItems.length;
  const activeQueue = contentItems.filter((i) => i.status !== "completed").length;
  const completedCampaigns = contentItems.filter((i) => i.status === "completed").length;
  const geoOptimizationScore = totalCampaigns > 0 ? Math.round((completedCampaigns / totalCampaigns) * 100) : 0;

  return (
    <div id="dashboard-tab-container" className="space-y-8">
      {/* Metrics Banner */}
      <div id="metrics-grid" className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Content Suite Projects", value: totalCampaigns, sub: "Total campaigns active" },
          { label: "Active Queue", value: activeQueue, sub: "Needs action / generating" },
          { label: "Completed Campaigns", value: completedCampaigns, sub: "Ready for distribution" },
          { label: "AEO/GEO Citation Score", value: `${geoOptimizationScore}%`, sub: "AI Overview citable structures" },
        ].map((item, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-lg">
            <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">{item.label}</p>
            <h3 className="text-3xl font-sans font-semibold text-slate-100 mt-2">{item.value}</h3>
            <p className="text-xs text-slate-500 mt-1">{item.sub}</p>
          </div>
        ))}
      </div>

      <div id="command-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left / Middle: Autonomy Control Panel & Queue */}
        <div id="control-queue-span" className="lg:col-span-2 space-y-8">
          {/* Autonomy Panel */}
          <div id="autonomy-panel" className="bg-slate-900 border border-slate-800 rounded-lg p-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-sans font-medium text-slate-100">Autonomy Control Panel</h2>
            </div>
            
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Define how much operational control you delegate to the AEOS Content agent. 
              In both modes, content is guarded against SEO keyword density stuffing and strictly adheres to E-E-A-T and human voice criteria.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ask-Permission Mode */}
              <button
                id="btn-ask-permission"
                onClick={() => setAutopilot(false)}
                className={`p-5 rounded-lg border text-left transition-all ${
                  !autopilot
                    ? "bg-slate-800/80 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                    : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${!autopilot ? "bg-indigo-400 animate-pulse" : "bg-slate-600"}`} />
                  <h4 className="text-sm font-sans font-semibold text-slate-100">Ask-Permission Mode</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The Agent researches keyword intent and drafts a citable Content Outline first. 
                  Generation is paused until you review and approve the outline.
                </p>
              </button>

              {/* Autopilot Mode */}
              <button
                id="btn-autopilot"
                onClick={() => setAutopilot(true)}
                className={`p-5 rounded-lg border text-left transition-all ${
                  autopilot
                    ? "bg-slate-800/80 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                    : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${autopilot ? "bg-indigo-400 animate-pulse" : "bg-slate-600"}`} />
                  <h4 className="text-sm font-sans font-semibold text-slate-100 flex items-center gap-1.5">
                    Autopilot Mode <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  </h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fully autonomous content strategy execution. Entering a keyword instantly triggers trend-lookup, outline mapping, drafting, and full distribution compiling.
                </p>
              </button>
            </div>
          </div>

          {/* Active Campaigns Pipeline */}
          <div id="campaigns-pipeline" className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h2 className="text-lg font-sans font-medium text-slate-100 mb-4">Active Operations Queue</h2>
            
            <div className="divide-y divide-slate-800">
              {contentItems.map((item) => {
                const isItemProcessing = isProcessing === item.id;
                return (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-sans font-medium text-slate-200 hover:text-indigo-400 cursor-pointer" onClick={() => onSelectCampaign(item)}>
                          {item.title}
                        </span>
                        {item.status === "completed" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Completed
                          </span>
                        )}
                        {item.status === "outline_pending" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Awaiting Outline Approval
                          </span>
                        )}
                        {item.status === "writing" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                            <Loader2 className="w-2.5 h-2.5 animate-spin" /> Drafting
                          </span>
                        )}
                        {item.status === "draft" && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                            Research
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 max-w-xl">{item.topic}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                        <span>Keywords: {item.keywords.join(", ")}</span>
                        <span>•</span>
                        <span>Audience: {item.audience}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                      <button
                        onClick={() => onSelectCampaign(item)}
                        className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 flex items-center gap-1 transition-all"
                      >
                        <FileText className="w-3 h-3" /> View Detail
                      </button>

                      {item.status === "outline_pending" && (
                        <button
                          disabled={!!isProcessing}
                          onClick={() => onApproveOutline(item)}
                          className="px-3 py-1.5 rounded bg-indigo-600 text-slate-100 text-xs hover:bg-indigo-500 flex items-center gap-1.5 font-sans font-medium transition-all disabled:opacity-50"
                        >
                          {isItemProcessing ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Writing...
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Approve & Write
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {contentItems.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No active projects. Use the Research or Articles tab to create one.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Live Agent Activity Logs */}
        <div id="logs-panel" className="bg-slate-900 border border-slate-800 rounded-lg p-6 flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-sans font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Autonomous Operations
            </h2>
            <span className="text-[10px] font-mono text-slate-500">Live Telemetry</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
            {logs.map((log) => (
              <div key={log.id} className="text-xs space-y-1">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-500">{log.timestamp}</span>
                  <span
                    className={`px-1.5 py-0.25 rounded text-[9px] font-semibold tracking-wider uppercase ${
                      log.status === "success"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : log.status === "warning"
                        ? "bg-amber-500/10 text-amber-400"
                        : log.status === "info"
                        ? "bg-indigo-500/10 text-indigo-400"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {log.task}
                  </span>
                </div>
                <p className="text-slate-300 font-sans leading-relaxed pl-1.5 border-l border-slate-800">
                  {log.message}
                </p>
              </div>
            ))}

            {logs.length === 0 && (
              <div className="text-center py-12 text-slate-600 font-mono text-xs">
                System initialized. Waiting for task triggers...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
