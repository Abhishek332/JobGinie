import { z } from 'zod';

import { generateStructured } from '@/lib/llm';
import {
  AnalysisResult,
  AnalysisResultSchemaForLLM,
} from '@/types/resume-flow';

export type RunAnalysisInput = {
  jobTitle: string;
  jobDescription: string;
  yearsRequired?: number | null;
  resumeText: string;
};

const analysisResultZodSchema = z.object({
  fitScore: z.number().int().min(0).max(100),
  missingKeywords: z.array(z.string()),
  skillGaps: z.array(z.string()),
  experienceGaps: z.array(z.string()),
  summaryParagraph: z.string().min(1),
  topRecommendations: z.array(z.string()).min(3).max(5),
});

function buildAnalysisPrompt(input: RunAnalysisInput): string {
  const { jobTitle, jobDescription, yearsRequired, resumeText } = input;

  const yoeLine =
    yearsRequired != null
      ? `Years of experience required: ${yearsRequired}`
      : 'Years of experience required: not specified';

  return [
    'Compare the following resume to the job description and return a structured fit and gap analysis.',
    '',
    '## Job',
    `Title: ${jobTitle}`,
    yoeLine,
    '',
    'Description:',
    jobDescription,
    '',
    '## Resume (plain text)',
    resumeText,
    '',
    'Instructions:',
    '- fitScore: integer 0–100 for overall fit.',
    '- missingKeywords: terms from the JD that are absent or weak in the resume.',
    '- skillGaps: skills required or preferred but not shown on the resume.',
    '- experienceGaps: gaps in years, role level, domain, or scope vs the JD.',
    '- summaryParagraph: 2–4 sentences on fit and the main gaps.',
    '- topRecommendations: 3–5 specific, actionable improvements for this job.',
    '',
    'Return only valid JSON matching the required schema.',
  ].join('\n');
}

const ANALYSIS_SYSTEM_PROMPT =
  'You are an expert resume analyst and recruiter. Compare resumes to job descriptions objectively. Be specific and actionable. Output valid JSON only.';

/** Safe to show in the UI — all other analysis errors stay generic. */
export const ANALYSIS_INVALID_FORMAT_ERROR =
  'Analysis returned an invalid format. Please try again.';

/**
 * Run fit + gap analysis via the LLM abstraction. Pure function: input → typed result.
 */
export async function runAnalysis(
  input: RunAnalysisInput,
): Promise<AnalysisResult> {
  const raw = await generateStructured<AnalysisResult>({
    prompt: buildAnalysisPrompt(input),
    systemPrompt: ANALYSIS_SYSTEM_PROMPT,
    schema: AnalysisResultSchemaForLLM as object,
  });

  const parsed = analysisResultZodSchema.safeParse(raw);
  if (!parsed.success) {
    console.error('Invalid analysis result from LLM:', parsed.error.flatten());
    throw new Error(ANALYSIS_INVALID_FORMAT_ERROR);
  }

  return parsed.data;
}
