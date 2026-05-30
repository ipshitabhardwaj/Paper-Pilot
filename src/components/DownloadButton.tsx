import React, { useState } from "react";
import { Download } from "lucide-react";
import { PaperInfo, AnalysisResult } from "../types";

interface DownloadButtonProps {
  paper: PaperInfo;
  analysis: AnalysisResult;
}

export default function DownloadButton({ paper, analysis }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const downloadPdf = async () => {
    if (!analysis) return;
    setLoading(true);

    try {
      const html2pdf = (await import("html2pdf.js")).default;

      const content = `
        <div style="font-family: 'Georgia', serif; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 40px;">
          
          <div style="border-bottom: 3px solid #1a1a1a; padding-bottom: 24px; margin-bottom: 32px;">
            <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #666; margin-bottom: 8px;">PaperPilot Scholarly Analysis</div>
            <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 12px 0; line-height: 1.3;">${paper.title || paper.fileName}</h1>
            <div style="font-size: 12px; color: #555; line-height: 1.8;">
              ${paper.arxivId ? `<div>arXiv: <a href="https://arxiv.org/abs/${paper.arxivId}" style="color: #1a1a1a;">arxiv.org/abs/${paper.arxivId}</a></div>` : ""}
              <div>Source: ${paper.fileName}</div>
              <div>Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
              <div style="margin-top: 6px;">
                <span style="display: inline-block; padding: 2px 10px; background: ${analysis.confidence === "high" ? "#d4edda" : analysis.confidence === "medium" ? "#fff3cd" : "#f8d7da"}; color: ${analysis.confidence === "high" ? "#155724" : analysis.confidence === "medium" ? "#856404" : "#721c24"}; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">
                  Confidence: ${analysis.confidence}
                </span>
              </div>
            </div>
          </div>

          <div style="background: #f8f8f8; border-left: 4px solid #1a1a1a; padding: 20px 24px; margin-bottom: 32px;">
            <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #888; margin-bottom: 10px;">Executive TL;DR</div>
            <p style="font-size: 14px; line-height: 1.7; margin: 0; font-style: italic;">${analysis.tldr}</p>
          </div>

          <div style="margin-bottom: 28px;">
            <h2 style="font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 14px;">Executive Summary</h2>
            <p style="font-size: 13px; line-height: 1.8; margin: 0;">${analysis.executiveSummary}</p>
          </div>

          <div style="margin-bottom: 28px;">
            <h2 style="font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 14px;">Main Contributions</h2>
            <ul style="margin: 0; padding-left: 20px;">
              ${analysis.mainContributions.map(c => `<li style="font-size: 13px; line-height: 1.7; margin-bottom: 6px;">${c}</li>`).join("")}
            </ul>
          </div>

          <div style="margin-bottom: 28px;">
            <h2 style="font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 14px;">Methodology</h2>
            <p style="font-size: 13px; line-height: 1.8; margin: 0 0 12px 0;"><strong>Overview:</strong> ${analysis.methodology.overview}</p>
            <p style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #666; margin: 0 0 8px 0;">Key Stages</p>
            <ol style="margin: 0; padding-left: 20px;">
              ${analysis.methodology.steps.map(s => `<li style="font-size: 13px; line-height: 1.7; margin-bottom: 6px;">${s}</li>`).join("")}
            </ol>
            <p style="font-size: 13px; line-height: 1.8; margin: 12px 0 0 0;"><strong>Novelty:</strong> ${analysis.methodology.novelty}</p>
          </div>

          <div style="margin-bottom: 28px;">
            <h2 style="font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 14px;">Assumptions</h2>
            <p style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #666; margin: 0 0 8px 0;">Explicit</p>
            <ul style="margin: 0 0 14px 0; padding-left: 20px;">
              ${analysis.assumptions.explicit.map(a => `<li style="font-size: 13px; line-height: 1.7; margin-bottom: 5px;">${a}</li>`).join("")}
            </ul>
            <p style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #666; margin: 0 0 8px 0;">Implicit</p>
            <ul style="margin: 0; padding-left: 20px;">
              ${analysis.assumptions.implicit.map(a => `<li style="font-size: 13px; line-height: 1.7; margin-bottom: 5px;">${a}</li>`).join("")}
            </ul>
          </div>

          <div style="margin-bottom: 28px;">
            <h2 style="font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 14px;">Weaknesses & Limitations</h2>
            <ul style="margin: 0; padding-left: 20px;">
              ${analysis.weaknesses.map(w => `<li style="font-size: 13px; line-height: 1.7; margin-bottom: 6px;">${w}</li>`).join("")}
            </ul>
          </div>

          <div style="margin-bottom: 28px;">
            <h2 style="font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 14px;">Peer Reviewer Questions</h2>
            ${analysis.reviewerQuestions.map((q, i) => `
              <div style="margin-bottom: 12px; padding: 12px 16px; background: #f8f8f8; border-radius: 4px;">
                <div style="font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #888; margin-bottom: 6px;">Q${String(i + 1).padStart(2, "0")}</div>
                <p style="font-size: 13px; line-height: 1.6; margin: 0; font-style: italic;">"${q}"</p>
              </div>
            `).join("")}
          </div>

          <div style="margin-bottom: 28px;">
            <h2 style="font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 14px;">Future Research Directions</h2>
            <ul style="margin: 0; padding-left: 20px;">
              ${analysis.futureDirections.map(f => `<li style="font-size: 13px; line-height: 1.7; margin-bottom: 6px;">${f}</li>`).join("")}
            </ul>
          </div>

          <div style="margin-bottom: 28px;">
            <h2 style="font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 14px;">Layperson Explanation</h2>
            <p style="font-size: 13px; line-height: 1.8; margin: 0;">${analysis.beginnerExplanation}</p>
          </div>

          <div style="margin-bottom: 32px;">
            <h2 style="font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 14px;">Keywords</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${analysis.keywords.map(k => `<span style="display: inline-block; padding: 4px 12px; background: #1a1a1a; color: white; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; border-radius: 2px;">${k}</span>`).join("")}
            </div>
          </div>

          <div style="border-top: 1px solid #ddd; padding-top: 16px; text-align: center;">
            <p style="font-size: 11px; color: #999; margin: 0;">Synthesized by PaperPilot • Powered by Google Gemini 3.5 Flash</p>
          </div>

        </div>
      `;

      const element = document.createElement("div");
      element.innerHTML = content;
      document.body.appendChild(element);

      const filename = `PaperPilot_${(paper.title || paper.fileName).replace(/\s+/g, "_").replace(/\.pdf$/i, "").substring(0, 60)}.pdf`;

      await html2pdf().set({
        margin: 0,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      }).from(element).save();

      document.body.removeChild(element);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={downloadPdf}
      disabled={loading}
      className="flex w-full items-center justify-between py-2.5 px-3 border border-[#1A1A1A] bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-[#1A1A1A] transition-colors duration-150 rounded-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span>{loading ? "Generating PDF..." : "Download Analysis"}</span>
      <Download className="h-3.5 w-3.5" />
    </button>
  );
}