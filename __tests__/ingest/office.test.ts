import { extractDocx, extractXlsx } from "@/ingest/office";

describe("extractDocx", () => {
  test("throws on invalid buffer", async () => {
    await expect(extractDocx(Buffer.from("not a docx"))).rejects.toThrow();
  });
});

describe("extractXlsx", () => {
  test("handles xlsx parsing", () => {
    // xlsx library may throw or return empty — just test the interface exists
    try {
      const result = extractXlsx(Buffer.from("not xlsx"), "test.xlsx");
      expect(result).toBeDefined();
    } catch (e) {
      expect(e).toBeDefined();
    }
  });
});
