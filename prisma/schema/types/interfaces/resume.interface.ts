import { Prisma } from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const resume = Prisma.validator<Prisma.ResumeDefaultArgs>()({});
export type Resume = Prisma.ResumeGetPayload<typeof resume>;
