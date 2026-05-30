import type { Request, Response } from "express";
import multer from "multer";
import { parseArxivId, fetchArxivPaper } from "../src/lib/arxiv";
import { searchRelatedPapers } from "../src/lib/arxiv-search";
import { analyzeScientificPaper } from "../src/lib/gemini";

export const config = {
  api: {
    bodyParser: false,
  },
};

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 35 * 1024 * 1024 }
});

async function getPdfParse() {
  const mod = await import("pdf-parse");
  return (mod as any).default || mod;
}

function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

function getCleanText(parseResult: any): string {
  return parseResult && parseResult.text ? parseResult.text.trim() : "";
}

async function parseJsonBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk: any) => { body += chunk; });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", (err: any) => reject(err));
  });
}

async function handlePdfUpload(req: any, res: any) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded. Please double check file format." });
    }

    const pdfParse = await getPdfParse();

    let parseResult;
    try {
      parseResult = await pdfParse(req.file.buffer);
    } catch (parseError: any) {
      console.error("PDF Parsing error:", parseError);
      return res.status(422).json({ 
        error: `Failed to extract text from PDF. File might be corrupted or standard layout matches failed: ${parseError.message || parseError}` 
      });
    }

    const textContent = getCleanText(parseResult);
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

async function handleArxivUrl(req: any, res: any) {
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
    const pdfParse = await getPdfParse();

    let parseResult;
    try {
      parseResult = await pdfParse(pdfBuffer);
    } catch (parseError: any) {
      console.error("arXiv PDF parse failure:", parseError);
      return res.status(422).json({
        error: `Failed to extract text from the arXiv PDF download: ${parseError.message || parseError}`
      });
    }

    const textContent = getCleanText(parseResult);
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

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const contentType = req.headers["content-type"] || "";
  if (contentType.includes("multipart/form-data")) {
    try {
      await runMiddleware(req, res, upload.single("pdf"));
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
    return handlePdfUpload(req, res);
  } else {
    try {
      const body = await parseJsonBody(req);
      req.body = body;
    } catch (err: any) {
      return res.status(400).json({ error: "Invalid JSON payload" });
    }
    return handleArxivUrl(req, res);
  }
}