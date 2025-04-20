import { Prisma } from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const industryInsight = Prisma.validator<Prisma.IndustryInsightDefaultArgs>()(
  {},
);

export type IndustryInsight = Prisma.IndustryInsightGetPayload<
  typeof industryInsight
>;
