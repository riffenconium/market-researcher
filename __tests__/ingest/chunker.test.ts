import { chunkText } from "@/ingest/chunker";

describe("chunkText", () => {
  test("splits text into chunks respecting paragraph boundaries", () => {
    const text = "Paragraph one about coconut production.\n\nParagraph two about trade flows.\n\nParagraph three about pricing.";
    const chunks = chunkText(text, 80);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.content).not.toMatch(/^\s/);
    }
  });

  test("returns single chunk for short text", () => {
    const text = "Short text.";
    const chunks = chunkText(text, 1000);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].content).toBe("Short text.");
    expect(chunks[0].chunkIndex).toBe(0);
  });

  test("preserves chunk ordering via chunkIndex", () => {
    const paragraphs = Array.from({ length: 10 }, (_, i) => `Paragraph ${i} with enough text to be meaningful.`);
    const text = paragraphs.join("\n\n");
    const chunks = chunkText(text, 100);
    for (let i = 0; i < chunks.length; i++) {
      expect(chunks[i].chunkIndex).toBe(i);
    }
  });
});
