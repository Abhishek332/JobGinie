'use server';

import { fetchIndustryTrends } from './industry-trends';
import { getOrCreateUserOrNull, withAuth } from './with-auth';
import { db } from '@/lib/prisma';

interface UpdateUserData {
  industry: string;
  experience: number;
  bio?: string;
  skills?: string[];
}

function isRateLimitError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes('429') ||
    msg.includes('Too Many Requests') ||
    msg.includes('quota') ||
    msg.includes('rate limit')
  );
}

function toErrorMessage(error: unknown): string {
  if (isRateLimitError(error)) {
    return 'Rate limit exceeded. Please try again in a few minutes.';
  }
  return (
    (error instanceof Error ? error.message : String(error)).slice(0, 200) ||
    'Failed to update user profile.'
  );
}

export type UpdateUserResult =
  | { success: true; updatedUser: unknown; industryInsights: unknown }
  | { success: false; error: string };

export const updateUser = withAuth(
  async (dbUser, data: UpdateUserData): Promise<UpdateUserResult> => {
    try {
      // LLM work must run outside `$transaction` — interactive tx timeouts (default 5–15s)
      // cannot span long external calls or the connection expires mid-flight.
      const industryRow = await db.industryInsight.findUnique({
        where: { industry: data.industry },
      });

      // Same gate as before: only call the LLM when there is no IndustryInsight row for this industry.
      let insightCreateExtras: Record<string, unknown> | undefined;
      if (!industryRow) {
        try {
          const newInsights = await fetchIndustryTrends(data.industry);
          insightCreateExtras =
            newInsights && typeof newInsights === 'object'
              ? (newInsights as Record<string, unknown>)
              : {};
        } catch {
          insightCreateExtras = undefined;
        }
      }

      const res = await db.$transaction(
        async (tx) => {
          const stillMissing = !(await tx.industryInsight.findUnique({
            where: { industry: data.industry },
            select: { industry: true },
          }));

          if (stillMissing) {
            const nextUpdate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            try {
              await tx.industryInsight.upsert({
                where: { industry: data.industry },
                create: {
                  industry: data.industry,
                  ...(insightCreateExtras ?? {}),
                  nextUpdate,
                },
                update: {},
              });
            } catch {
              await tx.industryInsight.upsert({
                where: { industry: data.industry },
                create: {
                  industry: data.industry,
                  nextUpdate,
                },
                update: {},
              });
            }
          }

          const updatedUser = await tx.user.update({
            where: { id: dbUser.id },
            data: {
              industry: data.industry,
              experience: data.experience,
              bio: data.bio,
              skills: data.skills,
            },
          });

          const industryInsightsAfter = await tx.industryInsight.findUnique({
            where: { industry: data.industry },
          });

          return { updatedUser, industryInsights: industryInsightsAfter };
        },
        { maxWait: 10_000, timeout: 30_000 },
      );

      return { success: true, ...res };
    } catch (error) {
      console.error('Update User Error: ', (error as Error).message);
      return {
        success: false,
        error: toErrorMessage(error),
      };
    }
  },
);

export async function getUserOnboardingStatus() {
  try {
    const dbUser = await getOrCreateUserOrNull();
    if (!dbUser) {
      return { isOnboarded: false as const, industry: null };
    }

    return {
      isOnboarded: !!dbUser.industry,
      industry: dbUser.industry ?? null,
    };
  } catch {
    return { isOnboarded: false as const, industry: null };
  }
}
