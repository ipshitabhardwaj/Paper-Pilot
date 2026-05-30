import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

let aiClient: GoogleGenAI | null = null;

/**
 * Returns the GoogleGenAI client with lazy-loading to ensure API key presence
 * doesn't cause startup crashes if missing.
 */
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please supply an API key in visual secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// Complete schema object matching requested production JSON shapes
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    tldr: {
      type: Type.STRING,
      description: "A punchy summary of the entire paper in under 150 words."
    },
    executiveSummary: {
      type: Type.STRING,
      description: "A comprehensive, 3 to 5 paragraph scholarly yet readable executive summary of the paper."
    },
    mainContributions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of the original scientific, mathematical, or empirical contributions."
    },
    methodology: {
      type: Type.OBJECT,
      properties: {
        overview: { type: Type.STRING, description: "High level summary of the research methodology." },
        steps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific sequential stages, algorithms, or processes." },
        novelty: { type: Type.STRING, description: "Key advancements of this method compared to standard baselines." }
      },
      required: ["overview", "steps", "novelty"]
    },
    assumptions: {
      type: Type.OBJECT,
      properties: {
        explicit: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Explicit limits, premises, configurations, or hardware boundaries mentioned." },
        implicit: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Hidden, unstated assumptions, sampling biases, or bounds inferred with logical reasoning." }
      },
      required: ["explicit", "implicit"]
    },
    weaknesses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Real structural limitations, dataset biases, compute parameters, or validation weaknesses."
    },
    reviewerQuestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Peer reviewer journal defense-level questions challenging specific validation, mathematical proofs or assumptions."
    },
    futureDirections: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Horizons or ideas for future research or logical extensions."
    },
    beginnerExplanation: {
      type: Type.STRING,
      description: "A clear layperson analogy explaining what this paper achieves."
    },
    keywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Exactly 5 concise academic search keywords representing the primary fields of study."
    },
    confidence: {
      type: Type.STRING,
      enum: ["high", "medium", "low"],
      description: "Expert level confidence score of the analysis based on content completeness. 'high' for rich full content; 'medium' if something is missing; 'low' if paper text is very short or sparse."
    }
  },
  required: [
    "tldr",
    "executiveSummary",
    "mainContributions",
    "methodology",
    "assumptions",
    "weaknesses",
    "reviewerQuestions",
    "futureDirections",
    "beginnerExplanation",
    "keywords",
    "confidence"
  ]
};

/**
 * Executes scholarly research analysis using Gemini 3.5 Flash
 */
export async function analyzeScientificPaper(text: string): Promise<AnalysisResult> {
  const ai = getAiClient();
  
  // Prune text limit to prevent extreme contexts
  const trimmed = text.length > 350000 
    ? text.substring(0, 350000) + "\n\n[CONTENT TRUNCATED FOR MAXIMUM PROCESSING SPEED]"
    : text;
    
  const prompt = `You are an elite, objective, and highly skeptical academic researcher, journal editor, and science communicator.
Analyze the scientific paper text provided inside the blocks below. Generate comprehensive, deeply scholarly insights following the requested structure.

Research Paper Text Content:
---
${trimmed}
---

Generate insights strictly matching the schema requirements. Ensure the 'confidence' field reflects paper fidelity:
- Use 'high' if the PDF has comprehensive text, math, tables, and discussions.
- Use 'medium' if the paper lacks details in core methodology or validation.
- Use 'low' if the text extraction returned extremely sparse words or suggests a low-detail or partial screenshot document.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      systemInstruction: "You speak with high mathematical and scientific precision. Strip vague marketing slogans. Formulate rigorous critiques."
    }
  });

  const parsedText = response.text || "";
  
  // Robust cleaning of markdown blocks
  const cleanJsonText = parsedText.replace(/```json|```/g, "").trim();
  
  try {
    return JSON.parse(cleanJsonText) as AnalysisResult;
  } catch (parseErr) {
    console.error("Failed to parse clean JSON:", cleanJsonText);
    throw new Error("Gemini returned invalid JSON structure. Please retry analysis.");
  }
}
