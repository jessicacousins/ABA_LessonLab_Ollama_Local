import jsPDF from "jspdf";

export function downloadLessonPDF({ title, metaLines, bodyText }) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const usableWidth = pageWidth - margin * 2;

  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title || "ABA Lesson Plan", margin, y);
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const meta = (metaLines || []).filter(Boolean);
  meta.forEach(line => {
    const split = doc.splitTextToSize(line, usableWidth);
    split.forEach(s => {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(s, margin, y);
      y += 14;
    });
  });

  if (meta.length) y += 10;

  doc.setFontSize(11);
  const paragraphs = String(bodyText || "").split("\n");
  for (const p of paragraphs) {
    const line = p.trimEnd();
    const split = doc.splitTextToSize(line.length ? line : " ", usableWidth);
    for (const s of split) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(s, margin, y);
      y += 14;
    }
  }

  const safe = (title || "lesson_plan").replace(/[^a-z0-9\-\_]+/gi, "_").slice(0, 64);
  doc.save(`${safe}.pdf`);
}
