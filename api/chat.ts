import type { Request, Response } from "express";

export default async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { extractedText, message, history } = req.body;

    if (!extractedText) {
      return res.status(400).json({ error: "Missing paper content. Please upload or fetch a research paper first." });
    }
    if (!message) {
      return res.status(400).json({ error: "Missing prompt query message." });
    }
    
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY environment variable is not configured. Please supply an API key in visual secrets panel." 
      });
    }

    const trimmedContext = extractedText.length > 250000 
      ? extractedText.substring(0, 250000) + "\n\n[CONTENT TRUNCATED]"
      : extractedText;

    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: key, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });

    const contents: any[] = [
      {
        role: "user",
        parts: [{ text: `Here is the research paper content to use as your absolute boundary of truth. Answer user Q&As ONLY from this paper.\n\nPaper Content:\n${trimmedContext}` }]
      }
    ];

    if (Array.isArray(history)) {
      for (const h of history) {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        });
      }
    }

    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: `You are PaperPilot's expert scientific peer-reviewer. 
        Your absolute directive is to answer questions strictly using facts directly detailed in the provided paper context.
        If a question asks about details, datasets, experiments, or hypotheses not discussed or supported in the paper context, you must clearly and transparently state: "This information is not present in the research paper."
        Do not make assumptions outside of standard, common sense logic. Never invent, extrapolate, or hallucinate scientific claims.`
      }
    });

    return res.json({
      answer: response.text || "No response received."
    });

  } catch (err: any) {
    console.error("Chat engine controller failure:", err);
    return res.status(500).json({ error: err.message || "An unexpected error occurred during chat reasoning." });
  }
}
