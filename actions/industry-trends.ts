'use server';

import { GoogleGenAI } from '@google/genai';
import { isEmpty } from 'lodash';

import { checkUserAuth } from './validate-user-auth';
import { IndustryInsightSchemaForLLM } from '@/llm-schemas/industryInsights.schema';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getIndustryTrends(industry: string) {
  const dbUser = await checkUserAuth();

  if (isEmpty(dbUser.industryInsight)) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: `Analyze the current state of the ${industry} industry and provide insights`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: IndustryInsightSchemaForLLM,
        },
      });

      const jsonResponse = JSON.parse(
        response.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}',
      );

      return jsonResponse;
    } catch (error) {
      console.error('Error generating industry insights:', error);
      throw new Error('Failed to generate industry insights');
    }
  }

  return dbUser.industryInsight;
}
