import { auth } from '@clerk/nextjs/server';

import { db } from '@/lib/prisma';

export const checkUserAuth = async () => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized.');
  }

  const dbUser = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
    include: {
      industryInsight: true,
    },
  });

  if (!dbUser) throw new Error('User not found');

  return dbUser;
};
