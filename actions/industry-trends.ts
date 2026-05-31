'use server';

import { withAuthGuard } from './with-auth';
import type { IndustryInsight } from '@/generated/prisma/client';
import { generateStructured } from '@/lib/llm';
import { db } from '@/lib/prisma';
import {
  IndustryInsightFromLLM,
  IndustryInsightSchemaForLLM,
} from '@/llm-schemas/industryInsights.schema';

/** Internal fetch — caller must already be authenticated. */
export async function fetchIndustryTrends(
  industry: string,
): Promise<IndustryInsight | IndustryInsightFromLLM | null> {
  const existing = await db.industryInsight.findUnique({
    where: { industry },
  });

  if (existing) {
    return existing;
  }

  try {
    return await generateStructured<IndustryInsightFromLLM>({
      prompt: `Analyze the current state of the ${industry} industry and provide insights. Return JSON only.`,
      schema: IndustryInsightSchemaForLLM as object,
    });
  } catch (error) {
    console.error('Error generating industry insights:', error);
    throw new Error('Failed to generate industry insights');
  }
}

export const getIndustryTrends = withAuthGuard(
  async (_user, industry: string) => fetchIndustryTrends(industry),
);
