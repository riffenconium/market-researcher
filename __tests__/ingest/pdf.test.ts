import { extractPdf } from "@/ingest/pdf";

describe("extractPdf", () => {
  test("throws on invalid PDF buffer", async () => {
    await expect(extractPdf(Buffer.from("not a real pdf"))).rejects.toThrow();
  });
});
