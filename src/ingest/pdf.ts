import pdfParse from "pdf-parse";

export interface ExtractedDocument {
  text: string;
  metadata: {
    pageCount?: number;
    title?: string;
    source: string;
  };
}

export async function extractPdf(buffer: Buffer, fileName?: string): Promise<ExtractedDocument> {
  const data = await pdfParse(buffer);
  return {
    text: data.text,
    metadata: {
      pageCount: data.numpages,
      title: data.info?.Title || fileName || "Unknown",
      source: fileName || "uploaded-pdf",
    },
  };
}
