import { db } from '../prisma';
import { inngest } from './client';
import { generateStructured } from '@/lib/llm';
import {
  IndustryInsightFromLLM,
  IndustryInsightSchemaForLLM,
} from '@/llm-schemas/industryInsights.schema';

export const generateIndustryInsights = inngest.createFunction(
  {
    name: 'Generate Industry Insights',
    id: 'generate-industry-insights',
  },
  {
    cron: '0 0 * * 0',
  },
  async ({ step }) => {
    const industries = await step.run('Fetch industries', () => {
      return db.industryInsight.findMany({
        select: {
          industry: true,
        },
      });
    });

    for (const { industry } of industries) {
      const insights = await step.run(
        `Generate insights for ${industry}`,
        async () =>
          generateStructured<IndustryInsightFromLLM>({
            prompt: `Analyze the current state of the ${industry} industry and provide insights. Return JSON only.`,
            schema: IndustryInsightSchemaForLLM as object,
            model: 'gemini-1.5-flash',
          }),
      );

      await step.run(`Update ${industry} insights`, async () => {
        const payload =
          insights && typeof insights === 'object' ? insights : {};
        await db.industryInsight.update({
          where: { industry },
          data: {
            ...payload,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      });
    }
  },
);
