/**
 * Shared types for the resume-for-job flow (job details → upload → analysis → build → preview → download).
 */

export type SessionId = string;

/** Max PDF upload size (5 MB). Used by client validation and server action. */
export const MAX_RESUME_PDF_SIZE_BYTES = 5 * 1024 * 1024;

export const RESUME_PDF_MIME_TYPE = 'application/pdf';

export type ParseResumePdfSuccess = {
  ok: true;
  text: string;
};

export type ParseResumePdfFailure = {
  ok: false;
  error: string;
};

export type ParseResumePdfResult =
  | ParseResumePdfSuccess
  | ParseResumePdfFailure;
