import { generateId, formatDate } from "@/lib/utils";

describe("generateId", () => {
  it("returns a non-empty string", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("returns unique values", () => {
    const ids = new Set(Array.from({ length: 20 }, () => generateId()));
    expect(ids.size).toBe(20);
  });
});

describe("formatDate", () => {
  it("formats a date as YYYY-MM-DD", () => {
    const d = new Date("2026-04-02T10:00:00.000Z");
    expect(formatDate(d)).toBe("2026-04-02");
  });
});
