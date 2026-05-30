import { useState } from "react";
import { FileText, Download, Trash2, Database, ExternalLink, Share2 } from "lucide-react";
import { PaperInfo, AnalysisResult } from "../types";
import DownloadButton from "./DownloadButton";

interface SidebarInfoProps {
  paper: PaperInfo;
  analysis: AnalysisResult | null;
  onReset: () => void;
}

export default function SidebarInfo({ paper, analysis, onReset }: SidebarInfoProps) {
  const [shared, setShared] = useState(false);

  // Format File Size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Approximate Word Count
  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const handleCopyShareLink = () => {
    if (!paper.arxivId) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?arxiv=${paper.arxivId}`;
    navigator.clipboard.writeText(shareUrl);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };



  return (
    <div className="flex flex-col gap-6 rounded-none border border-[#E5E5E1] bg-white p-6 shadow-none">
      
      {/* File Identifier Block */}
      <div className="space-y-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#888880] mb-2 font-mono">
            Active Document
          </p>
          <h2 className="font-serif text-2xl font-normal leading-tight text-[#1A1A1A] break-words">
            {paper.title || paper.fileName.replace(/\.[^/.]+$/, "")}
          </h2>
          {paper.arxivId && (
            <div className="mt-2">
              <a
                href={`https://arxiv.org/abs/${paper.arxivId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 font-mono text-[9px] font-bold text-[#1A1A1A] uppercase tracking-wider underline hover:text-[#888880]"
              >
                <span>arXiv:${paper.arxivId}</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          )}
          {paper.authors && paper.authors.length > 0 && (
            <p className="font-sans text-xs text-[#666660] mt-1.5 line-clamp-2">
              By {paper.authors.join(", ")}
            </p>
          )}
          {paper.publishedDate && (
            <p className="font-mono text-[9px] text-[#888880] uppercase tracking-wider mt-1">
              Published {new Date(paper.publishedDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
            </p>
          )}
          {!paper.arxivId && (
            <p className="font-mono text-[10px] text-[#666660] italic mt-1 uppercase tracking-wider">
              Target Source Node
            </p>
          )}
        </div>

        {/* Technical metadata list */}
        <div className="p-4 bg-[#F5F5F0] border border-[#E5E5E1] rounded-none">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-3 font-mono">
            Document Stats
          </p>
          <div className="grid grid-cols-2 gap-y-2 text-[11px] font-mono">
            <span className="text-[#888880]">Weight</span>
            <span className="text-right text-slate-800 font-semibold">{formatBytes(paper.fileSize)}</span>
            
            <span className="text-[#888880]">Length</span>
            <span className="text-right text-slate-800 font-semibold">{paper.extractedText.length.toLocaleString()} ch</span>
            
            <span className="text-[#888880]">Est. Words</span>
            <span className="text-right text-slate-800 font-semibold">{getWordCount(paper.extractedText).toLocaleString()}</span>
            
            <span className="text-[#888880]">Sanity</span>
            <span className="text-right text-emerald-700 font-bold uppercase tracking-tight">Pure Session</span>
          </div>
        </div>
      </div>

      {/* Primary Export & Change Doc Actions */}
      <div className="space-y-2 border-t border-[#E5E5E1] pt-4">
        {analysis && (
          <DownloadButton paper={paper} analysis={analysis} />
        )}

        {analysis && paper.arxivId && (
          <button
            onClick={handleCopyShareLink}
            className="flex w-full items-center justify-between py-2 px-3 border border-[#E5E5E1] bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-[#F5F5F0] transition-colors duration-150 rounded-none cursor-pointer font-sans"
          >
            <span>{shared ? "Link Copied!" : "Share Analysis Link"}</span>
            <Share2 className="h-3.5 w-3.5" />
          </button>
        )}

        <button
          onClick={onReset}
          className="flex w-full items-center justify-between py-2 px-3 border border-[#E5E5E1] bg-white text-[#666660] text-xs font-bold uppercase tracking-widest hover:text-[#1A1A1A] hover:bg-[#FDFDFB] transition-colors duration-150 rounded-none cursor-pointer"
        >
          <span>Change Document</span>
          <Trash2 className="h-3.5 w-3.5 opacity-50" />
        </button>
      </div>

      {/* Security notice / status card */}
      <div className="bg-[#F5F5F0] border border-[#E5E5E1] p-4 text-[11px] text-[#666660] rounded-none">
        <div className="flex items-center space-x-1.5 font-bold mb-1.5 text-[#1A1A1A]">
          <Database className="h-3.5 w-3.5" />
          <span className="font-mono text-[10px] uppercase tracking-wider">SANDBOXED ENGINE</span>
        </div>
        <p className="leading-relaxed font-sans text-[#666660]">
          We use direct contextual inference mapping. All extracted text sits inside your secure web session to avoid memory leakage.
        </p>
      </div>

    </div>
  );
}
