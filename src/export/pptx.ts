import PptxGenJS from "pptxgenjs";
import type { SlideOutline } from "@/agent/types";

const COLORS = {
  dark: "1a1a2e",
  accent: "16213e",
  text: "333333",
  lightText: "666666",
  white: "FFFFFF",
  sourceStrip: "e8e8e8",
  titleBg: "0f3460",
};

export async function generateDeck(outline: SlideOutline, deckTitle: string): Promise<Buffer> {
  const pptx = new PptxGenJS();

  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "AI Market Researcher";
  pptx.title = deckTitle;

  // Title slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: COLORS.titleBg };
  titleSlide.addText(deckTitle, {
    x: 0.8,
    y: 1.5,
    w: 11,
    h: 2,
    fontSize: 36,
    fontFace: "Arial",
    color: COLORS.white,
    bold: true,
  });
  titleSlide.addText("AI-Powered Market Research", {
    x: 0.8,
    y: 3.5,
    w: 11,
    fontSize: 18,
    fontFace: "Arial",
    color: COLORS.white,
    italic: true,
  });

  // Content slides
  for (const slideData of outline.slides) {
    const slide = pptx.addSlide();

    // Action title bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: 13.33,
      h: 1.1,
      fill: { color: COLORS.titleBg },
    });

    slide.addText(slideData.title, {
      x: 0.5,
      y: 0.15,
      w: 12,
      h: 0.8,
      fontSize: 20,
      fontFace: "Arial",
      color: COLORS.white,
      bold: true,
      valign: "middle",
    });

    // Key points
    const bulletPoints = slideData.keyPoints.map((point) => ({
      text: point,
      options: {
        fontSize: 14,
        fontFace: "Arial" as const,
        color: COLORS.text,
        bullet: { type: "bullet" as const },
        paraSpaceAfter: 8,
      },
    }));

    slide.addText(bulletPoints, {
      x: 0.5,
      y: 1.4,
      w: 7.5,
      h: 4,
      valign: "top",
    });

    // Supporting data sidebar
    if (slideData.supportingData.length > 0) {
      slide.addShape(pptx.ShapeType.rect, {
        x: 8.5,
        y: 1.4,
        w: 4.3,
        h: 4,
        fill: { color: "f5f5f5" },
        rectRadius: 0.1,
      });

      slide.addText("Key Data", {
        x: 8.8,
        y: 1.5,
        w: 3.8,
        h: 0.4,
        fontSize: 12,
        fontFace: "Arial",
        bold: true,
        color: COLORS.accent,
      });

      const dataPoints = slideData.supportingData.map((d) => ({
        text: d,
        options: {
          fontSize: 11,
          fontFace: "Arial" as const,
          color: COLORS.text,
          bullet: { type: "bullet" as const },
          paraSpaceAfter: 6,
        },
      }));

      slide.addText(dataPoints, {
        x: 8.8,
        y: 2.0,
        w: 3.8,
        h: 3.2,
        valign: "top",
      });
    }

    // Source strip at bottom
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 6.8,
      w: 13.33,
      h: 0.7,
      fill: { color: COLORS.sourceStrip },
    });

    slide.addText(`Sources: ${slideData.sourcesCited.join("; ")}`, {
      x: 0.5,
      y: 6.85,
      w: 12,
      h: 0.5,
      fontSize: 8,
      fontFace: "Arial",
      color: COLORS.lightText,
      italic: true,
    });

    // Speaker notes
    if (slideData.speakerNotes) {
      slide.addNotes(slideData.speakerNotes);
    }
  }

  const output = await pptx.write({ outputType: "nodebuffer" });
  return output as Buffer;
}
