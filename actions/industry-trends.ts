'use server';

import { isEmpty } from 'lodash';

import { checkUserAuth } from './validate-user-auth';
import { generateStructured } from '@/lib/llm';
import {
  IndustryInsightFromLLM,
  IndustryInsightSchemaForLLM,
} from '@/llm-schemas/industryInsights.schema';

type IndustryInsight = Awaited<
  ReturnType<typeof checkUserAuth>
>['industryInsight'];

export async function getIndustryTrends(
  industry: string,
): Promise<IndustryInsight | IndustryInsightFromLLM | null> {
  const dbUser = await checkUserAuth();

  if (isEmpty(dbUser.industryInsight)) {
    try {
      return generateStructured<IndustryInsightFromLLM>({
        prompt: `Analyze the current state of the ${industry} industry and provide insights. Return JSON only.`,
        schema: IndustryInsightSchemaForLLM as object,
        model: 'gemini-1.5-flash',
      });
    } catch (error) {
      console.error('Error generating industry insights:', error);
      throw new Error('Failed to generate industry insights');
    }
  }

  return dbUser.industryInsight;
}
