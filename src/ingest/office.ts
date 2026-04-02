import mammoth from "mammoth";
import * as XLSX from "xlsx";
import { ExtractedDocument } from "./pdf";

export async function extractDocx(buffer: Buffer, fileName?: string): Promise<ExtractedDocument> {
  const result = await mammoth.extractRawText({ buffer });
  return {
    text: result.value,
    metadata: { title: fileName || "uploaded-docx", source: fileName || "uploaded-docx" },
  };
}

export function extractXlsx(buffer: Buffer, fileName?: string): ExtractedDocument {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheets: string[] = [];
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    sheets.push(`## Sheet: ${sheetName}\n${csv}`);
  }
  return {
    text: sheets.join("\n\n"),
    metadata: { title: fileName || "uploaded-xlsx", source: fileName || "uploaded-xlsx" },
  };
}
