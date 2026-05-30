import React, { useState, useRef } from "react";
import { UploadCloud, FileText, AlertTriangle, ShieldCheck, Zap, HelpCircle, GraduationCap, ArrowRight, Search, FileDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LandingHeroProps {
  onFileSelect: (file: File) => void;
  onArxivSelect: (arxivId: string) => void;
  errorMsg: string | null;
  isLoading: boolean;
}

interface ArxivMetaPreview {
  title: string;
  authors: string[];
  abstract: string;
  publishedDate: string;
  arxivId: string;
}

export default function LandingHero({ onFileSelect, onArxivSelect, errorMsg, isLoading }: LandingHeroProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "arxiv">("upload");
  
  // PDF Upload states
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ArXiv States
  const [arxivInput, setArxivInput] = useState("");
  const [arxivFetchLoading, setArxivFetchLoading] = useState(false);
  const [arxivFetchError, setArxivFetchError] = useState<string | null>(null);
  const [arxivPreview, setArxivPreview] = useState<ArxivMetaPreview | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSelect(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSelect(file);
    }
  };

  const validateAndSelect = (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("Invalid file type. Please upload a PDF file containing research print or documentation.");
      return;
    }
    // Limit to 30MB
    if (file.size > 30 * 1024 * 1024) {
      alert("File is too large. PaperPilot supports analytical parsing for files under 30MB.");
      return;
    }
    setSelectedFileName(file.name);
    onFileSelect(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // arXiv Details pre-fetching
  const handleFetchArxivMetadata = async () => {
    if (!arxivInput.trim()) return;
    setArxivFetchLoading(true);
    setArxivFetchError(null);
    setArxivPreview(null);

    try {
      const response = await fetch("/api/paper/arxiv-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ arxivId: arxivInput.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "ArXiv failed to return valid metadata metadata.");
      }

      setArxivPreview({
        title: data.title,
        authors: data.authors,
        abstract: data.abstract,
        publishedDate: data.publishedDate,
        arxivId: data.arxivId,
      });
    } catch (err: any) {
      console.error(err);
      setArxivFetchError(err.message || "Failed to fetch arXiv metadata. Check internet or ID format.");
    } finally {
      setArxivFetchLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      
      {/* Intro Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-1.5 rounded-none bg-[#F5F5F0] px-3.5 py-1.5 font-mono text-[10px] font-bold text-[#1A1A1A] border border-[#E5E5E1] uppercase tracking-[0.15em]"
        >
          <span>Next-Gen Academic Engine</span>
        </motion.div>

        <motion.h1 
          className="mt-6 font-serif text-4xl font-normal tracking-tight text-[#1A1A1A] sm:text-5xl md:text-6xl"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Navigate Complex Papers <br/>
          <span className="italic font-bold bg-none text-[#1A1A1A]">
            with Pilot Precision
          </span>
        </motion.h1>

        <motion.p 
          className="mt-6 font-sans text-base text-[#666660] sm:text-lg leading-relaxed max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Drop your technical PDF, scientific paper, or patent spec below. Instantaneously break down methodology, extract implicit barriers, challenge with skeptical peer reviews, and ask context-bound questions.
        </motion.p>
      </div>

      {/* Main Container Workspace Card */}
      <motion.div 
        className="mx-auto max-w-2xl bg-white rounded-none border border-[#E5E5E1] shadow-none mb-16 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* Tab Header Selector */}
        <div className="flex border-b border-[#E5E5E1] bg-[#F5F5F0]">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 py-3 text-center font-mono text-[10px] font-bold uppercase tracking-widest border-r border-[#E5E5E1] transition duration-150 cursor-pointer ${
              activeTab === "upload" ? "bg-white text-black" : "text-[#888880] hover:text-black hover:bg-[#E5E5E1]/40"
            }`}
          >
            Upload local PDF
          </button>
          <button
            onClick={() => setActiveTab("arxiv")}
            className={`flex-1 py-3 text-center font-mono text-[10px] font-bold uppercase tracking-widest transition duration-150 cursor-pointer ${
              activeTab === "arxiv" ? "bg-white text-black" : "text-[#888880] hover:text-black hover:bg-[#E5E5E1]/40"
            }`}
          >
            arXiv URL or ID
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            
            {/* TAB: LOCAL UPLOAD */}
            {activeTab === "upload" && (
              <motion.div
                key="upload-tab"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={isLoading ? undefined : triggerFileInput}
                  className={`relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-none border border-[#E5E5E1] p-8 text-center transition ${
                    isDragActive 
                      ? "bg-[#F5F5F0]" 
                      : "hover:bg-[#FDFDFB]"
                  } ${isLoading ? "pointer-events-none opacity-85" : ""}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isLoading}
                  />

                  <div className="flex h-12 w-12 items-center justify-center rounded-none bg-[#F5F5F0] text-[#1A1A1A] mb-4 border border-[#E5E5E1]">
                    {isLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1A1A1A] border-t-transparent" />
                    ) : (
                      <UploadCloud className="h-6 w-6 text-[#1A1A1A]" />
                    )}
                  </div>

                  {isLoading ? (
                    <div className="space-y-3">
                      <h3 className="font-serif italic text-base font-semibold text-[#1A1A1A]">
                        Parsing &amp; Analyzing Research Paper...
                      </h3>
                      <p className="font-mono text-[10px] text-[#888880] uppercase tracking-widest">
                        Extracting scholarly context &bull; Querying Gemini model &bull; Structured synthesis
                      </p>
                      <div className="mx-auto h-[2px] w-48 overflow-hidden bg-[#E5E5E1]">
                        <div className="h-full w-full origin-left bg-[#1A1A1A] animate-[pulse_1.5s_infinite]" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="font-sans text-sm font-semibold text-[#1A1A1A]">
                        {selectedFileName ? (
                          <span className="flex items-center justify-center italic font-serif">
                            <FileText className="h-4 w-4 mr-2 shrink-0 text-[#888880]" />
                            {selectedFileName}
                          </span>
                        ) : (
                          <span>Drag and drop research PDF here, or <span className="underline decoration-1 underline-offset-4 font-bold text-black">browse files</span></span>
                        )}
                      </p>
                      <p className="text-[11px] text-[#888880] font-mono tracking-wide">
                        Supports standard scientific print PDFs up to 30MB
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: ARXIV ID IMPORT */}
            {activeTab === "arxiv" && (
              <motion.div
                key="arxiv-tab"
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {!arxivPreview && !arxivFetchLoading && (
                  <div className="space-y-4">
                    <p className="text-xs text-[#666660] leading-relaxed">
                      Enter any arXiv format parameter. Supports full PDF link (e.g. <span className="font-mono bg-[#F5F5F0] px-1">arxiv.org/pdf/2301.07041</span>),abstract link (e.g. <span className="font-mono bg-[#F5F5F0] px-1">arxiv.org/abs/2301.07041</span>), or raw paper IDs.
                    </p>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                        <input
                          type="text"
                          placeholder="e.g., 2301.07041 or https://arxiv.org/abs/2103.00020"
                          value={arxivInput}
                          onChange={(e) => setArxivInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleFetchArxivMetadata()}
                          className="w-full flex-grow pl-10 pr-4 py-2.5 text-xs border border-[#E5E5E1] bg-white rounded-none focus:outline-none focus:border-black font-sans"
                        />
                      </div>
                      <button
                        onClick={handleFetchArxivMetadata}
                        disabled={!arxivInput.trim()}
                        className="py-2.5 px-4 bg-black border border-black text-white hover:bg-white hover:text-black font-mono text-[10px] font-bold uppercase tracking-wider rounded-none cursor-pointer duration-150 disabled:opacity-50"
                      >
                        Fetch Details
                      </button>
                    </div>
                  </div>
                )}

                {/* Loading Skeleton */}
                {arxivFetchLoading && (
                  <div className="border border-[#E5E5E1] p-6 space-y-4 rounded-none animate-pulse">
                    <div className="h-2.5 bg-stone-200 w-1/4" />
                    <div className="space-y-2">
                      <div className="h-5 bg-stone-300 w-11/12" />
                      <div className="h-5 bg-stone-300 w-3/4" />
                    </div>
                    <div className="h-3 bg-stone-200 w-2/5" />
                    <div className="space-y-1.5 pt-3 border-t border-stone-100">
                      <div className="h-2.5 bg-stone-200 w-full" />
                      <div className="h-2.5 bg-stone-200 w-11/12" />
                      <div className="h-2.5 bg-stone-200 w-4/5" />
                    </div>
                  </div>
                )}

                {/* arXiv metadata error display */}
                {arxivFetchError && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-xs text-rose-900 rounded-none flex items-start space-x-2.5">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                    <div>
                      <p className="font-bold font-serif italic">Metadata Fetch Failed</p>
                      <p className="font-mono text-[11px] leading-relaxed mt-0.5">{arxivFetchError}</p>
                    </div>
                  </div>
                )}

                {/* Metadata preview card panel */}
                {arxivPreview && !arxivFetchLoading && (
                  <div className="border border-black p-6 space-y-4 rounded-none bg-white relative">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[9px] font-bold bg-black text-white px-2 py-0.5 uppercase tracking-widest">
                        arXiv {arxivPreview.arxivId}
                      </span>
                      <button 
                        onClick={() => { setArxivPreview(null); setArxivFetchError(null); }}
                        className="text-stone-400 hover:text-black text-xs font-mono"
                      >
                        Reset Form
                      </button>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-serif text-xl font-normal text-[#1A1A1A] leading-tight select-all">
                        {arxivPreview.title}
                      </h3>
                      {arxivPreview.authors && arxivPreview.authors.length > 0 && (
                        <p className="text-[11px] text-[#666660] font-sans">
                          By <span className="font-medium text-black">{arxivPreview.authors.join(", ")}</span>
                        </p>
                      )}
                    </div>

                    <div className="text-[11px] text-[#666660] font-mono border-t border-b border-[#E5E5E1] py-3 uppercase tracking-wider grid grid-cols-2">
                      <span>Indexed Date: {new Date(arxivPreview.publishedDate).toLocaleDateString()}</span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-stone-400">ArXiv abstract</span>
                      <p className="text-xs text-[#666660] font-sans leading-relaxed line-clamp-3">
                        {arxivPreview.abstract}
                      </p>
                    </div>

                    {isLoading ? (
                      <div className="pt-4 space-y-3">
                        <div className="mx-auto h-[2px] w-full overflow-hidden bg-[#E5E5E1]">
                          <div className="h-full w-full origin-left bg-black animate-[pulse_1.5s_infinite]" />
                        </div>
                        <p className="text-center text-[10px] uppercase font-mono font-bold tracking-widest text-black">
                          Analyzing ArXiv PDF Content...
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => onArxivSelect(arxivPreview.arxivId)}
                        className="w-full flex items-center justify-center space-x-2 py-3 bg-black text-white border border-black font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors duration-150 cursor-pointer rounded-none mt-4"
                      >
                        <span>Initiate Pilot Analysis</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Error message */}
        {errorMsg && (
          <div className="mx-6 mb-6 flex items-start space-x-3 rounded-none bg-rose-50 border border-rose-200 p-4 text-xs text-rose-900">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-serif italic font-bold">Analysis Error</p>
              <p className="font-mono text-[11px] leading-relaxed mt-1 text-[#666660]">{errorMsg}</p>
            </div>
          </div>
        )}

        <div className="mt-0 flex items-center justify-between text-[10px] text-[#888880] font-mono bg-[#F5F5F0] border-t border-[#E5E5E1] rounded-none px-6 py-3.5">
          <span className="flex items-center">
            <ShieldCheck className="h-3.5 w-3.5 text-[#1A1A1A] mr-1.5" />
            Zero permanent cloud storage &bull; Absolute data bounds
          </span>
          <span className="font-bold tracking-widest text-[#1A1A1A] uppercase">
            Secure Session
          </span>
        </div>
      </motion.div>

      {/* Bento Feature Grid */}
      <div className="mt-6">
        <h2 className="text-center font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-[#888880] mb-10">
          Pilot Intelligence Platform Components
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          
          <div className="rounded-none border border-[#E5E5E1] bg-white p-6 transition">
            <div className="flex h-9 w-9 items-center justify-center rounded-none bg-[#F5F5F0] text-[#1A1A1A] mb-4 border border-[#E5E5E1]">
              <Zap className="h-4 w-4" />
            </div>
            <h3 className="font-serif text-lg text-[#1A1A1A] mb-2">Technical Synthesis</h3>
            <p className="text-xs text-[#666660] leading-relaxed">
              Synthesizes long multi-column print papers. Extracts goals, background, and results, generating an exact TLDR in less than 150 words.
            </p>
          </div>

          <div className="rounded-none border border-[#E5E5E1] bg-white p-6 transition">
            <div className="flex h-9 w-9 items-center justify-center rounded-none bg-[#F5F5F0] text-[#1A1A1A] mb-4 border border-[#E5E5E1]">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h3 className="font-serif text-lg text-[#1A1A1A] mb-2">Assumption Audit</h3>
            <p className="text-xs text-[#666660] leading-relaxed">
              Discovers transparent declared hypotheses AND deciphers unspoken technical or environmental dependencies built into methodologies.
            </p>
          </div>

          <div className="rounded-none border border-[#E5E5E1] bg-white p-6 transition">
            <div className="flex h-9 w-9 items-center justify-center rounded-none bg-[#F5F5F0] text-[#1A1A1A] mb-4 border border-[#E5E5E1]">
              <GraduationCap className="h-4 w-4" />
            </div>
            <h3 className="font-serif text-lg text-[#1A1A1A] mb-2">Layperson Bridge</h3>
            <p className="text-xs text-[#666660] leading-relaxed">
              Provides simplified explanations. Translates deep formulas or niche vocabulary with illustrative real-world analogies.
            </p>
          </div>

          <div className="rounded-none border border-[#E5E5E1] bg-white p-6 transition">
            <div className="flex h-9 w-9 items-center justify-center rounded-none bg-[#F5F5F0] text-[#1A1A1A] mb-4 border border-[#E5E5E1]">
              <HelpCircle className="h-4 w-4" />
            </div>
            <h3 className="font-serif text-lg text-[#1A1A1A] mb-2">Context-Bounded Q&amp;A</h3>
            <p className="text-xs text-[#666660] leading-relaxed">
              Talk directly with the context data. No hallucinated external noise—the chat resolves questions strictly within parsed text.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
