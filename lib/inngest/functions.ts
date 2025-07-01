import { GoogleGenAI } from '@google/genai';

import { db } from '../prisma';
import { inngest } from './client';

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
      const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

      const response = await step.ai.wrap('calling-gemini', async () => {
        return genAI.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt,
          // tokenLimit: 4096,
        });
      });

      const cleanedupResponse = (response.text ?? '{}')
        .replaceAll(/```|json|\n/g, '')
        .trim();
      const insights = JSON.parse(cleanedupResponse);

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
