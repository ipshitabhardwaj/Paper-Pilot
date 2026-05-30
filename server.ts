import express from "express";
import path from "path";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { XMLParser } from "fast-xml-parser";
import "dotenv/config";
import { parseArxivId, fetchArxivPaper } from "./src/lib/arxiv";
import { searchRelatedPapers } from "./src/lib/arxiv-search";
import { analyzeScientificPaper } from "./src/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 35 * 1024 * 1024 }
});

async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = (pdfjsLib as any).getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str);
    fullText += strings.join(" ") + "\n";
  }
  return fullText.trim();
}

function getCleanText(parseResult: any): string {
  return parseResult && parseResult.text ? parseResult.text.trim() : "";
}

async function handlePdfUpload(req: express.Request, res: express.Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded. Please double check file format." });
    }

    let textContent = "";
    try {
      textContent = await extractPdfText(req.file.buffer);
      console.log("Extracted text length:", textContent.length, "| Preview:", textContent.substring(0, 200));
    } catch (parseError: any) {
      console.error("PDF Parsing error:", parseError);
      return res.status(422).json({ 
        error: `Failed to extract text from PDF: ${parseError.message || parseError}` 
      });
    }

    if (textContent.length < 150) {
      return res.status(422).json({
        error: "Insufficient text content extracted from the PDF. It might be scan-only or image-only without OCR encoding."
      });
    }

    const analysis = await analyzeScientificPaper(textContent);
    const paperTitle = req.file.originalname.replace(/\.[^/.]+$/, "");
    const keywords = analysis.keywords || [];
    const relatedPapers = await searchRelatedPapers(paperTitle, keywords);

    return res.json({
      paper: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        extractedText: textContent,
        title: paperTitle
      },
      analysis,
      relatedPapers
    });

  } catch (err: any) {
    console.error("PDF Upload analysis failure:", err);
    return res.status(500).json({ error: err.message || "An unexpected error occurred during paper analysis." });
  }
}

async function handleArxivUrl(req: express.Request, res: express.Response) {
  try {
    const { arxivId } = req.body;
    if (!arxivId) {
      return res.status(400).json({ error: "Missing required parameter arxivId." });
    }

    const cleanId = parseArxivId(arxivId);
    if (!cleanId) {
      return res.status(400).json({ error: "Provided input matches no valid arXiv URL or Paper ID format." });
    }

    let paperData;
    try {
      paperData = await fetchArxivPaper(cleanId);
    } catch (fetchErr: any) {
      console.error("arXiv Retrieval error:", fetchErr);
      return res.status(422).json({ 
        error: `Could not retrieve paper details from arXiv: ${fetchErr.message || fetchErr}` 
      });
    }

    const { title, authors, abstract, publishedDate, pdfBuffer } = paperData;

    let textContent = "";
    try {
      textContent = await extractPdfText(pdfBuffer);
      console.log("arXiv extracted text length:", textContent.length, "| Preview:", textContent.substring(0, 200));
    } catch (parseError: any) {
      console.error("arXiv PDF parse failure:", parseError);
      return res.status(422).json({
        error: `Failed to extract text from the arXiv PDF download: ${parseError.message || parseError}`
      });
    }

    const effectiveText = textContent.length > 200 
      ? textContent 
      : `${title}\n\nAbstract: ${abstract}`;

    const analysis = await analyzeScientificPaper(effectiveText);
    const keywords = analysis.keywords || [];
    const relatedPapers = await searchRelatedPapers(title, keywords);

    return res.json({
      paper: {
        fileName: `arxiv_${cleanId}.pdf`,
        fileSize: pdfBuffer.length,
        extractedText: effectiveText,
        arxivId: cleanId,
        title,
        authors,
        publishedDate
      },
      analysis,
      relatedPapers
    });

  } catch (err: any) {
    console.error("arXiv analysis pipeline error:", err);
    return res.status(500).json({ error: err.message || "An unexpected error occurred during arXiv paper analysis." });
  }
}

app.post("/api/paper/arxiv-metadata", async (req, res) => {
  try {
    const { arxivId } = req.body;
    if (!arxivId) {
      return res.status(400).json({ error: "ArXiv ID or URL is required." });
    }
    const cleanId = parseArxivId(arxivId);
    if (!cleanId) {
      return res.status(400).json({ error: "Invalid arXiv URL or ID format." });
    }
    
    const metadataUrl = `https://export.arxiv.org/api/query?id_list=${cleanId}`;
    const metaRes = await fetch(metadataUrl);
    if (!metaRes.ok) {
      throw new Error(`Failed to fetch metadata from arXiv (status ${metaRes.status})`);
    }
    const xmlText = await metaRes.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    const jsonObj = parser.parse(xmlText);
    const feed = jsonObj.feed;
    if (!feed || !feed.entry) {
      throw new Error(`Paper with ID "${cleanId}" not found on arXiv.`);
    }
    const entry = feed.entry;
    const title = (entry.title || "").replace(/\s+/g, " ").trim();
    let authors: string[] = [];
    if (entry.author) {
      const authorList = Array.isArray(entry.author) ? entry.author : [entry.author];
      authors = authorList.map((a: any) => a.name).filter(Boolean);
    }
    const abstract = (entry.summary || "").replace(/\s+/g, " ").trim();
    const publishedDate = entry.published || "";
    
    return res.json({ title, authors, abstract, publishedDate, arxivId: cleanId });
  } catch (err: any) {
    console.error("ArXiv metadata fetch failed:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch paper metadata." });
  }
});

app.post("/api/paper/upload", (req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  if (contentType.includes("multipart/form-data")) {
    upload.single("pdf")(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      handlePdfUpload(req, res);
    });
  } else {
    handleArxivUrl(req, res);
  }
});

app.post("/api/paper/chat", async (req, res) => {
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
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured." });
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
        If a question asks about details not present in the paper, clearly state: "This information is not present in the research paper."
        Never invent, extrapolate, or hallucinate scientific claims.`
      }
    });

    return res.json({ answer: response.text || "No response received." });

  } catch (err: any) {
    console.error("Chat engine controller failure:", err);
    return res.status(500).json({ error: err.message || "An unexpected error occurred during chat reasoning." });
  }
});

async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PaperPilot Server fully booted on http://0.0.0.0:${PORT}`);
  });
}

initServer().catch((e) => {
  console.error("Failed to start server:", e);
});