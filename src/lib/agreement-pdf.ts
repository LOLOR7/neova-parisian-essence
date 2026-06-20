import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import {
  type AgreementField,
  type AgreementTemplate,
  SECTION_LABELS,
  fieldsBySection,
} from "./agreement-templates";
import wordmarkAsset from "@/assets/neova-wordmark.png.asset.json";

export type AgreementValues = Record<string, string>;

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 56;
const INK = rgb(0.08, 0.12, 0.18);
const MUTED = rgb(0.42, 0.46, 0.52);
const HAIR = rgb(0.85, 0.85, 0.85);
const ACCENT = rgb(0.55, 0.42, 0.27);

type Ctx = {
  pdf: PDFDocument;
  page: PDFPage;
  y: number;
  regular: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
};

const fmtDate = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
};

function newPage(ctx: Ctx) {
  ctx.page = ctx.pdf.addPage([PAGE_W, PAGE_H]);
  ctx.y = PAGE_H - MARGIN;
}

function ensure(ctx: Ctx, needed: number) {
  if (ctx.y - needed < MARGIN + 30) newPage(ctx);
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const paragraphs = (text || "").split(/\n+/);
  const lines: string[] = [];
  for (const p of paragraphs) {
    if (!p.trim()) { lines.push(""); continue; }
    const words = p.split(/\s+/);
    let cur = "";
    for (const w of words) {
      const test = cur ? cur + " " + w : w;
      if (font.widthOfTextAtSize(test, size) > maxWidth) {
        if (cur) lines.push(cur);
        cur = w;
      } else cur = test;
    }
    if (cur) lines.push(cur);
  }
  return lines;
}

function drawParagraph(ctx: Ctx, text: string, opts: { size?: number; font?: PDFFont; color?: any; lineGap?: number } = {}) {
  const size = opts.size ?? 10;
  const font = opts.font ?? ctx.regular;
  const color = opts.color ?? INK;
  const gap = opts.lineGap ?? 3;
  const lines = wrap(text || "—", font, size, PAGE_W - MARGIN * 2);
  for (const line of lines) {
    ensure(ctx, size + gap);
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y - size, size, font, color });
    ctx.y -= size + gap;
  }
}

function drawSectionHeader(ctx: Ctx, title: string) {
  ensure(ctx, 40);
  ctx.y -= 12;
  ctx.page.drawText(title.toUpperCase(), {
    x: MARGIN, y: ctx.y - 9, size: 9, font: ctx.bold, color: ACCENT,
  });
  ctx.y -= 12;
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y }, end: { x: PAGE_W - MARGIN, y: ctx.y },
    thickness: 0.5, color: HAIR,
  });
  ctx.y -= 10;
}

function drawLabelValue(ctx: Ctx, label: string, value: string, isDate = false) {
  const v = isDate ? fmtDate(value) : (value || "—");
  ensure(ctx, 26);
  ctx.page.drawText(label, { x: MARGIN, y: ctx.y - 9, size: 8, font: ctx.bold, color: MUTED });
  ctx.y -= 11;
  const lines = wrap(v, ctx.regular, 10.5, PAGE_W - MARGIN * 2);
  for (const line of lines) {
    ensure(ctx, 14);
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y - 10, size: 10.5, font: ctx.regular, color: INK });
    ctx.y -= 14;
  }
  ctx.y -= 4;
}

function drawFieldsBlock(ctx: Ctx, fields: AgreementField[], values: AgreementValues) {
  for (const f of fields) {
    drawLabelValue(ctx, f.label, values[f.key] || "", f.type === "date");
  }
}

function drawClauses(ctx: Ctx, clauses: string[]) {
  drawSectionHeader(ctx, "Clauses générales");
  clauses.forEach((c, i) => {
    drawParagraph(ctx, `${i + 1}. ${c}`, { size: 9.5, color: INK, lineGap: 2 });
    ctx.y -= 4;
  });
}

function drawSignatures(ctx: Ctx, fields: AgreementField[], values: AgreementValues, dateIso: string) {
  drawSectionHeader(ctx, "Signatures");
  // Two columns, wrap onto more rows for >2 signatories
  const colW = (PAGE_W - MARGIN * 2 - 30) / 2;
  let col = 0;
  let rowTop = ctx.y;
  for (const f of fields) {
    if (col === 0) {
      ensure(ctx, 70);
      rowTop = ctx.y;
    }
    const x = MARGIN + col * (colW + 30);
    ctx.page.drawText(f.label, { x, y: rowTop - 10, size: 9, font: ctx.bold, color: MUTED });
    ctx.page.drawLine({
      start: { x, y: rowTop - 50 }, end: { x: x + colW, y: rowTop - 50 },
      thickness: 0.4, color: HAIR,
    });
    ctx.page.drawText(values[f.key] || "—", { x, y: rowTop - 64, size: 10, font: ctx.regular, color: INK });
    ctx.page.drawText(`Fait le ${fmtDate(dateIso)}`, { x, y: rowTop - 76, size: 8, font: ctx.italic, color: MUTED });
    col++;
    if (col === 2) {
      col = 0;
      ctx.y = rowTop - 90;
    }
  }
  if (col === 1) ctx.y = rowTop - 90;
}

function drawFooter(ctx: Ctx, ref: string) {
  const total = ctx.pdf.getPageCount();
  ctx.pdf.getPages().forEach((p, i) => {
    p.drawText(
      `Document généré par Neova Space — L'original signé fait foi.${ref ? `  ·  Réf. ${ref}` : ""}`,
      { x: MARGIN, y: 28, size: 7.5, font: ctx.italic, color: MUTED },
    );
    p.drawText(`${i + 1} / ${total}`, {
      x: PAGE_W - MARGIN - 30, y: 28, size: 7.5, font: ctx.regular, color: MUTED,
    });
  });
}

let _logoBytesCache: Uint8Array | null = null;
async function loadLogoBytes(): Promise<Uint8Array | null> {
  if (_logoBytesCache) return _logoBytesCache;
  try {
    const res = await fetch(wordmarkAsset.url);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    _logoBytesCache = new Uint8Array(buf);
    return _logoBytesCache;
  } catch {
    return null;
  }
}

export async function generateAgreementPdf(
  template: AgreementTemplate,
  values: AgreementValues,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const page = pdf.addPage([PAGE_W, PAGE_H]);
  const ctx: Ctx = { pdf, page, y: PAGE_H - MARGIN, regular, bold, italic };

  const groups = fieldsBySection(template);
  const dateIso = values.date || new Date().toISOString().slice(0, 10);

  // Header band — embed official Neova wordmark (PNG) in the top-left.
  const logoBytes = await loadLogoBytes();
  const LOGO_H = 22; // points; sharp at 150 DPI for typical wordmark
  let logoDrawnH = 18;
  if (logoBytes) {
    try {
      const img = await pdf.embedPng(logoBytes);
      const scale = LOGO_H / img.height;
      const w = img.width * scale;
      ctx.page.drawImage(img, { x: MARGIN, y: ctx.y - LOGO_H, width: w, height: LOGO_H });
      logoDrawnH = LOGO_H;
    } catch {
      // Fallback to text wordmark if embedding fails
      ctx.page.drawText("NEOVA", { x: MARGIN, y: ctx.y - 14, size: 16, font: bold, color: INK });
      ctx.page.drawText("S P A C E", { x: MARGIN + 56, y: ctx.y - 12, size: 8, font: regular, color: MUTED });
    }
  } else {
    ctx.page.drawText("NEOVA", { x: MARGIN, y: ctx.y - 14, size: 16, font: bold, color: INK });
    ctx.page.drawText("S P A C E", { x: MARGIN + 56, y: ctx.y - 12, size: 8, font: regular, color: MUTED });
  }
  ctx.page.drawText(fmtDate(dateIso), {
    x: PAGE_W - MARGIN - regular.widthOfTextAtSize(fmtDate(dateIso), 9),
    y: ctx.y - (logoDrawnH / 2) - 3, size: 9, font: regular, color: MUTED,
  });
  ctx.y -= logoDrawnH + 8;
  ctx.page.drawLine({ start: { x: MARGIN, y: ctx.y }, end: { x: PAGE_W - MARGIN, y: ctx.y }, thickness: 0.6, color: HAIR });
  ctx.y -= 18;

  // Category + Title
  ctx.page.drawText(template.category.toUpperCase(), {
    x: MARGIN, y: ctx.y - 8, size: 8, font: bold, color: ACCENT,
  });
  ctx.y -= 14;
  for (const line of wrap(template.name, bold, 18, PAGE_W - MARGIN * 2)) {
    ensure(ctx, 24);
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y - 18, size: 18, font: bold, color: INK });
    ctx.y -= 22;
  }
  ctx.y -= 4;
  for (const line of wrap(template.description, italic, 10, PAGE_W - MARGIN * 2)) {
    ensure(ctx, 14);
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y - 10, size: 10, font: italic, color: MUTED });
    ctx.y -= 13;
  }

  // Sections in order
  if (groups.parties.length) {
    drawSectionHeader(ctx, `Entre les soussignés — ${SECTION_LABELS.parties}`);
    drawFieldsBlock(ctx, groups.parties, values);
  }
  if (groups.objet.length) {
    drawSectionHeader(ctx, SECTION_LABELS.objet);
    drawFieldsBlock(ctx, groups.objet, values);
  }
  if (groups.mission.length) {
    drawSectionHeader(ctx, SECTION_LABELS.mission);
    drawFieldsBlock(ctx, groups.mission, values);
  }
  if (groups.honoraires.length) {
    drawSectionHeader(ctx, SECTION_LABELS.honoraires);
    drawFieldsBlock(ctx, groups.honoraires, values);
  }
  if (groups.conditions.length) {
    drawSectionHeader(ctx, SECTION_LABELS.conditions);
    drawFieldsBlock(ctx, groups.conditions, values);
  }

  drawClauses(ctx, template.clauses);

  if (groups.signatures.length) drawSignatures(ctx, groups.signatures, values, dateIso);

  drawFooter(ctx, values.requestReference || "");

  return pdf.save();
}

export function downloadBytes(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}