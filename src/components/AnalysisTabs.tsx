import React, { useState, useEffect } from "react";
import { 
  BookOpen, Sparkles, AlertTriangle, ShieldAlert, BadgeHelp, HelpCircle, 
  Copy, Check, Blocks, Milestone, ArrowRight, Rocket, Compass, Sparkle
} from "lucide-react";
import { AnalysisResult, Message } from "../types";
import InteractiveChat from "./InteractiveChat";

interface AnalysisTabsProps {
  analysis: AnalysisResult;
  extractedText: string;
  chatMessages: Message[];
  setChatMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isChatSending: boolean;
  onSendChatMessage: (text: string) => void;
}

type TabType = "summary" | "methodology" | "contributions" | "assumptions" | "weaknesses" | "reviewer" | "future" | "chat";

export default function AnalysisTabs({
  analysis,
  extractedText,
  chatMessages,
  setChatMessages,
  isChatSending,
  onSendChatMessage,
}: AnalysisTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("summary");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [progressWidth, setProgressWidth] = useState(12);

  // Transition progress bar effects
  useEffect(() => {
    setProgressWidth(25);
    const timer1 = setTimeout(() => setProgressWidth(65), 100);
    const timer2 = setTimeout(() => setProgressWidth(100), 250);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [activeTab]);

  // Copy to clipboard helper
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const tabs: { id: TabType; name: string; icon: React.ReactNode }[] = [
    { id: "summary", name: "Summary", icon: <BookOpen className="h-3.5 w-3.5" /> },
    { id: "methodology", name: "Methodology", icon: <Compass className="h-3.5 w-3.5" /> },
    { id: "contributions", name: "Contributions", icon: <Blocks className="h-3.5 w-3.5" /> },
    { id: "assumptions", name: "Assumptions", icon: <Milestone className="h-3.5 w-3.5" /> },
    { id: "weaknesses", name: "Weaknesses", icon: <ShieldAlert className="h-3.5 w-3.5" /> },
    { id: "reviewer", name: "Reviewer Board", icon: <BadgeHelp className="h-3.5 w-3.5" /> },
    { id: "future", name: "Future Work", icon: <Rocket className="h-3.5 w-3.5" /> },
    { id: "chat", name: "Interactive", icon: <HelpCircle className="h-3.5 w-3.5" /> },
  ];

  const renderConfidenceBadge = () => {
    const level = analysis.confidence || "high";
    const bgColors = {
      high: "bg-emerald-50 border-emerald-300 text-emerald-800",
      medium: "bg-amber-50 border-amber-300 text-amber-800",
      low: "bg-rose-50 border-rose-300 text-rose-800 group"
    };

    return (
      <div className="relative inline-flex items-center">
        <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border rounded-none ${bgColors[level]}`}>
          <span className={`h-1.5 w-1.5 rounded-none mr-1.5 ${
            level === "high" ? "bg-emerald-600" : level === "medium" ? "bg-amber-600" : "bg-rose-600 animate-pulse"
          }`} />
          Confidence: {level}
        </span>
        {level === "low" && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-48 p-2 bg-[#1A1A1A] text-white text-[9px] leading-tight font-mono border border-black shadow-lg z-20 pointer-events-none rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            Paper may be too short or low-detail for full analysis
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-none border border-[#E5E5E1] overflow-hidden shadow-none relative">
      
      {/* Interactive top progress indicators bar */}
      <div 
        className="absolute top-0 left-0 h-[2px] bg-black transition-all duration-300 ease-out z-30" 
        style={{ width: `${progressWidth}%` }}
      />

      {/* Dynamic Tab Navigation Menu */}
      <div className="border-b border-[#E5E5E1] bg-[#F5F5F0]">
        <nav className="flex flex-wrap" aria-label="Tabs">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-4 text-[10px] font-bold uppercase tracking-widest border-r border-[#E5E5E1] transition-all duration-150 rounded-none cursor-pointer ${
                  isSelected
                    ? "bg-white text-black border-b-2 border-b-black"
                    : "text-[#888880] hover:text-black hover:bg-[#E5E5E1]/30"
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Primary Tab View Panel */}
      <div className="flex-1 p-8 overflow-y-auto max-h-[700px]">
        
        {/* TAB: SUMMARY */}
        {activeTab === "summary" && (
          <div className="space-y-8">
            
            {/* Action Header */}
            <div className="flex items-center justify-between border-b border-[#E5E5E1] pb-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#888880] mb-1 font-mono">Document Perspective</p>
                <div className="flex items-center space-x-3">
                  <h3 className="font-serif text-2xl text-[#1A1A1A]">Technical Synthesizer</h3>
                  <div className="group relative">
                    {renderConfidenceBadge()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleCopyText(`${analysis.tldr}\n\n${analysis.executiveSummary}`, "total-summary")}
                className="flex items-center space-x-1.5 rounded-none border border-[#1A1A1A] bg-white px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-black hover:bg-black hover:text-white transition-colors duration-150 cursor-pointer"
              >
                {copiedId === "total-summary" ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 text-slate-400" />
                    <span>Copy Synthesis</span>
                  </>
                )}
              </button>
            </div>

            {/* TLDR banner */}
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#888880] mb-4 font-mono">Executive TL;DR</p>
              <div className="font-serif text-lg leading-relaxed text-[#333330] italic bg-[#FDFDFB] border-l-4 border-[#1A1A1A] pl-5 py-3">
                "{analysis.tldr}"
              </div>
            </div>

            {/* Detailed Executive Summary */}
            <div className="space-y-3">
              <h4 className="font-bold uppercase tracking-widest text-[11px] pb-2 border-b border-[#E5E5E1] font-mono text-[#888880]">
                Methodological Breakdown
              </h4>
              <p className="font-sans text-sm leading-relaxed text-[#444440] bg-white border border-[#E5E5E1] p-6 rounded-none whitespace-pre-line">
                {analysis.executiveSummary}
              </p>
            </div>

            {/* Beginner explanation / Translation */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center space-x-1.5 font-sans font-bold text-stone-800 uppercase text-[10px] tracking-wider font-mono">
                <Sparkles className="h-4 w-4 text-[#1A1A1A]" />
                <span>Layperson Interpretation &amp; Conceptual Analogy</span>
              </div>
              <div className="rounded-none bg-[#F5F5F0] border border-[#E5E5E1] p-6 text-[#444440]">
                <p className="font-sans text-sm leading-relaxed">
                  {analysis.beginnerExplanation}
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB: METHODOLOGY */}
        {activeTab === "methodology" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-[#E5E5E1] pb-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#888880] mb-1 font-mono">Scholarly Design</p>
                <h3 className="font-serif text-2xl text-[#1A1A1A]">Research Design &amp; Method</h3>
              </div>
              <button
                onClick={() => handleCopyText(
                  `${analysis.methodology.overview}\n\nSteps:\n${analysis.methodology.steps.join("\n")}`, 
                  "met-copy"
                )}
                className="flex items-center space-x-1.5 rounded-none border border-[#1A1A1A] bg-white px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-black hover:bg-black hover:text-white transition-colors duration-150 cursor-pointer"
              >
                {copiedId === "met-copy" ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3 text-slate-400" />
                )}
                <span>{copiedId === "met-copy" ? "Copied!" : "Copy Method"}</span>
              </button>
            </div>

            {/* Overview */}
            <div className="space-y-3">
              <h4 className="font-bold uppercase tracking-widest text-[11px] pb-2 border-b border-[#E5E5E1] font-mono text-[#888880]">
                Methodological Overview
              </h4>
              <p className="font-sans text-sm leading-relaxed text-[#444440] bg-white border border-[#E5E5E1] p-6 rounded-none">
                {analysis.methodology.overview}
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              <h4 className="font-bold uppercase tracking-widest text-[11px] pb-2 border-b border-[#E5E5E1] font-mono text-[#888880]">
                Developmental Stages of Implementation
              </h4>
              <div className="space-y-3">
                {analysis.methodology.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-4 border border-[#E5E5E1] bg-white p-5 hover:border-black transition duration-150">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center bg-[#1A1A1A] font-mono text-[10px] font-bold text-white">
                      {idx + 1}
                    </div>
                    <p className="font-sans text-sm leading-relaxed text-[#444440]">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Novelty */}
            <div className="rounded-none bg-[#F5F5F0] border border-[#E5E5E1] p-6">
              <div className="flex items-center space-x-2 text-black mb-3">
                <Sparkle className="h-4 w-4 shrink-0 text-black animate-pulse" />
                <span className="font-mono text-[10px] uppercase tracking-widest font-bold">Innovation &amp; Core Novelty</span>
              </div>
              <p className="font-sans text-xs leading-relaxed text-[#666660]">
                {analysis.methodology.novelty}
              </p>
            </div>
          </div>
        )}

        {/* TAB: CONTRIBUTIONS */}
        {activeTab === "contributions" && (
          <div className="space-y-8">
            
            <div className="flex items-center justify-between border-b border-[#E5E5E1] pb-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#888880] mb-1 font-mono">Academic Benchmarks</p>
                <h3 className="font-serif text-2xl text-[#1A1A1A]">Main Contributions</h3>
              </div>
              <button
                onClick={() => handleCopyText(analysis.mainContributions.join("\n"), "contributions")}
                className="flex items-center space-x-1.5 rounded-none border border-[#1A1A1A] bg-white px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-black hover:bg-black hover:text-white transition-colors duration-150 cursor-pointer"
              >
                {copiedId === "contributions" ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3 text-slate-400" />
                )}
                <span>{copiedId === "contributions" ? "Copied!" : "Copy Contributions"}</span>
              </button>
            </div>

            {/* Contributions listing */}
            <div className="space-y-4">
              <h4 className="font-bold uppercase tracking-widest text-[11px] pb-2 border-b border-[#E5E5E1] font-mono text-[#888880]">
                Proven Breakthroughs &amp; Contributions
              </h4>
              <div className="space-y-3">
                {analysis.mainContributions.map((cont, idx) => (
                  <div key={idx} className="flex items-start space-x-4 rounded-none border border-[#E5E5E1] bg-white p-5 hover:border-black transition duration-150">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-[#1A1A1A] font-mono text-[11px] font-bold text-white">
                      0{idx + 1}
                    </div>
                    <p className="font-sans text-sm leading-relaxed text-[#444440] pt-0.5">
                      {cont}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB: ASSUMPTIONS */}
        {activeTab === "assumptions" && (
          <div className="space-y-8">
            
            <div className="flex items-center justify-between border-b border-[#E5E5E1] pb-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#888880] mb-1 font-mono">Critical Premises</p>
                <h3 className="font-serif text-2xl text-[#1A1A1A]">Preconditions &amp; Hypotheses</h3>
              </div>
              <button
                onClick={() => handleCopyText(
                  `Explicit Assumptions:\n${analysis.assumptions.explicit.join("\n")}\n\nImplicit Assumptions:\n${analysis.assumptions.implicit.join("\n")}`, 
                  "assumptions"
                )}
                className="flex items-center space-x-1.5 rounded-none border border-[#1A1A1A] bg-white px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-black hover:bg-black hover:text-white transition-colors duration-150 cursor-pointer"
              >
                {copiedId === "assumptions" ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3 text-slate-400" />
                )}
                <span>{copiedId === "assumptions" ? "Copied!" : "Copy Hypotheses"}</span>
              </button>
            </div>

            <p className="font-serif text-base italic text-[#666660] leading-relaxed">
              Every research project builds on historical boundaries of hardware constraints, sampling limits, or structural simplifications. Reviewing assumptions identifies how easily the paper's claims apply to real-world deployment.
            </p>

            {/* Assumptions Lists */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Explicit */}
              <div className="rounded-none border border-[#E5E5E1] p-6 bg-white space-y-4">
                <div className="border-b border-[#E5E5E1] pb-2 font-mono text-[10px] font-bold text-black uppercase tracking-wider">
                  Explicit Declarations
                </div>
                <div className="space-y-3">
                  {analysis.assumptions.explicit.length > 0 ? (
                    analysis.assumptions.explicit.map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-[#444440] leading-relaxed">
                        <span className="text-black font-mono font-bold shrink-0 mt-0.5">•</span>
                        <p>{item}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-stone-400 italic">No explicit constraints noted.</p>
                  )}
                </div>
              </div>

              {/* Implicit critique */}
              <div className="rounded-none border border-[#E5E5E1] p-6 bg-[#FDFDFB] space-y-4">
                <div className="border-b border-[#E5E5E1] pb-2 font-mono text-[10px] font-bold text-stone-600 uppercase tracking-wider">
                  Implicit &amp; Unspoken Premises
                </div>
                <div className="space-y-3">
                  {analysis.assumptions.implicit.length > 0 ? (
                    analysis.assumptions.implicit.map((item, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-[#444440] leading-relaxed">
                        <ArrowRight className="h-3.5 w-3.5 text-[#1A1A1A] shrink-0 mt-0.5" />
                        <p>{item}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-stone-400 italic">No implicit gaps identified.</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB: WEAKNESSES */}
        {activeTab === "weaknesses" && (
          <div className="space-y-8">
            
            <div className="flex items-center justify-between border-b border-[#E5E5E1] pb-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#888880] mb-1 font-mono">Skeptical Critique</p>
                <h3 className="font-serif text-2xl text-[#1A1A1A]">Potential Weaknesses</h3>
              </div>
              <button
                onClick={() => handleCopyText(analysis.weaknesses.join("\n"), "weaknesses")}
                className="flex items-center space-x-1.5 rounded-none border border-[#1A1A1A] bg-white px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-black hover:bg-black hover:text-white transition-colors duration-150 cursor-pointer"
              >
                {copiedId === "weaknesses" ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3 text-slate-400" />
                )}
                <span>{copiedId === "weaknesses" ? "Copied!" : "Copy Critiques"}</span>
              </button>
            </div>

            <div className="rounded-none border border-[#E5E5E1] bg-[#1A1A1A] text-[#FDFDFB] p-6 space-y-3">
              <div className="flex items-center space-x-2 text-white">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold">
                  Skepticism Disclaimer
                </span>
              </div>
              <p className="font-sans text-xs leading-relaxed text-zinc-300">
                These structural limitations are inferred by challenging the mathematical boundaries, performance baseline claims, and validation datasets of the document.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold uppercase tracking-widest text-[11px] pb-2 border-b border-[#E5E5E1] font-mono text-[#888880]">
                Identified Flaws or Trade-offs
              </h4>
              <div className="space-y-3">
                {analysis.weaknesses.map((weakness, idx) => (
                  <div key={idx} className="flex items-start space-x-4 bg-white border border-[#E5E5E1] p-5 rounded-none hover:border-black transition duration-150">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center bg-stone-200 text-stone-800 font-mono text-[10px] font-bold">
                      !
                    </div>
                    <p className="font-sans text-sm leading-relaxed text-[#444440] pt-0.5">
                      {weakness}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB: REVIEWER VIEW */}
        {activeTab === "reviewer" && (
          <div className="space-y-8">
            
            <div className="flex items-center justify-between border-b border-[#E5E5E1] pb-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#888880] mb-1 font-mono">Defense Preparation</p>
                <h3 className="font-serif text-2xl text-[#1A1A1A]">Critical Review Board</h3>
              </div>
              <button
                onClick={() => handleCopyText(analysis.reviewerQuestions.join("\n\n"), "reviewer")}
                className="flex items-center space-x-1.5 rounded-none border border-[#1A1A1A] bg-white px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-black hover:bg-black hover:text-white transition-colors duration-150 cursor-pointer"
              >
                {copiedId === "reviewer" ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3 text-slate-450" />
                )}
                <span>{copiedId === "reviewer" ? "Copied!" : "Copy Panel"}</span>
              </button>
            </div>

            <p className="font-serif text-base italic text-[#666660] leading-relaxed max-w-2xl">
              These oral board questions model standard journal defense procedures. If you are preparing for a thesis defense, seminar, or project review, study these to address hidden bottlenecks.
            </p>

            <div className="space-y-4">
              {analysis.reviewerQuestions.map((question, idx) => (
                <div key={idx} className="rounded-none border border-[#E5E5E1] bg-white p-6 hover:border-black transition duration-150 space-y-3">
                  <div className="flex items-center space-x-2 font-mono text-[9px] font-bold uppercase text-[#888880]">
                    <span className="bg-[#F5F5F0] border border-[#E5E5E1] px-1.5 py-0.5">
                      DEFENSE QUESTION 0{idx + 1}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-normal text-[#1A1A1A] leading-relaxed">
                    "{question}"
                  </h3>

                  <div className="p-4 bg-[#F5F5F0] border border-[#E5E5E1] text-[11px] font-sans text-[#666660] leading-relaxed">
                    <span className="font-bold text-[#1A1A1A] uppercase tracking-wider text-[9px] block mb-1">
                      Critical Peer-Review Challenge Rationale:
                    </span>
                    This question challenges validation boundaries. Ensure claims can withstand robust mathematical or experimental replicates of testing matrices.
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB: FUTURE WORK */}
        {activeTab === "future" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-[#E5E5E1] pb-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#888880] mb-1 font-mono">Research Horizons</p>
                <h3 className="font-serif text-2xl text-[#1A1A1A]">Inferred Future Outlook</h3>
              </div>
              <button
                onClick={() => handleCopyText(analysis.futureDirections.slice(0, 3).join("\n"), "future-copy")}
                className="flex items-center space-x-1.5 rounded-none border border-[#1A1A1A] bg-white px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-black hover:bg-black hover:text-white transition-colors duration-150 cursor-pointer"
              >
                {copiedId === "future-copy" ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3 text-slate-400" />
                )}
                <span>{copiedId === "future-copy" ? "Copied!" : "Copy Directions"}</span>
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold uppercase tracking-widest text-[11px] pb-2 border-b border-[#E5E5E1] font-mono text-[#888880]">
                Potential Future Horizons
              </h4>
              <div className="space-y-4">
                {analysis.futureDirections.map((dir, idx) => (
                  <div key={idx} className="flex items-start space-x-4 border border-[#E5E5E1] bg-white p-5 hover:border-black transition duration-150 rounded-none">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#F5F5F0] border border-[#E5E5E1] text-[#1A1A1A]">
                      <Rocket className="h-4 w-4" />
                    </div>
                    <div className="space-y-1.5 pt-0.5">
                      <span className="font-mono text-black font-bold block uppercase tracking-widest text-[9px]">HORIZON DIRECTION 0{idx + 1}</span>
                      <p className="font-sans text-sm leading-relaxed text-[#444440]">
                        {dir}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: INTERACTIVE CHAT */}
        {activeTab === "chat" && (
          <div className="h-full min-h-[440px] flex flex-col">
            <InteractiveChat 
              chatMessages={chatMessages}
              setChatMessages={setChatMessages}
              isChatSending={isChatSending}
              onSendChatMessage={onSendChatMessage}
            />
          </div>
        )}

      </div>
    </div>
  );
}
