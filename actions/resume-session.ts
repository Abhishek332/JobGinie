'use server';

import { checkUserAuth } from './validate-user-auth';
import { db } from '@/lib/prisma';
import {
  jobDetailsSchema,
  type JobDetailsFormInput,
} from '@/lib/validation.schema';

export type CreateResumeSessionResult =
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
