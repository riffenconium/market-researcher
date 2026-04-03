import { PDFParse } from "pdf-parse";

export interface ExtractedDocument {
  text: string;
  metadata: {
    pageCount?: number;
    title?: string;
    source: string;
  };
}

export async function extractPdf(buffer: Buffer, fileName?: string): Promise<ExtractedDocument> {
  const parser = new PDFParse({ data: buffer });
  const [textResult, infoResult] = await Promise.all([
    parser.getText(),
    parser.getInfo(),
  ]);
  return {
    text: textResult.text,
    metadata: {
      pageCount: infoResult.total,
      title: (infoResult.info as Record<string, unknown>)?.Title as string | undefined || fileName || "Unknown",
      source: fileName || "uploaded-pdf",
    },
  };
}
