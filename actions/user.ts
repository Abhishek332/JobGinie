'use server';

import { getIndustryTrends } from './industry-trends';
import { checkUserAuth } from './validate-user-auth';
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

export async function updateUser(data: UpdateUserData) {
  const dbUser = await checkUserAuth();

  try {
    const res = await db.$transaction(
      async (tx) => {
        const industryInsights = await tx.industryInsight.findUnique({
          where: {
            industry: data.industry,
          },
        });

        if (!industryInsights) {
          try {
            const newInsights = await getIndustryTrends(data.industry);
            const payload =
              newInsights && typeof newInsights === 'object'
                ? (newInsights as Record<string, unknown>)
                : {};
            await tx.industryInsight.create({
              data: {
                industry: data.industry,
                ...payload,
                nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              },
            });
          } catch {
            // LLM failed (e.g. 429 quota) – still complete onboarding; create minimal row so industry exists
            await tx.industryInsight.create({
              data: {
                industry: data.industry,
                nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              },
            });
          }
        }

        const updatedUser = await tx.user.update({
          where: {
            id: dbUser.id,
          },
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
      {
        timeout: 15000,
      },
    );

    return {
      success: true,
      ...res,
    };
  } catch (error) {
    if (isRateLimitError(error)) {
      throw new Error(
        'Rate limit exceeded. Please try again in a few minutes.',
      );
    }
    throw new Error(
      'Failed to update user profile. ' +
        (error instanceof Error ? error.message : String(error)),
    );
  }
}

export async function getUserOnboardingStatus() {
  const dbUser = await checkUserAuth();

  try {
    const userWithIndustry = await db.user.findUnique({
      where: {
        id: dbUser.id,
      },
      select: {
        industry: true,
      },
    });

    return { isOnboarded: !!userWithIndustry?.industry };
  } catch {
    throw new Error('Failed to get user onboarding status.');
  }
}
