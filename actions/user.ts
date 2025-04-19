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
          // get industry insights from AI
          const newInsights = await getIndustryTrends(data.industry);
          await tx.industryInsight.create({
            data: {
              industry: data.industry,
              ...newInsights,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
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

        return { updatedUser, industryInsights };
      },
      {
        timeout: 10000,
      },
    );

    return {
      success: true,
      ...res,
    };
  } catch (error) {
    throw new Error(
      'Failed to update user profile.' + (error as Error).message,
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
