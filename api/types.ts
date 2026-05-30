export interface RelatedPaper {
  title: string;
  authors: string[];
  abstract: string;
  arxivId: string;
  publishedDate: string;
  pdfUrl: string;
}

export interface Methodology {
  overview: string;
  steps: string[];
  novelty: string;
}

export interface Assumptions {
  explicit: string[];
  implicit: string[];
}

export interface AnalysisResult {
  tldr: string; // under 150 words
  executiveSummary: string; // 3-5 paragraph string
  mainContributions: string[];
  methodology: Methodology;
  assumptions: Assumptions;
  weaknesses: string[];
  reviewerQuestions: string[];
  futureDirections: string[];
  beginnerExplanation: string; // string with analogies
  keywords: string[]; // 5 strings
  confidence: "high" | "medium" | "low";
}

export interface PaperInfo {
  fileName: string;
  fileSize: number;
  extractedText: string;
  arxivId?: string;
  title?: string;
  authors?: string[];
  publishedDate?: string;
}

export interface AnalysisResponse {
  paper: PaperInfo;
  analysis: AnalysisResult;
  relatedPapers: RelatedPaper[];
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}
