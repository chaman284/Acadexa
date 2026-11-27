// ============================================================================
// DOCUMENT TEXT EXTRACTOR — deterministic, no AI/LLM involved
// PDF -> page units | PPTX -> slide units (+ speaker notes) | DOCX/TXT -> chunks
// ============================================================================
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import JSZip from 'jszip';
import mammoth from 'mammoth';

// Polyfill dummy DOMMatrix and Path2D on globalThis to suppress pdfjs-dist's optional node-canvas warnings.
// Text extraction from PDFs does not use canvas or visual rendering operations.
if (typeof globalThis !== 'undefined') {
  (globalThis as any).DOMMatrix = (globalThis as any).DOMMatrix || class DOMMatrix {};
  (globalThis as any).Path2D = (globalThis as any).Path2D || class Path2D {};
}

// pdfjs-dist v3 exposes a CommonJS legacy build that works in Node without a canvas.
const pdfjsLib: typeof import('pdfjs-dist') = require('pdfjs-dist/legacy/build/pdf');

export interface DocumentUnit {
  unitNumber: number;
  label: string;
  text: string;
}

export interface ExtractedDocument {
  fileName: string;
  totalUnits: number;
  units: DocumentUnit[];
  wordCount: number;
  preview: string;
  warning?: string;
}

export class DocumentExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DocumentExtractionError';
  }
}

const WORDS_PER_CHUNK = 500;
const MIN_UNIT_CHARS = 20;
const SCANNED_PDF_MIN_CHARS = 200;

const decodeXmlEntities = (value: string): string =>
  value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');

const isPageNumberOnly = (line: string): boolean => {
  const v = line.trim();
  if (!v || v.length > 20) return false;
  if (/^(?:page\s*)?[-–—]?\s*\d+\s*(?:of\s*\d+)?[-–—]?$/i.test(v)) return true;
  return /^[ivxlcdm]{1,5}$/i.test(v);
};

/** Lines repeated across most units are headers/footers and should not reach Gemini. */
const collectRepeatedLines = (rawUnits: string[]): Set<string> => {
  const counts = new Map<string, number>();
  for (const raw of rawUnits) {
    const uniqueLines = new Set(
      raw
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0 && line.length < 80 && !isPageNumberOnly(line))
    );
    uniqueLines.forEach(line => counts.set(line, (counts.get(line) || 0) + 1));
  }
  const threshold = Math.max(3, Math.ceil(rawUnits.length * 0.6));
  return new Set(
    Array.from(counts.entries())
      .filter(([, count]) => count >= threshold)
      .map(([line]) => line)
  );
};

const cleanUnitText = (raw: string, repeatedLines: Set<string>): string => {
  const lines = raw
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && !isPageNumberOnly(line) && !repeatedLines.has(line));

  return lines
    .join('\n')
    // Join words split by a hyphen at a line break.
    .replace(/([A-Za-z])-\s*\n\s*([A-Za-z])/g, '$1$2')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/[\t ]{2,}/g, ' ')
    .trim();
};

const splitIntoWordChunks = (text: string): string[] => {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += WORDS_PER_CHUNK) {
    chunks.push(words.slice(i, i + WORDS_PER_CHUNK).join(' '));
  }
  return chunks;
};

const extractPdfATags = (xml: string): string => {
  const matches = xml.match(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g) || [];
  return matches
    .map(tag => decodeXmlEntities(tag.replace(/^<a:t(?:\s[^>]*)?>/, '').replace(/<\/a:t>$/, '')))
    .join(' ');
};

async function extractPdf(buffer: Buffer, rawUnits: string[]): Promise<void> {
  try {
    const doc = await pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      disableFontFace: true,
      isEvalSupported: false,
    } as any).promise;

    for (let pageNo = 1; pageNo <= doc.numPages; pageNo++) {
      const page = await doc.getPage(pageNo);
      const content = await page.getTextContent();
      const text = content.items
        .map((item: any) => (typeof item.str === 'string' ? item.str : ''))
        .join(' ');
      const lines = text.replace(/([A-Za-z])- (?=[A-Za-z])/g, '$1-\n').replace(/\s{2,}/g, '\n');
      rawUnits.push(lines.trim());
    }

    // TODO: add Tesseract OCR fallback here for image-only PDFs.
    await (doc as any).destroy?.();
  } catch (error: any) {
    if (error?.name === 'PasswordException' || /password/i.test(String(error?.message || ''))) {
      throw new DocumentExtractionError(
        'This PDF is password-protected. Please remove the password and upload it again.'
      );
    }
    throw new DocumentExtractionError(
      'The PDF could not be opened. It may be corrupted or password-protected.'
    );
  }
}

async function extractPptx(buffer: Buffer, rawUnits: string[]): Promise<void> {
  try {
    const zip = await JSZip.loadAsync(buffer);
    const slidePaths = Object.keys(zip.files)
      .filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name))
      .sort((a, b) => {
        const aNum = parseInt(a.match(/slide(\d+)\.xml/)![1], 10);
        const bNum = parseInt(b.match(/slide(\d+)\.xml/)![1], 10);
        return aNum - bNum;
      });

    if (slidePaths.length === 0) {
      throw new DocumentExtractionError('No slides were found in this PPTX file.');
    }

    for (let index = 0; index < slidePaths.length; index++) {
      const slideXml = await zip.file(slidePaths[index])!.async('string');
      let text = extractPdfATags(slideXml);

      const notePath = `ppt/notesSlides/notesSlide${index + 1}.xml`;
      const noteFile = zip.file(notePath);
      if (noteFile) {
        const notes = extractPdfATags(await noteFile.async('string'))
          .replace(/^Click to edit Master text styles.*$/i, '')
          .trim();
        if (notes) text += `\nSpeaker notes: ${notes}`;
      }
      rawUnits.push(text.trim());
    }
  } catch (error: any) {
    if (error instanceof DocumentExtractionError) throw error;
    throw new DocumentExtractionError(
      'This PPTX file could not be read. It may be password-protected or corrupted.'
    );
  }
}

async function extractDocx(buffer: Buffer, rawUnits: string[]): Promise<void> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const chunks = splitIntoWordChunks(result.value);
    rawUnits.push(...chunks);
  } catch {
    throw new DocumentExtractionError(
      'This DOCX file could not be read. Legacy .doc and password-protected files are not supported; please save as DOCX.'
    );
  }
}

function extractTxt(buffer: Buffer, rawUnits: string[]): void {
  const text = buffer.toString('utf8').replace(/^\uFEFF/, '');
  rawUnits.push(...splitIntoWordChunks(text));
}

const detectWarning = (text: string): string | undefined => {
  const length = Math.max(1, text.length);
  const replacementCount = (text.match(/\uFFFD/g) || []).length;
  const controlCount = (text.match(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g) || []).length;
  if (replacementCount / length > 0.01 || controlCount / length > 0.02) {
    return 'Some characters could not be decoded cleanly. Review the extracted text before generating questions.';
  }
  const latinCount = (text.match(/[A-Za-z]/g) || []).length;
  const nonAsciiCount = (text.match(/[^\x00-\x7F]/g) || []).length;
  if (latinCount > 0 && nonAsciiCount / latinCount > 0.5) {
    return 'Much of the extracted text appears to be non-English. Question quality may be reduced.';
  }
  return undefined;
};

/**
 * Extract normalized text units from a document. No AI is used here.
 * `mimeType` drives the parser; the file extension is used as a fallback.
 */
export async function extractDocument(filePath: string, mimeType: string): Promise<ExtractedDocument> {
  const fileName = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const buffer = await readFile(filePath);

  if (buffer.length === 0) {
    throw new DocumentExtractionError('The uploaded file is empty.');
  }

  if (ext === '.ppt' || ext === '.doc') {
    throw new DocumentExtractionError(
      'Legacy .ppt/.doc files are not supported. Please convert the file to PPTX/DOCX and upload it again.'
    );
  }

  const rawUnits: string[] = [];
  const type = (mimeType || '').toLowerCase();

  if (type === 'application/pdf' || ext === '.pdf') {
    await extractPdf(buffer, rawUnits);
  } else if (
    type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    ext === '.pptx'
  ) {
    await extractPptx(buffer, rawUnits);
  } else if (
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === '.docx'
  ) {
    await extractDocx(buffer, rawUnits);
  } else if (type === 'text/plain' || ext === '.txt') {
    extractTxt(buffer, rawUnits);
  } else {
    throw new DocumentExtractionError(
      'Unsupported file format. Upload a PDF, PPTX, DOCX, or TXT file.'
    );
  }

  const isPdf = type === 'application/pdf' || ext === '.pdf';
  const allRawText = rawUnits.join('\n');

  if (isPdf && rawUnits.length > 1 && allRawText.replace(/\s/g, '').length < SCANNED_PDF_MIN_CHARS) {
    throw new DocumentExtractionError(
      "This looks like a scanned/image PDF. Text could not be extracted. OCR isn't supported yet."
    );
  }

  const repeatedLines = collectRepeatedLines(rawUnits);
  const units: DocumentUnit[] = [];

  rawUnits.forEach((raw, index) => {
    const text = cleanUnitText(raw, repeatedLines);
    if (text.length < MIN_UNIT_CHARS) return;
    const label =
      isPdf
        ? `Page ${index + 1}`
        : type.includes('presentation') || ext === '.pptx'
          ? `Slide ${index + 1}`
          : `Section ${index + 1}`;
    units.push({ unitNumber: index + 1, label, text });
  });

  if (units.length === 0) {
    throw new DocumentExtractionError(
      isPdf
        ? 'No readable text found in the PDF. It may be empty or contain only images.'
        : 'No readable text found in the document.'
    );
  }

  const fullText = units.map(unit => unit.text).join(' ');
  return {
    fileName,
    totalUnits: units.length,
    units,
    wordCount: fullText.split(/\s+/).filter(Boolean).length,
    preview: fullText.slice(0, 300),
    warning: detectWarning(fullText),
  };
}
