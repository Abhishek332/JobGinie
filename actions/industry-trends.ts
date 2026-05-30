'use server';

import type { IndustryInsight } from '@prisma/client';

import { checkUserAuth } from './validate-user-auth';
import { generateStructured } from '@/lib/llm';
import { db } from '@/lib/prisma';
import {
  IndustryInsightFromLLM,
  IndustryInsightSchemaForLLM,
} from '@/llm-schemas/industryInsights.schema';

export async function getIndustryTrends(
  industry: string,
): Promise<IndustryInsight | IndustryInsightFromLLM | null> {
  await checkUserAuth();

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
