import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { AgreementTemplate } from "./agreement-templates";

export type AgreementFieldValues = {
  clientName: string;
  clientEmail: string;
  phone: string;
  requestReference: string;
  projectType: string;
  location: string;
  budget: string;
  surface: string;
  notes: string;
  date: string;
  signatory: string;
};

export const EMPTY_FIELDS: AgreementFieldValues = {
  clientName: "",
  clientEmail: "",
  phone: "",
  requestReference: "",
  projectType: "",
  location: "",
  budget: "",
  surface: "",
  notes: "",
  date: new Date().toISOString().slice(0, 10),
  signatory: "Neova Space — Direction",
};

/** Generates a Neova-branded agreement summary PDF and returns its bytes. */
export async function generateAgreementPdf(
  template: AgreementTemplate,
  values: AgreementFieldValues,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4 portrait
  const { width, height } = page.getSize();

  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);

  const ink = rgb(0.08, 0.12, 0.18);
  const muted = rgb(0.42, 0.46, 0.52);
  const hair = rgb(0.85, 0.85, 0.85);
  const accent = rgb(0.55, 0.42, 0.27); // neova warm

  const margin = 50;
  let y = height - margin;

  // Header
  page.drawText("NEOVA", { x: margin, y, size: 18, font: bold, color: ink });
  page.drawText("S P A C E", { x: margin + 60, y: y + 2, size: 9, font: regular, color: muted });
  page.drawText(values.date, { x: width - margin - 70, y, size: 10, font: regular, color: muted });
  y -= 12;
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.6, color: hair });

  y -= 30;
  page.drawText(template.category.toUpperCase(), { x: margin, y, size: 8, font: bold, color: accent });
  y -= 16;
  // Title (wrap manually)
  const titleLines = wrap(template.name, 50);
  for (const line of titleLines) {
    page.drawText(line, { x: margin, y, size: 18, font: bold, color: ink });
    y -= 22;
  }

  y -= 6;
  for (const line of wrap(template.description, 95)) {
    page.drawText(line, { x: margin, y, size: 10, font: italic, color: muted });
    y -= 14;
  }

  // Parties / details block
  y -= 18;
  page.drawText("INFORMATIONS DU CLIENT", { x: margin, y, size: 9, font: bold, color: muted });
  y -= 14;
  y = drawRow(page, margin, y, "Nom", values.clientName, regular, bold, ink, muted);
  y = drawRow(page, margin, y, "Email", values.clientEmail, regular, bold, ink, muted);
  y = drawRow(page, margin, y, "Téléphone", values.phone, regular, bold, ink, muted);
  y = drawRow(page, margin, y, "Référence", values.requestReference, regular, bold, ink, muted);

  y -= 14;
  page.drawText("PROJET", { x: margin, y, size: 9, font: bold, color: muted });
  y -= 14;
  y = drawRow(page, margin, y, "Type", values.projectType, regular, bold, ink, muted);
  y = drawRow(page, margin, y, "Localisation", values.location, regular, bold, ink, muted);
  y = drawRow(page, margin, y, "Budget", values.budget, regular, bold, ink, muted);
  y = drawRow(page, margin, y, "Surface", values.surface, regular, bold, ink, muted);

  if (values.notes) {
    y -= 14;
    page.drawText("NOTES / CONDITIONS PARTICULIÈRES", { x: margin, y, size: 9, font: bold, color: muted });
    y -= 14;
    for (const line of wrap(values.notes, 95)) {
      page.drawText(line, { x: margin, y, size: 10, font: regular, color: ink });
      y -= 13;
    }
  }

  // Clauses
  y -= 14;
  page.drawText("ARTICLES", { x: margin, y, size: 9, font: bold, color: muted });
  y -= 14;
  template.clauses.forEach((clause, i) => {
    const lines = wrap(`${i + 1}. ${clause}`, 95);
    for (const line of lines) {
      if (y < 130) return; // stop if no room — keep summary on one page
      page.drawText(line, { x: margin, y, size: 10, font: regular, color: ink });
      y -= 13;
    }
    y -= 4;
  });

  // Signatures
  const sigY = 110;
  page.drawLine({ start: { x: margin, y: sigY }, end: { x: width - margin, y: sigY }, thickness: 0.4, color: hair });
  page.drawText("Le Client", { x: margin, y: sigY - 18, size: 9, font: bold, color: muted });
  page.drawText(values.clientName || "—", { x: margin, y: sigY - 34, size: 10, font: regular, color: ink });

  page.drawText("Pour Neova", { x: width / 2 + 10, y: sigY - 18, size: 9, font: bold, color: muted });
  page.drawText(values.signatory, { x: width / 2 + 10, y: sigY - 34, size: 10, font: regular, color: ink });
  page.drawText(`Date : ${values.date}`, { x: width / 2 + 10, y: sigY - 50, size: 9, font: regular, color: muted });

  page.drawText(
    "Document généré par Neova Space — résumé d'accord. L'original signé fait foi.",
    { x: margin, y: 40, size: 8, font: italic, color: muted },
  );

  return pdf.save();
}

function drawRow(
  page: any,
  x: number,
  y: number,
  label: string,
  value: string,
  regular: any,
  bold: any,
  ink: any,
  muted: any,
): number {
  page.drawText(label, { x, y, size: 10, font: bold, color: muted });
  page.drawText(value || "—", { x: x + 110, y, size: 10, font: regular, color: ink });
  return y - 14;
}

function wrap(text: string, max: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = cur ? cur + " " + w : w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

export function downloadBytes(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
