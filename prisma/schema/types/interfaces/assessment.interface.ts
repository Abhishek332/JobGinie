import { Prisma } from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const assessment = Prisma.validator<Prisma.AssessmentDefaultArgs>()({});
export type Assessment = Prisma.AssessmentGetPayload<typeof assessment>;
