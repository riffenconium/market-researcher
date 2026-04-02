import { extractFromHtml } from "@/ingest/web";

describe("extractFromHtml", () => {
  test("extracts text from HTML string", () => {
    const html = `<html><head><title>Test Page</title></head><body><main><h1>Main Content</h1><p>This is the important text.</p></main></body></html>`;
    const result = extractFromHtml(html, "https://example.com");
    expect(result.text).toContain("Main Content");
    expect(result.text).toContain("important text");
    expect(result.metadata.source).toBe("https://example.com");
  });

  test("removes nav/footer/script elements", () => {
    const html = `<html><body><nav>Nav</nav><main><p>Content</p></main><footer>Footer</footer><script>var x=1;</script></body></html>`;
    const result = extractFromHtml(html, "https://example.com");
    expect(result.text).toContain("Content");
    expect(result.text).not.toContain("Nav");
    expect(result.text).not.toContain("Footer");
  });
});
