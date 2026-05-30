import type { Request, Response } from "express";
import { XMLParser } from "fast-xml-parser";
import { parseArxivId } from "./arxiv";

export default async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
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
}
