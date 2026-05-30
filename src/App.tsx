import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Header from "./components/Header";
import LandingHero from "./components/LandingHero";
import SidebarInfo from "./components/SidebarInfo";
import AnalysisTabs from "./components/AnalysisTabs";
import RelatedPapers from "./components/RelatedPapers";
import { PaperInfo, AnalysisResult, Message, RelatedPaper } from "./types";

export default function App() {
  const [paper, setPaper] = useState<PaperInfo | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [relatedPapers, setRelatedPapers] = useState<RelatedPaper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Connection messages
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isChatSending, setIsChatSending] = useState(false);

  // Trigger PDF upload & analysis
  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setErrorMsg(null);
    setPaper(null);
    setAnalysis(null);
    setRelatedPapers([]);
    setChatMessages([]);

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await fetch("/api/paper/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      setPaper(data.paper);
      setAnalysis(data.analysis);
      setRelatedPapers(data.relatedPapers || []);
    } catch (err: any) {
      console.error("Upload controller failed:", err);
      setErrorMsg(err.message || "Failed to process and analyze research paper.");
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger ArXiv Paper Select & analysis
  const handleArxivSelect = async (arxivId: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setPaper(null);
    setAnalysis(null);
    setRelatedPapers([]);
    setChatMessages([]);

    try {
      const response = await fetch("/api/paper/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ arxivId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      setPaper(data.paper);
      setAnalysis(data.analysis);
      setRelatedPapers(data.relatedPapers || []);
    } catch (err: any) {
      console.error("ArXiv analytical pipeline failed:", err);
      setErrorMsg(err.message || "Failed to download and parse arXiv scholarly paper stream.");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto deep-link analyzer parameter parsing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const arxivParam = params.get("arxiv");
    if (arxivParam) {
      // Clear parameter silently to avoid reload-loops
      window.history.replaceState({}, document.title, window.location.pathname);
      handleArxivSelect(arxivParam);
    }
  }, []);

  // context-bound Chat message delivery channel
  const handleSendChatMessage = async (text: string) => {
    if (!paper) return;

    const userTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = {
      id: `m-usr-${Date.now()}`,
      role: "user",
      text,
      timestamp: userTime,
    };

    // Update conversation logs locally immediately
    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatSending(true);

    try {
      // Re-map messages context cleanly to avoid including unnecessary metadata
      const mappedHistory = chatMessages.map(({ role, text }) => ({ role, text }));

      const response = await fetch("/api/paper/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          extractedText: paper.extractedText,
          message: text,
          history: mappedHistory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resolve conversation context check.");
      }

      const aiTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const aiMsg: Message = {
        id: `m-ai-${Date.now()}`,
        role: "model",
        text: data.answer,
        timestamp: aiTime,
      };

      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("Chat logic error:", err);
      const errTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const errMsg: Message = {
        id: `m-err-${Date.now()}`,
        role: "model",
        text: `⚠️ An error occurred while retrieving answer: ${err.message || "Please check server console logs."}`,
        timestamp: errTime,
      };
      setChatMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsChatSending(false);
    }
  };

  // Reset to landing
  const handleReset = () => {
    setPaper(null);
    setAnalysis(null);
    setRelatedPapers([]);
    setErrorMsg(null);
    setIsLoading(false);
    setChatMessages([]);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FDFDFB] font-sans text-[#1A1A1A] antialiased selection:bg-[#1A1A1A] selection:text-white">
      
      {/* Branding Navigation Header */}
      <Header onReset={handleReset} hasActivePaper={!!paper} />

      {/* Main Container Workspace */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {!paper && !isLoading ? (
            
            /* VIEW: LANDING PAGE */
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <LandingHero 
                onFileSelect={handleFileSelect} 
                onArxivSelect={handleArxivSelect}
                errorMsg={errorMsg} 
                isLoading={isLoading} 
              />
            </motion.div>

          ) : isLoading ? (

            /* VIEW: FULL SCREEN PARSING LOADER (Fallback during first analysis load) */
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-8 text-center"
            >
              <div className="max-w-md space-y-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-none bg-[#1A1A1A] text-white border border-[#1A1A1A]">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
                <div className="space-y-2">
                  <h2 className="font-serif italic text-xl font-normal text-[#1A1A1A]">
                    Executing Scholarly Extraction
                  </h2>
                  <p className="font-sans text-xs text-[#666660] leading-relaxed">
                    PaperPilot is parsing this scientific print, decoding structures, formulating prompts, and compiling peer-reviewed responses with Gemini API.
                  </p>
                </div>
                
                {/* Visual infinite loading bar */}
                <div className="mx-auto h-[2px] w-56 overflow-hidden bg-[#E5E5E1]">
                  <div className="h-full w-full origin-left bg-[#1A1A1A] animate-[pulse_1.5s_infinite]" />
                </div>
              </div>
            </motion.div>

          ) : (

            /* VIEW: ACTIVE WORKSPACE (ANALYSIS PANEL) */
            <motion.div
              key="workspace"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.4 }}
              className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
            >
              <div className="grid gap-6 lg:grid-cols-12 items-start">
                
                {/* Left hand Sidebar: PDF attributes & exports */}
                <div className="lg:col-span-3 lg:sticky lg:top-22 space-y-4">
                  <SidebarInfo 
                    paper={paper} 
                    analysis={analysis} 
                    onReset={handleReset} 
                  />
                </div>

                {/* Right hand Panel: Dynamic AnalysisTabs & chat console */}
                <div className="lg:col-span-9 h-full">
                  {analysis && (
                    <AnalysisTabs 
                      analysis={analysis}
                      extractedText={paper.extractedText}
                      chatMessages={chatMessages}
                      setChatMessages={setChatMessages}
                      isChatSending={isChatSending}
                      onSendChatMessage={handleSendChatMessage}
                    />
                  )}
                </div>

              </div>

              {/* Citations and database-inferred papers */}
              {relatedPapers.length > 0 && (
                <RelatedPapers 
                  relatedPapers={relatedPapers} 
                  onAnalyzePaper={handleArxivSelect} 
                />
              )}
            </motion.div>

          )}
        </AnimatePresence>
      </main>

      {/* Global footer detail lines */}
      <footer className="border-t border-[#E5E5E1] bg-white py-8 mt-16 text-[#888880]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[9px]">
          <span>&copy; {new Date().getFullYear()} PaperPilot &bull; Powered by Google Gemini-3.5-flash &amp; Node-PDF</span>
          <div className="flex space-x-4">
            <span className="flex items-center">
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-none bg-emerald-600" />
              API Server Online
            </span>
            <span>Secure Sandboxed Environment</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
