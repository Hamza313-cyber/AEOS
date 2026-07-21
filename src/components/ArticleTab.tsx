import React, { useState } from "react";
import { ContentItem, ContentOutline } from "../types";
import { FileText, Plus, Check, Loader2, Sparkles, BookOpen, AlertTriangle, Eye, ShieldCheck, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

interface ArticleTabProps {
  contentItems: ContentItem[];
  selectedCampaign: ContentItem | null;
  onSelectCampaign: (item: ContentItem) => void;
  onAddCampaign: (item: Partial<ContentItem>) => void;
  onGenerateOutline: (item: ContentItem) => Promise<void>;
  onApproveOutline: (item: ContentItem) => Promise<void>;
  isProcessing: string | null;
}

// Simple client-side Markdown to JSX converter to avoid package issues
function renderMarkdown(text: string) {
  if (!text) return null;
  
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    // Headers
    if (line.startsWith("# ")) {
      return <h1 key={idx} className="text-2xl font-sans font-bold text-slate-100 mt-6 mb-4">{line.slice(2)}</h1>;
    }
    if (line.startsWith("## ")) {
      return <h2 key={idx} className="text-lg font-sans font-semibold text-slate-100 mt-5 mb-3 border-b border-slate-800 pb-1">{line.slice(3)}</h2>;
    }
    if (line.startsWith("### ")) {
      return <h3 key={idx} className="text-base font-sans font-medium text-slate-200 mt-4 mb-2">{line.slice(4)}</h3>;
    }
    
    // Bullet points
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return <li key={idx} className="ml-5 list-disc text-slate-300 text-xs leading-relaxed my-1">{line.slice(2)}</li>;
    }

    // Bold tags or standard block highlight for requires verification
    if (line.includes("[Requires Verification:")) {
      const parts = line.split(/(\[Requires Verification:.*?\])/);
      return (
        <p key={idx} className="text-xs text-slate-300 leading-relaxed my-3 font-sans">
          {parts.map((part, pIdx) => {
            if (part.startsWith("[Requires Verification:")) {
              return (
                <span key={pIdx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-[10px] mx-1 my-0.5">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  {part}
                </span>
              );
            }
            return part;
          })}
        </p>
      );
    }

    // Standard empty line
    if (!line.trim()) {
      return <div key={idx} className="h-2" />;
    }

    // Standard paragraph
    return <p key={idx} className="text-xs text-slate-300 leading-relaxed my-3 font-sans">{line}</p>;
  });
}

export default function ArticleTab({
  contentItems,
  selectedCampaign,
  onSelectCampaign,
  onAddCampaign,
  onGenerateOutline,
  onApproveOutline,
  isProcessing,
}: ArticleTabProps) {
  // New Campaign Form State
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [keywordsInput, setKeywordsInput] = useState("");
  const [audience, setAudience] = useState("");
  const [eeatPoints, setEeatPoints] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Verification checks tracking
  const [checkedFacts, setCheckedFacts] = useState<Record<string, boolean>>({});

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !topic) return;

    const keywords = keywordsInput
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const freshCampaign: Partial<ContentItem> = {
      title,
      topic,
      keywords,
      audience: audience || "General Professional",
      eeatPoints,
      status: "draft"
    };

    onAddCampaign(freshCampaign);
    setTitle("");
    setTopic("");
    setKeywordsInput("");
    setAudience("");
    setEeatPoints("");
    setShowCreateForm(false);
  };

  const toggleFactCheck = (key: string) => {
    setCheckedFacts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isCurrentCampaignProcessing = selectedCampaign && isProcessing === selectedCampaign.id;

  return (
    <div id="article-workspace-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Sidebar: Campaigns Selection & Create form */}
      <div id="campaigns-list-panel" className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-sans font-semibold tracking-wider text-slate-400 uppercase">Campaign Hub</h2>
            <button
              id="btn-toggle-create-form"
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-2 py-1 rounded bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 text-[11px] font-sans font-semibold flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> New Project
            </button>
          </div>

          {/* New Campaign Creation Form */}
          {showCreateForm && (
            <form onSubmit={handleCreateCampaign} className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Headline Concept</label>
                <input
                  id="form-title"
                  type="text"
                  required
                  placeholder="e.g. Demystifying Generative Search SEO"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Core Topic Angle</label>
                <textarea
                  id="form-topic"
                  required
                  rows={2}
                  placeholder="What is this article about?"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-indigo-500 font-sans resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Keywords (Comma-separated)</label>
                <input
                  id="form-keywords"
                  type="text"
                  placeholder="e.g. AEO SEO, topical authority"
                  value={keywordsInput}
                  onChange={(e) => setKeywordsInput(e.target.value)}
                  className="w-full px-3.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Target Audience</label>
                  <input
                    id="form-audience"
                    type="text"
                    placeholder="e.g. CTOs, Founders"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full px-3.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  E-E-A-T Evidence (Experience/Expertise)
                </label>
                <textarea
                  id="form-eeat"
                  rows={2}
                  placeholder="e.g. Our team analyzed 35 schema templates. Share real metrics."
                  value={eeatPoints}
                  onChange={(e) => setEeatPoints(e.target.value)}
                  className="w-full px-3.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-indigo-500 font-sans resize-none"
                />
              </div>

              <button
                id="btn-submit-campaign"
                type="submit"
                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-xs font-sans font-semibold rounded transition-all"
              >
                Create Project Outline
              </button>
            </form>
          )}

          {/* Campaigns Lists */}
          <div id="campaign-list-scroller" className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {contentItems.map((item) => (
              <button
                key={item.id}
                id={`btn-select-campaign-${item.id}`}
                onClick={() => {
                  onSelectCampaign(item);
                  setCheckedFacts({});
                }}
                className={`w-full p-3 rounded-lg text-left border transition-all flex items-start gap-3 ${
                  selectedCampaign?.id === item.id
                    ? "bg-slate-800/80 border-indigo-500/80"
                    : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                }`}
              >
                <FileText className={`w-4 h-4 shrink-0 mt-0.5 ${selectedCampaign?.id === item.id ? "text-indigo-400" : "text-slate-500"}`} />
                <div className="space-y-1 min-w-0">
                  <h4 className="text-xs font-sans font-semibold text-slate-200 line-clamp-1">{item.title}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{item.topic}</p>
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 uppercase">
                    <span>Status: {item.status.replace("_", " ")}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Center & Right: Document Editor / Planning Panel */}
      <div id="document-workspace-span" className="lg:col-span-2 space-y-6">
        {selectedCampaign ? (
          <div id="active-campaign-wrapper" className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
            {/* Title Block */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Active Workspace</span>
                <h2 className="text-lg font-sans font-semibold text-slate-100">{selectedCampaign.title}</h2>
                <p className="text-xs text-slate-400">{selectedCampaign.topic}</p>
              </div>

              {/* Action Buttons based on status */}
              <div className="shrink-0">
                {selectedCampaign.status === "draft" && (
                  <button
                    id="btn-generate-outline"
                    disabled={!!isProcessing}
                    onClick={() => onGenerateOutline(selectedCampaign)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-slate-100 text-xs font-sans font-semibold rounded flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isCurrentCampaignProcessing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Generating Brief...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate SEO Outline
                      </>
                    )}
                  </button>
                )}

                {selectedCampaign.status === "outline_pending" && (
                  <button
                    id="btn-approve-write"
                    disabled={!!isProcessing}
                    onClick={() => onApproveOutline(selectedCampaign)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-100 text-xs font-sans font-semibold rounded flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isCurrentCampaignProcessing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Writing Article...
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Approve & Compose Draft
                      </>
                    )}
                  </button>
                )}

                {selectedCampaign.status === "completed" && (
                  <span className="px-3 py-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-sans font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Ready for Distribution
                  </span>
                )}
              </div>
            </div>

            {/* Content Display: Outline vs Final Draft */}
            {selectedCampaign.status === "draft" && (
              <div className="text-center py-12 space-y-4">
                <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="text-sm font-sans font-semibold text-slate-300">Ready to build Content Blueprint</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    The agent will analyze the topic against target intents, build an E-E-A-T presentation blueprint, and map citable GEO headers. Click the generate button above to start.
                  </p>
                </div>
              </div>
            )}

            {/* Outline Brief stage */}
            {selectedCampaign.status === "outline_pending" && selectedCampaign.outline && (
              <div id="outline-brief-container" className="space-y-6">
                <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-5 space-y-4">
                  <h3 className="text-xs font-mono font-semibold tracking-wider text-indigo-400 uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Autonomous Content Outline & Strategy
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div className="space-y-1">
                      <strong className="text-slate-300 font-sans block">Audience Alignment:</strong>
                      <p className="text-slate-400 leading-relaxed">{selectedCampaign.outline.targetAudience}</p>
                    </div>
                    <div className="space-y-1">
                      <strong className="text-slate-300 font-sans block">Suggested Word Count:</strong>
                      <p className="text-slate-400">{selectedCampaign.outline.suggestedWordCount} words (focused on semantic depth)</p>
                    </div>
                    <div className="space-y-1">
                      <strong className="text-slate-300 font-sans block">Experience Integration Strategy (E-E-A-T):</strong>
                      <p className="text-slate-400 leading-relaxed">{selectedCampaign.outline.eeatStrategy}</p>
                    </div>
                    <div className="space-y-1">
                      <strong className="text-slate-300 font-sans block">Answer Overview (GEO) Strategy:</strong>
                      <p className="text-slate-400 leading-relaxed">{selectedCampaign.outline.aeoGeoStrategy}</p>
                    </div>
                  </div>
                </div>

                {/* Outline structure */}
                <div className="space-y-3">
                  <h4 className="text-xs font-sans font-semibold text-slate-200 uppercase tracking-wider">Heading Structure & Intent Mapping</h4>
                  <div className="border border-slate-800 rounded-lg divide-y divide-slate-800 bg-slate-950/40">
                    {selectedCampaign.outline.headings.map((heading, hIdx) => (
                      <div key={hIdx} className="p-3 flex items-start justify-between gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-500">H{heading.depth}</span>
                          <span className="font-sans font-medium text-slate-200">{heading.title}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[9px] text-slate-400 font-mono tracking-wider uppercase">
                          {heading.intent}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Takeaways */}
                <div className="space-y-2">
                  <h4 className="text-xs font-sans font-semibold text-slate-200 uppercase tracking-wider">Key Takeaway Core Syntheses</h4>
                  <ul className="space-y-1.5">
                    {selectedCampaign.outline.keyTakeaways.map((takeaway, tIdx) => (
                      <li key={tIdx} className="flex items-start gap-2 text-xs text-slate-400 leading-relaxed">
                        <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        {takeaway}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Factual claim verification checklist */}
                {selectedCampaign.outline.verificationChecklist && (
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-5 space-y-3">
                    <h4 className="text-xs font-sans font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Critical Anti-Hallucination Fact Verification Checklist
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      To comply with the strict anti-hallucination mandate, you must review these specific assertions before compose-generation or publishing.
                    </p>
                    <div className="space-y-2">
                      {selectedCampaign.outline.verificationChecklist.map((check, cIdx) => (
                        <div key={cIdx} className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            id={`check-fact-${cIdx}`}
                            checked={!!checkedFacts[check]}
                            onChange={() => toggleFactCheck(check)}
                            className="w-3.5 h-3.5 rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-0 mt-0.5 cursor-pointer"
                          />
                          <label htmlFor={`check-fact-${cIdx}`} className={`text-xs leading-relaxed cursor-pointer transition-all ${checkedFacts[check] ? "text-slate-500 line-through" : "text-slate-300 font-sans"}`}>
                            {check}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Completed Article Body Display */}
            {selectedCampaign.status === "completed" && selectedCampaign.articleBody && (
              <div id="final-article-document" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Col: Article Body markdown preview (takes 2/3) */}
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Document Preview</span>
                    <span className="text-[10px] font-mono text-slate-500">Word count: ~{selectedCampaign.articleBody.split(" ").length}</span>
                  </div>

                  <div className="bg-slate-950 p-6 rounded-lg border border-slate-800 max-h-[600px] overflow-y-auto pr-3 prose prose-invert font-sans">
                    {renderMarkdown(selectedCampaign.articleBody)}
                  </div>
                </div>

                {/* Right Col: Anti-hallucination checker in workspace */}
                <div className="space-y-4">
                  <h3 className="text-xs font-sans font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Human Fact Review
                  </h3>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Verify inline citation warnings before distributing content. Fully verified pieces protect client authoritativeness.
                  </p>

                  {/* Fact check metrics */}
                  {selectedCampaign.outline && selectedCampaign.outline.verificationChecklist && (
                    <div className="space-y-3 p-4 bg-slate-950 rounded border border-slate-800">
                      <h4 className="text-[11px] font-mono text-slate-400 uppercase">Claims Audit</h4>
                      <div className="space-y-2">
                        {selectedCampaign.outline.verificationChecklist.map((check, cIdx) => (
                          <div key={cIdx} className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              id={`final-check-${cIdx}`}
                              checked={!!checkedFacts[check]}
                              onChange={() => toggleFactCheck(check)}
                              className="w-3.5 h-3.5 rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-0 mt-0.5 cursor-pointer"
                            />
                            <label htmlFor={`final-check-${cIdx}`} className={`text-[11px] leading-relaxed cursor-pointer transition-all ${checkedFacts[check] ? "text-slate-500 line-through" : "text-slate-300 font-sans"}`}>
                              {check}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2 text-xs">
                    <strong className="text-slate-200 block font-sans">E-E-A-T Compliance:</strong>
                    <div className="flex flex-col gap-1.5 text-slate-400 leading-relaxed text-[11px]">
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <Check className="w-3.5 h-3.5" /> Direct Experience logs integrated
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <Check className="w-3.5 h-3.5" /> High Topical Depth metrics mapped
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <Check className="w-3.5 h-3.5" /> Concise Q&A layouts built (AEO)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center text-slate-500 font-sans">
            Please select a campaign from the left, or create a new project outline to initialize content composing.
          </div>
        )}
      </div>
    </div>
  );
}
