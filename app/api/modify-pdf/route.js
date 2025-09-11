import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  PDFDocument,
  StandardFonts,
  rgb,
  PDFArray,
  PDFName,
  PDFNumber,
} from "pdf-lib";

export async function GET() {
  try {
    const inputPath = path.join(
      process.cwd(),
      "public",
      "report-1756997438085.pdf"
    );
    const existingPdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // 1. Remove first page
    if (pdfDoc.getPageCount() > 0) pdfDoc.removePage(0);

    // 2. Add custom first page
    const newPage = pdfDoc.addPage();
    const { width, height } = newPage.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    newPage.drawText("My Custom First Page", {
      x: 50,
      y: height - 100,
      size: 24,
      font,
      color: rgb(0.2, 0.2, 0.8),
    });

    // Move new page to front
    const pages = pdfDoc.getPages();
    pdfDoc.insertPage(0, pages.pop());

    const FOOTER_HEIGHT = 50;

    // 3. Remove footer + links from each page
    pdfDoc.getPages().forEach((page, index) => {
      const { width: pageWidth } = page.getSize();

      const annots = page.node.Annots();
      if (annots && annots instanceof PDFArray) {
        const keptRefs = [];

        for (let i = 0; i < annots.size(); i++) {
          const ref = annots.get(i); // should be a PDFRef
          const annotDict = pdfDoc.context.lookup(ref);

          if (annotDict) {
            const rect = annotDict.get(PDFName.of("Rect"));
            if (rect && rect instanceof PDFArray && rect.size() === 4) {
              const y1 = (rect.get(1) ).number;
              const y2 = (rect.get(3) ).number;

              const inFooter = y1 < FOOTER_HEIGHT || y2 < FOOTER_HEIGHT;
              if (!inFooter) {
                keptRefs.push(ref); // keep the ref
              }
            } else {
              keptRefs.push(ref); // keep if no rect
            }
          } else {
            keptRefs.push(ref); // fallback: keep
          }
        }

        // Reset annots with only the kept refs
        page.node.set(PDFName.of("Annots"), PDFArray.withContext(pdfDoc.context, keptRefs));
      }

      // Cover old footer visually
      page.drawRectangle({
        x: 0,
        y: 0,
        width: pageWidth,
        height: FOOTER_HEIGHT,
        color: rgb(1, 1, 1),
      });

      // Add new footer
      page.drawText(`Custom Footer - Page ${index + 1}`, {
        x: 50,
        y: 20,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
    });

    // 4. Save updated file
    const outDir = path.join(process.cwd(), "reports");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const newPdfBytes = await pdfDoc.save();
    const outputPath = path.join(outDir, "sample-updated1.pdf");
    fs.writeFileSync(outputPath, newPdfBytes);

    return NextResponse.json({
      message: "PDF updated successfully!",
      path: outputPath,
    });
  } catch (err) {
    console.error("PDF processing error:", err);
    return NextResponse.json(
      { error: "Failed to process PDF", details: String(err) },
      { status: 500 }
    );
  }
}
