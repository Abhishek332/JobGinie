/** UI-facing industry insight types (browser-safe Prisma types + manual JSON shapes). */

import type { IndustryInsight } from '@/generated/prisma/browser';

export type { DemandLevel, MarketOutlook } from '@/generated/prisma/enums';

/** JSON array item shape — Prisma stores this as Json[], so structure is defined here. */
export type SalaryRange = {
  role: string;
  min: number;
  max: number;
  median: number;
};

export type IndustryInsightView = Pick<
  IndustryInsight,
  | 'marketOutlook'
  | 'growthRate'
  | 'demandLevel'
  | 'topSkills'
  | 'keyTrends'
  | 'recommendedSkills'
> & {
  lastUpdated: Date | string;
  nextUpdate: Date | string;
  salaryRanges: SalaryRange[];
};
