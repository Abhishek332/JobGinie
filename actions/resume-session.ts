'use server';

import { checkUserAuth } from './validate-user-auth';
import { parseResumePdf } from '@/lib/pdf/parseResumePdf';
import { db } from '@/lib/prisma';
import {
  jobDetailsSchema,
  type JobDetailsFormInput,
} from '@/lib/validation.schema';
import {
  MAX_RESUME_PDF_SIZE_BYTES,
  RESUME_PDF_MIME_TYPE,
} from '@/types/resume-flow';

export type CreateResumeSessionResult =
  | { success: true; sessionId: string }
  | { success: false; error: string };

export type UploadResumePdfResult =
  | { success: true; sessionId: string }
  | { success: false; error: string };

export async function createResumeSession(
  input: JobDetailsFormInput,
): Promise<CreateResumeSessionResult> {
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

  let user;
  try {
    user = await checkUserAuth();
  } catch {
    return { success: false, error: 'Please sign in to continue.' };
  }

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
}

export async function getResumeSessionForUser(sessionId: string) {
  let user;
  try {
    user = await checkUserAuth();
  } catch {
    return null;
  }

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

export async function uploadResumePdf(
  formData: FormData,
): Promise<UploadResumePdfResult> {
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

  let user;
  try {
    user = await checkUserAuth();
  } catch {
    return { success: false, error: 'Please sign in to continue.' };
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
      data: { parsedResumeText: text },
    });
    return { success: true, sessionId: session.id };
  } catch (error) {
    console.error('Upload resume PDF error:', error);
    return { success: false, error: 'Failed to save parsed resume.' };
  }
}
