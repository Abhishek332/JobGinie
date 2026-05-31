'use server';

import { getAuthenticatedUserOrNull, withAuth } from './with-auth';
import { Prisma } from '@/generated/prisma/client';
import { parseResumePdf } from '@/lib/pdf/parseResumePdf';
import { db } from '@/lib/prisma';
import {
  ANALYSIS_INVALID_FORMAT_ERROR,
  runAnalysis,
} from '@/lib/resume/runAnalysis';
import {
  jobDetailsSchema,
  type JobDetailsFormInput,
} from '@/lib/validation.schema';
import {
  MAX_RESUME_PDF_SIZE_BYTES,
  RESUME_PDF_MIME_TYPE,
  type AnalysisResult,
} from '@/types/resume-flow';

export type CreateResumeSessionResult =
  | { success: true; sessionId: string }
  | { success: false; error: string };

export type UploadResumePdfResult =
  | { success: true; sessionId: string }
  | { success: false; error: string };

export type RunResumeAnalysisResult =
  | { success: true; analysis: AnalysisResult }
  | { success: false; error: string };

function toUserFacingAnalysisError(error: unknown): string {
  if (
    error instanceof Error &&
    error.message === ANALYSIS_INVALID_FORMAT_ERROR
  ) {
    return error.message;
  }
  return 'Failed to analyze resume. Please try again.';
}

export const createResumeSession = withAuth(
  async (
    user,
    input: JobDetailsFormInput,
  ): Promise<CreateResumeSessionResult> => {
    const parsed = jobDetailsSchema.safeParse(input);
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const message =
        first.jobTitle?.[0] ??
        first.jobDescription?.[0] ??
        first.yearsRequired?.[0] ??
        'Invalid job details';
      return { success: false, error: message };
    }

    const { jobTitle, jobDescription, yearsRequired } = parsed.data;

    try {
      const session = await db.resumeSession.create({
        data: {
          userId: user.id,
          jobTitle: jobTitle.trim(),
          jobDescription: jobDescription.trim(),
          yearsRequired: yearsRequired ?? null,
        },
      });
      return { success: true, sessionId: session.id };
    } catch (error) {
      console.error('Create resume session error:', error);
      return { success: false, error: 'Failed to create session.' };
    }
  },
);

export async function getResumeSessionForUser(sessionId: string) {
  const user = await getAuthenticatedUserOrNull();
  if (!user) return null;

  return db.resumeSession.findFirst({
    where: {
      id: sessionId,
      userId: user.id,
    },
    select: {
      id: true,
      jobTitle: true,
      parsedResumeText: true,
    },
  });
}

function isPdfFile(file: File): boolean {
  return (
    file.type === RESUME_PDF_MIME_TYPE ||
    file.name.toLowerCase().endsWith('.pdf')
  );
}

export const uploadResumePdf = withAuth(
  async (user, formData: FormData): Promise<UploadResumePdfResult> => {
    const sessionId = formData.get('sessionId');
    const file = formData.get('file');

    if (typeof sessionId !== 'string' || !sessionId.trim()) {
      return { success: false, error: 'Session is required.' };
    }

    if (!(file instanceof File)) {
      return { success: false, error: 'Please select a PDF file.' };
    }

    if (!isPdfFile(file)) {
      return { success: false, error: 'Only PDF files are allowed.' };
    }

    if (file.size > MAX_RESUME_PDF_SIZE_BYTES) {
      return { success: false, error: 'File must be 5 MB or smaller.' };
    }

    if (file.size === 0) {
      return { success: false, error: 'The selected file is empty.' };
    }

    const session = await db.resumeSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id,
      },
    });

    if (!session) {
      return { success: false, error: 'Session not found.' };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseResumePdf(buffer);

    if (!parsed.ok) {
      return { success: false, error: parsed.error };
    }

    const text = parsed.text.trim();
    if (!text) {
      return {
        success: false,
        error:
          'Could not extract text from this PDF. Try a text-based PDF or a different file.',
      };
    }

    try {
      await db.resumeSession.update({
        where: { id: session.id },
        data: {
          parsedResumeText: text,
          analysisResult: Prisma.DbNull,
          generatedResumeJson: Prisma.DbNull,
        },
      });
      return { success: true, sessionId: session.id };
    } catch (error) {
      console.error('Upload resume PDF error:', error);
      return { success: false, error: 'Failed to save parsed resume.' };
    }
  },
);

export const runResumeAnalysis = withAuth(
  async (user, sessionId: string): Promise<RunResumeAnalysisResult> => {
    if (typeof sessionId !== 'string' || !sessionId.trim()) {
      return { success: false, error: 'Session is required.' };
    }

    const session = await db.resumeSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id,
      },
    });

    if (!session) {
      return { success: false, error: 'Session not found.' };
    }

    if (!session.parsedResumeText?.trim()) {
      return {
        success: false,
        error: 'Please upload and parse a resume before running analysis.',
      };
    }

    try {
      const analysis = await runAnalysis({
        jobTitle: session.jobTitle,
        jobDescription: session.jobDescription,
        yearsRequired: session.yearsRequired,
        resumeText: session.parsedResumeText,
      });

      await db.resumeSession.update({
        where: { id: session.id },
        data: { analysisResult: analysis },
      });

      return { success: true, analysis };
    } catch (error) {
      console.error('Run resume analysis error:', error);
      return { success: false, error: toUserFacingAnalysisError(error) };
    }
  },
);
