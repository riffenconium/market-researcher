import { extractPdf, ExtractedDocument } from "./pdf";
import { extractUrl } from "./web";
import { extractDocx, extractXlsx } from "./office";
import { chunkText } from "./chunker";
import type Database from "better-sqlite3";
import { createSource, updateSourceStatus, createChunks } from "@/db/queries";

interface IngestFileInput {
  projectId: string;
  fileName: string;
  fileType: "pdf" | "docx" | "xlsx" | "csv";
  buffer: Buffer;
}

interface IngestUrlInput {
  projectId: string;
  url: string;
}

interface IngestTextInput {
  projectId: string;
  name: string;
  text: string;
}

export async function ingestFile(db: Database.Database, input: IngestFileInput): Promise<string> {
  const sourceId = createSource(db, {
    projectId: input.projectId,
    name: input.fileName,
    type: input.fileType,
  });

  try {
    updateSourceStatus(db, sourceId, "processing");

    let doc: ExtractedDocument;
    switch (input.fileType) {
      case "pdf":
        doc = await extractPdf(input.buffer, input.fileName);
        break;
      case "docx":
        doc = await extractDocx(input.buffer, input.fileName);
        break;
      case "xlsx":
      case "csv":
        doc = extractXlsx(input.buffer, input.fileName);
        break;
      default:
        throw new Error(`Unsupported file type: ${input.fileType}`);
    }

    const chunks = chunkText(doc.text);
    createChunks(
      db,
      sourceId,
      chunks.map((c) => ({
        content: c.content,
        metadata: JSON.stringify(doc.metadata),
        chunkIndex: c.chunkIndex,
      }))
    );

    updateSourceStatus(db, sourceId, "ready");
    return sourceId;
  } catch (error) {
    updateSourceStatus(db, sourceId, "error");
    throw error;
  }
}

export async function ingestUrl(db: Database.Database, input: IngestUrlInput): Promise<string> {
  const sourceId = createSource(db, {
    projectId: input.projectId,
    name: input.url,
    type: "url",
  });

  try {
    updateSourceStatus(db, sourceId, "processing");
    const doc = await extractUrl(input.url);

    const chunks = chunkText(doc.text);
    createChunks(
      db,
      sourceId,
      chunks.map((c) => ({
        content: c.content,
        metadata: JSON.stringify(doc.metadata),
        chunkIndex: c.chunkIndex,
      }))
    );

    updateSourceStatus(db, sourceId, "ready");
    return sourceId;
  } catch (error) {
    updateSourceStatus(db, sourceId, "error");
    throw error;
  }
}

export async function ingestText(db: Database.Database, input: IngestTextInput): Promise<string> {
  const sourceId = createSource(db, {
    projectId: input.projectId,
    name: input.name,
    type: "text",
  });

  try {
    updateSourceStatus(db, sourceId, "processing");

    const chunks = chunkText(input.text);
    createChunks(
      db,
      sourceId,
      chunks.map((c) => ({
        content: c.content,
        metadata: JSON.stringify({ title: input.name, source: "pasted-text" }),
        chunkIndex: c.chunkIndex,
      }))
    );

    updateSourceStatus(db, sourceId, "ready");
    return sourceId;
  } catch (error) {
    updateSourceStatus(db, sourceId, "error");
    throw error;
  }
}
