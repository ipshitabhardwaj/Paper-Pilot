import { XMLParser } from "fast-xml-parser";

/**
 * Parsers arXiv ID from various URLs or a bare ID:
 * - arxiv.org/abs/2301.07041
 * - arxiv.org/pdf/2301.07041
 * - 2301.07041
 */
export function parseArxivId(input: string): string | null {
  const trimmed = input.trim();
  
  // Regex to match arxiv.org/abs/2301.07041, arxiv.org/pdf/2301.07041, or simple 2301.07041 (with optional version suffix)
  const regex = /(?:arxiv\.org\/(?:abs|pdf)\/|arxiv:)?([0-9]+\.[0-9]+v?[0-9]*)/i;
  const match = trimmed.match(regex);
  if (match) {
    return match[1];
  }
  
  // Check for raw format like 2301.07041
  const rawMatch = trimmed.match(/^([0-9]+\.[0-9]+v?[0-9]*)$/);
  if (rawMatch) {
    return rawMatch[1];
  }
  
  return null;
}

/**
 * Fetch paper metadata from arXiv details API and download the PDF.
 * Returns information needed for parsing and analysis.
 */
export async function fetchArxivPaper(id: string) {
  // 1. Fetch metadata from arXiv XML API
  const metadataUrl = `https://export.arxiv.org/api/query?id_list=${id}`;
  const metaRes = await fetch(metadataUrl);
  if (!metaRes.ok) {
    throw new Error(`Failed to fetch metadata from arXiv for ID ${id} (status ${metaRes.status})`);
  }
  const xmlText = await metaRes.text();
  
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_"
  });
  const jsonObj = parser.parse(xmlText);
  
  const feed = jsonObj.feed;
  if (!feed || !feed.entry) {
    throw new Error(`ArXiv paper ID "${id}" was not found or is in an invalid state on arXiv.`);
  }
  
  const entry = feed.entry;
  const title = (entry.title || "").replace(/\s+/g, " ").trim();
  const abstract = (entry.summary || "").replace(/\s+/g, " ").trim();
  const publishedDate = entry.published || "";
  
  // Extract authors
  let authors: string[] = [];
  if (entry.author) {
    const authorList = Array.isArray(entry.author) ? entry.author : [entry.author];
    authors = authorList.map((a: any) => a.name).filter(Boolean);
  }
  
  // 2. Fetch standard PDF stream/bytes
  const pdfUrl = `https://arxiv.org/pdf/${id}.pdf`;
  const pdfRes = await fetch(pdfUrl);
  if (!pdfRes.ok) {
    // Some older papers use pdfs/ID format or need /pdf/ path mapping
    throw new Error(`Failed to download full text PDF from arXiv for ID ${id} (status ${pdfRes.status})`);
  }
  
  const arrayBuf = await pdfRes.arrayBuffer();
  const pdfBuffer = Buffer.from(arrayBuf);
  
  return {
    title,
    authors,
    abstract,
    publishedDate,
    pdfBuffer,
    arxivId: id
  };
}
