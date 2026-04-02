export interface Chunk {
  content: string;
  chunkIndex: number;
}

export function chunkText(text: string, maxChunkSize: number = 4000): Chunk[] {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  if (paragraphs.length === 0) {
    return [{ content: text.trim(), chunkIndex: 0 }];
  }

  const chunks: Chunk[] = [];
  let currentChunk = "";
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();

    if (currentChunk.length + trimmed.length + 2 > maxChunkSize && currentChunk.length > 0) {
      chunks.push({ content: currentChunk.trim(), chunkIndex });
      chunkIndex++;
      currentChunk = trimmed;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + trimmed;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({ content: currentChunk.trim(), chunkIndex });
  }

  return chunks;
}
