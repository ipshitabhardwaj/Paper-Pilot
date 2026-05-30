import { XMLParser } from "fast-xml-parser";
import { RelatedPaper } from "../types";

/**
 * Search arXiv for related papers based on the title and top keywords.
 */
export async function searchRelatedPapers(title: string, keywords: string[]): Promise<RelatedPaper[]> {
  try {
    // Build a search query prioritising keywords and first few words of the title
    const cleanTitle = title.replace(/[^a-zA-Z0-9\s]/g, "").trim();
    const titleWords = cleanTitle.split(/\s+/).slice(0, 3).filter(w => w.length > 2).join("+AND+ti:");
    
    // We search the title for terms, or fallback/expand with keywords
    let queryPart = "";
    if (titleWords) {
      queryPart = `ti:${titleWords}`;
    }
    
    const validKeywords = (keywords || []).slice(0, 3).map(k => k.trim()).filter(k => k.length > 0);
    if (validKeywords.length > 0) {
      const keywordTerms = validKeywords.map(k => `all:${encodeURIComponent(k)}`).join("+AND+");
      if (queryPart) {
        queryPart = `(${queryPart})+OR+(${keywordTerms})`;
      } else {
        queryPart = keywordTerms;
      }
    }
    
    if (!queryPart) {
      // safe fallback
      queryPart = "all:deep+learning";
    }

    const url = `https://export.arxiv.org/api/query?search_query=${queryPart}&max_results=5`;
    const res = await fetch(url);
    if (!res.ok) {
      return [];
    }
    
    const xmlText = await res.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
    const jsonObj = parser.parse(xmlText);
    const feed = jsonObj.feed;
    if (!feed || !feed.entry) {
      return [];
    }
    
    const entries = Array.isArray(feed.entry) ? feed.entry : [feed.entry];
    const related: RelatedPaper[] = [];
    
    for (const entry of entries) {
      const idUrl = entry.id || "";
      const arxivIdMatch = idUrl.match(/\/abs\/(.+)$/);
      const arxivId = arxivIdMatch ? arxivIdMatch[1] : "";
      
      if (!arxivId) continue;
      
      // Skip the source paper itself if it is found in the search
      const cleanEntryTitle = (entry.title || "").replace(/\s+/g, " ").trim();
      if (cleanEntryTitle.toLowerCase() === title.toLowerCase()) {
        continue;
      }
      
      let authors: string[] = [];
      if (entry.author) {
        const authorList = Array.isArray(entry.author) ? entry.author : [entry.author];
        authors = authorList.map((a: any) => a.name).filter(Boolean);
      }
      
      related.push({
        title: cleanEntryTitle,
        authors,
        abstract: (entry.summary || "").replace(/\s+/g, " ").trim(),
        arxivId,
        publishedDate: entry.published || "",
        pdfUrl: `https://arxiv.org/pdf/${arxivId}.pdf`
      });
    }
    
    return related;
  } catch (err) {
    console.error("Related papers search failed, returning backup list:", err);
    return [];
  }
}
