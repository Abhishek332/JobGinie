import { PDFParse } from 'pdf-parse';

import type { ParseResumePdfResult } from '@/types/resume-flow';

function toParseError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (/password|encrypted|decrypt/i.test(message)) {
    return 'This PDF is password-protected. Please upload an unlocked file.';
  }

  if (/invalid|corrupt|format|xref|unexpected/i.test(message)) {
    return 'Could not read this PDF. The file may be corrupt or not a valid PDF.';
  }

  return 'Failed to parse PDF. Please try a different file.';
}

/**
 * Parse a resume PDF buffer into plain text on the server.
 * Does not persist the raw PDF — callers store only the returned text.
 */
export async function parseResumePdf(
  buffer: Buffer,
): Promise<ParseResumePdfResult> {
  let parser: PDFParse | undefined;

  try {
    parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return { ok: true, text: result.text ?? '' };
  } catch (error) {
    return { ok: false, error: toParseError(error) };
  } finally {
    await parser?.destroy();
  }
}
