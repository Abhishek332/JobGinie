import { Prisma } from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const user = Prisma.validator<Prisma.UserDefaultArgs>()({});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const userWithIndustryInsight = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    industryInsight: true,
  },
});

export type User = Prisma.UserGetPayload<typeof user>;
export type UserWithIndustryInsights = Prisma.UserGetPayload<
  typeof userWithIndustryInsight
>;
