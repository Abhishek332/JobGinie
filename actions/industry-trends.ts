'use server';

import { GoogleGenAI } from '@google/genai';
import { isEmpty } from 'lodash';

import { checkUserAuth } from './validate-user-auth';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getIndustryTrends(industry: string) {
  const dbUser = await checkUserAuth();

  if (!isEmpty(dbUser.industryInsight)) {
    try {
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

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        // tokenLimit: 4096,
      });

      const cleanedupResponse = (response.text ?? '{}').replaceAll(
        /```|json|\n/g,
        '',
      );
      const jsonResponse = JSON.parse(cleanedupResponse);
      return jsonResponse;
    } catch (error) {
      console.error('Error generating industry insights:', error);
      throw new Error('Failed to generate industry insights');
    }
  }
}
