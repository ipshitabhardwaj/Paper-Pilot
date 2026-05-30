import React from "react";
import { BookOpen, ExternalLink, ArrowRight, Calendar, Users } from "lucide-react";
import { RelatedPaper } from "../types";

interface RelatedPapersProps {
  relatedPapers: RelatedPaper[];
  onAnalyzePaper: (arxivId: string) => void;
}

export default function RelatedPapers({ relatedPapers, onAnalyzePaper }: RelatedPapersProps) {
  if (!relatedPapers || relatedPapers.length === 0) {
    return null;
  }

  // Format date readable
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="mt-16 border-t border-[#E5E5E1] pt-12">
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#888880] mb-1">Citations &amp; Baselines</p>
        <h3 className="font-serif text-3xl font-normal text-[#1A1A1A]">Related Scholarly Prints</h3>
        <p className="font-sans text-xs text-[#666660] mt-1">
          Discovered on arXiv via title keywords and research fields of study. Match hypotheses or build secondary baselines.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {relatedPapers.slice(0, 3).map((paper) => (
          <div 
            key={paper.arxivId} 
            className="flex flex-col justify-between bg-white border border-[#E5E5E1] p-6 rounded-none hover:border-black transition duration-150 h-full text-left"
          >
            <div className="space-y-4">
              {/* Meta details */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[9px] text-[#888880] uppercase tracking-wider pb-2 border-b border-[#E5E5E1]">
                <span className="flex items-center">
                  <Calendar className="mr-1 h-3 w-3 shrink-0" />
                  {formatDate(paper.publishedDate)}
                </span>
                <span>&bull;</span>
                <span className="text-[#1A1A1A] font-bold">arXiv:{paper.arxivId}</span>
              </div>

              {/* Title */}
              <h4 className="font-serif text-base font-semibold leading-tight text-[#1A1A1A] group-hover:underline">
                {paper.title}
              </h4>

              {/* Authors */}
              {paper.authors && paper.authors.length > 0 && (
                <div className="flex items-start text-[11px] text-[#666660] space-x-1">
                  <Users className="h-3 w-3 shrink-0 mt-0.5 text-stone-400" />
                  <p className="line-clamp-1">
                    {paper.authors.join(", ")}
                  </p>
                </div>
              )}

              {/* Abstract Summary */}
              <p className="font-sans text-xs leading-relaxed text-[#666660] line-clamp-4">
                {paper.abstract}
              </p>
            </div>

            {/* Actions panel */}
            <div className="flex gap-2 pt-6 mt-4 border-t border-[#E5E5E1]/60">
              <button
                onClick={() => onAnalyzePaper(paper.arxivId)}
                className="flex-1 flex items-center justify-center space-x-1.5 rounded-none border border-black bg-white px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-wider text-black hover:bg-black hover:text-white transition duration-150 cursor-pointer"
              >
                <span>Analyze Paper</span>
                <ArrowRight className="h-3 w-3" />
              </button>
              
              <a
                href={`https://arxiv.org/abs/${paper.arxivId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center border border-[#E5E5E1] text-[#888880] hover:text-black hover:border-black transition-colors rounded-none cursor-pointer"
                title="View on arXiv"
                referrerPolicy="no-referrer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
