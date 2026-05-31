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

/** Fit + gap analysis result (Step 5). Stored on session.analysisResult. */
export type AnalysisResult = {
  fitScore: number;
  missingKeywords: string[];
  skillGaps: string[];
  experienceGaps: string[];
  summaryParagraph: string;
  topRecommendations: string[];
};

/** Plain-object schema hint for generateStructured (stringified into the prompt). */
export const AnalysisResultSchemaForLLM = {
  type: 'object',
  properties: {
    fitScore: {
      type: 'number',
      description: 'Overall fit score from 0 to 100',
    },
    missingKeywords: {
      type: 'array',
      items: { type: 'string' },
      description: 'Important job keywords or phrases missing from the resume',
    },
    skillGaps: {
      type: 'array',
      items: { type: 'string' },
      description: 'Required or preferred skills not clearly demonstrated',
    },
    experienceGaps: {
      type: 'array',
      items: { type: 'string' },
      description: 'Experience areas or YOE gaps compared to the job',
    },
    summaryParagraph: {
      type: 'string',
      description: 'Short paragraph summarizing fit and main gaps',
    },
    topRecommendations: {
      type: 'array',
      items: { type: 'string' },
      description: 'Top 3 to 5 actionable recommendations to improve fit',
    },
  },
  required: [
    'fitScore',
    'missingKeywords',
    'skillGaps',
    'experienceGaps',
    'summaryParagraph',
    'topRecommendations',
  ],
} as const;
