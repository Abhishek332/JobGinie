'use server';

import { auth } from '@clerk/nextjs/server';

import { db } from '@/lib/prisma';

const checkUserAuth = async () => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized.');
  }

  const dbUser = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!dbUser) throw new Error('User not found');

  return dbUser;
};

interface UpdateUserData {
  industry: string;
  experience: number;
  bio?: string;
  skills: string[];
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
          await tx.industryInsight.create({
            data: {
              industry: data.industry,
              growthRate: 0,
              demandLevel: 'Medium',
              marketOutlook: 'Neutral',
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

    return res.updatedUser;
  } catch {
    throw new Error('Failed to update user profile.');
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
