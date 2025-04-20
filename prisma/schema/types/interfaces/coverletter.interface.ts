import { Prisma } from '@prisma/client';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const coverLetter = Prisma.validator<Prisma.CoverLetterDefaultArgs>()({});
export type CoverLetter = Prisma.CoverLetterGetPayload<typeof coverLetter>;
