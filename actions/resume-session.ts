'use server';

import { checkUserAuth } from './validate-user-auth';
import { db } from '@/lib/prisma';
import {
  jobDetailsSchema,
  type JobDetailsFormData,
} from '@/lib/validation.schema';

export type CreateResumeSessionResult =
  | { success: true; sessionId: string }
  | { success: false; error: string };

export async function createResumeSession(
  input: JobDetailsFormData,
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

  try {
    const user = await checkUserAuth();
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
    const message =
      error instanceof Error ? error.message : 'Failed to create session';
    return { success: false, error: message };
  }
}
