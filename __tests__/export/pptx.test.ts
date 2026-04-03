import { generateDeck } from "@/export/pptx";
import type { SlideOutline } from "@/agent/types";

describe("generateDeck", () => {
  test("generates a pptx buffer from slide outline", async () => {
    const outline: SlideOutline = {
      slides: [
        {
          position: 1,
          title: "Global coconut market reached $12B in 2025",
          keyPoints: ["Production grew 5% YoY", "Indonesia leads with 35% share"],
          supportingData: ["$12B market size", "65M tonnes production"],
          sourcesCited: ["FAO Report 2025"],
          speakerNotes: "Open with the headline number to set context.",
        },
        {
          position: 2,
          title: "Southeast Asia dominates production but Africa is rising",
          keyPoints: ["Philippines and Indonesia account for 60%", "African production up 12%"],
          supportingData: ["60% production share", "12% African growth"],
          sourcesCited: ["Trade Data 2025"],
          speakerNotes: "Emphasize the shift in production geography.",
        },
      ],
    };

    const buffer = await generateDeck(outline, "Coconut Industry Analysis");
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);
  });
});
