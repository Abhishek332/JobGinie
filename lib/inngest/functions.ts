import { GoogleGenAI } from '@google/genai';

import { db } from '../prisma';
import { inngest } from './client';
import { IndustryInsightSchemaForLLM } from '@/llm-schemas/industryInsights.schema';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
      const response = await step.ai.wrap('calling-gemini', async () => {
        return genAI.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: `Analyze the current state of the ${industry} industry and provide insights`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: IndustryInsightSchemaForLLM,
          },
        });
      });

      const insights = JSON.parse(
        response.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}',
      );

      await step.run(`Update ${industry} insights`, async () => {
        await db.industryInsight.update({
          where: { industry },
          data: {
            ...insights,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      });
    }
  },
);
