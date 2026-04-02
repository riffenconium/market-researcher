import * as cheerio from "cheerio";
import { ExtractedDocument } from "./pdf";

export function extractFromHtml(html: string, url: string): ExtractedDocument {
  const $ = cheerio.load(html);
  $("script, style, nav, footer, header, aside, .ad, .sidebar").remove();

  let text = "";
  const mainContent = $("main, article, [role='main']").first();
  if (mainContent.length) {
    text = mainContent.text();
  } else {
    text = $("body").text();
  }

  text = text.replace(/\s+/g, " ").trim();
  const title = $("title").text().trim() || $("h1").first().text().trim() || url;

  return {
    text,
    metadata: { title, source: url },
  };
}

export async function extractUrl(url: string): Promise<ExtractedDocument> {
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; MarketResearcher/1.0)" },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  const html = await response.text();
  return extractFromHtml(html, url);
}
